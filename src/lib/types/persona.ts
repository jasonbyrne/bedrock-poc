export interface Medication {
	drugName: string;
	dosage?: string;
	frequency?: string;
	duration?: string;
	route?: string;
	strength?: string;
	rate?: string;
	drugForm?: string;
	notes?: string;
}

export interface Address {
	streetAddress: string[];
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
	phoneNumber: string;
	phoneType: 'home' | 'work' | 'mobile' | 'other';
}

export interface MedicareBeneficiary {
	beneficiaryKey: number;
	firstName: string;
	lastName: string;
	birthDate: string; // ISO date string
	gender: 'Male' | 'Female' | 'Other';
	mailingAddress: Address;
	homeAddress?: Address;
	phoneNumbers: PhoneNumber[];
	medicareId: string;
	planType: 'Medicare Advantage' | 'Original Medicare' | 'Medicare Supplement';
	effectiveDate: string; // ISO date string
	primaryCarePhysician?: PrimaryCarePhysician;
	chronicConditions: ChronicCondition[];
	medications: Medication[];
	preferredPharmacy?: Pharmacy;
	emergencyContactName?: EmergencyContact;
	emergencyContactPhone?: EmergencyContact;
}
