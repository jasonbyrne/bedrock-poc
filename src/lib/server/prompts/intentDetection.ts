import { getPromptInstructions } from '$lib/server/intents';

const intentList = getPromptInstructions(true).join('\n');

/**
 * Creates intent detection prompt for Claude.
 * Optimized for Claude Haiku's capabilities and limitations.
 */
export function createIntentDetectionPrompt(userInput: string): string {
	const prompt = `
You are a helpful and knowledgeable Medicare chatbot. Your task is to analyze the user's message 
and determine their intent and any relevant details they've provided.

User's message: "${userInput}"

AVAILABLE INTENTS: 
${intentList}

RESPONSE REQUIREMENTS:
You MUST respond with a JSON object containing:
{
  "intent": string,      // The most likely intent from the Available Intents, or "Unknown" if unclear
  "confidence": number,  // Your confidence in this intent (0.0 to 1.0)
  "slots": {            // Any relevant details extracted from the message
    "key": "value"      // Key-value pairs of extracted information
  }
}

EXAMPLES:

Input: "How much will my Lipitor cost?"
Output: {
  "intent": "GetSingleDrugPrice",
  "confidence": 0.95,
  "slots": {
    "drug_name": "Lipitor"
  }
}

Input: "I need to find a cardiologist near me"
Output: {
  "intent": "FindProvider",
  "confidence": 0.9,
  "slots": {
    "provider_type": "cardiologist",
    "location": "near me"
  }
}

Input: "Why did the chicken cross the road?"
Output: {
  "intent": "Unknown",
  "confidence": 0.1
}

IMPORTANT:
- You MUST respond with ONLY a valid JSON object
- Do NOT include any explanatory text before or after the JSON
- The JSON must match the exact structure shown above
- If you're unsure about the intent, respond with the "Unknown" intent with low confidence
- Only extract slots that are explicitly mentioned in the message
`;

	return prompt;
}
