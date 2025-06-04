/**
 * Chatbot API client service
 * Handles communication with chatbot endpoints
 */

import type {
	ChatbotWelcomeResponse,
	ChatbotMessageRequest,
	ChatbotMessageResponse,
	ApiError
} from '$lib/types/chatTypes.js';

/**
 * Base API request with auth header
 */
async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {},
	token?: string
): Promise<T> {
	const headers = new Headers(options.headers);
	headers.set('Content-Type', 'application/json');

	if (token) {
		headers.set('Authorization', `Bearer ${token}`);
	}

	const response = await fetch(endpoint, {
		...options,
		headers
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.error || `HTTP ${response.status}`);
	}

	return data;
}

/**
 * Initialize a new chat session and get welcome message
 */
export async function initializeChatSession(token: string): Promise<ChatbotWelcomeResponse> {
	return apiRequest<ChatbotWelcomeResponse>(
		'/api/chatbot/welcome',
		{
			method: 'POST'
		},
		token
	);
}

/**
 * Send a message to the chatbot
 */
export async function sendChatMessage(
	sessionId: string,
	message: string,
	token: string
): Promise<ChatbotMessageResponse> {
	const requestBody: ChatbotMessageRequest = {
		session_id: sessionId,
		message
	};

	return apiRequest<ChatbotMessageResponse>(
		'/api/chatbot/message',
		{
			method: 'POST',
			body: JSON.stringify(requestBody)
		},
		token
	);
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
