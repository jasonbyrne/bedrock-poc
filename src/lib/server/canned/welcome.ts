import { getSuggestions } from '../intents';
import type { AuthJwtPayload } from '$lib/types/authTypes';

/**
 * Get the welcome message for new users.
 * This is a canned response that introduces the chatbot and its capabilities.
 * The list of capabilities is dynamically generated from available intents.
 */
export function getWelcomeMessage(user?: AuthJwtPayload): string {
	const capabilities = getSuggestions()
		.map((suggestion) => `• ${suggestion}`)
		.join('\n');
	const name = user?.firstName ? user.firstName : 'there';
	const greeting = `👋 Hi ${name}!`;
	const message = [
		`${greeting} I'm your Medicare assistant.`,
		'',
		'I can help you to:',
		capabilities,
		'',
		'What would you like to know about?'
	].join('\n');
	return message;
}
