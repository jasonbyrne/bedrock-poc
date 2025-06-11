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
		// If we don't know the type of provider, ask them
		if (!this.session.collectedSlots.provider_type) {
			return {
				message:
					'It sounds like you would like to find a provider. What type of provider are you looking for?'
			};
		}

		// Extract provider type from slots if available
		const providerType = this.session.collectedSlots.provider_type
			? String(this.session.collectedSlots.provider_type)
			: 'doctor';
		const location = this.session.collectedSlots.location
			? String(this.session.collectedSlots.location)
			: 'your area';

		return {
			message: `I can help you find a ${providerType} in ${location}. Here's what I found: (This is a placeholder response that would typically include provider search results)`
		};
	}
}
