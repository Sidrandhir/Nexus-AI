import { GoogleGenAI, Type } from "@google/genai";
import { AIModel, Message, RouterResult, MessageImage, GroundingChunk, AttachedDocument, QueryIntent } from "../types";
import { logError } from "./analyticsService";

// Concurrency guard — prevent duplicate concurrent requests
let isRequestPending = false;
let lastRequestTimestamp = 0;
const MIN_REQUEST_GAP = 100;

// Model Mapping — Paid billing: use best available models freely
const CORE_MODELS = {
  FLASH: 'gemini-2.0-flash',
  PRO: 'gemini-2.5-pro',
};

const SYSTEM_CORE = `
# IDENTITY
You are Nexus AI — a precision reasoning engine created by the Nexus AI team.
If asked who you are: "I am Nexus AI, a unified intelligence system."

# RESPONSE RULES
1. **DIRECT ANSWER FIRST** — First sentence answers the question. No filler ("Great question!", "Sure!", "Let me explain...").
2. **STRUCTURED** — Use ## headings, **bold leads**, numbered lists for steps, bullets for options, tables for comparisons, \`code\` for technical terms.
3. **CODE** — Always use language identifiers. Provide COMPLETE, RUNNABLE code with brief inline comments.
4. **CONCISE DEPTH** — Cover what matters: the answer, the why, edge cases. Skip obvious explanations. Never repeat the same idea twice.
5. **CLOSING** — End with ONE: a recommendation, a next step, or a key summary. Never end with "Hope this helps!" or similar.

# VERBOSITY CONTROL
- Match response length to question complexity. Simple questions get short answers.
- For code requests: prioritize the code block. Add only essential explanation below it.
- If the user says "just code" or "code only": return ONLY the code block, no explanation.
- Never restate the question back. Never pad with generic context the user already knows.
- Every sentence must earn its place. Cut ruthlessly.

# FORMATTING
- Break paragraphs every 2-3 sentences.
- Use tables for comparisons, never prose.
- Use > blockquotes for critical warnings only.
- Make responses scannable via headings and bold terms.

# TONE
Professional, direct, confident. No hedging, no filler, no apologies.

# LIVE DATA
When using Google Search grounding, provide current factual information based on the date/time in context.
`;

const CODING_ADDENDUM = `
# CODING MODE — ACTIVE
- Lead with the complete code solution. Explanation follows AFTER the code, not before.
- Keep explanation to essential points: what the code does, key design decisions, gotchas.
- Do NOT explain language basics, obvious syntax, or standard library usage.
- Do NOT repeat the same concept in different words.
- Include error handling and edge cases in the code itself, not as separate prose.
- If asked to debug: show the fix first, then explain the root cause in 1-2 sentences.
- End coding answers with follow-up suggestions the user might want: "You could also explore: ..."
`;

const PRODUCT_ADDENDUM = `
# PRODUCT & SHOPPING MODE
When the user asks about products, shopping, items to buy, product recommendations, comparisons, deals, prices, or anything ecommerce-related:
1. Use Google Search to find REAL, current product information with accurate prices and valid URLs.
2. Present products inside a fenced code block with the language identifier "products" containing a JSON array.
3. Each product object MUST have these fields:
   - "name": Full product name
   - "price": Price as a string with currency symbol (e.g. "$29.99", "₹1,499")
   - "url": A real, working URL to buy or view the product (Amazon, Flipkart, Best Buy, official site, etc.)
   - "store": Store or marketplace name (e.g. "Amazon", "Flipkart", "Best Buy")
   - "rating": Rating string (e.g. "4.5/5") — omit if unknown
   - "description": One-line summary, max 80 characters
4. Include 4-6 products. Prioritize variety across stores when possible.
5. After the products code block, add a brief 1-2 sentence recommendation or comparison summary.
6. ONLY use this format for product/shopping queries. Do NOT use it for general questions.
7. The JSON must be valid and parseable. No trailing commas. No comments inside the JSON.

Example (use exactly this format):
\`\`\`products
[{"name":"Sony WH-1000XM5","price":"$348","url":"https://www.amazon.com/dp/B09XS7JWHH","store":"Amazon","rating":"4.7/5","description":"Industry-leading noise cancelling wireless headphones"}]
\`\`\`
`;

const classifyIntent = (prompt: string, hasImage: boolean, hasDocs: boolean): QueryIntent => {
  const p = prompt.toLowerCase();
  const productMarkers = ['buy', 'purchase', 'shop', 'product', 'recommend', 'best', 'cheapest', 'deal', 'discount', 'amazon', 'flipkart', 'ecommerce', 'e-commerce', 'shopping', 'order online', 'add to cart', 'price of', 'cost of', 'where to buy', 'top 5', 'top 10', 'vs', 'comparison', 'review', 'rating', 'worth buying', 'alternative'];
  if (productMarkers.some(k => p.includes(k))) return 'live';
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
  
  // If a previous request is still pending, wait briefly for it to clear
  if (isRequestPending) {
    await sleep(300);
    if (isRequestPending) {
      isRequestPending = false; // Force-clear stale lock
    }
  }
  
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

  // Dynamic token budget based on intent
  const intentMaxTokens: Record<string, number> = { live: 2048, coding: 8192, general: 4096 };
  const maxTokenBudget = intentMaxTokens[routing.intent] || 4096;

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
      
      // Send recent history — trimmed for speed. Truncate long messages to reduce input tokens.
      const MAX_MSG_LEN = 3000;
      const contents: any[] = history.slice(-6).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content.length > MAX_MSG_LEN ? msg.content.slice(0, MAX_MSG_LEN) + '...[truncated]' : msg.content }]
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

      const codingBlock = routing.intent === 'coding' ? CODING_ADDENDUM : '';
      const finalSystemInstruction = `${SYSTEM_CORE}${codingBlock}\n${PRODUCT_ADDENDUM}\n${dateContext}\n[PREFERENCE]: ${personification}`;

      if (onStreamChunk) {
        const result = await ai.models.generateContentStream({
          model: targetEngine,
          contents,
          config: {
            systemInstruction: finalSystemInstruction,
            temperature: routing.intent === 'coding' ? 0.2 : 0.7,
            maxOutputTokens: maxTokenBudget,
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
          if (chunks) {
            for (const c of chunks as GroundingChunk[]) groundingChunks.push(c);
          }
        }
      } else {
        const response = await ai.models.generateContent({
          model: targetEngine,
          contents,
          config: {
            systemInstruction: finalSystemInstruction,
            temperature: routing.intent === 'coding' ? 0.2 : 0.7,
            maxOutputTokens: maxTokenBudget,
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
      if (msg.includes('429') || msg.includes('quota') || msg.includes('resource exhausted') || msg.includes('rate limit') || msg.includes('503') || msg.includes('unavailable') || msg.includes('overloaded') || msg.includes('load failed') || msg.includes('failed to fetch') || msg.includes('network')) {
        if (attempt < MAX_RETRIES - 1) {
          const backoffMs = Math.min(1500 * Math.pow(2, attempt), 20000); // 1.5s → 3s → 6s → 12s
          console.warn(`API error (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${backoffMs}ms...`);
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
    const trimmed = lastMsg.length > 800 ? lastMsg.substring(0, 800) : lastMsg;
    const response = await ai.models.generateContent({
      model: CORE_MODELS.FLASH,
      contents: `Suggest 3 brief follow-up questions for: "${trimmed}". Return JSON array of strings.`,
      config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }, maxOutputTokens: 256 }
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