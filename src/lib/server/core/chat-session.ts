import { nanoid } from 'nanoid';
import { ChatMessage } from './chat-message';

function generateSessionId(): string {
	return nanoid(16);
}

export class ChatSession {
	session_id: string;
	beneficiary_key: number;
	created_at: Date;
	last_activity: Date;
	messages: ChatMessage[] = [];
	current_intent?: string;
	current_confidence?: number;
	collected_slots: Record<string, unknown> = {};

	constructor(beneficiary_key: number, session_id?: string) {
		this.session_id = session_id || generateSessionId();
		this.beneficiary_key = beneficiary_key;
		this.created_at = new Date();
		this.last_activity = new Date();
		this.messages = [];
		this.current_intent = undefined;
		this.current_confidence = undefined;
		this.collected_slots = {};
	}

	public addMessage(message: ChatMessage): void {
		this.messages.push(message);
		this.last_activity = new Date();
	}

	public getMessages(): ChatMessage[] {
		return this.messages;
	}

	public updateActivity(): void {
		this.last_activity = new Date();
	}

	public updateContext(context: {
		intent?: string;
		slots?: Record<string, unknown>;
		confidence?: number;
	}): void {
		const { intent, slots, confidence } = context;
		if (intent) this.current_intent = intent;
		if (slots) this.collected_slots = { ...this.collected_slots, ...slots };
		if (confidence) this.current_confidence = confidence;
		this.updateActivity();
	}

	public getLastNMessages(limit: number = 10, offset: number = 0): ChatMessage[] {
		// We want to pull from the end of the array, don't mutate the array
		return this.messages.slice(
			this.messages.length - limit - offset,
			this.messages.length - offset
		);
	}

	public getLastMessage(type?: 'user' | 'assistant'): ChatMessage | undefined {
		if (!type) {
			return this.messages[this.messages.length - 1];
		}
		// work backwards from the end of the array
		for (let i = this.messages.length - 1; i >= 0; i--) {
			if (this.messages[i].role === type) {
				return this.messages[i];
			}
		}
		return undefined;
	}

	public getMessageById(id: string): ChatMessage | undefined {
		return this.messages.find((msg) => msg.id === id);
	}

	public isExpired(timeoutMs: number): boolean {
		const now = new Date();
		const timeSinceActivity = now.getTime() - this.last_activity.getTime();
		return timeSinceActivity > timeoutMs;
	}
}
