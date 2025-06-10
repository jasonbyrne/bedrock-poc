// Types for intent controller pattern
import type { ChatSession } from '../server/core/chat-session';
import type { ChatMessage } from '../server/core/chat-message';

export interface Intent {
	name: string;
	text: string;
	slots: string[];
	criticalSlots?: string[];
	examples?: string[];
	description?: string;
	isFallback?: boolean;
	requiredSlots?: string[];
}

export interface IntentHandlerParams {
	session: ChatSession;
	started_at: number;
}

export interface IntentHandlerResult {
	success: boolean;
	message: ChatMessage;
	session_updated?: boolean;
	[key: string]: unknown;
}
