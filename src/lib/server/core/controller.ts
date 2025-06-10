import type { IntentHandlerParams } from '$lib/types/intentTypes';
import type { MessageReply } from '$lib/types/message-reply';
import type { ChatSession } from '$lib/server/core/chat-session';
import type { AuthJwtPayload } from '$lib/types/authTypes';

abstract class Controller {
	protected minConfidence: number | null = null;

	protected started_at: number;
	protected session: ChatSession;

	constructor(params: IntentHandlerParams) {
		this.started_at = params.started_at;
		this.session = params.session;

		// Validate required session state
		if (!this.session.user) {
			throw new Error('Controller requires authenticated user in session');
		}
		if (!this.session.current_intent) {
			throw new Error('Controller requires intent in session');
		}
	}

	// Getters to access session data - now guaranteed to exist
	protected get confidence(): number {
		return this.session.current_confidence || 0;
	}

	protected get intent(): string {
		return this.session.current_intent!.name;
	}

	protected get slots(): Record<string, unknown> {
		return this.session.collected_slots;
	}

	protected get user(): AuthJwtPayload {
		return this.session.user!;
	}

	protected get user_message(): string {
		return this.session.user_message || '';
	}

	public isConfident(): boolean {
		if (!this.minConfidence) return true;
		return this.confidence >= this.minConfidence;
	}

	public abstract handle(): Promise<MessageReply>;

	public async clarification(): Promise<MessageReply> {
		return {
			message: 'I am not sure what you mean. Could you please rephrase?'
		};
	}

	protected slotsWeHave(): string[] {
		// Slots that have truthy values
		const haveSlots = Object.keys(this.slots).filter(
			(slot) => this.slots[slot as keyof typeof this.slots]
		);
		console.log('[DEBUG] Slots we have:', haveSlots);
		console.log('[DEBUG] Slots :', this.slots);
		return haveSlots;
	}

	protected slotsWeAreMissing(): string[] {
		const haveSlots = this.slotsWeHave();
		return (
			this.session.current_intent?.requiredSlots?.filter((slot) => !haveSlots.includes(slot)) || []
		);
	}

	protected isMissingRequiredSlots(): boolean {
		return !this.haveAllRequiredSlots();
	}

	protected haveAllRequiredSlots(): boolean {
		if (!this.session.current_intent?.requiredSlots?.length) return true;
		const haveSlots = this.slotsWeHave();
		return this.session.current_intent?.requiredSlots.length === haveSlots.length;
	}
}

export default Controller;
