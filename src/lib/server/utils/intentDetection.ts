/**
 * Intent detection utilities for routing user messages to appropriate controllers
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
 * Amazon Lex intent detection (alternative to Bedrock)
 * Note: This requires additional AWS Lex configuration
 */
async function detectIntentWithLex(
	session: ChatSession
): Promise<{ intent: string; confidence: number; slots?: Record<string, unknown> } | null> {
	try {
		console.log('[DEBUG] Using Lex for intent detection');

		// Use session ID for Lex context
		const sessionId = session.sessionId;

		// Get previous session context for Lex session attributes
		const sessionAttributes: Record<string, string> = {};

		// Convert session context to Lex session attributes (strings only)
		if (session.currentIntent) {
			sessionAttributes.previousIntent = session.currentIntent.name;
		}
		if (session.currentConfidence !== undefined) {
			sessionAttributes.previousConfidence = session.currentConfidence.toString();
		}
		// Add any collected slots as context
		if (session.collectedSlots) {
			for (const [key, value] of Object.entries(session.collectedSlots)) {
				if (typeof value === 'string' || typeof value === 'number') {
					sessionAttributes[`slot_${key}`] = value.toString();
				}
			}
		}

		// Note: This would require AWS Lex Runtime V2 SDK setup
		// For now, this is a placeholder that would integrate with Lex
		console.log('[DEBUG] Lex integration not implemented - using fallback');

		return {
			intent: 'Unknown',
			confidence: 0.5,
			slots: {}
		};
	} catch (error) {
		console.error('[ERROR] Lex intent detection error:', error);
		return null;
	}
}
