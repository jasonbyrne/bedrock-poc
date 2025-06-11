/**
 * Mock authentication API endpoint for Medicare Chatbot POC
 */

import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';
import type { LoginRequest, LoginResponse } from '$lib/types/authTypes.js';
import {
	findPersonaByKey,
	createMockJwtPayload,
	generateMockJwt
} from '$lib/services/personaService.js';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body: LoginRequest = await request.json();

		// Validate required fields
		if (!body.selectedPersona) {
			throw error(400, 'Persona selection is required');
		}

		// Find the selected persona
		const persona = findPersonaByKey(body.selectedPersona);
		if (!persona) {
			throw error(404, 'Selected persona not found');
		}

		// Create JWT payload and generate token
		const jwtPayload = createMockJwtPayload(persona);
		const token = generateMockJwt(jwtPayload);

		// Simulate some processing delay for realism
		await new Promise((resolve) => setTimeout(resolve, 500));

		const response: LoginResponse = {
			success: true,
			token
		};

		return json(response);
	} catch (err) {
		console.error('Login API error:', err);

		// Handle SvelteKit errors
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		// Handle other errors
		const response: LoginResponse = {
			success: false,
			error: 'Authentication failed'
		};

		return json(response, { status: 500 });
	}
};
