import type { MedicareBeneficiary } from '$lib/types/persona';

export const margaretOconnor: MedicareBeneficiary = {
	beneficiaryKey: 1005,
	firstName: 'Margaret',
	lastName: "O'Connor",
	birthDate: '1945-04-22',
	gender: 'Female',
	mailingAddress: {
		streetAddress: ['789 Oak Lane'],
		city: 'Boston',
		state: 'MA',
		zip: '02108'
	},
	phoneNumbers: [
		{
			phoneNumber: '(617) 555-0123',
			phoneType: 'home'
		}
	],
	medicareId: 'MED005845042E',
	planType: 'Original Medicare',
	effectiveDate: '2010-04-01',
	primaryCarePhysician: {
		name: 'Dr. Patrick Murphy',
		phone: '(617) 555-0124'
	},
	chronicConditions: [
		{
			name: 'Type 1 Diabetes',
			description: 'Insulin-dependent, uses insulin pump'
		},
		{
			name: 'Hypothyroidism',
			description: 'Well controlled with levothyroxine'
		},
		{
			name: 'Cataracts',
			description: 'Bilateral, mild vision changes'
		}
	],
	medications: [
		{
			drugName: 'Insulin Aspart',
			dosage: 'Variable',
			frequency: 'Continuous via pump',
			duration: 'Long-term',
			notes: 'Rapid-acting insulin for pump use'
		},
		{
			drugName: 'Levothyroxine',
			dosage: '75mcg',
			frequency: 'Once daily in morning',
			duration: 'Long-term',
			notes: 'Take on empty stomach'
		},
		{
			drugName: 'Aspirin',
			dosage: '81mg',
			frequency: 'Once daily',
			duration: 'Long-term',
			notes: 'For cardiovascular protection'
		}
	],
	preferredPharmacy: {
		name: 'CVS Pharmacy #9876',
		streetAddress: ['800 Boylston Street'],
		city: 'Boston',
		state: 'MA',
		zip: '02199'
	},
	emergencyContactName: {
		name: "Sean O'Connor (Son)",
		phone: '(617) 555-0125'
	}
};
