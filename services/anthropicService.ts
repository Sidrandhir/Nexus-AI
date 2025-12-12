import { Message, Role } from "../types";

// NOTE: Ensure REACT_APP_ANTHROPIC_API_KEY is set in your environment variables
const API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY;

export const callClaude = async (
  history: Message[],
  newMessage: string
): Promise<string> => {
  if (!API_KEY) {
    console.warn("Missing REACT_APP_ANTHROPIC_API_KEY");
    return "Error: Anthropic API Key is missing. Please add REACT_APP_ANTHROPIC_API_KEY to your environment variables.";
  }

  try {
    // Filter out system messages as they are handled differently in Claude if needed,
    // but here we just map user/assistant for the 'messages' array.
    const messages = history
      .filter(m => m.role !== Role.SYSTEM)
      .map(m => ({
        role: m.role === Role.USER ? 'user' : 'assistant',
        content: m.content
      }));

    messages.push({ role: 'user', content: newMessage });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true' // Required for client-side calls
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', // Using the specific model ID requested
        max_tokens: 4096,
        messages: messages
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Anthropic API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || "";
  } catch (error) {
    console.error("Anthropic Service Error:", error);
    return `I encountered an issue connecting to Claude: ${(error as Error).message}`;
  }
};