import { formatPrompt } from '.';

/**
 * Creates missing information prompt for when intent is confident but slots are incomplete.
 * Optimized for Claude Haiku's capabilities and limitations.
 */
export function createMissingInformationPrompt(args: {
	topic: string;
	providedSlots: string[];
	missingSlots: string[];
}): string {
	const { topic, providedSlots, missingSlots } = args;
	const providedInfo = providedSlots.join(', ');
	const missingInfo = missingSlots.join(', ');

	const prompt = `
You are a helpful and knowledgeable Medicare chatbot. You understand the user is asking about ${topic}, 
and you want to make sure you have all the information needed to help them accurately.

You already have this information: ${providedInfo}
You need a bit more information about: ${missingInfo}

RESPONSE GUIDELINES:
1. Acknowledge their request positively
2. Explain why the additional information is important
3. Ask for the missing details in a natural, conversational way
4. Keep the tone friendly and supportive
5. Be concise and focused on getting the specific information needed

EXAMPLES:

For drug price with missing dosage and frequency:
"I understand you're interested in the cost of {drug_name}. What dosage have you been prescribed and how often will you be taking it?"

For provider search with missing location:
"I can help you find a specialist in your area. What is your preferred location?"

Remember:
- Respond ONLY with plain text
- Do NOT include JSON, markdown formatting, or structured data
- Do NOT use code blocks, bullet points, or numbered lists
- Write in natural, conversational language
- Keep your response focused and concise (2-3 sentences)
- Always maintain a helpful, empathetic tone`;

	return formatPrompt(prompt);
}
