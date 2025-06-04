/**
 * Authentication and persona type definitions for Medicare Chatbot POC
 */

export interface MedicareBeneficiary {
	beneficiary_key: number;
	first_name: string;
	last_name: string;
	birth_date: string; // ISO date string
	gender: 'Male' | 'Female' | 'Other';
	address: string;
	city: string;
	state: string;
	zip: string;
	phone_number: string;
	medicare_id: string;
	plan_type: 'Medicare Advantage' | 'Original Medicare' | 'Medicare Supplement';
	effective_date: string; // ISO date string
	primary_care_physician?: string;
	chronic_conditions: string[];
	preferred_pharmacy?: string;
	emergency_contact_name?: string;
	emergency_contact_phone?: string;
}

export interface AuthJwtPayload {
	beneficiary_key: number;
	first_name: string;
	last_name: string;
	birth_date: string;
	gender: 'Male' | 'Female' | 'Other';
	address: string;
	city: string;
	state: string;
	zip: string;
	phone_number: string;
	medicare_id: string;
	plan_type: 'Medicare Advantage' | 'Original Medicare' | 'Medicare Supplement';
	effective_date: string;
	primary_care_physician?: string;
	chronic_conditions: string[];
	preferred_pharmacy?: string;
	emergency_contact_name?: string;
	emergency_contact_phone?: string;
	iat: number; // issued at timestamp
	exp: number; // expiration timestamp
}

export interface LoginRequest {
	email?: string; // Optional for show
	password?: string; // Optional for show
	selected_persona: number; // beneficiary_key
}

export interface LoginResponse {
	success: boolean;
	token?: string;
	error?: string;
}

export interface PersonaOption {
	value: number;
	label: string;
	description: string;
}

export type AuthState = 'loading' | 'authenticated' | 'unauthenticated' | 'error';
