import { nanoid } from 'nanoid';
import { ChatMessage, type MessageRole } from './chat-message';
import { getIntentByName } from '../intents';
import type { Intent } from '$lib/types/intentTypes';
import type { AuthJwtPayload } from '$lib/types/authTypes';

function generateSessionId(): string {
	return nanoid(16);
}

export class ChatSession {
	sessionId: string;
	beneficiaryKey: number;
	createdAt: Date;
	lastActivity: Date;
	messages: ChatMessage[] = [];
	currentIntent?: Intent;
	currentConfidence?: number;
	collectedSlots: Record<string, unknown> = {};
	user?: AuthJwtPayload;

	constructor(beneficiaryKey: number, sessionId?: string) {
		this.sessionId = sessionId || generateSessionId();
		this.beneficiaryKey = beneficiaryKey;
		this.createdAt = new Date();
		this.lastActivity = new Date();
		this.messages = [];
		this.currentIntent = undefined;
		this.currentConfidence = undefined;
		this.collectedSlots = {};
		this.user = undefined;
	}

	public get intentName(): string {
		return this.currentIntent?.name ?? 'Unknown';
	}

	public get intentConfidence(): number {
		return this.currentConfidence ?? 0;
	}

	/**
	 * Get the last user message
	 */
	public get userMessage(): string {
		return this.getLastMessage('user')?.content ?? '';
	}

	private addMessage(message: ChatMessage): void {
		this.messages.push(message);
		this.lastActivity = new Date();
	}

	public getMessages(): ChatMessage[] {
		return this.messages;
	}

	public updateActivity(): void {
		this.lastActivity = new Date();
	}

	/**
	 * Set user information for this session
	 */
	public setUser(user: AuthJwtPayload): void {
		this.user = user;
	}

	/**
	 * Append a new user message to the session
	 */
	public addUserMessage(message: string | ChatMessage): ChatMessage {
		const userMessage =
			typeof message === 'string' ? ChatMessage.createUserMessage(message) : message;
		this.addMessage(userMessage);
		return userMessage;
	}

	/**
	 * Append a new assistant message to the session
	 */
	public addAssistantMessage(message: string | ChatMessage) {
		const assistantMessage =
			typeof message === 'string' ? ChatMessage.createAssistantMessage(message) : message;
		this.addMessage(assistantMessage);
		return assistantMessage;
	}

	/**
	 * Check if critical slots have changed and return whether to clear previous slots
	 */
	private shouldClearSlots(newIntentName?: string, newSlots?: Record<string, unknown>): boolean {
		// If no current intent or no new slots, don't clear
		if (!this.currentIntent || !newSlots) return false;

		// If intent changed, clear slots
		if (newIntentName && newIntentName !== this.currentIntent.name) {
			console.log(
				`[DEBUG] Intent changed from "${this.currentIntent.name}" to "${newIntentName}" - clearing all slots`
			);
			return true;
		}

		// Check for critical slot changes within the same intent
		const currentIntent = newIntentName || this.currentIntent.name;
		const intentDefinition = getIntentByName(currentIntent);

		if (!intentDefinition?.criticalSlots) return false;

		// Check if any critical slot has changed
		for (const criticalSlot of intentDefinition.criticalSlots) {
			const oldValue = this.collectedSlots[criticalSlot];
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
		this.collectedSlots = {};
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
				this.currentIntent = intentDefinition;
			}
		}
		if (confidence) this.currentConfidence = confidence;

		// Merge new slots with existing ones
		if (slots) {
			this.collectedSlots = { ...this.collectedSlots, ...slots };
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

	public getLastMessage(type?: MessageRole): ChatMessage | undefined {
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
		const timeSinceActivity = now.getTime() - this.lastActivity.getTime();
		return timeSinceActivity > timeoutMs;
	}
}
