import type { AuthJwtPayload } from '$lib/types/authTypes.js';

export const getWelcomeMessage = (userPayload: AuthJwtPayload) => {
	return `Hello ${userPayload.firstName}! I'm your Medicare assistant.

I can help you with:
• Understanding your ${userPayload.planType} coverage
• Finding providers and specialists
• Checking drug costs and coverage
• Explaining benefits and services
• Prior authorization requirements

What specific aspect of your Medicare coverage would you like to know about?`;
};
