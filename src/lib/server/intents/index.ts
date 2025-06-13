import { getSingleDrugPriceIntent } from './getSingleDrugPrice';
import { getMultiDrugPriceIntent } from './getMultiDrugPrice';
import { findProviderIntent } from './findProvider';
import { getPlanInfoIntent } from './getPlanInfo';
import { welcomeIntent } from './welcome';
import { unknownIntent } from './unknown';
import type { Intent } from '$lib/types/intent.types';

export const INTENTS: Intent[] = [
	getSingleDrugPriceIntent,
	getMultiDrugPriceIntent,
	findProviderIntent,
	getPlanInfoIntent,
	welcomeIntent,
	unknownIntent
];

/**
 * Get list of user-facing suggestions from intents that have them
 */
export function getSuggestions(): string[] {
	return INTENTS.filter((intent) => intent.userSuggestion).map((intent) => {
		return intent.userSuggestion ?? '';
	});
}

export function getPromptInstructions(includeSlots: boolean = true): string[] {
	return INTENTS.map((intent) => {
		const slots = includeSlots && intent.slots.length ? ` (${intent.slots.join(', ')})` : '';
		return `${intent.name}: ${intent.promptInstructions}${slots}`;
	});
}

export function getIntentByName(name: string): Intent | null {
	return INTENTS.find((intent) => intent.name === name) ?? null;
}
