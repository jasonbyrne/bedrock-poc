import type { MedicareBeneficiary } from '$lib/types/persona';

export const joyceWashington: MedicareBeneficiary = {
	beneficiaryKey: 1003,
	firstName: 'Joyce',
	lastName: 'Washington',
	birthDate: '1941-02-28',
	gender: 'Female',
	mailingAddress: {
		streetAddress: ['567 Magnolia Street'],
		city: 'Memphis',
		state: 'TN',
		zip: '38103'
	},
	phoneNumbers: [
		{
			phoneNumber: '(901) 555-0456',
			phoneType: 'home'
		}
	],
	medicareId: 'MED003741022C',
	planType: 'Medicare Supplement',
	effectiveDate: '2006-03-01',
	primaryCarePhysician: {
		name: 'Dr. Robert Jackson',
		phone: '(901) 555-0457'
	},
	chronicConditions: [
		{
			name: 'Congestive Heart Failure',
			description: 'Class II heart failure, well managed with medications'
		},
		{
			name: 'Atrial Fibrillation',
			description: 'Irregular heart rhythm, on blood thinner'
		},
		{
			name: 'Chronic Kidney Disease Stage 3',
			description: 'Mild kidney function decline, monitored quarterly'
		}
	],
	medications: [
		{
			drugName: 'Metoprolol',
			dosage: '50mg',
			frequency: 'Twice daily',
			duration: 'Long-term',
			notes: 'Beta-blocker for heart rate control'
		},
		{
			drugName: 'Warfarin',
			dosage: '5mg',
			frequency: 'Once daily',
			duration: 'Long-term',
			notes: 'Blood thinner, requires regular INR monitoring'
		},
		{
			drugName: 'Furosemide',
			dosage: '40mg',
			frequency: 'Once daily in morning',
			duration: 'Long-term',
			notes: 'Diuretic for heart failure, monitor potassium'
		},
		{
			drugName: 'Lisinopril',
			dosage: '5mg',
			frequency: 'Once daily',
			duration: 'Long-term',
			notes: 'ACE inhibitor for heart protection'
		}
	],
	preferredPharmacy: {
		name: 'Kroger Pharmacy',
		streetAddress: ['570 S Highland Street'],
		city: 'Memphis',
		state: 'TN',
		zip: '38111'
	},
	emergencyContactName: {
		name: 'Denise Washington (Daughter)',
		phone: '(901) 555-0458'
	}
};
