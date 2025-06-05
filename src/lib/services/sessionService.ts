/**
 * Session management service for chatbot conversations
 * Manages in-memory session storage for POC
 */

import type { ChatSession, ChatMessage } from '$lib/types/chatTypes.js';
import { nanoid } from 'nanoid';

// In-memory session storage (in production, this would be Redis/database)
const sessions = new Map<string, ChatSession>();

// Cleanup interval for expired sessions (15 minutes)
const SESSION_TIMEOUT = 60 * 60 * 1000;
const CLEANUP_INTERVAL = 5 * 60 * 1000;

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
	return nanoid(16);
}

/**
 * Create a new chat session
 */
export function createSession(beneficiary_key: number): ChatSession {
	const session_id = generateSessionId();
	const now = new Date();

	const session: ChatSession = {
		session_id,
		beneficiary_key,
		created_at: now,
		last_activity: now,
		messages: [],
		collected_slots: {}
	};

	sessions.set(session_id, session);
	return session;
}

/**
 * Get a session by ID
 */
export function getSession(session_id: string): ChatSession | null {
	const session = sessions.get(session_id);
	if (!session) return null;

	// Check if session is expired
	const now = new Date();
	const timeSinceActivity = now.getTime() - session.last_activity.getTime();

	if (timeSinceActivity > SESSION_TIMEOUT) {
		sessions.delete(session_id);
		return null;
	}

	return session;
}

/**
 * Update session activity timestamp
 */
export function updateSessionActivity(session_id: string): boolean {
	const session = sessions.get(session_id);
	if (!session) return false;

	session.last_activity = new Date();
	return true;
}

/**
 * Add a message to a session
 */
export function addMessageToSession(session_id: string, message: ChatMessage): boolean {
	const session = sessions.get(session_id);
	if (!session) return false;

	session.messages.push(message);
	session.last_activity = new Date();
	return true;
}

/**
 * Update session intent and slots
 */
export function updateSessionContext(
	session_id: string,
	intent?: string,
	slots?: Record<string, unknown>
): boolean {
	const session = sessions.get(session_id);
	if (!session) return false;

	if (intent) session.current_intent = intent;
	if (slots) session.collected_slots = { ...session.collected_slots, ...slots };
	session.last_activity = new Date();
	return true;
}

/**
 * Clean up expired sessions
 */
function cleanupExpiredSessions(): void {
	const now = new Date();
	const expired: string[] = [];

	for (const [session_id, session] of sessions.entries()) {
		const timeSinceActivity = now.getTime() - session.last_activity.getTime();
		if (timeSinceActivity > SESSION_TIMEOUT) {
			expired.push(session_id);
		}
	}

	expired.forEach((session_id) => sessions.delete(session_id));

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
