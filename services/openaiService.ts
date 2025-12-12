import { Message, Role } from "../types";

// NOTE: Ensure REACT_APP_OPENAI_API_KEY is set in your environment variables
const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

export const callOpenAI = async (
  history: Message[],
  newMessage: string
): Promise<string> => {
  if (!API_KEY) {
    console.warn("Missing REACT_APP_OPENAI_API_KEY");
    return "Error: OpenAI API Key is missing. Please add REACT_APP_OPENAI_API_KEY to your environment variables.";
  }

  try {
    // Format messages for OpenAI
    const messages = history.map(m => ({
      role: m.role === Role.USER ? 'user' : 'assistant',
      content: m.content
    }));
    
    // Add the new user message
    messages.push({ role: 'user', content: newMessage });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: messages,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("OpenAI Service Error:", error);
    return `I encountered an issue connecting to OpenAI: ${(error as Error).message}`;
  }
};