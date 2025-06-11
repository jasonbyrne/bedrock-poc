/**
 * Authentication and persona type definitions for Medicare Chatbot POC
 */
import type { MedicareBeneficiary } from './persona';

export interface AuthJwtPayload extends MedicareBeneficiary {
	iat: number; // issued at timestamp
	exp: number; // expiration timestamp
}

export interface LoginRequest {
	email?: string; // Optional for show
	password?: string; // Optional for show
	selectedPersona: number; // beneficiaryKey
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
