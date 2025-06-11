// Client-side environment variables (exposed to the browser)
// These are prefixed with PUBLIC_ in .env

// Importing from $env/dynamic/public works at runtime, but not during build
// So we'll use import.meta.env for static analysis

// Public app configuration
export const publicEnv = {
	app: {
		name: import.meta.env.PUBLIC_APP_NAME || 'AI Drug Search POC',
		version: import.meta.env.PUBLIC_APP_VERSION || '1.0.0',
		debug: import.meta.env.PUBLIC_DEBUG_MODE === 'true'
	},
	api: {
		baseUrl: import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:5173/api'
	},
	ui: {
		maxMessageLength: parseInt(import.meta.env.PUBLIC_MAX_MESSAGE_LENGTH || '500', 10),
		typingDelayMs: parseInt(import.meta.env.PUBLIC_TYPING_DELAY_MS || '1000', 10)
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
