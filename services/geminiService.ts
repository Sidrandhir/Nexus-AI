import { GoogleGenAI } from "@google/genai";
import { Message, Role, Attachment } from "../types";

// Initialize the client
// CRITICAL: We only use process.env.API_KEY as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const callGemini = async (
  history: Message[], 
  newMessage: string, 
  useSearch: boolean = false,
  imageAttachment?: Attachment
): Promise<string> => {
  try {
    // Model Selection logic
    // If image is present, we use gemini-2.5-flash-image (based on prompt rules for General Image Tasks)
    // or keep 2.5-flash if it supports it. The prompt says "General Image Generation and Editing Tasks: 'gemini-2.5-flash-image'".
    // However, for analyzing images (vision), 2.5-flash is multimodal.
    // Let's stick to the prompt's explicit model map:
    // "General Image Generation and Editing Tasks: 'gemini-2.5-flash-image'" - this sounds like generation.
    // For "Basic Text Tasks", use 'gemini-2.5-flash'.
    // NOTE: 'gemini-2.5-flash' is multimodal and handles image inputs well for analysis.
    
    let modelName = 'gemini-2.5-flash';

    const tools = useSearch ? [{ googleSearch: {} }] : [];

    // Construct the parts
    const parts: any[] = [];

    // 1. Add Image if present
    if (imageAttachment) {
      // Extract base64 string (remove data:image/png;base64, prefix)
      const base64Data = imageAttachment.url.split(',')[1];
      
      parts.push({
        inlineData: {
          mimeType: imageAttachment.mimeType,
          data: base64Data
        }
      });
    }

    // 2. Add History Context as Text (since we are doing a stateless generateContent call)
    let contextPrompt = "";
    const recentHistory = history.slice(-5); // Keep last 5 messages for context
    if (recentHistory.length > 0) {
      contextPrompt = "Previous conversation history:\n" + 
        recentHistory.map(m => {
            const attachmentInfo = m.attachment ? `[User uploaded an image: ${m.attachment.name}]` : '';
            return `${m.role === Role.USER ? 'User' : 'Model'}: ${attachmentInfo} ${m.content}`;
        }).join("\n") + 
        "\n\nCurrent Request:\n";
    }

    // 3. Add text prompt
    parts.push({ text: `${contextPrompt}${newMessage}` });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: parts },
      config: {
        tools: tools,
        systemInstruction: "You are a helpful AI assistant powered by Google Gemini.",
      },
    });

    // Check for grounding metadata (URLs) to append to the response if they exist
    let text = response.text || "";
    
    // Simplistic handling of grounding chunks for display
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks && groundingChunks.length > 0) {
      const links = groundingChunks
        .map((chunk: any) => chunk.web?.uri)
        .filter((uri: string) => uri)
        .map((uri: string, index: number) => `[Source ${index + 1}](${uri})`)
        .join(', ');
      
      if (links) {
        text += `\n\n**Sources:** ${links}`;
      }
    }

    return text;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I apologize, but I encountered an error connecting to the Gemini network. Please try again.";
  }
};