import { GoogleGenAI, Type } from "@google/genai";
import { AIModel, Message, RouterResult, MessageImage, GroundingChunk, AttachedDocument, QueryIntent } from "../types";
import { logError } from "./analyticsService";

// Concurrency guard — only one request at a time
let isRequestPending = false;
let lastRequestTimestamp = 0;
const MIN_REQUEST_GAP = 500;

// Model Mapping — Paid billing: use best available models freely
const CORE_MODELS = {
  FLASH: 'gemini-2.0-flash',
  PRO: 'gemini-2.5-pro',
};

const SYSTEM_CORE = `
# IDENTITY & ROLE
You are Nexus AI — a professional cognitive assistant for thinking, analysis, and decision-making.
- You are NOT a generic chatbot. You are a precision reasoning engine.
- If asked who you are: "I am Nexus AI, a unified intelligence system created by the Nexus AI team."

# CORE PURPOSE
Deliver expert-grade, structured, in-depth answers on any topic. Act like a senior engineer, analyst, or strategist would — with clarity, evidence, and actionable depth.

# RESPONSE STRUCTURE — MANDATORY FORMAT
Every response MUST follow this structure:

1. **DIRECT ANSWER FIRST** — The very first sentence must directly answer the question or state the conclusion. Never open with filler like "Great question!" or "Sure, let me explain..." or "That's interesting." Jump straight to the answer.

2. **STRUCTURED BODY** — Break your response into clearly labeled sections:
   - Use ## and ### markdown headings to separate major topics
   - Use **bold lead terms** at the start of each bullet point
   - Use numbered lists (1. 2. 3.) for sequential steps, processes, or instructions
   - Use bullet points (- ) for non-sequential items, features, or options
   - Use tables (| col | col |) whenever comparing 2+ options, approaches, or items side-by-side
   - Use > blockquotes for important warnings, tips, or key takeaways
   - Use \`inline code\` for variables, commands, file names, and technical terms

3. **CODE BLOCKS** — When providing code:
   - Always include the language identifier (e.g. \`\`\`python, \`\`\`typescript, \`\`\`sql)
   - Provide COMPLETE, RUNNABLE code — never partial snippets
   - Add brief comments inside the code explaining key logic
   - If the code is long, break it into logical sections with headings above each block

4. **DEPTH & THOROUGHNESS** — CRITICAL:
   - Minimum: 3-5 substantive paragraphs for any non-trivial question
   - Explain the WHY behind every recommendation, not just the WHAT
   - Cover edge cases, trade-offs, and common pitfalls
   - For technical topics: include full code + explanation + usage examples
   - For analytical topics: provide multiple perspectives, evidence, and detailed reasoning
   - For simple yes/no questions: answer directly first, then explain WHY in depth

5. **CLOSING** — End with exactly ONE of these (pick the most relevant):
   - A clear **recommendation**: "For your use case, I'd recommend X because..."
   - An **actionable next step**: "To get started, run..."
   - A brief **summary** of key points if the response was long

# FORMATTING RULES
- Never write long unbroken paragraphs. Break after every 2-3 sentences.
- Never use comparisons in paragraph form — always use a table.
- Never end with "Hope this helps!" or "Let me know if you need more!" — just end with substance.
- Use --- horizontal rules to separate major conceptual sections when a response is long.
- Make responses scannable: a reader should understand the answer in 3 seconds by reading only headings and bold terms.

# TONE
- Professional, direct, confident
- No hedging ("I think maybe..."), no filler, no apologetics
- Explanatory but efficient — every sentence earns its place

# LIVE BROWSING & REAL-TIME DATA
When using Google Search grounding, provide up-to-date, factual information based on the CURRENT DATE AND TIME in your instructions.
Reference findings clearly. For "today", "now", or "latest" queries, use the provided clock context.
`;

