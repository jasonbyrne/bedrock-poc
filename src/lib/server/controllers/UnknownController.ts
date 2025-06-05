import type { MessageReply } from '$lib/types/message-reply';

export async function handleUnknown(): Promise<MessageReply> {
	return {
		message: 'I am not sure what you mean. Could you please rephrase?'
	};
}
