import type { Intent } from '$lib/types/intent.types';

export const unknownIntent: Intent = {
	name: 'Unknown',
	isFallback: true,
	promptInstructions: 'Intent does not match any supported category or is unclear/unsupported',
	text: 'unclear',
	slots: [],
	criticalSlots: [],
	examples: [
		'I want to talk about something else',
		'Blah blah',
		'Random text',
		'???',
		'What is the weather today?'
	]
};
