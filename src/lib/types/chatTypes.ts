/**
 * Chat and conversation type definitions for Medicare Chatbot POC
 */

export interface ChatMessage {
	id: string;
	content: string;
	role: 'user' | 'assistant';
	timestamp: Date;
	is_typing?: boolean;
	metadata?: MessageMetadata;
}

export interface MessageMetadata {
	intent?: string;
	slots?: Record<string, unknown>;
	confidence_score?: number;
	processing_time_ms?: number;
	error?: string;
}

export interface ConversationState {
	session_id: string;
	messages: ChatMessage[];
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
	message: ChatMessage;
	error?: string;
}

export interface ChatbotMessageRequest {
	session_id: string;
	message: string;
}

export interface ChatbotMessageResponse {
	success: boolean;
	message: ChatMessage;
	session_updated: boolean;
	error?: string;
}

export interface ChatSession {
	session_id: string;
	beneficiary_key: number;
	created_at: Date;
	last_activity: Date;
	messages: ChatMessage[];
	current_intent?: string;
	collected_slots: Record<string, unknown>;
}

export interface ApiError {
	success: false;
	error: string;
	code?: string;
}
