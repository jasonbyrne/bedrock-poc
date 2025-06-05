import type { MessageReply } from '$lib/types/message-reply';
import Controller from '$lib/server/core/controller';

export class FindProviderController extends Controller {
	protected minConfidence = 0.7;

	public async clarification(): Promise<MessageReply> {
		return {
			message:
				'I think you are asking about finding a provider, but I am not sure enough to answer that. Could you provide more details?'
		};
	}

	async handle(): Promise<MessageReply> {
		// Extract provider type from slots if available
		const providerType = this.slots.provider_type ? String(this.slots.provider_type) : 'doctor';
		const location = this.slots.location ? String(this.slots.location) : 'your area';

		return {
			message: `I can help you find a ${providerType} in ${location}. Here's what I found: (This is a placeholder response that would typically include provider search results)`
		};
	}
}
