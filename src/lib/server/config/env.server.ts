// Server-side environment variables (not exposed to client)

export interface AwsBedrockConfig {
  accessKeyId?: string;
  secretAccessKey?: string;
  region: string;
  modelId: string;
}

export interface AwsMedicalComprehendConfig {
  region: string;
}

export interface AwsConfig {
  bedrock: AwsBedrockConfig;
  medicalComprehend: AwsMedicalComprehendConfig;
}

export interface AppConfig {
  nodeEnv: string;
  logLevel: string;
  mockBedrockResponses: boolean;
  enableRequestLogging: boolean;
}

export interface RateLimitingConfig {
  bedrockMaxRequestsPerMinute: number;
  bedrockTimeoutMs: number;
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
      accessKeyId: process.env.VITE_BEDROCK_ACCESS_KEY_ID,
      secretAccessKey: process.env.VITE_BEDROCK_SECRET_ACCESS_KEY,
      region: process.env.VITE_BEDROCK_REGION || 'us-east-1',
      modelId: process.env.VITE_BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0',
    },
    medicalComprehend: {
      region: process.env.VITE_MEDICAL_COMPREHEND_REGION || 'us-east-1',
    },
  } as const,
  
  // Application settings
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    mockBedrockResponses: process.env.MOCK_BEDROCK_RESPONSES === 'true',
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === 'true',
  },
  
  // Rate limiting
  rateLimiting: {
    bedrockMaxRequestsPerMinute: parseInt(process.env.BEDROCK_MAX_REQUESTS_PER_MINUTE || '60', 10),
    bedrockTimeoutMs: parseInt(process.env.BEDROCK_TIMEOUT_MS || '30000', 10),
    maxRetryAttempts: parseInt(process.env.MAX_RETRY_ATTEMPTS || '3', 10),
  } as RateLimitingConfig,
  
  // Session & Cache
  session: {
    secret: process.env.SESSION_SECRET,
    cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10),
    maxConversationLength: parseInt(process.env.MAX_CONVERSATION_LENGTH || '50', 10),
  } as SessionConfig,
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
