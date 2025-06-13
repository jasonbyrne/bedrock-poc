import type { MedicareBeneficiary } from '$lib/types/persona';

export const williamThompson: MedicareBeneficiary = {
	beneficiaryKey: 1002,
	firstName: 'William',
	lastName: 'Thompson',
	birthDate: '1950-11-03',
	gender: 'Male',
	mailingAddress: {
		streetAddress: ['8924 Prairie View Drive'],
		city: 'Des Moines',
		state: 'IA',
		zip: '50312'
	},
	phoneNumbers: [
		{
			phoneNumber: '(515) 555-0234',
			phoneType: 'home'
		}
	],
	medicareId: 'MED002850119B',
	planType: 'Original Medicare',
	effectiveDate: '2015-11-01',
	primaryCarePhysician: {
		name: 'Dr. Jennifer Walsh',
		phone: '(515) 555-0235'
	},
	chronicConditions: [
		{
			name: 'Chronic Obstructive Pulmonary Disease (COPD)',
			description: 'Moderate COPD, former smoker, uses inhaler daily'
		},
		{
			name: 'High Cholesterol',
			description: 'Managed with statin, diet modification'
		}
	],
	medications: [
		{
			drugName: 'Albuterol Inhaler',
			dosage: '90mcg',
			frequency: '2 puffs every 4-6 hours as needed',
			duration: 'Long-term',
			notes: 'Rescue inhaler for breathing difficulty'
		},
		{
			drugName: 'Spiriva',
			dosage: '18mcg',
			frequency: 'Once daily',
			duration: 'Long-term',
			notes: 'Long-acting bronchodilator'
		},
		{
			drugName: 'Atorvastatin',
			dosage: '40mg',
			frequency: 'Once daily at bedtime',
			duration: 'Long-term',
			notes: 'Monitor liver function annually'
		}
	],
	preferredPharmacy: {
		name: 'Hy-Vee Pharmacy',
		streetAddress: ['8900 University Avenue'],
		city: 'Des Moines',
		state: 'IA',
		zip: '50314'
	},
	emergencyContactName: {
		name: 'Margaret Thompson (Wife)',
		phone: '(515) 555-0236'
	}
};
