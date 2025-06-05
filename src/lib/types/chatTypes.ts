/**
 * Chat and conversation type definitions for Medicare Chatbot POC
 */

// Re-export the class-based types for compatibility
export type { ChatMessage } from '$lib/server/core/chat-message.js';
export type { ChatSession } from '$lib/server/core/chat-session.js';

// Keep existing metadata interface for backward compatibility
export interface MessageMetadata {
	intent?: string;
	slots?: Record<string, unknown>;
	confidence_score?: number;
	processing_time_ms?: number;
	error?: string;
	[key: string]: unknown;
}

// Legacy interface for compatibility during transition
export interface LegacyChatMessage {
	id: string;
	content: string;
	role: 'user' | 'assistant';
	timestamp: Date;
	is_typing?: boolean;
	metadata?: MessageMetadata;
}

// Union type that accepts both old and new formats
export type ChatMessageLike =
	| LegacyChatMessage
	| import('$lib/server/core/chat-message.js').ChatMessage;

export interface ConversationState {
	session_id: string;
	messages: ChatMessageLike[];
	is_loading: boolean;
	current_intent?: string;
	collected_slots: Record<string, unknown>;
	last_activity: Date;
}

export interface ChatInputState {
	message: string;
	is_sending: boolean;
	error?: string;
}

export type MessageRole = 'user' | 'assistant';

// Chatbot API Types
export interface ChatbotWelcomeResponse {
	success: boolean;
	session_id: string;
	message: ChatMessageLike;
	error?: string;
}

export interface ChatbotMessageRequest {
	session_id: string;
	message: string;
}

export interface ChatbotMessageResponse {
	success: boolean;
	message: ChatMessageLike;
	session_updated: boolean;
	error?: string;
}

export interface ApiError {
	success: false;
	error: string;
	code?: string;
}
