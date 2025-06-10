import { nanoid } from 'nanoid';
import { ChatMessage } from './chat-message';
import { getIntentByName } from '../intents';
import type { Intent } from '$lib/types/intentTypes';
import type { AuthJwtPayload } from '$lib/types/authTypes';

function generateSessionId(): string {
	return nanoid(16);
}

export class ChatSession {
	session_id: string;
	beneficiary_key: number;
	created_at: Date;
	last_activity: Date;
	messages: ChatMessage[] = [];
	current_intent?: Intent;
	current_confidence?: number;
	collected_slots: Record<string, unknown> = {};
	user?: AuthJwtPayload;
	user_message?: string;

	constructor(beneficiary_key: number, session_id?: string) {
		this.session_id = session_id || generateSessionId();
		this.beneficiary_key = beneficiary_key;
		this.created_at = new Date();
		this.last_activity = new Date();
		this.messages = [];
		this.current_intent = undefined;
		this.current_confidence = undefined;
		this.collected_slots = {};
		this.user = undefined;
		this.user_message = undefined;
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

	/**
	 * Set user information for this session
	 */
	public setUser(user: AuthJwtPayload): void {
		this.user = user;
	}

	/**
	 * Set the current user message being processed
	 */
	public setCurrentUserMessage(message: string): void {
		this.user_message = message;
	}

	/**
	 * Check if critical slots have changed and return whether to clear previous slots
	 */
	private shouldClearSlots(newIntentName?: string, newSlots?: Record<string, unknown>): boolean {
		// If no current intent or no new slots, don't clear
		if (!this.current_intent || !newSlots) return false;

		// If intent changed, clear slots
		if (newIntentName && newIntentName !== this.current_intent.name) {
			console.log(
				`[DEBUG] Intent changed from "${this.current_intent.name}" to "${newIntentName}" - clearing all slots`
			);
			return true;
		}

		// Check for critical slot changes within the same intent
		const currentIntent = newIntentName || this.current_intent.name;
		const intentDefinition = getIntentByName(currentIntent);

		if (!intentDefinition?.criticalSlots) return false;

		// Check if any critical slot has changed
		for (const criticalSlot of intentDefinition.criticalSlots) {
			const oldValue = this.collected_slots[criticalSlot];
			const newValue = newSlots[criticalSlot];

			// If we have both old and new values and they're different, clear slots
			if (oldValue && newValue && oldValue !== newValue) {
				console.log(
					`[DEBUG] Critical slot changed: ${criticalSlot} from "${oldValue}" to "${newValue}" - clearing all slots`
				);
				return true;
			}
		}

		return false;
	}

	/**
	 * Clear all slots when changing topics or critical slot values
	 */
	private clearSlots(): void {
		console.log('[DEBUG] Clearing all slots - starting fresh');
		this.collected_slots = {};
	}

	public updateContext(context: {
		intent?: string;
		slots?: Record<string, unknown>;
		confidence?: number;
	}): void {
		const { intent, slots, confidence } = context;

		// Check if we should clear previous slots
		if (this.shouldClearSlots(intent, slots)) {
			this.clearSlots();
		}

		// Update intent and confidence
		if (intent) {
			const intentDefinition = getIntentByName(intent);
			if (intentDefinition) {
				this.current_intent = intentDefinition;
			}
		}
		if (confidence) this.current_confidence = confidence;

		// Merge new slots with existing ones
		if (slots) {
			this.collected_slots = { ...this.collected_slots, ...slots };
		}

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
