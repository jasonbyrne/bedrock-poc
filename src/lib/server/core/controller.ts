import type { IntentHandlerParams } from '$lib/types/intentTypes';
import type { MessageReply } from '$lib/types/message-reply';
import type { ChatSession } from '$lib/types/chatTypes';
import type { AuthJwtPayload } from '$lib/types/authTypes';

abstract class Controller {
	protected abstract minConfidence: number;
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

	abstract handle(): Promise<MessageReply>;
	
	protected isConfident(): boolean {
		return this.confidence >= this.minConfidence;
	}
}

export default Controller;
