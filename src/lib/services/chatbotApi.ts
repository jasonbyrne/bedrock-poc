/**
 * Client-side API service for chatbot interactions
 */

import type {
	ChatbotWelcomeResponse,
	ChatbotMessageRequest,
	ChatbotMessageResponse,
	ApiError
} from '$lib/types/chatTypes';
import { publicEnv } from '$lib/config/env';

const AUTH_TOKEN_KEY = 'medicare_chatbot_auth_token';

/**
 * Initialize a new chatbot session
 */
export async function initializeChatSession(): Promise<ChatbotWelcomeResponse> {
	const response = await fetch(`${publicEnv.api.baseUrl}/chatbot/welcome`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`
		}
	});

	if (!response.ok) {
		const error: ApiError = await response.json();
		throw new Error(error.error || 'Failed to initialize chat session');
	}

	return response.json();
}

/**
 * Send a message to the chatbot
 */
export async function sendMessage(
	sessionId: string,
	message: string
): Promise<ChatbotMessageResponse> {
	const requestBody: ChatbotMessageRequest = {
		session_id: sessionId,
		message
	};

	const response = await fetch(`${publicEnv.api.baseUrl}/chatbot/message`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`
		},
		body: JSON.stringify(requestBody)
	});

	if (!response.ok) {
		const error: ApiError = await response.json();
		throw new Error(error.error || 'Failed to send message');
	}

	return response.json();
}

/**
 * Type guard to check if response is an error
 */
export function isApiError(response: unknown): response is ApiError {
	return (
		typeof response === 'object' &&
		response !== null &&
		'success' in response &&
		(response as ApiError).success === false
	);
}
