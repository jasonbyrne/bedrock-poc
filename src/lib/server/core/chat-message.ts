import { nanoid } from 'nanoid';

export interface MessageMetadata {
	intent?: string;
	slots?: Record<string, unknown>;
	confidence_score?: number;
	processing_time_ms?: number;
	error?: string;
	[key: string]: unknown;
}

export class ChatMessage {
	public id: string;
	public content: string;
	public role: 'user' | 'assistant';
	public timestamp: Date;
	public is_typing?: boolean;
	public metadata?: MessageMetadata;
	public processing_time_ms?: number;
	public error?: string;

	constructor(
		role: 'user' | 'assistant',
		content: string,
		options: {
			id?: string;
			timestamp?: Date;
			is_typing?: boolean;
			metadata?: MessageMetadata;
			processing_time_ms?: number;
			error?: string;
		} = {}
	) {
		this.id = options.id || nanoid(12);
		this.content = content.trim();
		this.role = role;
		this.timestamp = options.timestamp || new Date();
		this.is_typing = options.is_typing;
		this.metadata = options.metadata;
		this.processing_time_ms = options.processing_time_ms;
		this.error = options.error;
	}

	/**
	 * Create a user message
	 */
	static createUserMessage(
		content: string,
		options?: { id?: string; timestamp?: Date }
	): ChatMessage {
		return new ChatMessage('user', content, options);
	}

	/**
	 * Create an assistant message with metadata
	 */
	static createAssistantMessage(
		content: string,
		metadata?: MessageMetadata,
		options?: { id?: string; timestamp?: Date; processing_time_ms?: number }
	): ChatMessage {
		return new ChatMessage('assistant', content, {
			...options,
			metadata
		});
	}

	/**
	 * Create a typing indicator message
	 */
	static createTypingIndicator(): ChatMessage {
		return new ChatMessage('assistant', '', {
			id: `typing_${Date.now()}`,
			is_typing: true
		});
	}

	/**
	 * Update the message metadata
	 */
	public updateMetadata(metadata: Partial<MessageMetadata>): void {
		this.metadata = { ...this.metadata, ...metadata };
	}

	/**
	 * Set intent information
	 */
	public setIntent(intent: string, confidence?: number, slots?: Record<string, unknown>): void {
		this.updateMetadata({
			intent,
			confidence_score: confidence,
			slots
		});
	}

	/**
	 * Mark processing complete with timing
	 */
	public markProcessingComplete(started_at: number): void {
		this.processing_time_ms = Date.now() - started_at;
		this.updateMetadata({
			processing_time_ms: this.processing_time_ms
		});
	}
}
