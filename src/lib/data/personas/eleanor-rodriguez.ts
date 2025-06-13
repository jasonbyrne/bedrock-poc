import type { MedicareBeneficiary } from '$lib/types/persona';

export const eleanorRodriguez: MedicareBeneficiary = {
	beneficiaryKey: 1001,
	firstName: 'Eleanor',
	lastName: 'Rodriguez',
	birthDate: '1943-07-12',
	gender: 'Female',
	mailingAddress: {
		streetAddress: ['1247 Sunset Boulevard', 'Apt 3B'],
		city: 'Los Angeles',
		state: 'CA',
		zip: '90026'
	},
	phoneNumbers: [
		{
			phoneNumber: '(213) 555-0891',
			phoneType: 'home'
		},
		{
			phoneNumber: '(213) 555-0892',
			phoneType: 'mobile'
		}
	],
	medicareId: 'MED001947123A',
	planType: 'Medicare Advantage',
	effectiveDate: '2008-07-01',
	primaryCarePhysician: {
		name: 'Dr. Maria Gonzalez',
		phone: '(213) 555-0893'
	},
	chronicConditions: [
		{
			name: 'Type 2 Diabetes',
			description: 'Managed with medication and diet, diagnosed 2005'
		},
		{
			name: 'Hypertension',
			description: 'Well controlled with ACE inhibitor'
		},
		{
			name: 'Osteoarthritis',
			description: 'Mild knee and hip pain, managed with exercise'
		}
	],
	medications: [
		{
			drugName: 'metformin',
			dosage: '1000mg',
			route: 'Oral',
			strength: '500mg',
			drugForm: 'Tablet',
			frequency: 'Twice daily',
			duration: 'Long-term',
			notes: 'Take with meals to reduce GI upset'
		},
		{
			drugName: 'Gabapentin',
			dosage: '300mg',
			frequency: 'Three times daily',
			duration: 'Long-term',
			notes: 'For diabetic nerve pain'
		},
		{
			drugName: 'Simvastatin',
			dosage: '20mg',
			frequency: 'Once daily at bedtime',
			duration: 'Long-term',
			notes: 'Monitor liver function annually'
		}
	],
	preferredPharmacy: {
		name: 'CVS Pharmacy #2847',
		streetAddress: ['1250 Sunset Boulevard'],
		city: 'Los Angeles',
		state: 'CA',
		zip: '90026'
	},
	emergencyContactName: {
		name: 'Carlos Rodriguez (Son)',
		phone: '(213) 555-0894'
	}
};
