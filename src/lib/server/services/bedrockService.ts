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
} from '../prompts';
import type { LlmResponse } from '$lib/types/llmResponse';
import { getSuggestions } from '../intents';
import type { ChatMessage } from '../core/chat-message';

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
 * Intent detection result with confidence and optional slots.
 */
export interface IntentDetectionResult {
	intent: string;
	confidence: number;
	slots?: Record<string, unknown>;
}

export interface AnswerMessageArgs {
	topic: string;
	answer: string | Record<string, unknown>;
}

/**
 * Arguments for missing information message generation.
 */
export interface MissingInformationArgs {
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
		const lastUserMessage = session.lastUserMessage;
		if (!lastUserMessage) {
			consoleLogger.error('No user message found in session');
			return null;
		}

		const systemPrompt = createIntentDetectionPrompt(lastUserMessage);
		const bedrockResult = await this.generateResponseWithOptions(
			{
				session,
				systemPrompt
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
	public async generateFallbackMessage(
		session: ChatSession,
		opts?: {
			suggestedActions: string[];
		}
	): Promise<LlmResponse> {
		const lastUserMessage = session.lastUserMessage;
		const systemPrompt = createFallbackPrompt({
			userMessage: lastUserMessage,
			suggestedActions: opts?.suggestedActions.length ? opts.suggestedActions : getSuggestions()
		});

		return this.generateResponseWithOptions(
			{
				session,
				systemPrompt
			},
			{
				temperature: 0.2, // Slightly higher for natural conversation
				maxTokens: 800, // Allow more space for helpful responses
				isStructured: false // Natural conversational response
			}
		);
	}

	/**
	 * Generate a clarification message when intent is suspected but confidence is low.
	 */
	public async generateClarificationMessage(
		session: ChatSession,
		args: {
			suspectedIntent: string;
			confidence: number;
			extractedSlots?: Record<string, unknown>;
		}
	): Promise<LlmResponse> {
		const { suspectedIntent, confidence, extractedSlots = {} } = args;
		const lastUserMessage = session.lastUserMessage;

		const systemPrompt = createClarificationPrompt({
			suspectedIntent,
			confidence,
			extractedSlots,
			originalMessage: lastUserMessage
		});

		return this.generateResponseWithOptions(
			{
				session,
				systemPrompt
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
		session: ChatSession,
		args: {
			topic: string;
			providedSlots: string[];
			missingSlots: string[];
		}
	): Promise<LlmResponse> {
		const { topic, providedSlots, missingSlots } = args;

		const systemPrompt = createMissingInformationPrompt({
			topic,
			providedSlots,
			missingSlots
		});

		return this.generateResponseWithOptions(
			{
				session,
				systemPrompt
			},
			{
				temperature: 0.15, // Low for consistent information requests
				maxTokens: 700, // Space for detailed explanations
				isStructured: false // Natural conversational response
			}
		);
	}

	public async generateAnswerMessage(
		session: ChatSession,
		args: {
			topic: string;
			answer: string | Record<string, unknown>;
			additionalPrompts?: string[];
		}
	): Promise<LlmResponse> {
		const { topic, answer, additionalPrompts } = args;

		const systemPrompt = createAnswerPrompt(topic, answer);

		return this.generateResponseWithOptions(
			{
				session,
				systemPrompt: additionalPrompts
					? `${systemPrompt}\n\n${additionalPrompts.join('\n')}`
					: systemPrompt
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
		args: {
			session: ChatSession;
			systemPrompt: string;
		},
		options: {
			temperature?: number;
			maxTokens?: number;
			isStructured?: boolean;
		} = {}
	): Promise<LlmResponse> {
		const {
			temperature = serverEnv.aws.bedrock.defaultTemperature,
			maxTokens = serverEnv.aws.bedrock.defaultMaxTokens,
			isStructured = false
		} = options;
		const { systemPrompt, session } = args;
		const contextMessages = session.getLastNMessages(serverEnv.aws.bedrock.messageContextWindow);
		const previousMessages = this.prepareMessagesForClaude(contextMessages);
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

		consoleLogger.info('system prompt', systemPrompt);
		consoleLogger.info('previous messages', previousMessages);

		try {
			// Different parameters for structured vs conversational responses
			const bodyParams = {
				anthropic_version: 'bedrock-2023-05-31',
				messages: previousMessages,
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
	 * Prepare messages for Claude, ensuring proper formatting and context.
	 * Messages must alternate between user and assistant roles.
	 * Consecutive messages of the same role are concatenated.
	 */
	private prepareMessagesForClaude(messages: ChatMessage[]): BedrockMessage[] {
		// Map to BedrockMessage format first
		const bedrockMessages = messages.map((msg) => ({
			role: msg.role as 'user' | 'assistant',
			content: msg.content
		}));

		// Ensure strict role alternation by concatenating consecutive messages of the same role
		const alternatingMessages: BedrockMessage[] = [];

		for (const msg of bedrockMessages) {
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

// Export singleton instance
export const bedrockService = BedrockService.getInstance();
