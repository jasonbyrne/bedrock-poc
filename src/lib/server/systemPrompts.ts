/**
 * System prompts for Bedrock LLM use-cases. Update these for prompt engineering.
 * All prompts should be clear, concise, and tailored to the specific task.
 */

/**
 * Intent Detection: Instructs the LLM to extract intent, slots, and confidence from user input.
 * Response must be strict JSON: { intent: string, confidence: number, slots?: object }
 */
import { INTENTS } from './intents';

function buildIntentList(): string {
	const intentLines = INTENTS.map(
		(intent) =>
			`- ${intent.name}: ${intent.description}${intent.slots.length ? ` (slots: ${intent.slots.join(', ')})` : ''}`
	);
	return intentLines.join('\n');
}

function buildIntentDetectionPrompt(): string {
	return `You are an intent recognition engine for a Medicare chatbot. Analyze the user's message and return a valid, minified JSON object with these fields:
- intent (string): one of the supported intents below
- confidence (number): your confidence (0-1)
- slots (object, optional): any key-value slots extracted from the message (omit this property if there are no slots)

Supported intents (choose the closest match):
${buildIntentList()}

Respond ONLY with a valid, minified JSON object. Do not include any explanation, extra text, or formatting.

Example (with slots):
{"intent":"GetDrugPrice","confidence":0.92,"slots":{"drug_name":"atorvastatin"}}

Example (no slots):
{"intent":"Welcome","confidence":0.99}`;
}

export const INTENT_DETECTION_PROMPT = buildIntentDetectionPrompt();

/**
 * Response Generation: Instructs the LLM to reply as a friendly, knowledgeable healthcare assistant.
 */
export const RESPONSE_GENERATION_PROMPT = `
You are a helpful and knowledgeable Medicare chatbot. Respond to the user as a friendly healthcare assistant. Keep answers accurate, concise, and easy to understand. If you do not know the answer, say so honestly.
`;
