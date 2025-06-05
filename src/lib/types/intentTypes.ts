// Types for intent controller pattern
import type { ChatSession } from './chatTypes';
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

export interface ChatMessage {
	id: string;
	content: string;
	role: 'user' | 'assistant';
	timestamp: Date;
	metadata: {
		intent: string;
		slots?: Record<string, unknown>;
		confidence_score?: number;
		processing_time_ms?: number;
		[key: string]: unknown;
	};
}

export interface IntentHandlerResult {
	success: boolean;
	message: ChatMessage;
	session_updated?: boolean;
	[key: string]: unknown;
}
