import { GoogleGenAI, Type } from "@google/genai";
import { AIModel, Message, RouterResult, MessageImage, GroundingChunk, AttachedDocument, QueryIntent } from "../types";
import { logError } from "./analyticsService";

// NEXUS CIRCUIT BREAKER - Prevent infinite retry loops on Quota errors
let isRequestPending = false;
let lastRequestTimestamp = 0;
let consecutiveQuotaErrors = 0;
const MIN_REQUEST_GAP = 1200;
const MAX_QUOTA_RETRIES = 2;

// Model Mapping - NEXUS FLASH is the primary stable engine with higher quotas
const CORE_MODELS = {
  FLASH: 'gemini-3-flash-preview',
  PRO: 'gemini-3-pro-preview',
};

const SYSTEM_CORE = `
# IDENTITY & ROLE
You are Nexus AI — a professional cognitive assistant for thinking, analysis, and decision-making.
- You are not a generic chatbot.
- Communicate clearly, concisely, and with structured reasoning.
- If asked who you are: "I am Nexus AI, a unified intelligence system created by the Nexus AI team."

# CORE PURPOSE
Unify multiple reasoning approaches into one clear, actionable response. Focus on simplification and acceleration of user decisions.

# LIVE BROWSING & REAL-TIME DATA
When using Google Search grounding, you MUST provide up-to-date, factual information based on the CURRENT DATE AND TIME provided in your instructions. 
Always reference your findings clearly. If the user asks for "today", "now", or "latest", use the provided clock context to ground your search.

# RESPONSE STYLE
- Use short paragraphs and bullet points.
- Provide structured outputs (tables, steps).
- Maintain a calm, professional tone.
`;

const classifyIntent = (prompt: string, hasImage: boolean, hasDocs: boolean): QueryIntent => {
  const p = prompt.toLowerCase();
  const liveMarkers = ['weather', 'price', 'stock', 'news', 'today', 'current', 'latest', 'market', 'browse', 'status', 'who is', 'happening', 'live', 'internet', 'search', 'time', 'date'];
  if (liveMarkers.some(k => p.includes(k)) || hasImage) return 'live';
  const technicalMarkers = ['function', 'debug', 'code', 'error', 'repo', 'git', 'technical', 'architecture', 'formula', 'script', 'how to build'];
  if (technicalMarkers.some(k => p.includes(k)) || p.includes('```')) return 'coding';
  return 'general';
};

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
  
  const now = Date.now();
  if (now - lastRequestTimestamp < MIN_REQUEST_GAP) {
    throw new Error("Cooling down neural links. Interface stabilizing...");
  }

  // Prevent spamming if we are consistently hitting quota
  if (consecutiveQuotaErrors >= MAX_QUOTA_RETRIES && (now - lastRequestTimestamp < 60000)) {
    throw new Error("The Nexus link is currently saturated (Global API Quota Exceeded). Please allow the channel 60 seconds to reset.");
  }

  isRequestPending = true;
  lastRequestTimestamp = now;

  const routing = (manualModel && manualModel !== 'auto') 
    ? { model: manualModel, reason: "Manual Sync", explanation: `Routing to ${manualModel}.`, confidence: 1.0, complexity: 0.5, intent: classifyIntent(prompt, !!image, documents.length > 0) }
    : routePrompt(prompt, !!image, documents.length > 0);

  if (onRouting) onRouting(routing);

  // FLASH is prioritized for most tasks to save PRO quota for extreme logic
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

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const contents: any[] = history.slice(-6).map(msg => ({
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
          temperature: routing.intent === 'coding' ? 0.1 : 0.6,
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
          temperature: routing.intent === 'coding' ? 0.1 : 0.6,
          tools: tools.length > 0 ? tools : undefined
        },
      });
      fullText = response.text || "";
      usage = response.usageMetadata || usage;
      groundingChunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [];
    }

    consecutiveQuotaErrors = 0; // Success, reset breaker
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
    const msg = err.message || "";
    if (msg.includes('quota') || msg.includes('429')) {
      consecutiveQuotaErrors++;
      throw new Error("Nexus Daily Limit Reached. To continue, please verify your API key selection or try again later.");
    }
    logError(msg, true, routing.model);
    throw err;
  } finally {
    isRequestPending = false;
  }
};

export const generateFollowUpSuggestions = async (lastMsg: string, intent: QueryIntent): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: CORE_MODELS.FLASH,
      contents: `Suggest 3 follow-up questions for: "${lastMsg}". Return JSON array.`,
      config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } }
    });
    return JSON.parse(response.text || "[]").slice(0, 3);
  } catch (err) { return []; }
};

export const generateChatTitle = async (firstMessage: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: CORE_MODELS.FLASH,
      contents: `Summarize the following first message into a professional, concise 3 to 5 word title for a chat conversation: "${firstMessage}". Return ONLY the title text. Do not use quotes or periods.`,
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