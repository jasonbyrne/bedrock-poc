/**
 * Static persona data and authentication service for Medicare Chatbot POC
 */

import type { MedicareBeneficiary, PersonaOption, AuthJwtPayload } from '$lib/types/authTypes.js';

export const STATIC_PERSONAS: MedicareBeneficiary[] = [
	{
		beneficiary_key: 1001,
		first_name: 'Margaret',
		last_name: 'Johnson',
		birth_date: '1945-03-15',
		gender: 'Female',
		address: '123 Oak Street',
		city: 'Springfield',
		state: 'IL',
		zip: '62701',
		phone_number: '(217) 555-0123',
		medicare_id: 'MED123456789A',
		plan_type: 'Medicare Advantage',
		effective_date: '2020-01-01',
		primary_care_physician: 'Dr. Sarah Williams',
		chronic_conditions: ['Diabetes Type 2', 'Hypertension'],
		preferred_pharmacy: 'CVS Pharmacy - Main St',
		emergency_contact_name: 'Robert Johnson (Son)',
		emergency_contact_phone: '(217) 555-0124'
	},
	{
		beneficiary_key: 1002,
		first_name: 'Robert',
		last_name: 'Chen',
		birth_date: '1952-08-22',
		gender: 'Male',
		address: '456 Pine Avenue',
		city: 'Austin',
		state: 'TX',
		zip: '73301',
		phone_number: '(512) 555-0234',
		medicare_id: 'MED987654321B',
		plan_type: 'Original Medicare',
		effective_date: '2017-08-01',
		primary_care_physician: 'Dr. Michael Rodriguez',
		chronic_conditions: ['High Cholesterol', 'Arthritis'],
		preferred_pharmacy: 'Walgreens - Cedar Park',
		emergency_contact_name: 'Linda Chen (Wife)',
		emergency_contact_phone: '(512) 555-0235'
	},
	{
		beneficiary_key: 1003,
		first_name: 'Dorothy',
		last_name: 'Washington',
		birth_date: '1940-12-05',
		gender: 'Female',
		address: '789 Maple Drive',
		city: 'Atlanta',
		state: 'GA',
		zip: '30309',
		phone_number: '(404) 555-0345',
		medicare_id: 'MED456789123C',
		plan_type: 'Medicare Supplement',
		effective_date: '2015-12-01',
		primary_care_physician: 'Dr. James Thompson',
		chronic_conditions: ['Heart Disease', 'Osteoporosis', 'Diabetes Type 2'],
		preferred_pharmacy: 'Kroger Pharmacy - Peachtree',
		emergency_contact_name: 'Michael Washington (Nephew)',
		emergency_contact_phone: '(404) 555-0346'
	},
	{
		beneficiary_key: 1004,
		first_name: 'Frank',
		last_name: 'Miller',
		birth_date: '1948-06-30',
		gender: 'Male',
		address: '321 Elm Street',
		city: 'Phoenix',
		state: 'AZ',
		zip: '85001',
		phone_number: '(602) 555-0456',
		medicare_id: 'MED789123456D',
		plan_type: 'Medicare Advantage',
		effective_date: '2018-06-01',
		primary_care_physician: 'Dr. Patricia Garcia',
		chronic_conditions: ['COPD', 'Hypertension'],
		preferred_pharmacy: "Fry's Pharmacy - Central Ave",
		emergency_contact_name: 'Susan Miller (Daughter)',
		emergency_contact_phone: '(602) 555-0457'
	},
	{
		beneficiary_key: 1005,
		first_name: 'Helen',
		last_name: 'Davis',
		birth_date: '1955-11-18',
		gender: 'Female',
		address: '654 Birch Lane',
		city: 'Seattle',
		state: 'WA',
		zip: '98101',
		phone_number: '(206) 555-0567',
		medicare_id: 'MED321654987E',
		plan_type: 'Original Medicare',
		effective_date: '2020-11-01',
		chronic_conditions: ['Anxiety', 'Mild Cognitive Impairment'],
		preferred_pharmacy: 'Rite Aid - Capitol Hill',
		emergency_contact_name: 'David Davis (Brother)',
		emergency_contact_phone: '(206) 555-0568'
	}
];

/**
 * Get all personas formatted for dropdown options
 */
export function getPersonaOptions(): PersonaOption[] {
	return STATIC_PERSONAS.map((persona) => ({
		value: persona.beneficiary_key,
		label: `${persona.first_name} ${persona.last_name}`,
		description: `${persona.plan_type} • ${persona.city}, ${persona.state}`
	}));
}

/**
 * Find a persona by beneficiary key
 */
export function findPersonaByKey(beneficiary_key: number): MedicareBeneficiary | undefined {
	return STATIC_PERSONAS.find((persona) => persona.beneficiary_key === beneficiary_key);
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
