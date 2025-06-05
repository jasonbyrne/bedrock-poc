import { getWelcomeMessage } from '$lib/server/canned-messages';
import type { IntentHandlerParams } from '$lib/types/intentTypes';
import type { MessageReply } from '$lib/types/message-reply';

export async function handleWelcome(params: IntentHandlerParams): Promise<MessageReply> {
	return {
		message: getWelcomeMessage(params.user)
	};
}
