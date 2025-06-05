import type { MessageReply } from '$lib/types/message-reply';
import Controller from '$lib/server/core/controller';

export class GetPlanInfoController extends Controller {
	protected minConfidence = 0.8;

	public async clarification(): Promise<MessageReply> {
		return {
			message:
				'I think you are asking about your plan, but I am not sure enough to answer that. Is that right?'
		};
	}

	async handle(): Promise<MessageReply> {
		return {
			message: `Here is information about your Medicare plan: [Plan details would go here]`
		};
	}
}
