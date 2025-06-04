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

export interface BedrockResponse {
	content: string;
	metadata?: {
		latency: number;
		model: string;
	};
	error?: Error;
}

export class BedrockService {
	private client: BedrockRuntimeClient;
	private readonly modelId: string;
	private readonly isMock: boolean;

	constructor() {
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
	 * Generates a response from the Bedrock model given system prompt, previous chat context, and new user input.
	 */
	async generateResponse({
		systemPrompt,
		previousMessages,
		userInput
	}: BedrockPromptArgs): Promise<BedrockResponse> {
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
			console.log('Messages API payload:', JSON.stringify(messages, null, 2));
			const params: InvokeModelCommandInput = {
				modelId: this.modelId,
				contentType: 'application/json',
				accept: 'application/json',
				body: JSON.stringify({
					anthropic_version: 'bedrock-2023-05-31',
					messages,
					max_tokens: 1024,
					temperature: 0.0
				})
			};
			const command = new InvokeModelCommand(params);
			const response = await this.client.send(command);
			const responseBody = JSON.parse(Buffer.from(response.body as Uint8Array).toString('utf-8'));
			const latency = Date.now() - startTime;

			// Claude 3 returns an array: [{ type: 'text', text: '...' }]
			let content = '';
			if (
				Array.isArray(responseBody) &&
				responseBody.length > 0 &&
				typeof responseBody[0].text === 'string'
			) {
				content = responseBody[0].text;
			} else {
				const fallback = responseBody.content || responseBody.completion || '';
				content = typeof fallback === 'string' ? fallback : JSON.stringify(fallback);
			}
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
	 * Builds a Claude 3 Messages API array from system prompt, previous messages, and user input.
	 *
	 * @param systemPrompt - The system prompt (optional)
	 * @param previousMessages - Prior chat messages
	 * @param userInput - The latest user message
	 * @returns Claude 3-compatible messages array
	 */
	private buildMessages(
		systemPrompt: string,
		previousMessages: BedrockMessage[],
		userInput: string
	): Array<{ role: 'user' | 'assistant'; content: string }> {
		const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
		const hasHistory = previousMessages.length > 0;

		// Add previous messages as-is, preserving strict alternation
		for (const msg of previousMessages) {
			if (msg.role === 'user' || msg.role === 'assistant') {
				messages.push({ role: msg.role, content: msg.content });
			}
		}

		// Determine if this is the first message in the conversation
		if (!hasHistory && systemPrompt && systemPrompt.trim()) {
			// Only prepend system prompt to very first user message
			messages.push({
				role: 'user',
				content: `${systemPrompt.trim()}

${userInput}`
			});
		} else {
			// Only add a new user message if the last message was 'assistant' or there is alternation
			if (messages.length === 0 || messages[messages.length - 1].role === 'assistant') {
				messages.push({ role: 'user', content: userInput });
			} else {
				// If the last message was 'user', do NOT add another user message (should not happen)
				console.warn(
					'[WARN] Attempted to add two user messages in a row to Claude 3 messages API.'
				);
			}
		}
		return messages;
	}
}

export const bedrockService = new BedrockService();
