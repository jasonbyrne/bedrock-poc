/**
 * Common utility functions for API endpoints
 * Provides reusable helpers for authentication, validation, and error handling
 */

import { json } from '@sveltejs/kit';
import type { ChatbotMessageRequest } from '$lib/types/chatTypes.js';
import { authenticateRequest } from '$lib/services/jwtAuth.js';
import { getSession } from '$lib/services/sessionService.js';
import { ChatSession } from '$lib/server/core/chat-session.js';
import type { AuthJwtPayload } from '$lib/types/authTypes';

/**
 * Create a standardized error JSON response
 */
export function errorJson(error: string, code: string, status: number): Response {
	return json({ success: false, error, code }, { status });
}

/**
 * Require authentication for the request
 * Returns the user payload or an error response
 */
export function requireAuth(request: Request): AuthJwtPayload | Response {
	const userPayload = authenticateRequest(request);
	if (!userPayload) {
		return errorJson('Unauthorized - Invalid or missing JWT token', 'AUTH_ERROR', 401);
	}
	return userPayload;
}

/**
 * Require and validate a session by ID
 * Returns the session or an error response
 */
export function requireSession(session_id: string): ChatSession | Response {
	const session = getSession(session_id);
	if (!session) {
		return errorJson('Session not found or expired', 'SESSION_ERROR', 404);
	}
	return session;
}

/**
 * Require that the session belongs to the authenticated user
 * Returns true or an error response
 */
export function requireSessionOwner(session: ChatSession, user: AuthJwtPayload): true | Response {
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
export function validateMessageRequest(body: unknown): ChatbotMessageRequest | null {
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
 * Require and validate a message request body
 * Returns the validated request or an error response
 */
export function requireValidMessageRequest(body: unknown): ChatbotMessageRequest | Response {
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

/**
 * Type guard to check if a value is a Response object
 * Useful for checking helper function returns
 */
export function isResponse(value: unknown): value is Response {
	return value instanceof Response;
}

/**
 * Execute multiple validation functions and return the first error response
 * or the array of successful results
 */
export function requireAll<T extends unknown[]>(
	...validators: Array<() => T[number] | Response>
): T | Response {
	const results: unknown[] = [];

	for (const validator of validators) {
		const result = validator();
		if (isResponse(result)) {
			return result; // Return first error
		}
		results.push(result);
	}

	return results as T;
}
