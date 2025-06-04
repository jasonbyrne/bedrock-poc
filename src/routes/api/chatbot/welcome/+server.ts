/**
 * Chatbot welcome endpoint - generates initial welcome message and session
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { ChatbotWelcomeResponse, ChatMessage, ApiError } from '$lib/types/chatTypes.js';
import { authenticateRequest } from '$lib/services/jwtAuth.js';
import { createSession } from '$lib/services/sessionService.js';
import { nanoid } from 'nanoid';

export const POST: RequestHandler = async ({ request }) => {
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

		// Create a new session for this user
		const session = createSession(userPayload.beneficiary_key);

		// Generate personalized welcome message
		const welcomeContent = `Hello ${userPayload.first_name}! I'm your Medicare assistant.

I can help you with:
• Understanding your ${userPayload.plan_type} coverage
• Finding providers and specialists
• Checking drug costs and coverage
• Explaining benefits and services
• Prior authorization requirements

What specific aspect of your Medicare coverage would you like to know about?`;

		// Create the welcome message
		const welcomeMessage: ChatMessage = {
			id: nanoid(12),
			content: welcomeContent,
			role: 'assistant',
			timestamp: new Date(),
			metadata: {
				intent: 'Welcome',
				confidence_score: 1.0,
				processing_time_ms: 0
			}
		};

		// Add the welcome message to the session
		// Note: We don't need to call addMessageToSession since we're returning it
		// The frontend will display it and then call the message endpoint if needed

		const response: ChatbotWelcomeResponse = {
			success: true,
			session_id: session.session_id,
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
