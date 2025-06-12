import type { AuthJwtPayload } from '$lib/types/authTypes.js';
import { getSuggestions } from './intents';

export const getWelcomeMessage = (userPayload: AuthJwtPayload) => {
	const suggestions = getSuggestions()
		.map((suggestion) => `• ${suggestion}`)
		.join('\n');

	return `
Hello ${userPayload.firstName}! I'm your Medicare assistant.

Here are some things I can help you with:
${suggestions}

What specific aspect of your Medicare coverage would you like to know about?`;
};
