/**
 * Chatbot message endpoint - processes user messages within a session
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type {
	ChatbotMessageRequest,
	ChatbotMessageResponse,
	ChatMessage,
	ApiError
} from '$lib/types/chatTypes.js';
import { authenticateRequest } from '$lib/services/jwtAuth.js';
import {
	getSession,
	addMessageToSession,
	updateSessionContext
} from '$lib/services/sessionService.js';
import { nanoid } from 'nanoid';
import { bedrockService, type BedrockMessage } from '$lib/server/services/bedrockService';
import { INTENT_DETECTION_PROMPT, RESPONSE_GENERATION_PROMPT } from '$lib/server/systemPrompts';
import { getIntentByName } from '$lib/server/intents';
import { getWelcomeMessage } from '../canned-messages';
import type { ChatSession } from '$lib/types/chatTypes.js';

const DEFAULT_CONFIDENCE_THRESHOLD = 0.7;

/**
 * Validate request body for message endpoint
 */
function validateMessageRequest(body: unknown): ChatbotMessageRequest | null {
	if (!body || typeof body !== 'object') return null;

	const req = body as Record<string, unknown>;

	if (typeof req.session_id !== 'string' || !req.session_id.trim()) return null;
	if (typeof req.message !== 'string' || !req.message.trim()) return null;

	return {
		session_id: req.session_id.trim(),
		message: req.message.trim()
	};
}

/**
 * Simple intent recognition (placeholder for AWS Comprehend integration)
 */
// Bedrock-powered intent detection
async function detectIntentWithBedrock(
	userMessage: string
): Promise<{ intent: string; confidence: number; slots?: Record<string, unknown> } | null> {
	const bedrockResult = await bedrockService.generateResponse({
		systemPrompt: INTENT_DETECTION_PROMPT,
		previousMessages: [],
		userInput: userMessage
	});
	console.log('[DEBUG] Raw Bedrock intent output:', bedrockResult.content);
	try {
		interface ParsedIntent {
			intent?: string;
			confidence?: number;
			slots?: Record<string, unknown>;
		}
		let parsed: ParsedIntent | null = null;
		// Try to parse as array first (Claude 3 format)
		if (typeof bedrockResult.content === 'string' && bedrockResult.content.trim().startsWith('[')) {
			const arr: Array<{ type: string; text: string }> = JSON.parse(bedrockResult.content);
			if (Array.isArray(arr) && arr.length > 0 && typeof arr[0].text === 'string') {
				parsed = JSON.parse(arr[0].text) as ParsedIntent;
			}
		} else {
			parsed = JSON.parse(bedrockResult.content) as ParsedIntent;
		}
		console.log('[DEBUG] Parsed intent JSON:', parsed);
		if (parsed && typeof parsed.intent === 'string' && typeof parsed.confidence === 'number') {
			return parsed as { intent: string; confidence: number; slots?: Record<string, unknown> };
		}
		console.warn('[WARN] Parsed object missing required fields:', parsed);
	} catch (err) {
		console.error('Failed to parse Bedrock intent JSON:', err, bedrockResult.content);
	}
	return null;
}

function generateChatMessage(params: {
	content: string;
	intent: string;
	slots?: Record<string, unknown>;
	confidence: number;
	processingTime: number;
}): ChatMessage {
	return {
		id: nanoid(12),
		content: params.content,
		role: 'assistant',
		timestamp: new Date(),
		metadata: {
			intent: params.intent,
			slots: params.slots,
			confidence_score: params.confidence,
			processing_time_ms: params.processingTime
		}
	};
}

function prepareResponse(params: {
	session: ChatSession;
	content: string;
	intent: string;
	slots?: Record<string, unknown>;
	confidence: number;
	processingTime: number;
}): Response {
	const message = generateChatMessage(params);
	addMessageToSession(params.session.session_id, message);
	updateSessionContext(params.session.session_id, params.intent, params.slots);
	const response: ChatbotMessageResponse = {
		success: true,
		message,
		session_updated: true
	};
	return json(response, { status: 200 });
}

// Bedrock-powered response generation
async function generateChatbotReply(
	systemPrompt: string,
	history: BedrockMessage[],
	userInput: string
): Promise<string> {
	const bedrockResult = await bedrockService.generateResponse({
		systemPrompt,
		previousMessages: history,
		userInput
	});
	return bedrockResult.content;
}

