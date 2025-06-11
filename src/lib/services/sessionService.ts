/**
 * Session management service for Medicare Chatbot POC
 * Handles in-memory session storage and lifecycle
 */

import { ChatSession } from '$lib/server/core/chat-session.js';
import { ChatMessage } from '$lib/server/core/chat-message.js';

// In-memory session storage (in production, this would be Redis/database)
const sessions = new Map<string, ChatSession>();

// Cleanup interval for expired sessions (15 minutes)
const SESSION_TIMEOUT = 60 * 60 * 1000;
const CLEANUP_INTERVAL = 5 * 60 * 1000;

/**
 * Create a new chat session
 */
export function createSession(beneficiaryKey: number): ChatSession {
	const session = new ChatSession(beneficiaryKey);
	sessions.set(session.sessionId, session);
	return session;
}

/**
 * Get a session by ID
 */
export function getSession(sessionId: string): ChatSession | null {
	const session = sessions.get(sessionId);
	if (!session) return null;

	// Check if session is expired
	if (session.isExpired(SESSION_TIMEOUT)) {
		sessions.delete(sessionId);
		return null;
	}

	return session;
}

/**
 * Update session activity timestamp
 */
export function updateSessionActivity(sessionId: string): boolean {
	const session = sessions.get(sessionId);
	if (!session) return false;

	session.updateActivity();
	return true;
}

/**
 * Add a message to a session
 */
export function addMessageToSession(sessionId: string, message: ChatMessage): boolean {
	const session = sessions.get(sessionId);
	if (!session) return false;

	session.addMessage(message);
	return true;
}

/**
 * Update session intent and slots
 */
export function updateSessionContext(
	sessionId: string,
	intent?: string,
	slots?: Record<string, unknown>
): boolean {
	const session = sessions.get(sessionId);
	if (!session) return false;

	session.updateContext({ intent, slots });
	return true;
}

/**
 * Clean up expired sessions
 */
function cleanupExpiredSessions(): void {
	const expired: string[] = [];

	for (const [sessionId, session] of sessions.entries()) {
		if (session.isExpired(SESSION_TIMEOUT)) {
			expired.push(sessionId);
		}
	}

	expired.forEach((sessionId) => sessions.delete(sessionId));

	if (expired.length > 0) {
		console.log(`Cleaned up ${expired.length} expired chat sessions`);
	}
}

/**
 * Get session count (for monitoring)
 */
export function getActiveSessionCount(): number {
	return sessions.size;
}

// Start cleanup interval
if (typeof window === 'undefined') {
	setInterval(cleanupExpiredSessions, CLEANUP_INTERVAL);
}
