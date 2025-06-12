// Central router for intent controllers
import type { IntentHandlerParams, IntentHandlerResult } from '$lib/types/intentTypes';
import { WelcomeController } from './controllers/WelcomeController';
import { UnknownController } from './controllers/UnknownController';
import { GetSingleDrugPriceController } from './controllers/GetSingleDrugPriceController';
import { GetPlanInfoController } from './controllers/GetPlanInfoController';
import { FindProviderController } from './controllers/FindProviderController';
import { GetMultiDrugPriceController } from './controllers/GetMultiDrugPriceController';
import { createAssistantMessage } from './utils/createAssistantMessage';

import type Controller from './core/controller';

// Map intent names to their controller classes
const intentControllerMap: Record<string, new (params: IntentHandlerParams) => Controller> = {
	Welcome: WelcomeController,
	Unknown: UnknownController,
	GetSingleDrugPrice: GetSingleDrugPriceController,
	GetMultiDrugPrice: GetMultiDrugPriceController,
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
		const content = await (async () => {
			try {
				return controller.isConfident()
					? await controller.handle()
					: await controller.clarification();
			} catch (error) {
				console.error('[ERROR] Error handling intent:', error);
				return {
					message: 'Sorry. We encountered an error. Can you restate your request?'
				};
			}
		})();
		const assistantMessage = createAssistantMessage({
			content: content.message,
			intent: params.session.currentIntent?.name || 'Unknown',
			slots: params.session.collectedSlots,
			confidence: params.session.currentConfidence || 0,
			started_at: params.started_at
		});
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
			intent: params.session.currentIntent?.name || 'Unknown',
			slots: params.session.collectedSlots,
			confidence: params.session.currentConfidence || 0,
			started_at: params.started_at
		}),
		session_updated: false
	};
}
