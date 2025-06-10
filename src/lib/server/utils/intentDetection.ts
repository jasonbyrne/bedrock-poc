/**
 * Intent detection utilities using AWS Bedrock and AWS Lex
 * Handles conversation context and different AI service requirements
 */

import { ChatSession } from '$lib/server/core/chat-session.js';
import { bedrockService } from '$lib/server/services/bedrockService';

/**
 * Bedrock-powered intent detection with conversation context
 * Uses the session's conversation history to provide context for better intent recognition
 */
export async function detectIntent(
	session: ChatSession,
	aws_service: 'bedrock' | 'lex' = 'bedrock'
): Promise<{ intent: string; confidence: number; slots?: Record<string, unknown> } | null> {
	return aws_service === 'bedrock'
		? await bedrockService.detectIntent(session)
		: await detectIntentWithLex(session);
}

/**
 * Lex-powered intent detection with session context
 * Uses AWS Lex V2 Runtime for natural language understanding
 */
export async function detectIntentWithLex(
	session: ChatSession
): Promise<{ intent: string; confidence: number; slots?: Record<string, unknown> } | null> {
	// Get the current user message (the last message which was just added)
	const currentUserMessage = session.getLastMessage('user');
	if (!currentUserMessage) {
		console.error('[ERROR] No user message found in session');
		return null;
	}

	try {
		// Dynamic import to avoid linter errors when package isn't installed
		const { lexService } = await import('$lib/server/services/lexService');

		// Use session ID for Lex context
		const sessionId = session.session_id;

		// Get previous session context for Lex session attributes
		const sessionAttributes: Record<string, string> = {};

		// Convert session context to Lex session attributes (strings only)
		if (session.current_intent) {
			sessionAttributes.previousIntent = session.current_intent.name;
		}
		if (session.current_confidence !== undefined) {
			sessionAttributes.previousConfidence = session.current_confidence.toString();
		}
		// Add any collected slots as context
		if (session.collected_slots) {
			for (const [key, value] of Object.entries(session.collected_slots)) {
				if (typeof value === 'string' || typeof value === 'number') {
					sessionAttributes[`slot_${key}`] = value.toString();
				}
			}
		}

		console.log('[DEBUG] Lex intent detection:', {
			text: currentUserMessage.content,
			sessionId,
			sessionAttributesCount: Object.keys(sessionAttributes).length,
			sessionAttributes
		});

		const lexResult = await lexService.recognizeText({
			text: currentUserMessage.content,
			sessionId,
			sessionAttributes: Object.keys(sessionAttributes).length > 0 ? sessionAttributes : undefined
		});

		if (!lexResult) {
			console.warn('[WARN] No intent result from Lex');
			return null;
		}

		console.log('[DEBUG] Lex intent result:', {
			intent: lexResult.intent,
			confidence: lexResult.confidence,
			slots: lexResult.slots,
			interpretationsCount: lexResult.interpretations?.length || 0
		});

		// Return result in the same format as Bedrock
		return {
			intent: lexResult.intent,
			confidence: lexResult.confidence,
			slots: lexResult.slots
		};
	} catch (error) {
		console.error('[ERROR] Lex intent detection failed:', error);

		// If Lex service is not available, this is expected during development
		if (error instanceof Error && error.message.includes('Cannot find module')) {
			console.warn(
				'[WARN] Lex service not available - install @aws-sdk/client-lexv2-runtime to use Lex intent detection'
			);
		}

		return null;
	}
}
