/**
 * Chatbot message endpoint - processes user messages within a session
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { ChatbotMessageRequest, ChatMessage, ApiError } from '$lib/types/chatTypes.js';
import { authenticateRequest } from '$lib/services/jwtAuth.js';
import { addMessageToSession, getSession } from '$lib/services/sessionService.js';
import { nanoid } from 'nanoid';
import { bedrockService } from '$lib/server/services/bedrockService';
import type { AuthJwtPayload } from '$lib/types/authTypes';
import type { ChatSession } from '$lib/types/chatTypes';
import { INTENT_DETECTION_PROMPT } from '$lib/server/systemPrompts';
import { getIntentByName } from '$lib/server/intents';
import type { IntentHandlerParams } from '$lib/types/intentTypes';
import { routeIntent } from '$lib/server/router';

function errorJson(error: string, code: string, status: number): Response {
	return json({ success: false, error, code }, { status });
}

function requireAuth(request: Request): AuthJwtPayload | Response {
	const userPayload = authenticateRequest(request);
	if (!userPayload) {
		return errorJson('Unauthorized - Invalid or missing JWT token', 'AUTH_ERROR', 401);
	}
	return userPayload;
}

function requireValidMessageRequest(body: unknown): ChatbotMessageRequest | Response {
	const messageRequest = validateMessageRequest(body);
	if (!messageRequest) {
		return errorJson(
			'Invalid request - session_id and message are required',
			'VALIDATION_ERROR',
			400
		);
	}
	return messageRequest;
}

function requireSession(session_id: string): ChatSession | Response {
	const session = getSession(session_id);
	if (!session) {
		return errorJson('Session not found or expired', 'SESSION_ERROR', 404);
	}
	return session;
}

function requireSessionOwner(session: ChatSession, user: AuthJwtPayload): true | Response {
	if (session.beneficiary_key !== user.beneficiary_key) {
		return errorJson(
			'Unauthorized - Session does not belong to authenticated user',
			'SESSION_AUTH_ERROR',
			403
		);
	}
	return true;
}

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

export const POST: RequestHandler = async ({ request }) => {
	const startTime = Date.now();

	try {
		// Authenticate the request
		const userPayload = requireAuth(request);
		if (userPayload instanceof Response) return userPayload;

		// Parse and validate request body
		const body = await request.json();
		const messageRequest = requireValidMessageRequest(body);
		if (messageRequest instanceof Response) return messageRequest;

		// Get the session
		const session = requireSession(messageRequest.session_id);
		if (session instanceof Response) return session;

		// Verify session belongs to authenticated user
		const ownershipCheck = requireSessionOwner(session, userPayload);
		if (ownershipCheck instanceof Response) return ownershipCheck;

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

		// Route to the appropriate intent controller
		const params: IntentHandlerParams = {
			session,
			user: userPayload,
			slots,
			intent,
			confidence,
			started_at: startTime,
			user_message: messageRequest.message
		};
		const result = await routeIntent(intent, params);
		// Add assistant message to session history
		if (result && result.message) {
			addMessageToSession(messageRequest.session_id, result.message);
		}
		return json(result);
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
