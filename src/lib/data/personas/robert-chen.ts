import type { MedicareBeneficiary } from '$lib/types/persona';

export const robertChen: MedicareBeneficiary = {
	beneficiaryKey: 1004,
	firstName: 'Robert',
	lastName: 'Chen',
	birthDate: '1948-09-15',
	gender: 'Male',
	mailingAddress: {
		streetAddress: ['2345 Pine Street', 'Unit 12B'],
		city: 'San Francisco',
		state: 'CA',
		zip: '94115'
	},
	phoneNumbers: [
		{
			phoneNumber: '(415) 555-0789',
			phoneType: 'home'
		},
		{
			phoneNumber: '(415) 555-0790',
			phoneType: 'mobile'
		}
	],
	medicareId: 'MED004848091D',
	planType: 'Medicare Advantage',
	effectiveDate: '2013-09-01',
	primaryCarePhysician: {
		name: 'Dr. Sarah Kim',
		phone: '(415) 555-0791'
	},
	chronicConditions: [
		{
			name: 'Rheumatoid Arthritis',
			description: 'Moderate RA, managed with DMARDs and occasional steroids'
		},
		{
			name: 'Osteoporosis',
			description: 'Treated with bisphosphonates, regular DEXA scans'
		},
		{
			name: 'Gastroesophageal Reflux Disease (GERD)',
			description: 'Well controlled with PPI'
		}
	],
	medications: [
		{
			drugName: 'Methotrexate',
			dosage: '15mg',
			frequency: 'Once weekly',
			duration: 'Long-term',
			notes: 'Take with folic acid, monitor liver function'
		},
		{
			drugName: 'Alendronate',
			dosage: '70mg',
			frequency: 'Once weekly',
			duration: 'Long-term',
			notes: 'Take on empty stomach with full glass of water'
		},
		{
			drugName: 'Omeprazole',
			dosage: '20mg',
			frequency: 'Once daily before breakfast',
			duration: 'Long-term',
			notes: 'For GERD management'
		},
		{
			drugName: 'Folic Acid',
			dosage: '1mg',
			frequency: 'Daily except on methotrexate day',
			duration: 'Long-term',
			notes: 'To reduce methotrexate side effects'
		}
	],
	preferredPharmacy: {
		name: 'Walgreens #1234',
		streetAddress: ['2400 California Street'],
		city: 'San Francisco',
		state: 'CA',
		zip: '94115'
	},
	emergencyContactName: {
		name: 'Michael Chen (Son)',
		phone: '(415) 555-0792'
	}
};
