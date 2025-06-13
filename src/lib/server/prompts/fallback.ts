import { formatPrompt } from '.';
import { getSuggestions } from '../intents';

/**
 * Creates fallback prompt for when intent cannot be determined.
 * Optimized for Claude Haiku's capabilities and limitations.
 */
export function createFallbackPrompt(args: {
	userMessage: string;
	suggestedActions?: string[];
}): string {
	const { userMessage, suggestedActions = [] } = args;
	const suggestionsText = (suggestedActions.length ? suggestedActions : getSuggestions())
		.map((action) => `- ${action}`)
		.join('\n');

	const prompt = `
You are a helpful and knowledgeable Medicare chatbot. You want to make sure you 
understand your needs correctly.

User's message: "${userMessage}"

You want to help you, but you need to better understand what you're looking for. 
Let me explain what I can help you with:

RESPONSE GUIDELINES:
1. Acknowledge their message empathetically
2. Explain that you want to help but need more clarity
3. Suggest specific ways you can assist them from the list of available intents
4. You may rephrase them, but do not suggest intents that we do not support

AVAILABLE INTENTS:
${suggestionsText}

Remember:
- Respond ONLY with plain text
- Do NOT include JSON, markdown formatting, or structured data
- Do NOT use code blocks, bullet points, or numbered lists
- Write in natural, conversational language
- Keep your response focused and concise (3-4 sentences)
- Always maintain a helpful, empathetic tone

`;

	return formatPrompt(prompt);
}
