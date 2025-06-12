// Client-side environment variables (exposed to the browser)
// These are prefixed with PUBLIC_ in .env and imported via SvelteKit's secure system

import {
	PUBLIC_APP_NAME,
	PUBLIC_APP_VERSION,
	PUBLIC_DEBUG_MODE,
	PUBLIC_API_BASE_URL,
	PUBLIC_MAX_MESSAGE_LENGTH,
	PUBLIC_TYPING_DELAY_MS
} from '$env/static/public';

// Public app configuration
export const publicEnv = {
	app: {
		name: PUBLIC_APP_NAME || 'AI Drug Search POC',
		version: PUBLIC_APP_VERSION || '1.0.0',
		debug: PUBLIC_DEBUG_MODE === 'true'
	},
	api: {
		baseUrl: PUBLIC_API_BASE_URL || 'http://localhost:5173/api'
	},
	ui: {
		maxMessageLength: parseInt(PUBLIC_MAX_MESSAGE_LENGTH || '500', 10),
		typingDelayMs: parseInt(PUBLIC_TYPING_DELAY_MS || '1000', 10)
	}
} as const;

// Type-safe public environment variables
type PublicEnvType = typeof publicEnv;

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace App {
		type PublicEnv = PublicEnvType;
	}
}

// Helper functions for consistent title formatting
export const getPageTitle = (page?: string): string => {
	return page ? `${publicEnv.app.name} - ${page}` : publicEnv.app.name;
};

export const getPageDescription = (type: 'default' | 'search' | 'chat' = 'default'): string => {
	const baseName = publicEnv.app.name;
	switch (type) {
		case 'search':
			return `${baseName} - Conversational search interface`;
		case 'chat':
			return `${baseName} - Chat conversation interface`;
		default:
			return `${baseName} - AWS Bedrock Integration Demo`;
	}
};

export default publicEnv;
