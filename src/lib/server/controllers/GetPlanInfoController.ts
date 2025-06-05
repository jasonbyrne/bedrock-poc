import type { MessageReply } from '$lib/types/message-reply';
import Controller from '$lib/server/core/controller';

export class GetPlanInfoController extends Controller {
	protected minConfidence = 0.7;

	async handle(): Promise<MessageReply> {
		if (!this.isConfident()) {
			return {
				message:
					'I think you are asking about your plan, but I am not sure enough to answer that. Is that right?'
			};
		}
		return {
			message: `Here is information about your Medicare plan: [Plan details would go here]`
		};
	}
}
