// moved from lib/services/bedrockService.ts to server/services/bedrockService.ts

import type { InvokeModelCommandInput } from '@aws-sdk/client-bedrock-runtime';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { serverEnv } from '../config/env.server.js';
import type { ChatSession } from '../core/chat-session';
import {
	createIntentDetectionPrompt,
	createFallbackPrompt,
	createClarificationPrompt,
	createMissingInformationPrompt,
	createAnswerPrompt
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

export interface AnswerMessageArgs {
	session: ChatSession;
	topic: string;
	answer: string | Record<string, unknown>;
}

/**
 * Arguments for missing information message generation.
 */
export interface MissingInformationArgs {
	session: ChatSession;
	topic: string;
	providedSlots: string[];
	missingSlots: string[];
}

export class BedrockService {
	private static instance: BedrockService;
	private client: BedrockRuntimeClient;
	private readonly modelId: string;
	private readonly isMock: boolean;

	private constructor() {
		const { accessKeyId, secretAccessKey } = serverEnv.aws.bedrock;

		if (!accessKeyId || !secretAccessKey) {
			throw new Error(
				'AWS Bedrock credentials are required: BEDROCK_ACCESS_KEY_ID and BEDROCK_SECRET_ACCESS_KEY'
			);
		}

		this.client = new BedrockRuntimeClient({
			region: serverEnv.aws.bedrock.region,
			credentials: {
				accessKeyId,
				secretAccessKey
			},
			maxAttempts: serverEnv.aws.bedrock.rateLimiting.maxRetryAttempts
		});
		this.modelId = serverEnv.aws.bedrock.modelId;
		this.isMock = serverEnv.app.mockBedrockResponses;
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
		const contextMessages = session.getLastNMessages(serverEnv.aws.bedrock.messageContextWindow, 1);
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

		const contextMessages = session.getLastNMessages(serverEnv.aws.bedrock.messageContextWindow);
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

		const contextMessages = session.getLastNMessages(serverEnv.aws.bedrock.messageContextWindow);
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
		const { session, topic, providedSlots, missingSlots } = args;

		const currentUserMessage = session.getLastMessage('user');
		const userInput = currentUserMessage?.content || '';

		const contextMessages = session.getLastNMessages(4);
		const previousMessages = this.prepareMessagesForClaude(contextMessages);

		const systemPrompt = createMissingInformationPrompt({
			intent: session.intentName,
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

	public async generateAnswerMessage(args: AnswerMessageArgs): Promise<BedrockResponse> {
		const { session, topic, answer } = args;

		const contextMessages = session.getLastNMessages(serverEnv.aws.bedrock.messageContextWindow);
		const previousMessages = this.prepareMessagesForClaude(contextMessages);

		const systemPrompt = createAnswerPrompt(topic, answer);

		return this.generateResponseWithOptions(
			{
				systemPrompt,
				previousMessages,
				userInput: session.userMessage
			},
			{
				temperature: 0.1, // Low for consistent information requests
				maxTokens: 700, // Space for detailed explanations
				isStructured: false // Natural conversational response
			}
		);
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
		const {
			temperature = serverEnv.aws.bedrock.defaultTemperature,
			maxTokens = serverEnv.aws.bedrock.defaultMaxTokens,
			isStructured = false
		} = options;
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
			const messages = this.prepareMessagesForClaude(previousMessages, userInput);

			// Debug logging for message structure
			consoleLogger.info('Claude API messages', {
				messageCount: messages.length,
				roles: messages.map((m) => m.role),
				lastMessage: messages[messages.length - 1]?.role
			});

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
		else if (
			Array.isArray(responseBodyObject.content) &&
			responseBodyObject.content.length > 0 &&
			typeof responseBodyObject.content[0].text === 'string'
		) {
			content = responseBodyObject.content[0].text;
		}
		// Check if responseBody.content is a string (should try parsing as JSON first for Claude 3)
		else if (typeof responseBodyObject.content === 'string') {
			try {
				// Try to parse the content as JSON in case it's a Claude 3 response
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
				// If JSON parsing fails, use the content as-is
				content = responseBodyObject.content;
			}
		}
		// Legacy Claude 2 format
		else if (typeof responseBodyObject.completion === 'string') {
			content = responseBodyObject.completion;
		}

		return content.trim();
	}

	/**
	 * Parse intent detection response from Bedrock and return structured result.
	 */
	private parseIntentDetectionResponse(content: string): IntentDetectionResult | null {
		try {
			interface ParsedIntent {
				intent?: string;
				confidence?: number;
				slots?: Record<string, unknown>;
			}

			// Try to parse as JSON first
			let parsed: ParsedIntent;
			try {
				parsed = JSON.parse(content);
			} catch {
				// If JSON parsing fails, look for JSON in the content
				const jsonMatch = content.match(/\{[\s\S]*\}/);
				if (!jsonMatch) {
					consoleLogger.error('No JSON found in intent response:', content);
					return null;
				}
				parsed = JSON.parse(jsonMatch[0]);
			}

			// Validate required fields
			if (!parsed.intent || typeof parsed.confidence !== 'number') {
				consoleLogger.error('Invalid intent response format:', parsed);
				return null;
			}

			return {
				intent: parsed.intent,
				confidence: parsed.confidence,
				slots: parsed.slots || {}
			};
		} catch (error) {
			consoleLogger.error('Error parsing intent detection response', { error, content });
			return null;
		}
	}

	/**
	 * Convert chat session messages to the format expected by Claude model.
	 * Ensures strict role alternation required by Claude 3 API.
	 * Optionally adds a new user input message.
	 */
	private prepareMessagesForClaude(
		messages: Array<{ role: string; content: string }>,
		newUserInput?: string
	): BedrockMessage[] {
		// Filter to only user and assistant messages
		const validMessages = messages
			.filter((msg) => msg.role === 'user' || msg.role === 'assistant')
			.map((msg) => ({
				role: msg.role as 'user' | 'assistant',
				content: msg.content
			}));

		// Add new user input if provided
		if (newUserInput) {
			validMessages.push({
				role: 'user',
				content: newUserInput
			});
		}

		// Ensure strict role alternation by concatenating consecutive messages of the same role
		const alternatingMessages: BedrockMessage[] = [];

		for (const msg of validMessages) {
			const lastMessage = alternatingMessages[alternatingMessages.length - 1];

			if (!lastMessage || lastMessage.role !== msg.role) {
				// Different role or first message - add as new message
				alternatingMessages.push(msg);
			} else {
				// Same role as previous message - concatenate content
				lastMessage.content += '\n\n' + msg.content;
			}
		}

		// Ensure we start with a user message (Claude 3 requirement)
		while (alternatingMessages.length > 0 && alternatingMessages[0].role === 'assistant') {
			alternatingMessages.shift();
		}

		return alternatingMessages;
	}
}

// Export lazy singleton interface
export const bedrockService = {
	getInstance: () => BedrockService.getInstance(),
	detectIntent: (session: ChatSession) => BedrockService.getInstance().detectIntent(session),
	generateFallbackMessage: (args: FallbackMessageArgs) =>
		BedrockService.getInstance().generateFallbackMessage(args),
	generateClarificationMessage: (args: ClarificationMessageArgs) =>
		BedrockService.getInstance().generateClarificationMessage(args),
	generateMissingInformationMessage: (args: MissingInformationArgs) =>
		BedrockService.getInstance().generateMissingInformationMessage(args),
	generateAnswerMessage: (args: AnswerMessageArgs) =>
		BedrockService.getInstance().generateAnswerMessage(args)
};
