
import { Message } from "../types";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Fixed: Added systemInstructions parameter to match the 3-argument call in aiService.ts (Line 179)
export const callClaude = async (prompt: string, history: Message[], systemInstructions?: string): Promise<string> => {
  if (!ANTHROPIC_API_KEY) {
    return "Error: Anthropic API Key is missing. Please set process.env.ANTHROPIC_API_KEY.";
  }

  try {
    const messages = history.map(m => ({
      role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
      content: m.content
    }));

    // Add current prompt
    messages.push({ role: 'user' as const, content: prompt });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "dangerously-allow-browser": "true" // Note: In production, these calls should be server-side
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 4096,
        messages: messages,
        // Correctly passing the system instructions to the 'system' field for Claude 3 models
        system: systemInstructions,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Anthropic API request failed");
    }

    const data = await response.json();
    return data.content[0]?.text || "No response content from Claude.";
  } catch (error: any) {
    console.error("Anthropic Service Error:", error);
    return `Anthropic Error: ${error.message}`;
  }
};
