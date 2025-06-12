/**
 * Global session expiration handling store
 * Provides centralized session expiration detection and modal management
 */

import { writable } from 'svelte/store';
import { isSessionExpiredError, isAuthError } from '$lib/services/chatbotApi';
import { clearAuth } from '$lib/stores/authStore';
import { goto } from '$app/navigation';

// Global session expiration state
export const showSessionExpiredModal = writable(false);

/**
 * Global error handler for API calls that may result in session expiration
 * Use this to wrap any chatbot API calls throughout the application
 */
export async function handleApiCall<T>(apiCall: () => Promise<T>): Promise<T | null> {
	try {
		return await apiCall();
	} catch (error) {
		// Handle session expiration globally
		if (isSessionExpiredError(error)) {
			showSessionExpiredModal.set(true);
			return null;
		}

		// Handle auth errors globally
		if (isAuthError(error)) {
			clearAuth();
			goto('/');
			return null;
		}

		// Re-throw other errors for component-specific handling
		throw error;
	}
}

/**
 * Handle session expired modal continue action
 * Clears auth and navigates to home
 */
export function handleSessionExpiredContinue(): void {
	clearAuth();
	showSessionExpiredModal.set(false);
	goto('/');
}

/**
 * Wrapper functions for common API calls with built-in session handling
 */
export const sessionAwareApi = {
	/**
	 * Initialize chat session with automatic session expiration handling
	 */
	async initializeChatSession() {
		const { initializeChatSession } = await import('$lib/services/chatbotApi');
		return handleApiCall(() => initializeChatSession());
	},

	/**
	 * Send message with automatic session expiration handling
	 */
	async sendMessage(sessionId: string, message: string) {
		const { sendMessage } = await import('$lib/services/chatbotApi');
		return handleApiCall(() => sendMessage(sessionId, message));
	}
};
