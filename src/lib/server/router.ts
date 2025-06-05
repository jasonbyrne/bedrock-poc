// Central router for intent controllers
import type { IntentHandlerParams, IntentHandlerResult } from '$lib/types/intentTypes';
import { WelcomeController } from './controllers/WelcomeController';
import { UnknownController } from './controllers/UnknownController';
import { GetDrugPriceController } from './controllers/GetDrugPriceController';
import { GetPlanInfoController } from './controllers/GetPlanInfoController';
import { FindProviderController } from './controllers/FindProviderController';
import { createAssistantMessage } from './utils/createAssistantMessage';
import { addMessageToSession } from '$lib/services/sessionService';

import type Controller from './core/controller';

// Map intent names to their controller classes
const intentControllerMap: Record<string, new (params: IntentHandlerParams) => Controller> = {
	Welcome: WelcomeController,
	Unknown: UnknownController,
	GetDrugPrice: GetDrugPriceController,
	GetPlanInfo: GetPlanInfoController,
	FindProvider: FindProviderController
};

export async function routeIntent(
	intent: string,
	params: IntentHandlerParams
): Promise<IntentHandlerResult> {
	const ControllerClass = intentControllerMap[intent];
	if (ControllerClass) {
		const controller = new ControllerClass(params);
		const content = await controller.handle();
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
