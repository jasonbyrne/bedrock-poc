// moved from lib/services/bedrockService.ts to server/services/bedrockService.ts

import type { InvokeModelCommandInput } from '@aws-sdk/client-bedrock-runtime';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import {
	AWS_BEDROCK_ACCESS_KEY_ID,
	AWS_BEDROCK_SECRET_ACCESS_KEY,
	AWS_BEDROCK_REGION,
	AWS_BEDROCK_MODEL_ID,
	AWS_BEDROCK_MOCK_RESPONSES
} from '$env/static/private';
import type { ChatSession } from '../core/chat-session';
import {
	createIntentDetectionPrompt,
	createFallbackPrompt,
	createClarificationPrompt,
	createMissingInformationPrompt
} from '../systemPrompts';

// Simple logger fallback
const consoleLogger = {
	info: (message: string, data?: unknown) => console.log(`[INFO] ${message}`, data || ''),
	error: (message: string, error?: unknown) => console.error(`[ERROR] ${message}`, error || ''),
	warn: (message: string, data?: unknown) => console.warn(`[WARN] ${message}`, data || '')
};

/**
 * Chat message for Bedrock Claude model. Only 'user' and 'assistant' allowed in history; 'system' is for prompt only.
 */
export interface BedrockMessage {
	role: 'user' | 'assistant';
	content: string;
}

/**
 * Arguments for generating a Bedrock response.
 */
export interface BedrockPromptArgs {
	systemPrompt: string;
	previousMessages: BedrockMessage[];
	userInput: string;
}

/**
 * Base response interface for Bedrock operations.
 */
export interface BedrockResponse {
	content: string;
	metadata?: {
		latency: number;
		model: string;
	};
	error?: Error;
}

/**
 * Intent detection result with confidence and optional slots.
 */
export interface IntentDetectionResult {
	intent: string;
	confidence: number;
	slots?: Record<string, unknown>;
}

/**
 * Arguments for fallback message generation.
 */
export interface FallbackMessageArgs {
	session: ChatSession;
	originalMessage: string;
	suggestedActions?: string[];
}

/**
 * Arguments for clarification message generation.
 */
export interface ClarificationMessageArgs {
	session: ChatSession;
	suspectedIntent: string;
	confidence: number;
	extractedSlots?: Record<string, unknown>;
}

/**
 * Arguments for missing information message generation.
 */
export interface MissingInformationArgs {
	session: ChatSession;
	intent: string;
	topic: string;
	providedSlots: string[];
	missingSlots: string[];
}

const CONTEXT_MESSAGES = 6;

export class BedrockService {
	private static instance: BedrockService;
	private client: BedrockRuntimeClient;
	private readonly modelId: string;
	private readonly isMock: boolean;

	private constructor() {
		this.client = new BedrockRuntimeClient({
			region: AWS_BEDROCK_REGION,
			credentials: {
				accessKeyId: AWS_BEDROCK_ACCESS_KEY_ID,
				secretAccessKey: AWS_BEDROCK_SECRET_ACCESS_KEY
			},
			maxAttempts: 3
		});
		this.modelId = AWS_BEDROCK_MODEL_ID;
		this.isMock = AWS_BEDROCK_MOCK_RESPONSES === 'true';
	}

	/**
	 * Get the singleton instance of BedrockService.
	 */
	public static getInstance(): BedrockService {
		if (!BedrockService.instance) {
			BedrockService.instance = new BedrockService();
		}
		return BedrockService.instance;
	}

	/**
	 * Detect intent from user message with conversation context.
	 */
	public async detectIntent(session: ChatSession): Promise<IntentDetectionResult | null> {
		// Get the current user message (the last message which was just added)
		const currentUserMessage = session.getLastMessage('user');
		if (!currentUserMessage) {
			consoleLogger.error('No user message found in session');
			return null;
		}

		// Get context messages and prepare for Claude API
		const contextMessages = session.getLastNMessages(CONTEXT_MESSAGES, 1);
		const previousMessages = this.prepareMessagesForClaude(contextMessages);

		consoleLogger.info('Intent detection with context', {
			currentMessage: currentUserMessage.content,
			contextMessagesCount: previousMessages.length,
			rawContextCount: contextMessages.length
		});

		const systemPrompt = createIntentDetectionPrompt();
		const bedrockResult = await this.generateResponseWithOptions(
			{
				systemPrompt,
				previousMessages,
				userInput: currentUserMessage.content
			},
			{
				temperature: 0.05, // Very deterministic for JSON output
				maxTokens: 500, // Intent detection should be concise
				isStructured: true // Use structured response settings
			}
		);

		if (bedrockResult.error) {
			consoleLogger.error('Error in intent detection', bedrockResult.error);
			return null;
		}

		return this.parseIntentDetectionResponse(bedrockResult.content);
	}

