import type { Intent } from '$lib/types/intent.types';

export const welcomeIntent: Intent = {
	name: 'Welcome',
	promptInstructions:
		'User says hello or other greeting, asks for help, or asks who they are talking to',
	text: 'find out what I can do',
	slots: [],
	criticalSlots: [],
	examples: ['Hello', 'Hi there', 'Good morning', 'I need help', 'Can you assist me?']
};
