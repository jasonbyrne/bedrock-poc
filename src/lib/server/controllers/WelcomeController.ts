import { getWelcomeMessage } from '../canned';
import type { MessageReply } from '$lib/types/message-reply';
import Controller from '$lib/server/core/controller';

export class WelcomeController extends Controller {
	async handle(): Promise<MessageReply> {
		return this.reply(getWelcomeMessage(this.user));
	}
}