	/**
	 * Generate a fallback message when intent cannot be determined.
	 */
	public async generateFallbackMessage(args: FallbackMessageArgs): Promise<BedrockResponse> {
		const { session, originalMessage, suggestedActions = [] } = args;

		const contextMessages = session.getLastNMessages(CONTEXT_MESSAGES);
		const previousMessages = this.prepareMessagesForClaude(contextMessages);

		const systemPrompt = createFallbackPrompt({
			originalMessage,
			suggestedActions
		});

		return this.generateResponseWithOptions(
			{
				systemPrompt,
				previousMessages,
				userInput: originalMessage
			},
			{
				temperature: 0.3, // Slightly higher for natural conversation
				maxTokens: 800, // Allow more space for helpful responses
				isStructured: false // Natural conversational response
			}
		);
	}

	/**
	 * Generate a clarification message when intent is suspected but confidence is low.
	 */
	public async generateClarificationMessage(
		args: ClarificationMessageArgs
	): Promise<BedrockResponse> {
		const { session, suspectedIntent, confidence, extractedSlots = {} } = args;

		const currentUserMessage = session.getLastMessage('user');
		const userInput = currentUserMessage?.content || '';

		const contextMessages = session.getLastNMessages(CONTEXT_MESSAGES);
		const previousMessages = this.prepareMessagesForClaude(contextMessages);

		const systemPrompt = createClarificationPrompt({
			suspectedIntent,
			confidence,
			extractedSlots,
			originalMessage: userInput
		});

		return this.generateResponseWithOptions(
			{
				systemPrompt,
				previousMessages,
				userInput
			},
			{
				temperature: 0.2, // Balanced for clarity while being conversational
				maxTokens: 600, // Focused clarification responses
				isStructured: false // Natural conversational response
			}
		);
	}

	/**
	 * Generate a message asking for missing information when intent is confident but slots are incomplete.
	 */
	public async generateMissingInformationMessage(
		args: MissingInformationArgs
	): Promise<BedrockResponse> {
		const { session, intent, topic, providedSlots, missingSlots } = args;

		const currentUserMessage = session.getLastMessage('user');
		const userInput = currentUserMessage?.content || '';

		const contextMessages = session.getLastNMessages(4);
		const previousMessages = this.prepareMessagesForClaude(contextMessages);

		const systemPrompt = createMissingInformationPrompt({
			intent,
			topic,
			providedSlots,
			missingSlots
		});

		return this.generateResponseWithOptions(
			{
				systemPrompt,
				previousMessages,
				userInput
			},
			{
				temperature: 0.15, // Low for consistent information requests
				maxTokens: 700, // Space for detailed explanations
				isStructured: false // Natural conversational response
			}
		);
	}

	// Legacy method for backward compatibility
	public async generateNeedMoreInfoResponse(
		session: ChatSession,
		topic: string,
		providedSlots: string[],
		missingSlots: string[]
	): Promise<BedrockResponse> {
		return this.generateMissingInformationMessage({
			session,
			intent: 'unknown',
			topic,
			providedSlots,
			missingSlots
		});
	}

