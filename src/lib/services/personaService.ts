import type { PersonaOption, AuthJwtPayload } from '$lib/types/authTypes.js';
import personas from '$lib/data/personas';
import type { MedicareBeneficiary } from '$lib/types/persona';

/**
 * Get all personas formatted for dropdown options
 */
export function getPersonaOptions(): PersonaOption[] {
	return personas.map((persona) => {
		const age = new Date().getFullYear() - new Date(persona.birthDate).getFullYear();
		return {
			value: persona.beneficiaryKey,
			label: `${persona.firstName} ${persona.lastName} (${age})`,
			description: `${persona.planType} • ${persona.mailingAddress.city}, ${persona.mailingAddress.state}`
		};
	});
}

/**
 * Find a persona by beneficiary key
 */
export function findPersonaByKey(beneficiaryKey: number): MedicareBeneficiary | undefined {
	return personas.find((persona) => persona.beneficiaryKey === beneficiaryKey);
}

/**
 * Create a mock JWT payload from persona data
 */
export function createMockJwtPayload(persona: MedicareBeneficiary): AuthJwtPayload {
	const now = Math.floor(Date.now() / 1000);
	const expiration = now + 24 * 60 * 60; // 24 hours

	return {
		...persona,
		iat: now,
		exp: expiration
	};
}

/**
 * Generate a mock JWT token (base64 encoded payload for POC)
 */
export function generateMockJwt(payload: AuthJwtPayload): string {
	// For POC purposes, we'll just base64 encode the payload
	// In production, this would be a proper JWT with signature
	const header = { alg: 'HS256', typ: 'JWT' };
	const encodedHeader = btoa(JSON.stringify(header));
	const encodedPayload = btoa(JSON.stringify(payload));
	const mockSignature = 'mock_signature_for_poc';

	return `${encodedHeader}.${encodedPayload}.${mockSignature}`;
}

/**
 * Decode a mock JWT token
 */
export function decodeMockJwt(token: string): AuthJwtPayload | null {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return null;

		const payload = JSON.parse(atob(parts[1]));

		// Check if token is expired
		const now = Math.floor(Date.now() / 1000);
		if (payload.exp && payload.exp < now) {
			return null;
		}

		return payload;
	} catch {
		return null;
	}
}
