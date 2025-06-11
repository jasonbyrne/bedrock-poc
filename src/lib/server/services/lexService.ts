/**
 * AWS Lex V2 Runtime Service for intent detection and slot filling
 * Specialized for Medicare chatbot conversational AI
 */

import {
	LexRuntimeV2Client,
	RecognizeTextCommand,
	type RecognizeTextCommandInput,
	type RecognizeTextCommandOutput
} from '@aws-sdk/client-lex-runtime-v2';
import {
	AWS_LEX_REGION,
	AWS_LEX_ACCESS_KEY_ID,
	AWS_LEX_SECRET_ACCESS_KEY,
	AWS_LEX_BOT_ID,
	AWS_LEX_BOT_ALIAS_ID,
	AWS_LEX_LOCALE_ID,
	AWS_BEDROCK_REGION,
	AWS_BEDROCK_ACCESS_KEY_ID,
	AWS_BEDROCK_SECRET_ACCESS_KEY
} from '$env/static/private';

// Use dedicated Lex credentials first, fall back to Bedrock credentials
const AWS_REGION = AWS_LEX_REGION || AWS_BEDROCK_REGION || 'us-east-1';
const AWS_ACCESS_KEY_ID = AWS_LEX_ACCESS_KEY_ID || AWS_BEDROCK_ACCESS_KEY_ID || '';
const AWS_SECRET_ACCESS_KEY = AWS_LEX_SECRET_ACCESS_KEY || AWS_BEDROCK_SECRET_ACCESS_KEY || '';

// Lex-specific configuration
const BOT_ID = AWS_LEX_BOT_ID || '';
const BOT_ALIAS_ID = AWS_LEX_BOT_ALIAS_ID || 'TSTALIASID'; // Default test alias
const LOCALE_ID = AWS_LEX_LOCALE_ID || 'en_US';

// Debug logging for credential configuration
const hasBedrockCreds = !!(AWS_BEDROCK_ACCESS_KEY_ID && AWS_BEDROCK_SECRET_ACCESS_KEY);
const hasLexCreds = !!(AWS_LEX_ACCESS_KEY_ID && AWS_LEX_SECRET_ACCESS_KEY);
const credentialSource = hasLexCreds ? 'Lex' : hasBedrockCreds ? 'Bedrock (fallback)' : 'None';

console.log(`[DEBUG] Lex service credential source: ${credentialSource}`);
console.log(`[DEBUG] Lex Region: ${AWS_REGION}`);
console.log(`[DEBUG] Lex Bot ID: ${BOT_ID}`);
console.log(`[DEBUG] Lex Bot Alias: ${BOT_ALIAS_ID}`);
console.log(`[DEBUG] Lex Locale: ${LOCALE_ID}`);

export interface LexIntentResult {
	intent: string;
	confidence: number;
	slots?: Record<string, unknown>;
	sessionState?: {
		sessionId: string;
		sessionAttributes?: Record<string, string>;
	};
	interpretations?: Array<{
		intent: string;
		confidence: number;
		slots?: Record<string, unknown>;
	}>;
}

export interface LexRecognizeTextInput {
	text: string;
	sessionId: string;
	sessionAttributes?: Record<string, string>;
	requestAttributes?: Record<string, string>;
}

export class LexService {
	private client: LexRuntimeV2Client;
	private botId: string;
	private botAliasId: string;
	private localeId: string;

	constructor() {
		// Validate required configuration
		if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
			throw new Error('AWS credentials not configured for Lex service');
		}

		if (!BOT_ID) {
			throw new Error('AWS_LEX_BOT_ID is required for Lex service');
		}

		this.botId = BOT_ID;
		this.botAliasId = BOT_ALIAS_ID;
		this.localeId = LOCALE_ID;

		// Log configuration for debugging
		console.log(`[DEBUG] Lex initialization - Credential source: ${credentialSource}`);
		console.log(`[DEBUG] Using region: ${AWS_REGION}`);
		console.log(`[DEBUG] Access Key ID: ${AWS_ACCESS_KEY_ID.substring(0, 8)}...`);

		this.client = new LexRuntimeV2Client({
			region: AWS_REGION,
			credentials: {
				accessKeyId: AWS_ACCESS_KEY_ID,
				secretAccessKey: AWS_SECRET_ACCESS_KEY
			},
			maxAttempts: 3
		});

