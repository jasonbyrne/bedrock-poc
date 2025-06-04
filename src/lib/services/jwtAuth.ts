/**
 * JWT authentication utilities for API endpoints
 */

import type { AuthJwtPayload } from '$lib/types/authTypes.js';
import { decodeMockJwt } from './personaService.js';

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
	if (!authHeader) return null;

	const parts = authHeader.split(' ');
	if (parts.length !== 2 || parts[0] !== 'Bearer') {
		return null;
	}

	return parts[1];
}

/**
 * Validate JWT token and return payload
 */
export function validateJwtToken(token: string): AuthJwtPayload | null {
	try {
		return decodeMockJwt(token);
	} catch (error) {
		console.error('JWT validation error:', error);
		return null;
	}
}

/**
 * Extract and validate JWT from request headers
 */
export function authenticateRequest(request: Request): AuthJwtPayload | null {
	const authHeader = request.headers.get('authorization');
	const token = extractBearerToken(authHeader);

	if (!token) return null;

	return validateJwtToken(token);
}
