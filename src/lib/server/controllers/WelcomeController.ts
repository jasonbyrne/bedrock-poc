import { getWelcomeMessage } from '$lib/server/canned-messages';
import type { MessageReply } from '$lib/types/message-reply';
import Controller from '$lib/server/core/controller';

export class WelcomeController extends Controller {
	protected minConfidence = 0.7;

	public async clarification(): Promise<MessageReply> {
		return {
			message:
				'I am not sure what you are asking. Do you need me to explain what I can help you with?'
		};
	}

	async handle(): Promise<MessageReply> {
		return {
			message: getWelcomeMessage(this.user)
		};
	}
}
