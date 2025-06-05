import { ChatMessage } from '$lib/server/core/chat-message';

interface CreateAssistantMessageArgs {
	content: string;
	intent: string;
	slots?: Record<string, unknown>;
	confidence: number;
	started_at: number;
}

export function createAssistantMessage({
	content,
	intent,
	slots,
	confidence,
	started_at
}: CreateAssistantMessageArgs): ChatMessage {
	const message = ChatMessage.createAssistantMessage(content, {
		intent,
		slots,
		confidence_score: confidence,
		processing_time_ms: Date.now() - started_at
	});

	return message;
}
