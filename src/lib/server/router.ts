// Central router for intent controllers
import type { IntentHandlerParams, IntentHandlerResult } from '$lib/types/intentTypes';
import { handleWelcome } from './controllers/WelcomeController';
import { handleUnknown } from './controllers/UnknownController';
import { handleGetDrugPrice } from './controllers/GetDrugPriceController';
import { handleGetPlanInfo } from './controllers/GetPlanInfoController';
import { createAssistantMessage } from './utils/createAssistantMessage';
import { addMessageToSession } from '$lib/services/sessionService';
import type { MessageReply } from '$lib/types/message-reply';

// Map intent names to their controller handler functions
const intentControllerMap: Record<string, (params: IntentHandlerParams) => Promise<MessageReply>> =
	{
		Welcome: handleWelcome,
		Unknown: handleUnknown,
		GetDrugPrice: handleGetDrugPrice,
		GetPlanInfo: handleGetPlanInfo
	};

export async function routeIntent(
	intent: string,
	params: IntentHandlerParams
): Promise<IntentHandlerResult> {
	const handler = intentControllerMap[intent];
	if (handler) {
		const content = await handler(params);
		const assistantMessage = createAssistantMessage({
			content: content.message,
			intent: params.intent,
			slots: params.slots,
			confidence: params.confidence,
			started_at: params.started_at
		});
		addMessageToSession(params.session.session_id, assistantMessage);
		return {
			success: true,
			message: assistantMessage,
			session_updated: true // You can customize this if needed per intent
		};
	}
	// Fallback: always return a valid ChatMessage shape
	return {
		success: true,
		message: createAssistantMessage({
			content: 'I am not sure what you mean. Could you please rephrase?',
			intent: params.intent,
			slots: params.slots,
			confidence: params.confidence,
			started_at: params.started_at
		}),
		session_updated: false
	};
}
