import type { IntentHandlerParams } from '$lib/types/intentTypes';
import type { MessageReply } from '$lib/types/message-reply';
import type { ChatSession } from '$lib/types/chatTypes';
import type { AuthJwtPayload } from '$lib/types/authTypes';

abstract class Controller {
	protected minConfidence: number | null = null;

	protected confidence: number;
	protected intent: string;
	protected slots: Record<string, unknown>;
	protected started_at: number;
	protected user_message: string;
	protected session: ChatSession;
	protected user: AuthJwtPayload;

	constructor(params: IntentHandlerParams) {
		this.confidence = params.confidence;
		this.intent = params.intent;
		this.slots = params.slots ?? {};
		this.started_at = params.started_at;
		this.user_message = params.user_message;
		this.session = params.session;
		this.user = params.user;
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
}

export default Controller;
