export interface Medication {
	name: string;
	dosage?: string;
	frequency?: string;
	duration?: string;
	route?: string;
	strength?: string;
	rate?: string;
	form?: string;
	notes?: string;
}

export interface Address {
	street_address: string[];
	city: string;
	state: string;
	zip: string;
}

export interface Pharmacy extends Address {
	name: string;
}

export interface ChronicCondition {
	name: string;
	description: string;
}

export interface EmergencyContact {
	name: string;
	phone: string;
}

export interface PrimaryCarePhysician {
	name: string;
	phone: string;
}

export interface PhoneNumber {
	phone_number: string;
	phone_type: 'home' | 'work' | 'mobile' | 'other';
}

export interface MedicareBeneficiary {
	beneficiary_key: number;
	first_name: string;
	last_name: string;
	birth_date: string; // ISO date string
	gender: 'Male' | 'Female' | 'Other';
	mailing_address: Address;
	home_address?: Address;
	phone_numbers: PhoneNumber[];
	medicare_id: string;
	plan_type: 'Medicare Advantage' | 'Original Medicare' | 'Medicare Supplement';
	effective_date: string; // ISO date string
	primary_care_physician?: PrimaryCarePhysician;
	chronic_conditions: ChronicCondition[];
	medications: Medication[];
	preferred_pharmacy?: Pharmacy;
	emergency_contact_name?: EmergencyContact;
	emergency_contact_phone?: EmergencyContact;
}
