/**
 * System prompts for Bedrock LLM use-cases. Update these for prompt engineering.
 * All prompts should be clear, concise, and tailored to the specific task.
 */

import { INTENTS, getSuggestions } from './intents';

// Helper function to build intent list
function buildIntentList(): string {
	const intentLines = INTENTS.map(
		(intent) =>
			`- ${intent.name}: ${intent.promptInstructions}${intent.slots.length ? ` (slots: ${intent.slots.join(', ')})` : ''}`
	);
	return intentLines.join('\n');
}

/**
 * Creates intent detection prompt for analyzing user messages.
 */
export function createIntentDetectionPrompt(): string {
	const intentList = buildIntentList();

	return `
You are an intent recognition engine for a Medicare chatbot. Analyze the user's message to determine the best match.

Supported intents (choose the closest match):
${intentList}

If we are unsure what they are asking or they are asking something outside of the scope of what we can help with, return the "Unknown" intent.

CRITICAL FORMATTING REQUIREMENTS:
- Respond ONLY with a valid, minified JSON object
- Do NOT include any explanation, extra text, markdown formatting, or code blocks
- Do NOT wrap the response in arrays, quotes, or additional JSON structures
- Return raw JSON directly without any wrapper format
- Ensure the JSON is valid and properly escaped

The response should be a JSON object with these fields:
- intent (string): one of the supported intents below
- confidence (number): your confidence (0-1)
- slots (object, optional): any key-value slots extracted from the message (omit this property if there are no slots)

Example (with slots):
{"intent":"GetDrugPrice","confidence":0.92,"slots":{"drug_name":"atorvastatin"}}

Example (no slots):
{"intent":"Welcome","confidence":0.99}`;
}

/**
 * Creates fallback prompt for when intent cannot be determined.
 */
export function createFallbackPrompt(args: {
	originalMessage: string;
	suggestedActions?: string[];
}): string {
	const { originalMessage, suggestedActions = [] } = args;
	const suggestionsText = suggestedActions.map((action) => `- ${action}`).join('\n');

	let prompt = `
You are a helpful and knowledgeable Medicare chatbot. We did not not understand the user's request
or they are asking something outside of the scope of what we can help with.

The user said: 
"${originalMessage}"

Please respond to:
- Acknowledge that you didn't understand their request clearly
- Ask them to rephrase or provide more details
- Offer helpful suggestions of what we can help with. Do not suggest things that are outside of our scope.
- Keep your response concise, empathetic, and focused on helping them get the Medicare information they need

Response format:
- Respond ONLY with plain text
- Do NOT include JSON, markdown formatting, or structured data
- Do NOT use code blocks, bullet points, or numbered lists in your response
- Write in natural, conversational language as if speaking directly to the user
`;

	if (suggestionsText.length > 0) {
		prompt += `\n\nSuggest these options:\n${suggestionsText}`;
	} else {
		prompt += `\n\nSuggest these options:\n${getSuggestions().join('\n')}`;
	}

	return prompt;
}

/**
 * Creates clarification prompt for when intent is suspected but confidence is low.
 */
export function createClarificationPrompt(args: {
	suspectedIntent: string;
	confidence: number;
	extractedSlots?: Record<string, unknown>;
	originalMessage: string;
}): string {
	const { suspectedIntent, confidence, extractedSlots = {}, originalMessage } = args;
	const confidencePercentage = Math.round(confidence * 100);

	let prompt = `
You are a helpful and knowledgeable Medicare chatbot. I think the user is asking about "${suspectedIntent}" 
but I'm not completely confident (${confidencePercentage}% sure).

Original message: "${originalMessage}"`;

	if (Object.keys(extractedSlots).length > 0) {
		const extractedDetails = Object.entries(extractedSlots)
			.map(([key, value]) => `${key}: ${value}`)
			.join(', ');

		prompt += `\n\nI extracted these details: ${extractedDetails}`;
	}

	prompt += `\n\nPlease:
1. Acknowledge their request in a friendly way
2. Confirm if you understood correctly what they're looking for
3. Ask for clarification on any unclear details
4. Offer to help once you have the right information

RESPONSE FORMAT REQUIREMENTS:
- Respond ONLY with plain text
- Do NOT include JSON, markdown formatting, or structured data
- Do NOT use code blocks, bullet points, or numbered lists in your response
- Write in natural, conversational language as if speaking directly to the user
- Keep your response conversational and helpful`;

	return prompt;
}

/**
 * Creates missing information prompt for when intent is confident but slots are incomplete.
 */
export function createMissingInformationPrompt(args: {
	intent: string;
	topic: string;
	providedSlots: string[];
	missingSlots: string[];
}): string {
	const { intent, topic, providedSlots, missingSlots } = args;
	const providedInfo = providedSlots.join(', ');
	const missingInfo = missingSlots.join(', ');

	let prompt = `
You are a helpful and knowledgeable Medicare chatbot. The user is asking about ${topic} for intent: ${intent}).`;

	if (providedInfo.length > 0) {
		prompt += `\n\nI already have this information: ${providedInfo}`;
	}

	if (missingInfo.length > 0) {
		prompt += `\n\nI need additional information: ${missingInfo}`;
	}

	prompt += `\n\n
Please:
1. Acknowledge their request positively
2. Explain that you need a bit more information to help them accurately
3. Ask specifically for the missing information in a natural, conversational way

RESPONSE FORMAT REQUIREMENTS:
- Respond ONLY with plain text
- Do NOT include JSON, markdown formatting, or structured data
- Do NOT use code blocks, bullet points, or numbered lists in your response
- Write in natural, conversational language as if speaking directly to the user
- Keep your response friendly, clear, concise, and focused on getting the specific details needed`;

	console.log('[DEBUG] Missing information prompt:', prompt);
	return prompt;
}

/**
 * Creates a general response generation prompt with consistent formatting requirements.
 */
export function createGeneralResponsePrompt(context?: string): string {
	let prompt = `
You are a helpful and knowledgeable Medicare chatbot. Respond to the user as a friendly healthcare assistant.`;

	if (context) {
		prompt += `\n\nContext: ${context}`;
	}

	prompt += `\n
Guidelines:
- Keep answers accurate, concise, and easy to understand
- If you do not know the answer, say so honestly
- Focus on Medicare-related information and guidance
- Be empathetic and supportive in your responses

RESPONSE FORMAT REQUIREMENTS:
- Respond ONLY with plain text
- Do NOT include JSON, markdown formatting, or structured data
- Do NOT use code blocks, bullet points, or numbered lists in your response
- Write in natural, conversational language as if speaking directly to the user
- Ensure your response flows naturally and reads like human conversation`;

	return prompt;
}

/**
 * Create a general response with a definitive answer.
 * We provide the answer, which may be a string or a JSON object.
 * And then we will prompt the LLM to format the response in a human-readable way
 * with the appropriate formatting for the response type and context of the
 * previous messages.
 */
export function createAnswerPrompt(
	topic: string,
	answer: string | Record<string, unknown>
): string {
	const strAnswer = typeof answer === 'string' ? answer : JSON.stringify(answer);
	return `
You are a helpful and knowledgeable Medicare chatbot. Respond to the user as a friendly healthcare assistant.
You will be provided with an answer, which may be a string or a JSON object.
You will need to format the response in a human-readable way with the appropriate formatting for the response 
type and context of the previous messages.

The user is asking about: ${topic}.

Answer: 
${strAnswer}
	`;
}