		console.log('[DEBUG] Lex client initialized successfully');
	}

	/**
	 * Main method to recognize text and extract intent/slots
	 */
	async recognizeText(input: LexRecognizeTextInput): Promise<LexIntentResult | null> {
		const startTime = Date.now();

		try {
			const params: RecognizeTextCommandInput = {
				botId: this.botId,
				botAliasId: this.botAliasId,
				localeId: this.localeId,
				sessionId: input.sessionId,
				text: input.text,
				...(input.sessionAttributes && {
					sessionState: { sessionAttributes: input.sessionAttributes }
				}),
				...(input.requestAttributes && { requestAttributes: input.requestAttributes })
			};

			console.log('[DEBUG] Lex RecognizeText params:', {
				botId: this.botId,
				botAliasId: this.botAliasId,
				localeId: this.localeId,
				sessionId: input.sessionId,
				text: input.text,
				hasSessionAttributes: !!input.sessionAttributes,
				hasRequestAttributes: !!input.requestAttributes
			});

			const command = new RecognizeTextCommand(params);
			const response: RecognizeTextCommandOutput = await this.client.send(command);

			const latency = Date.now() - startTime;
			console.log(`[DEBUG] Lex response received in ${latency}ms:`, {
				intentName: response.sessionState?.intent?.name,
				intentState: response.sessionState?.intent?.state,
				slots: response.sessionState?.intent?.slots,
				interpretationsCount: response.interpretations?.length || 0
			});

			// Extract the primary intent and confidence
			const primaryIntent = response.sessionState?.intent;
			if (!primaryIntent?.name) {
				console.warn('[WARN] No intent detected by Lex');
				return null;
			}

			// Get confidence score (Lex provides this in interpretations)
			const primaryInterpretation = response.interpretations?.find(
				(interp) => interp.intent?.name === primaryIntent.name
			);
			const confidence = primaryInterpretation?.nluConfidence?.score || 0;

			// Extract slots and convert to simple key-value pairs
			const slots: Record<string, unknown> = {};
			if (primaryIntent.slots) {
				for (const [slotName, slotValue] of Object.entries(primaryIntent.slots)) {
					if (slotValue?.value?.interpretedValue) {
						slots[slotName] = slotValue.value.interpretedValue;
					} else if (slotValue?.value?.originalValue) {
						slots[slotName] = slotValue.value.originalValue;
					}
				}
			}

			// Build interpretations array from Lex response
			const interpretations =
				response.interpretations?.map((interp) => {
					const interpSlots: Record<string, unknown> = {};
					if (interp.intent?.slots) {
						for (const [slotName, slotValue] of Object.entries(interp.intent.slots)) {
							if (slotValue?.value?.interpretedValue) {
								interpSlots[slotName] = slotValue.value.interpretedValue;
							} else if (slotValue?.value?.originalValue) {
								interpSlots[slotName] = slotValue.value.originalValue;
							}
						}
					}

					return {
						intent: interp.intent?.name || '',
						confidence: interp.nluConfidence?.score || 0,
						slots: Object.keys(interpSlots).length > 0 ? interpSlots : undefined
					};
				}) || [];

			return {
				intent: primaryIntent.name,
				confidence,
				slots: Object.keys(slots).length > 0 ? slots : undefined,
				sessionState: {
					sessionId: input.sessionId,
					sessionAttributes: response.sessionState?.sessionAttributes
				},
				interpretations
			};
		} catch (error) {
			const latency = Date.now() - startTime;
			console.error(`[ERROR] Lex recognition failed after ${latency}ms:`, error);
			return null;
		}
	}

	/**
	 * Helper method to get bot configuration
	 */
	getBotConfig() {
		return {
			botId: this.botId,
			botAliasId: this.botAliasId,
			localeId: this.localeId,
			region: AWS_REGION
		};
	}

	/**
	 * Helper method to validate bot configuration
	 */
	async validateBotConfig(): Promise<boolean> {
		try {
			// Try a simple recognition to validate the bot is accessible
			const testResult = await this.recognizeText({
				text: 'hello',
				sessionId: 'test-session-' + Date.now()
			});

			console.log('[DEBUG] Bot validation result:', !!testResult);
			return testResult !== null;
		} catch (error) {
			console.error('[ERROR] Bot validation failed:', error);
			return false;
		}
	}
}

export const lexService = new LexService();
