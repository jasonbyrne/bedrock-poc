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

// Enhanced error types for better UI handling
export interface SessionExpiredError extends Error {
	type: 'SESSION_EXPIRED';
	code: 'SESSION_ERROR';
}

export interface AuthError extends Error {
	type: 'AUTH_ERROR';
	code: 'AUTH_ERROR';
}

export interface ApiRequestError extends Error {
	type: 'API_ERROR';
	code?: string;
}

/**
 * Create typed error from API response
 */
function createTypedError(
	error: ApiError,
	status: number
): SessionExpiredError | AuthError | ApiRequestError {
	// Check for session error first - both 404 and SESSION_ERROR code
	if (error.code === 'SESSION_ERROR' || (status === 404 && error.error.includes('Session'))) {
		const sessionError = new Error(error.error) as SessionExpiredError;
		sessionError.type = 'SESSION_EXPIRED';
		sessionError.code = 'SESSION_ERROR';
		return sessionError;
	}

	if (error.code === 'AUTH_ERROR' && status === 401) {
		const authError = new Error(error.error) as AuthError;
		authError.type = 'AUTH_ERROR';
		authError.code = 'AUTH_ERROR';
		return authError;
	}

	const apiError = new Error(error.error) as ApiRequestError;
	apiError.type = 'API_ERROR';
	apiError.code = error.code;
	return apiError;
}

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
		throw createTypedError(error, response.status);
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
		throw createTypedError(error, response.status);
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

/**
 * Type guards for specific error types
 */
export function isSessionExpiredError(error: unknown): error is SessionExpiredError {
	return error instanceof Error && 'type' in error && error.type === 'SESSION_EXPIRED';
}

export function isAuthError(error: unknown): error is AuthError {
	return error instanceof Error && 'type' in error && error.type === 'AUTH_ERROR';
}
