import type { MessageReply } from '$lib/types/message-reply';
import Controller from '$lib/server/core/controller';

export class GetDrugPriceController extends Controller {
	protected minConfidence = 0.7;

	public async clarification(): Promise<MessageReply> {
		return {
			message:
				'I think you are asking about a drug price, but I am not sure enough to answer that. Is that right?'
		};
	}

	async handle(): Promise<MessageReply> {
		// For now, just echo the slots for demonstration
		const drug = this.slots.drug_name ?? '[unknown drug]';
		return {
			message: `Let me look up the cost for ${drug}. (This is a placeholder response.)`
		};
	}
}
