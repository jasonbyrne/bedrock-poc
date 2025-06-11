import Controller from '../core/controller';
import type { MessageReply } from '$lib/types/message-reply';

export class GetMultiDrugPriceController extends Controller {
	async handle(): Promise<MessageReply> {
		return {
			message:
				'It looks like you are asking about the price of multiple drugs. I can help, but please ask one drug at a time.'
		};
	}
}
