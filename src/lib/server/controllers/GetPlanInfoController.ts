import type { MessageReply } from '$lib/types/message-reply';

export async function handleGetPlanInfo(): Promise<MessageReply> {
	return {
		message: "Here's some information about your plan. (Placeholder)"
	};
}
