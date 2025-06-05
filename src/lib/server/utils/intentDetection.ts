/**
 * Intent detection utilities using AWS Bedrock
 * Handles conversation context and Claude API requirements
 */

import { ChatSession } from '$lib/server/core/chat-session.js';
import { bedrockService } from '$lib/server/services/bedrockService';
import { INTENT_DETECTION_PROMPT } from '$lib/server/systemPrompts';

/**
 * Bedrock-powered intent detection with conversation context
 * Uses the session's conversation history to provide context for better intent recognition
 */
export async function detectIntentWithBedrock(
	session: ChatSession
): Promise<{ intent: string; confidence: number; slots?: Record<string, unknown> } | null> {
	// Get the current user message (the last message which was just added)
	const currentUserMessage = session.getLastMessage('user');
	if (!currentUserMessage) {
		console.error('[ERROR] No user message found in session');
		return null;
	}

	// Get the last 4 messages for context (excluding the current one we just added)
	const contextMessages = session.getLastNMessages(4, 1);

	// Convert ChatMessage instances to the format expected by bedrockService
	let previousMessages = contextMessages.map((msg) => ({
		role: msg.role,
		content: msg.content
	}));

	// Claude API requires strict alternation between user and assistant roles
	// Filter to ensure proper alternation
	const filteredMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
	let lastRole: 'user' | 'assistant' | null = null;

	for (const msg of previousMessages) {
		// Only add message if it's a different role from the last one
		if (msg.role !== lastRole) {
			filteredMessages.push(msg);
			lastRole = msg.role;
		}
		// If same role, skip this message (keeps the conversation flowing)
	}

	// Ensure we start with a user message
	while (filteredMessages.length > 0 && filteredMessages[0].role === 'assistant') {
		filteredMessages.shift();
	}

	previousMessages = filteredMessages;

	console.log('[DEBUG] Intent detection with context:', {
		currentMessage: currentUserMessage.content,
		contextMessagesCount: previousMessages.length,
		rawContextCount: contextMessages.length,
		context: previousMessages.map((m) => `${m.role}: ${m.content}`).join(' | ')
	});

	const bedrockResult = await bedrockService.generateResponse({
		systemPrompt: INTENT_DETECTION_PROMPT,
		previousMessages,
		userInput: currentUserMessage.content
	});

	console.log('[DEBUG] Raw Bedrock intent output:', bedrockResult.content);

	try {
		interface ParsedIntent {
			intent?: string;
			confidence?: number;
			slots?: Record<string, unknown>;
		}
		let parsed: ParsedIntent | null = null;

		// Try to parse as array first (Claude 3 format)
		if (typeof bedrockResult.content === 'string' && bedrockResult.content.trim().startsWith('[')) {
			const arr: Array<{ type: string; text: string }> = JSON.parse(bedrockResult.content);
			if (Array.isArray(arr) && arr.length > 0 && typeof arr[0].text === 'string') {
				parsed = JSON.parse(arr[0].text) as ParsedIntent;
			}
		} else {
			parsed = JSON.parse(bedrockResult.content) as ParsedIntent;
		}

		console.log('[DEBUG] Parsed intent JSON:', parsed);

		if (parsed && typeof parsed.intent === 'string' && typeof parsed.confidence === 'number') {
			return parsed as { intent: string; confidence: number; slots?: Record<string, unknown> };
		}

		console.warn('[WARN] Parsed object missing required fields:', parsed);
	} catch (err) {
		console.error('Failed to parse Bedrock intent JSON:', err, bedrockResult.content);
	}

	return null;
}