	/**
	 * Generate a response with specific parameters for different response types.
	 */
	private async generateResponseWithOptions(
		args: BedrockPromptArgs,
		options: {
			temperature?: number;
			maxTokens?: number;
			isStructured?: boolean;
		} = {}
	): Promise<BedrockResponse> {
		const { temperature = 0.1, maxTokens = 1024, isStructured = false } = options;
		const { systemPrompt, previousMessages, userInput } = args;
		const startTime = Date.now();

		if (this.isMock) {
			return {
				content: '[MOCK] This is a mock Bedrock response.',
				metadata: {
					latency: 0,
					model: this.modelId
				}
			};
		}

		try {
			const messages = this.buildMessages(systemPrompt, previousMessages, userInput);

			// Different parameters for structured vs conversational responses
			const bodyParams = {
				anthropic_version: 'bedrock-2023-05-31',
				messages,
				max_tokens: maxTokens,
				system: systemPrompt,
				temperature,
				...(isStructured
					? {
							// For structured responses (like JSON), use more deterministic settings
							top_p: 0.1,
							top_k: 1
						}
					: {
							// For conversational responses, allow more natural variation
							top_p: 0.9,
							top_k: 50,
							stop_sequences: ['Human:', 'Assistant:', '\n\nHuman:', '\n\nAssistant:']
						})
			};

			const params: InvokeModelCommandInput = {
				modelId: this.modelId,
				contentType: 'application/json',
				accept: 'application/json',
				body: JSON.stringify(bodyParams)
			};

			const command = new InvokeModelCommand(params);
			const response = await this.client.send(command);
			const responseBody = JSON.parse(Buffer.from(response.body as Uint8Array).toString('utf-8'));
			const latency = Date.now() - startTime;
			const content = this.parseResponse(responseBody);

			return {
				content,
				metadata: {
					latency,
					model: this.modelId
				}
			};
		} catch (error) {
			consoleLogger.error('Error generating Bedrock response', error);
			return {
				content: '',
				error: error instanceof Error ? error : new Error('Unknown error'),
				metadata: {
					latency: Date.now() - startTime,
					model: this.modelId
				}
			};
		}
	}

	/**
	 * Core method to generate responses from Bedrock.
	 */
	private async generateResponse(args: BedrockPromptArgs): Promise<BedrockResponse> {
		const { systemPrompt, previousMessages, userInput } = args;
		const startTime = Date.now();

		if (this.isMock) {
			return {
				content: '[MOCK] This is a mock Bedrock response.',
				metadata: {
					latency: 0,
					model: this.modelId
				}
			};
		}

		try {
			const messages = this.buildMessages(systemPrompt, previousMessages, userInput);
			const params: InvokeModelCommandInput = {
				modelId: this.modelId,
				contentType: 'application/json',
				accept: 'application/json',
				body: JSON.stringify({
					anthropic_version: 'bedrock-2023-05-31',
					messages,
					max_tokens: 1024,
					system: systemPrompt,
					temperature: 0.1,
					top_p: 0.9,
					top_k: 50,
					stop_sequences: ['Human:', 'Assistant:']
				})
			};

			const command = new InvokeModelCommand(params);
			const response = await this.client.send(command);
			const responseBody = JSON.parse(Buffer.from(response.body as Uint8Array).toString('utf-8'));
			const latency = Date.now() - startTime;
			const content = this.parseResponse(responseBody);

			return {
				content,
				metadata: {
					latency,
					model: this.modelId
				}
			};
		} catch (error) {
			consoleLogger.error('Error generating Bedrock response', error);
			return {
				content: '',
				error: error instanceof Error ? error : new Error('Unknown error'),
				metadata: {
					latency: Date.now() - startTime,
					model: this.modelId
				}
			};
		}
	}

