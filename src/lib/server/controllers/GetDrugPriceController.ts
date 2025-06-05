import type { IntentHandlerParams } from '$lib/types/intentTypes';
import type { MessageReply } from '$lib/types/message-reply';

// TODO: Replace this with actual business logic and Bedrock integration
export async function handleGetDrugPrice(params: IntentHandlerParams): Promise<MessageReply> {
	// For now, just echo the slots for demonstration
	const drug = params.slots?.drug_name ?? '[unknown drug]';
	return {
		message: `Let me look up the cost for ${drug}. (This is a placeholder response.)`
	};
}
