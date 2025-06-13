export { createIntentDetectionPrompt } from './intentDetection';
export { createFallbackPrompt } from './fallback';
export { createClarificationPrompt } from './clarification';
export { createMissingInformationPrompt } from './missingInformation';
export { createAnswerPrompt } from './answer';

/**
 * Prepare a prompt but removing unnecessary formatting.
 *
 * Formatting we REMOVE:
 * - Multiple consecutive newlines
 * - Empty lines at start/end
 */
export function formatPrompt(prompt: string): string {
	return prompt.replace(/\n{3,}/g, '\n\n').trim();
}