const classifyIntent = (prompt: string, hasImage: boolean, hasDocs: boolean): QueryIntent => {
  const p = prompt.toLowerCase();
  const liveMarkers = ['weather', 'price', 'stock', 'news', 'today', 'current', 'latest', 'market', 'browse', 'status', 'who is', 'happening', 'live', 'internet', 'search', 'time', 'date'];
  if (liveMarkers.some(k => p.includes(k)) || hasImage) return 'live';
  const technicalMarkers = ['function', 'debug', 'code', 'error', 'repo', 'git', 'technical', 'architecture', 'formula', 'script', 'how to build'];
  if (technicalMarkers.some(k => p.includes(k)) || p.includes('```')) return 'coding';
  return 'general';
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const routePrompt = (prompt: string, hasImage: boolean = false, hasDocs: boolean = false): RouterResult => {
  const intent = classifyIntent(prompt, hasImage, hasDocs);
  switch (intent) {
    case 'live':
      return { model: AIModel.GEMINI, reason: "Strategic Analysis", explanation: "Live web grounding core activated.", confidence: 1.0, complexity: 0.8, intent };
    case 'coding':
      return { model: AIModel.CLAUDE, reason: "Technical Precision", explanation: "Deep architecture logic core active.", confidence: 0.98, complexity: 0.9, intent };
    default:
      return { model: AIModel.GPT4, reason: "Logical Reasoning", explanation: "Balanced synthesis engine engaged.", confidence: 0.95, complexity: 0.4, intent };
  }
};

export const getAIResponse = async (
  prompt: string, 
  history: Message[], 
  manualModel?: AIModel | 'auto',
  onRouting?: (result: RouterResult) => void,
  image?: MessageImage,
  documents: AttachedDocument[] = [],
  personification: string = "",
  onStreamChunk?: (text: string) => void,
  signal?: AbortSignal
): Promise<{ content: string; model: AIModel; tokens: number; inputTokens: number; outputTokens: number; groundingChunks?: GroundingChunk[]; routingContext: any }> => {
  
  if (isRequestPending) throw new Error("Synchronization in progress. Please wait for the current stream to complete.");
  
  // Smooth out rapid requests — wait instead of throwing
  const now = Date.now();
  if (now - lastRequestTimestamp < MIN_REQUEST_GAP) {
    await sleep(MIN_REQUEST_GAP - (now - lastRequestTimestamp));
  }

  isRequestPending = true;
  lastRequestTimestamp = Date.now();

  const routing = (manualModel && manualModel !== 'auto') 
    ? { model: manualModel, reason: "Manual Sync", explanation: `Routing to ${manualModel}.`, confidence: 1.0, complexity: 0.5, intent: classifyIntent(prompt, !!image, documents.length > 0) }
    : routePrompt(prompt, !!image, documents.length > 0);

  if (onRouting) onRouting(routing);

  // Use PRO for coding/complex tasks, FLASH for everything else
  const targetEngine = (routing.intent === 'coding' && routing.model === AIModel.CLAUDE) ? CORE_MODELS.PRO : CORE_MODELS.FLASH;

  // Real-time Clock Context injection
  const currentDate = new Date();
  const dateContext = `
# REAL-TIME CONTEXT (CRITICAL)
- Current Date: ${currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Current Time: ${currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' })}
- ISO Timestamp: ${currentDate.toISOString()}
- Precise context is required for "today", "yesterday", and "current" queries.
`;

  // Retry with exponential backoff for transient errors
  const MAX_RETRIES = 4;
  let lastError: any = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
      if (!apiKey) throw new Error('Gemini API key not configured. Please add GEMINI_API_KEY to your environment.');
      const ai = new GoogleGenAI({ apiKey });
      
      // Send up to 10 history messages — paid account can handle the tokens
      const contents: any[] = history.slice(-10).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      
      const currentParts: any[] = [];
      if (documents.length > 0) {
        documents.forEach(doc => currentParts.push({ text: `[DATA ATTACHMENT: ${doc.title}]\n${doc.content}\n---` }));
      }
      if (image) currentParts.push({ inlineData: { data: image.inlineData.data, mimeType: image.mimeType } });
      currentParts.push({ text: prompt });
      contents.push({ role: 'user', parts: currentParts });

      const tools: any[] = [];
      if (routing.intent === 'live' || routing.model === AIModel.GEMINI) {
        tools.push({ googleSearch: {} });
      }

      let fullText = "";
      let usage: any = { totalTokenCount: 0, promptTokenCount: 0, candidatesTokenCount: 0 };
      let groundingChunks: GroundingChunk[] = [];

      const finalSystemInstruction = `${SYSTEM_CORE}\n${dateContext}\n[PREFERENCE]: ${personification}`;

      if (onStreamChunk) {
        const result = await ai.models.generateContentStream({
          model: targetEngine,
          contents,
          config: {
            systemInstruction: finalSystemInstruction,
            temperature: routing.intent === 'coding' ? 0.2 : 0.7,
            maxOutputTokens: 8192,
            tools: tools.length > 0 ? tools : undefined
          },
        });

        for await (const chunk of result) {
          if (signal?.aborted) break;
          const text = chunk.text || "";
          fullText += text;
          onStreamChunk(text);
          if (chunk.usageMetadata) usage = chunk.usageMetadata;
          const chunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
          if (chunks) groundingChunks = [...groundingChunks, ...(chunks as GroundingChunk[])];
        }
      } else {
        const response = await ai.models.generateContent({
          model: targetEngine,
          contents,
          config: {
            systemInstruction: finalSystemInstruction,
            temperature: routing.intent === 'coding' ? 0.2 : 0.7,
            maxOutputTokens: 8192,
            tools: tools.length > 0 ? tools : undefined
          },
        });
        fullText = response.text || "";
        usage = response.usageMetadata || usage;
        groundingChunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [];
      }

      isRequestPending = false;
      return { 
        content: fullText.trim(), 
        model: routing.model, 
        tokens: usage.totalTokenCount,
        inputTokens: usage.promptTokenCount,
        outputTokens: usage.candidatesTokenCount,
        groundingChunks: groundingChunks.length > 0 ? groundingChunks : undefined,
        routingContext: { ...routing, engine: targetEngine }
      };
    } catch (err: any) {
      lastError = err;
      const msg = (err.message || "").toLowerCase();
      
      // Retry on transient / rate-limit errors
      if (msg.includes('429') || msg.includes('quota') || msg.includes('resource exhausted') || msg.includes('rate limit') || msg.includes('503') || msg.includes('unavailable') || msg.includes('overloaded')) {
        if (attempt < MAX_RETRIES - 1) {
          const backoffMs = Math.min(1500 * Math.pow(2, attempt), 20000); // 1.5s → 3s → 6s → 12s
          console.warn(`API rate limit hit (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${backoffMs}ms...`);
          isRequestPending = false;
          await sleep(backoffMs);
          isRequestPending = true;
          lastRequestTimestamp = Date.now();
          continue;
        }
        // All retries exhausted
        isRequestPending = false;
        logError(msg, true, routing.model);
        throw new Error("API temporarily overloaded. Please wait a few seconds and try again.");
      }
      
      // Non-retryable error — throw immediately
      isRequestPending = false;
      logError(msg, true, routing.model);
      throw err;
    }
  }

  isRequestPending = false;
  throw lastError;
};

