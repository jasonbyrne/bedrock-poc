import type { IntentHandlerParams } from '$lib/types/intent.types';
import type { MessageReply } from '$lib/types/message-reply';
import type { ChatSession } from '$lib/server/core/chat-session';
import type { AuthJwtPayload } from '$lib/types/authTypes';
import { type LlmResponse, isLlmResponse } from '$lib/types/llmResponse';

abstract class Controller {
	/**
	 * The minimum confidence score required to handle the intent.
	 * If null, the intent will be handled regardless of confidence.
	 */
	protected minConfidence: number | null = null;

	/**
	 * The time the intent was started.
	 */
	protected startedAt: number;

	/**
	 * The session object.
	 */
	protected session: ChatSession;

	constructor(params: IntentHandlerParams) {
		// Validate required session state
		if (!params.session.user) {
			throw new Error('Controller requires authenticated user in session');
		}
		if (!params.session.currentIntent) {
			throw new Error('Controller requires intent in session');
		}
		// Set session state
		this.startedAt = params.started_at;
		this.session = params.session;
	}

	public get user(): AuthJwtPayload {
		// We cast this here because we know the user is authenticated and it won't be null
		return this.session.user as AuthJwtPayload;
	}

	/**
	 * Reply to the user with a message. Handle various overloads of the payload.
	 * @param payload - The message to reply with.
	 * @returns The message reply.
	 */
	protected reply(
		payload: string | LlmResponse | (Record<string, unknown> & { message: string })
	): MessageReply {
		if (isLlmResponse(payload)) {
			if (payload.error) {
				console.error('[ERROR] LLM Error:', payload.error);
			}
			return {
				message: payload.content
			};
		}
		if (typeof payload === 'string') {
			return {
				message: payload
			};
		}
		return {
			message: payload.message
		};
	}

	public isConfident(): boolean {
		if (!this.minConfidence) return true;
		return (this.session.currentConfidence || 0) >= this.minConfidence;
	}

	public abstract handle(): Promise<MessageReply>;

	public async clarification(): Promise<MessageReply> {
		return {
			message: 'I am not sure what you mean. Could you please rephrase?'
		};
	}

	protected slotsWeHave(): string[] {
		// Slots that have truthy values
		const haveSlots = Object.keys(this.session.collectedSlots).filter(
			(slot) => this.session.collectedSlots[slot as keyof typeof this.session.collectedSlots]
		);
		console.log('[DEBUG] Slots we have:', haveSlots);
		console.log('[DEBUG] Slots :', this.session.collectedSlots);
		return haveSlots;
	}

	protected slotsWeAreMissing(): string[] {
		const haveSlots = this.slotsWeHave();
		return (
			this.session.currentIntent?.requiredSlots?.filter((slot) => !haveSlots.includes(slot)) || []
		);
	}

	protected isMissingRequiredSlots(): boolean {
		return this.slotsWeAreMissing().length > 0;
	}

	protected haveAllRequiredSlots(): boolean {
		if (!this.session.currentIntent?.requiredSlots?.length) return true;
		return this.slotsWeAreMissing().length === 0;
	}
}

export default Controller;
