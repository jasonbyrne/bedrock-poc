import type { MessageReply } from '$lib/types/message-reply';
import Controller from '$lib/server/core/controller';

export class UnknownController extends Controller {
	protected minConfidence = 0; // Always confident for unknown intent

	async handle(): Promise<MessageReply> {
		return {
			message: 'I am not sure what you mean. Could you please rephrase?'
		};
	}
}
