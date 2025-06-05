/**
 * Chatbot message endpoint - processes user messages within a session
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { ApiError } from '$lib/types/chatTypes.js';
import { ChatMessage } from '$lib/server/core/chat-message.js';
import { getIntentByName } from '$lib/server/intents';
import type { IntentHandlerParams } from '$lib/types/intentTypes';
import { routeIntent } from '$lib/server/router';
import {
	requireAuth,
	requireValidMessageRequest,
	requireSession,
	requireSessionOwner
} from '$lib/server/utils/apiHelpers.js';
import { detectIntentWithBedrock } from '$lib/server/utils/intentDetection.js';

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

		// Create user message using the class
		const userMessage = ChatMessage.createUserMessage(messageRequest.message);
		session.addMessage(userMessage);

		// Detect intent using Bedrock with conversation context
		const intentResult = await detectIntentWithBedrock(session);
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

		// Update the session context with the latest intent, slots, and confidence
		session.updateContext({ intent, slots, confidence });

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
			session.addMessage(result.message);
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
