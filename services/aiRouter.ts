import { ModelProvider, RoutingDecision } from "../types";

/**
 * Routes the user message to the appropriate AI model based on heuristics.
 * 
 * Routing Logic:
 * 1. Image Attachment -> Google Gemini (Vision capabilities)
 * 2. Code/Programming -> Anthropic Claude
 * 3. Current Events/News -> Google Gemini (with Search)
 * 4. Long Analysis (>200 words) -> Anthropic Claude
 * 5. Creative Writing -> Anthropic Claude
 * 6. General -> OpenAI GPT-4
 */
export const routeMessage = (message: string, hasImage: boolean = false): RoutingDecision => {
  // 0. Check for Image Attachment
  if (hasImage) {
    return {
      provider: ModelProvider.GEMINI,
      reason: "Image attachment detected. Routing to Gemini for vision analysis capabilities."
    };
  }

  const lowerMsg = message.toLowerCase();
  const wordCount = message.trim().split(/\s+/).length;

  // 1. Check for Code/Programming related keywords
  const codeKeywords = [
    'function', 'const ', 'let ', 'var ', 'import ', 'export ', 
    'class ', 'interface ', 'return ', 'console.log', '=>', 
    'react', 'typescript', 'python', 'java', 'html', 'css', 
    'debug', 'fix this', 'code', 'algorithm', 'api', 'endpoint',
    'sql', 'database', 'json', 'regex', 'bash', 'terminal'
  ];
  
  if (codeKeywords.some(keyword => lowerMsg.includes(keyword))) {
    return {
      provider: ModelProvider.CLAUDE,
      reason: "Detected coding or technical question. Claude is optimized for programming tasks."
    };
  }

  // 2. Check for Current Events / Search needs
  const newsKeywords = [
    'news', 'today', 'latest', 'current', 'price', 'stock', 
    'weather', 'who won', 'when is', '2024', '2025', 'recent',
    'happened', 'update', 'live', 'real-time'
  ];

  if (newsKeywords.some(keyword => lowerMsg.includes(keyword))) {
    return {
      provider: ModelProvider.GEMINI,
      reason: "Detected query about current events or real-time data. Gemini with Google Search grounding selected.",
      requiresSearch: true
    };
  }

  // 3. Check for Long Analysis (>200 words)
  if (wordCount > 200) {
    return {
      provider: ModelProvider.CLAUDE,
      reason: "Long-form analysis detected (>200 words). Claude selected for high-context handling."
    };
  }

  // 4. Check for Creative Writing
  const creativeKeywords = [
    'write a story', 'poem', 'essay', 'screenplay', 'script',
    'fiction', 'novel', 'creative', 'narrative', 'haiku'
  ];
  
  if (creativeKeywords.some(keyword => lowerMsg.includes(keyword))) {
    return {
      provider: ModelProvider.CLAUDE,
      reason: "Creative writing task detected. Claude selected for nuanced generation."
    };
  }

  // 5. Default to GPT-4 for general conversational queries
  return {
    provider: ModelProvider.GPT4,
    reason: "General conversational query detected. Routing to GPT-4o for reliable general knowledge."
  };
};