export const generateFollowUpSuggestions = async (lastMsg: string, intent: QueryIntent): Promise<string[]> => {
  try {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
    if (!apiKey) return [];
    const ai = new GoogleGenAI({ apiKey });
    const trimmed = lastMsg.length > 2000 ? lastMsg.substring(0, 2000) : lastMsg;
    const response = await ai.models.generateContent({
      model: CORE_MODELS.FLASH,
      contents: `Suggest 3 follow-up questions for: "${trimmed}". Return JSON array.`,
      config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } }
    });
    return JSON.parse(response.text || "[]").slice(0, 3);
  } catch (err) { return []; }
};

export const generateChatTitle = async (firstMessage: string): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
    if (!apiKey) return 'New Session';
    const ai = new GoogleGenAI({ apiKey });
    const trimmed = firstMessage.length > 1000 ? firstMessage.substring(0, 1000) : firstMessage;
    const response = await ai.models.generateContent({
      model: CORE_MODELS.FLASH,
      contents: `Summarize the following first message into a professional, concise 3 to 5 word title for a chat conversation: "${trimmed}". Return ONLY the title text. Do not use quotes or periods.`,
    });
    return response.text?.trim().replace(/['"]/g, '').replace(/\.$/, '') || "New Session";
  } catch (err) { return "New Session"; }
};

export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export function encode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}