export const POST: RequestHandler = async ({ request }) => {
	const startTime = Date.now();

	try {
		// Authenticate the request
		const userPayload = authenticateRequest(request);
		if (!userPayload) {
			const errorResponse: ApiError = {
				success: false,
				error: 'Unauthorized - Invalid or missing JWT token',
				code: 'AUTH_ERROR'
			};
			return json(errorResponse, { status: 401 });
		}

		// Parse and validate request body
		const body = await request.json();
		const messageRequest = validateMessageRequest(body);

		if (!messageRequest) {
			const errorResponse: ApiError = {
				success: false,
				error: 'Invalid request - session_id and message are required',
				code: 'VALIDATION_ERROR'
			};
			return json(errorResponse, { status: 400 });
		}

		// Get the session
		const session = getSession(messageRequest.session_id);
		if (!session) {
			const errorResponse: ApiError = {
				success: false,
				error: 'Session not found or expired',
				code: 'SESSION_ERROR'
			};
			return json(errorResponse, { status: 404 });
		}

		// Verify session belongs to authenticated user
		if (session.beneficiary_key !== userPayload.beneficiary_key) {
			const errorResponse: ApiError = {
				success: false,
				error: 'Unauthorized - Session does not belong to authenticated user',
				code: 'SESSION_AUTH_ERROR'
			};
			return json(errorResponse, { status: 403 });
		}

		// Create user message
		const userMessage: ChatMessage = {
			id: nanoid(12),
			content: messageRequest.message,
			role: 'user',
			timestamp: new Date()
		};

		// Add user message to session
		addMessageToSession(messageRequest.session_id, userMessage);

		// Detect intent using Bedrock
		const intentResult = await detectIntentWithBedrock(messageRequest.message);
		if (!intentResult) {
			const errorResponse: ApiError = {
				success: false,
				error: 'Could not determine intent from message',
				code: 'INTENT_ERROR'
			};
			return json(errorResponse, { status: 422 });
		}
		const { intent, confidence, slots } = intentResult;

		// Get intent details
		const intentDetails = getIntentByName(intent);
		if (!intentDetails) {
			const errorResponse: ApiError = {
				success: false,
				error: 'Intent not found',
				code: 'INTENT_ERROR'
			};
			return json(errorResponse, { status: 422 });
		}

		// Check confidence threshold
		if (confidence < (intentDetails.confidenceRequired ?? DEFAULT_CONFIDENCE_THRESHOLD)) {
			return prepareResponse({
				session,
				content: 'I am not sure what you mean. Could you please rephrase?',
				intent: 'Unknown',
				confidence,
				slots,
				processingTime: Date.now() - startTime
			});
		}

		// Intent routing
		switch (intentDetails.name) {
			case 'Unknown':
				return prepareResponse({
					session,
					content: 'I am not sure what you mean. Could you please rephrase?',
					intent: 'Unknown',
					confidence,
					slots,
					processingTime: Date.now() - startTime
				});
			case 'Welcome':
				return prepareResponse({
					session,
					content: getWelcomeMessage(userPayload),
					intent: 'Welcome',
					confidence,
					slots,
					processingTime: Date.now() - startTime
				});
		}

		// Prepare chat history for Bedrock response generation
		const chatHistory: BedrockMessage[] = session.messages
			.filter((msg) => msg.role === 'user' || msg.role === 'assistant')
			.map((msg) => ({ role: msg.role as 'user' | 'assistant', content: msg.content }));

		const botResponseContent = await generateChatbotReply(
			RESPONSE_GENERATION_PROMPT,
			chatHistory,
			messageRequest.message
		);

		// Defensive: ensure only string is used for content
		type ClaudeTextObj = { type: string; text: string };
		let assistantText = botResponseContent;
		// If it's a stringified array, parse and extract .text
		if (typeof assistantText === 'string' && assistantText.trim().startsWith('[')) {
			try {
				const arr = JSON.parse(assistantText) as ClaudeTextObj[];
				if (Array.isArray(arr) && arr.length > 0 && typeof arr[0].text === 'string') {
					assistantText = arr[0].text;
				}
			} catch {
				// ignore parse error, fallback below
			}
		} else if (
			Array.isArray(assistantText) &&
			assistantText.length > 0 &&
			typeof (assistantText as ClaudeTextObj[])[0].text === 'string'
		) {
			assistantText = (assistantText as ClaudeTextObj[])[0].text;
		} else if (
			typeof assistantText === 'object' &&
			assistantText !== null &&
			'text' in assistantText &&
			typeof (assistantText as ClaudeTextObj).text === 'string'
		) {
			assistantText = (assistantText as ClaudeTextObj).text;
		}
		if (typeof assistantText !== 'string') {
			assistantText = '[Error: Unexpected response format from Claude 3]';
		}

		// Create bot response message
		return prepareResponse({
			session,
			content: assistantText,
			intent,
			slots,
			confidence,
			processingTime: Date.now() - startTime
		});
	} catch (error) {
		console.error('Message endpoint error:', error);

		const errorResponse: ApiError = {
			success: false,
			error: 'Internal server error',
			code: 'SERVER_ERROR'
		};

		return json(errorResponse, { status: 500 });
	}
};
