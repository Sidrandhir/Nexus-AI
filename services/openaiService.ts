
import { Message, MessageRole } from "../types";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Fixed: Added systemInstructions parameter to match the 3-argument call in aiService.ts (Line 183)
export const callOpenAI = async (prompt: string, history: Message[], systemInstructions?: string): Promise<string> => {
  if (!OPENAI_API_KEY) {
    return "Error: OpenAI API Key is missing. Please set process.env.OPENAI_API_KEY.";
  }

  try {
    const messages = [
      // Prepend system instructions if provided to maintain consistency across models
      ...(systemInstructions ? [{ role: 'system' as const, content: systemInstructions }] : []),
      ...history.map(m => ({
        role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
        content: m.content
      })),
      { role: 'user' as const, content: prompt }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-preview",
        messages: messages,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "OpenAI API request failed");
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "No response content from OpenAI.";
  } catch (error: any) {
    console.error("OpenAI Service Error:", error);
    return `OpenAI Error: ${error.message}`;
  }
};