	/**
	 * Parse Bedrock response content from various formats.
	 */
	private parseResponse(responseBody: unknown): string {
		if (typeof responseBody !== 'object' || responseBody === null) {
			return '';
		}

		const responseBodyObject = responseBody as {
			content?: unknown;
			completion?: string;
		};

		// Claude 3 returns an array: [{ type: 'text', text: '...' }]
		let content = '';

		// Check if responseBody is directly the Claude 3 array format
		if (
			Array.isArray(responseBody) &&
			responseBody.length > 0 &&
			typeof responseBody[0].text === 'string'
		) {
			content = responseBody[0].text;
		}
		// Check if responseBody.content is the Claude 3 array format
		else if (Array.isArray(responseBodyObject.content)) {
			const contentArray = responseBodyObject.content as Array<{ type: string; text: string }>;
			if (contentArray.length > 0 && typeof contentArray[0].text === 'string') {
				content = contentArray[0].text;
			}
		}
		// Check if responseBody.content is a stringified Claude 3 array
		else if (typeof responseBodyObject.content === 'string') {
			try {
				const parsedContent = JSON.parse(responseBodyObject.content);
				if (
					Array.isArray(parsedContent) &&
					parsedContent.length > 0 &&
					typeof parsedContent[0].text === 'string'
				) {
					content = parsedContent[0].text;
				} else {
					content = responseBodyObject.content;
				}
			} catch {
				// If parsing fails, treat as regular string content
				content = responseBodyObject.content;
			}
		}
		// Fallback to other response formats
		else {
			const fallback = responseBodyObject.content || responseBodyObject.completion || '';
			content = typeof fallback === 'string' ? fallback : JSON.stringify(fallback);
		}

		return content;
	}

	/**
	 * Parse intent detection response from Bedrock.
	 */
	private parseIntentDetectionResponse(content: string): IntentDetectionResult | null {
		try {
			interface ParsedIntent {
				intent?: string;
				confidence?: number;
				slots?: Record<string, unknown>;
			}
			let parsed: ParsedIntent | null = null;

			// Try to parse as array first (Claude 3 format)
			if (content.trim().startsWith('[')) {
				const arr: Array<{ type: string; text: string }> = JSON.parse(content);
				if (Array.isArray(arr) && arr.length > 0 && typeof arr[0].text === 'string') {
					parsed = JSON.parse(arr[0].text) as ParsedIntent;
				}
			} else {
				parsed = JSON.parse(content) as ParsedIntent;
			}

			consoleLogger.info('Parsed intent JSON', parsed);

			if (parsed && typeof parsed.intent === 'string' && typeof parsed.confidence === 'number') {
				return parsed as IntentDetectionResult;
			}

			consoleLogger.warn('Parsed object missing required fields', parsed);
		} catch (err) {
			consoleLogger.error('Failed to parse Bedrock intent JSON', { error: err, content });
		}

		return null;
	}

	/**
	 * Prepare chat messages for Claude API with proper role alternation.
	 */
	private prepareMessagesForClaude(
		messages: Array<{ role: string; content: string }>
	): BedrockMessage[] {
		// Convert to BedrockMessage format and filter for valid roles
		const bedrockMessages = messages
			.filter((msg) => msg.role === 'user' || msg.role === 'assistant')
			.map((msg) => ({
				role: msg.role as 'user' | 'assistant',
				content: msg.content
			}));

		// Claude API requires strict alternation between user and assistant roles
		const filteredMessages: BedrockMessage[] = [];
		let lastRole: 'user' | 'assistant' | null = null;

		for (const msg of bedrockMessages) {
			// Only add message if it's a different role from the last one
			if (msg.role !== lastRole) {
				filteredMessages.push(msg);
				lastRole = msg.role;
			}
		}

		// Ensure we start with a user message
		while (filteredMessages.length > 0 && filteredMessages[0].role === 'assistant') {
			filteredMessages.shift();
		}

		return filteredMessages;
	}

	/**
	 * Build Claude 3 Messages API array from system prompt, previous messages, and user input.
	 */
	private buildMessages(
		systemPrompt: string,
		previousMessages: BedrockMessage[],
		userInput: string
	): Array<{ role: 'user' | 'assistant'; content: string }> {
		const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

		// Add previous messages as-is, preserving strict alternation
		for (const msg of previousMessages) {
			if (msg.role === 'user' || msg.role === 'assistant') {
				messages.push({ role: msg.role, content: msg.content });
			}
		}

		// Always add the new user message as-is, never prepend system prompt
		if (messages.length === 0 || messages[messages.length - 1].role === 'assistant') {
			messages.push({ role: 'user', content: userInput });
		} else {
			// If the last message was 'user', do NOT add another user message (should not happen)
			consoleLogger.warn('Attempted to add two user messages in a row to Claude 3 messages API.');
		}
		return messages;
	}
}

// Export singleton instance
export const bedrockService = BedrockService.getInstance();
