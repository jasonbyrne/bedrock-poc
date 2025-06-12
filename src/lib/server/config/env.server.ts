// Server-side environment variables (not exposed to client)

import {
	BEDROCK_ACCESS_KEY_ID,
	BEDROCK_SECRET_ACCESS_KEY,
	BEDROCK_REGION,
	BEDROCK_MODEL_ID,
	BEDROCK_DEFAULT_TEMPERATURE,
	BEDROCK_DEFAULT_MAX_TOKENS,
	BEDROCK_MESSAGE_CONTEXT_WINDOW,
	BEDROCK_MAX_REQUESTS_PER_MINUTE,
	BEDROCK_TIMEOUT_MS,
	BEDROCK_MAX_RETRY_ATTEMPTS,
	BEDROCK_MOCK_RESPONSES,
	COMPREHEND_REGION,
	COMPREHEND_ACCESS_KEY_ID,
	COMPREHEND_SECRET_ACCESS_KEY,
	NODE_ENV,
	LOG_LEVEL,
	ENABLE_REQUEST_LOGGING,
	CACHE_SESSION_SECRET,
	CACHE_TTL_SECONDS,
	CACHE_MAX_CONVERSATION_LENGTH,
	LEX_REGION,
	LEX_ACCESS_KEY_ID,
	LEX_SECRET_ACCESS_KEY
} from '$env/static/private';

export interface AwsCredentials {
	accessKeyId?: string;
	secretAccessKey?: string;
}

export interface AwsBedrockConfig extends AwsCredentials {
	region: string;
	modelId: string;
	defaultTemperature: number;
	defaultMaxTokens: number;
	messageContextWindow: number;
	rateLimiting: RateLimitingConfig;
}

export interface AwsComprehendConfig extends AwsCredentials {
	region: string;
}

export interface AwsLexConfig extends AwsCredentials {
	region: string;
}

export interface AwsConfig {
	bedrock: AwsBedrockConfig;
	medicalComprehend: AwsComprehendConfig;
	lex: AwsLexConfig;
}

export interface AppConfig {
	nodeEnv: string;
	logLevel: string;
	mockBedrockResponses: boolean;
	enableRequestLogging: boolean;
}

export interface RateLimitingConfig {
	maxRequestsPerMinute: number;
	timeoutMs: number;
	maxRetryAttempts: number;
}

export interface SessionConfig {
	secret?: string;
	cacheTtlSeconds: number;
	maxConversationLength: number;
}

export const serverEnv = {
	// AWS Configuration
	aws: {
		bedrock: {
			accessKeyId: BEDROCK_ACCESS_KEY_ID,
			secretAccessKey: BEDROCK_SECRET_ACCESS_KEY,
			region: BEDROCK_REGION || 'us-east-1',
			modelId: BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0',
			defaultTemperature: parseFloat(BEDROCK_DEFAULT_TEMPERATURE || '0.1'),
			defaultMaxTokens: parseInt(BEDROCK_DEFAULT_MAX_TOKENS || '1024'),
			messageContextWindow: parseInt(BEDROCK_MESSAGE_CONTEXT_WINDOW || '6'),
			rateLimiting: {
				maxRequestsPerMinute: parseInt(BEDROCK_MAX_REQUESTS_PER_MINUTE || '60', 10),
				timeoutMs: parseInt(BEDROCK_TIMEOUT_MS || '30000', 10),
				maxRetryAttempts: parseInt(BEDROCK_MAX_RETRY_ATTEMPTS || '3', 10)
			}
		},
		medicalComprehend: {
			region: COMPREHEND_REGION || BEDROCK_REGION || 'us-east-1',
			accessKeyId: COMPREHEND_ACCESS_KEY_ID || BEDROCK_ACCESS_KEY_ID,
			secretAccessKey: COMPREHEND_SECRET_ACCESS_KEY || BEDROCK_SECRET_ACCESS_KEY
		},
		lex: {
			region: LEX_REGION || BEDROCK_REGION || 'us-east-1',
			accessKeyId: LEX_ACCESS_KEY_ID || BEDROCK_ACCESS_KEY_ID,
			secretAccessKey: LEX_SECRET_ACCESS_KEY || BEDROCK_SECRET_ACCESS_KEY
		}
	},

	// Application settings
	app: {
		nodeEnv: NODE_ENV || 'development',
		logLevel: LOG_LEVEL || 'info',
		mockBedrockResponses: BEDROCK_MOCK_RESPONSES === 'true',
		enableRequestLogging: ENABLE_REQUEST_LOGGING === 'true'
	},

	// Session & Cache
	session: {
		secret: CACHE_SESSION_SECRET,
		cacheTtlSeconds: parseInt(CACHE_TTL_SECONDS || '3600', 10),
		maxConversationLength: parseInt(CACHE_MAX_CONVERSATION_LENGTH || '50', 10)
	} as SessionConfig
} as const;

// Extend the global App namespace
declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace App {
		interface ServerEnv {
			aws: AwsConfig;
			app: AppConfig;
			rateLimiting: RateLimitingConfig;
			session: SessionConfig;
		}
	}
}

export default serverEnv;
