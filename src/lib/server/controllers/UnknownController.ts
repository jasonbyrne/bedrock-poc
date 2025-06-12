import type { MessageReply } from '$lib/types/message-reply';
import Controller from '$lib/server/core/controller';
import { bedrockService } from '$lib/server/services/bedrockService';

export class UnknownController extends Controller {
	async handle(): Promise<MessageReply> {
		return this.reply(
			await bedrockService.generateFallbackMessage(this.session, {
				suggestedActions: ['Look up a drug price', 'Find a health care provider near you']
			})
		);
	}
}
