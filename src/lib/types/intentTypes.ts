// Types for intent controller pattern
import type { ChatSession } from '../server/core/chat-session';
import type { ChatMessage } from '../server/core/chat-message';
import type { AuthJwtPayload } from '../types/authTypes';

export interface IntentHandlerParams {
	session: ChatSession;
	user: AuthJwtPayload;
	slots?: Record<string, unknown>;
	intent: string;
	confidence: number;
	started_at: number;
	user_message: string;
}

export interface IntentHandlerResult {
	success: boolean;
	message: ChatMessage;
	session_updated?: boolean;
	[key: string]: unknown;
}
