/**
 * Chatbot welcome endpoint - generates initial welcome message and session
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { ChatbotWelcomeResponse, ApiError } from '$lib/types/chatTypes.js';
import { createSession } from '$lib/services/sessionService.js';
import { ChatMessage } from '$lib/server/core/chat-message.js';
import { getWelcomeMessage } from '../canned-messages';
import { requireAuth } from '$lib/server/utils/apiHelpers.js';

export const POST: RequestHandler = async ({ request }) => {
	try {
		// Authenticate the request
		const userPayload = requireAuth(request);
		if (userPayload instanceof Response) return userPayload;

		// Create a new session for this user
		const session = createSession(userPayload.beneficiaryKey);

		// Generate personalized welcome message
		const welcomeContent = getWelcomeMessage(userPayload);

		// Create the welcome message using the class
		const welcomeMessage = ChatMessage.createAssistantMessage(welcomeContent, {
			intent: 'Welcome',
			confidence_score: 1.0,
			processing_time_ms: 0
		});

		// We're not adding the welcome message to the session, because it does not
		// help our context.

		const response: ChatbotWelcomeResponse = {
			success: true,
			session_id: session.sessionId,
			message: welcomeMessage
		};

		return json(response);
	} catch (error) {
		console.error('Welcome endpoint error:', error);

		const errorResponse: ApiError = {
			success: false,
			error: 'Internal server error',
			code: 'SERVER_ERROR'
		};

		return json(errorResponse, { status: 500 });
	}
};
