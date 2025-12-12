// These are placeholders as requested by the prompt.
// "Use placeholder functions for OpenAI and Anthropic APIs"

export const callOpenAI = async (message: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        `[GPT-4o] This is a simulated response for: "${message.substring(0, 30)}..."\n\n` +
        `I am answering this because the NEXUS Router determined your query was General Knowledge or matched my default routing capabilities.\n\n` +
        `*System Note: Real OpenAI API key integration would happen here.*`
      );
    }, 1500);
  });
};

export const callClaude = async (message: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        `[Claude 3.5 Sonnet] I have analyzed your request: "${message.substring(0, 30)}..."\n\n` +
        `The NEXUS Router selected me because your prompt appears to involve:\n` +
        `- Complex code generation\n` +
        `- Creative writing\n` +
        `- OR Detailed analysis\n\n` +
        `Here is a sample code block to demonstrate my capabilities:\n\n` +
        `\`\`\`typescript\n` +
        `function helloNexus() {\n` +
        `  console.log("Routing successful!");\n` +
        `}\n` +
        `\`\`\``
      );
    }, 2000);
  });
};
