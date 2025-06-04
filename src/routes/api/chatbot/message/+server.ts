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
function recognizeIntent(message: string): {
	intent: string;
	confidence: number;
	slots: Record<string, unknown>;
} {
	const lowerMessage = message.toLowerCase();

	// Simple keyword-based intent recognition for POC
	if (
		lowerMessage.includes('drug') ||
		lowerMessage.includes('medication') ||
		lowerMessage.includes('prescription')
	) {
		return { intent: 'GetDrugPrice', confidence: 0.85, slots: {} };
	}

	if (
		lowerMessage.includes('doctor') ||
		lowerMessage.includes('provider') ||
		lowerMessage.includes('physician')
	) {
		return { intent: 'FindProvider', confidence: 0.8, slots: {} };
	}

	if (
		lowerMessage.includes('plan') ||
		lowerMessage.includes('coverage') ||
		lowerMessage.includes('benefit')
	) {
		return { intent: 'GetPlanInfo', confidence: 0.75, slots: {} };
	}

	if (
		lowerMessage.includes('hello') ||
		lowerMessage.includes('hi') ||
		lowerMessage.includes('help')
	) {
		return { intent: 'Welcome', confidence: 0.9, slots: {} };
	}

	return { intent: 'Unknown', confidence: 0.5, slots: {} };
}

/**
 * Generate bot response based on intent
 */
function generateBotResponse(
	intent: string,
	userMessage: string,
	userPayload: import('$lib/types/authTypes.js').AuthJwtPayload
): string {
	switch (intent) {
		case 'GetDrugPrice':
			return `I can help you check drug costs and coverage under your ${userPayload.plan_type}. To provide accurate information, I'll need to know:\n\n• The specific medication name\n• The dosage and quantity\n• Your preferred pharmacy\n\nCould you please provide the name of the medication you're asking about?`;

		case 'FindProvider':
			return `I can help you find providers in your network. Your current primary care physician is ${userPayload.primary_care_physician || 'not listed'}.\n\nWhat type of provider are you looking for?\n• Primary care physician\n• Specialist (please specify)\n• Hospital or medical facility\n\nAlso, would you like providers near your current location in ${userPayload.city}, ${userPayload.state}?`;

		case 'GetPlanInfo':
			return `I can explain your ${userPayload.plan_type} coverage details. Here are some key aspects I can help with:\n\n• Covered services and benefits\n• Copayments and deductibles\n• Network providers\n• Prescription drug coverage\n• Prior authorization requirements\n\nWhat specific aspect of your plan would you like to know about?`;

		case 'Welcome':
			return `Hello ${userPayload.first_name}! I'm here to help with your Medicare questions. What would you like to know about your ${userPayload.plan_type} coverage?`;

		default:
			return `I'd like to help you with that. Could you please be more specific about what you need? I can assist with:\n\n• Drug costs and coverage\n• Finding providers\n• Understanding your plan benefits\n• Coverage questions\n\nWhat would you like to know more about?`;
	}
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

		// Recognize intent
		const { intent, confidence, slots } = recognizeIntent(messageRequest.message);

		// Generate bot response
		const botResponseContent = generateBotResponse(intent, messageRequest.message, userPayload);

		// Create bot response message
		const processingTime = Date.now() - startTime;
		const botMessage: ChatMessage = {
			id: nanoid(12),
			content: botResponseContent,
			role: 'assistant',
			timestamp: new Date(),
			metadata: {
				intent,
				slots,
				confidence_score: confidence,
				processing_time_ms: processingTime
			}
		};

		// Add bot message to session and update context
		addMessageToSession(messageRequest.session_id, botMessage);
		updateSessionContext(messageRequest.session_id, intent, slots);

		const response: ChatbotMessageResponse = {
			success: true,
			message: botMessage,
			session_updated: true
		};

		return json(response);
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
