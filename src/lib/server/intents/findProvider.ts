import type { Intent } from '$lib/types/intent.types';

export const findProviderIntent: Intent = {
	name: 'FindProvider',
	userSuggestion: 'Find a doctor, provider, or facility',
	promptInstructions: 'User is asking for a provider, doctor, or facility',
	text: 'find a provider',
	slots: ['provider_type', 'location', 'insurance_plan', 'preferred_provider'],
	criticalSlots: ['provider_type', 'location'],
	examples: [
		'Find a [provider_type] near [location]',
		'Are there any [provider_type] in my network?',
		'Who is my primary care physician?',
		'I need a [specialty] doctor in [location]',
		'Can you help me locate a hospital close to [location]?'
	]
};
