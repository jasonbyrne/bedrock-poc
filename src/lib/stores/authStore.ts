/**
 * Authentication store using Svelte stores for state management
 */

import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { AuthJwtPayload, AuthState } from '$lib/types/authTypes.js';
import { decodeMockJwt } from '$lib/services/personaService.js';

const AUTH_TOKEN_KEY = 'medicare_chatbot_auth_token';

// Svelte stores for reactive state
export const authState = writable<AuthState>('loading');
export const currentUser = writable<AuthJwtPayload | null>(null);
export const authToken = writable<string | null>(null);

/**
 * Initialize auth state from localStorage
 */
export function initializeAuth(): void {
	if (!browser) {
		authState.set('unauthenticated');
		return;
	}

	try {
		const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
		if (!storedToken) {
			authState.set('unauthenticated');
			return;
		}

		const payload = decodeMockJwt(storedToken);
		if (!payload) {
			// Token is invalid or expired
			localStorage.removeItem(AUTH_TOKEN_KEY);
			authState.set('unauthenticated');
			return;
		}

		// Token is valid
		authToken.set(storedToken);
		currentUser.set(payload);
		authState.set('authenticated');
	} catch (error) {
		console.error('Error initializing auth:', error);
		authState.set('error');
	}
}

/**
 * Set authentication token and user data
 */
export function setAuth(token: string, user: AuthJwtPayload): void {
	if (!browser) return;

	try {
		localStorage.setItem(AUTH_TOKEN_KEY, token);
		authToken.set(token);
		currentUser.set(user);
		authState.set('authenticated');
	} catch (error) {
		console.error('Error setting auth:', error);
		authState.set('error');
	}
}

/**
 * Clear authentication data
 */
export function clearAuth(): void {
	if (browser) {
		localStorage.removeItem(AUTH_TOKEN_KEY);
	}

	authToken.set(null);
	currentUser.set(null);
	authState.set('unauthenticated');
}

export const isAuthenticated = () => {
	return get(authState) === 'authenticated' && get(currentUser) !== null;
};

export const getUserDisplayName = () => {
	const user = get(currentUser);
	if (!user) return '';
	return `${user.first_name} ${user.last_name}`;
};

// Initialize auth state when module loads
if (browser) {
	initializeAuth();
}
