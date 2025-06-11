import type { MedicareBeneficiary } from '$lib/types/persona';

export const STATIC_PERSONAS: MedicareBeneficiary[] = [
	{
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
	},
	{
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
	},
	{
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
	},
	{
		beneficiaryKey: 1004,
		firstName: 'Robert',
		lastName: 'Kim',
		birthDate: '1956-09-15',
		gender: 'Male',
		mailingAddress: {
			streetAddress: ['42 Cherry Hill Lane'],
			city: 'Portland',
			state: 'OR',
			zip: '97201'
		},
		phoneNumbers: [
			{
				phoneNumber: '(503) 555-0678',
				phoneType: 'home'
			},
			{
				phoneNumber: '(503) 555-0679',
				phoneType: 'mobile'
			}
		],
		medicareId: 'MED004456091D',
		planType: 'Medicare Advantage',
		effectiveDate: '2021-09-01',
		primaryCarePhysician: {
			name: 'Dr. Lisa Chen',
			phone: '(503) 555-0680'
		},
		chronicConditions: [
			{
				name: 'Mild Cognitive Impairment',
				description: 'Early memory concerns, being monitored for progression'
			},
			{
				name: 'Benign Prostatic Hyperplasia',
				description: 'Enlarged prostate, managed with alpha-blocker'
			}
		],
		medications: [
			{
				drugName: 'Donepezil',
				dosage: '5mg',
				frequency: 'Once daily',
				duration: 'Long-term',
				notes: 'For cognitive function, started 6 months ago'
			},
			{
				drugName: 'Tamsulosin',
				dosage: '0.4mg',
				frequency: 'Once daily at bedtime',
				duration: 'Long-term',
				notes: 'Alpha-blocker for prostate symptoms'
			},
			{
				drugName: 'Multivitamin',
				dosage: '1 tablet',
				frequency: 'Once daily',
				duration: 'Long-term',
				notes: 'General health maintenance'
			}
		],
		preferredPharmacy: {
			name: 'Fred Meyer Pharmacy',
			streetAddress: ['100 NW 20th Place'],
			city: 'Portland',
			state: 'OR',
			zip: '97209'
		},
		emergencyContactName: {
			name: 'Grace Kim (Wife)',
			phone: '(503) 555-0681'
		}
	},
	{
		beneficiaryKey: 1005,
		firstName: 'Betty',
		lastName: "O'Brien",
		birthDate: '1945-05-22',
		gender: 'Female',
		mailingAddress: {
			streetAddress: ['1832 Ocean View Drive'],
			city: 'Miami',
			state: 'FL',
			zip: '33139'
		},
		phoneNumbers: [
			{
				phoneNumber: '(305) 555-0789',
				phoneType: 'home'
			}
		],
		medicareId: 'MED005445052E',
		planType: 'Original Medicare',
		effectiveDate: '2010-05-01',
		primaryCarePhysician: {
			name: 'Dr. Carlos Mendez',
			phone: '(305) 555-0790'
		},
		chronicConditions: [
			{
				name: 'Osteoporosis',
				description: 'Bone density loss, history of wrist fracture'
			},
			{
				name: 'Macular Degeneration',
				description: 'Dry AMD in both eyes, stable with supplements'
			},
			{
				name: 'Gastroesophageal Reflux Disease',
				description: 'Chronic heartburn, managed with PPI'
			}
		],
		medications: [
			{
				drugName: 'Alendronate',
				dosage: '70mg',
				frequency: 'Once weekly',
				duration: 'Long-term',
				notes: 'Take on empty stomach, remain upright 30 minutes'
			},
			{
				drugName: 'Calcium Carbonate with Vitamin D',
				dosage: '600mg/400IU',
				frequency: 'Twice daily',
				duration: 'Long-term',
				notes: 'Take with meals for better absorption'
			},
			{
				drugName: 'AREDS2 Formula',
				dosage: '2 capsules',
				frequency: 'Once daily',
				duration: 'Long-term',
				notes: 'Eye vitamin for macular degeneration'
			},
			{
				drugName: 'Omeprazole',
				dosage: '20mg',
				frequency: 'Once daily before breakfast',
				duration: 'Long-term',
				notes: 'Proton pump inhibitor for acid reflux'
			}
		],
		preferredPharmacy: {
			name: 'Publix Pharmacy #1247',
			streetAddress: ['1801 Alton Road'],
			city: 'Miami Beach',
			state: 'FL',
			zip: '33139'
		},
		emergencyContactName: {
			name: "Patricia O'Brien (Daughter)",
			phone: '(305) 555-0791'
		}
	},
	{
		beneficiaryKey: 1006,
		firstName: 'James',
		lastName: 'Patel',
		birthDate: '1952-12-08',
		gender: 'Male',
		mailingAddress: {
			streetAddress: ['3456 Elm Street', 'Unit 12'],
			city: 'Houston',
			state: 'TX',
			zip: '77002'
		},
		phoneNumbers: [
			{
				phoneNumber: '(713) 555-0912',
				phoneType: 'home'
			},
			{
				phoneNumber: '(713) 555-0913',
				phoneType: 'mobile'
			}
		],
		medicareId: 'MED006652120F',
		planType: 'Medicare Advantage',
		effectiveDate: '2017-12-01',
		primaryCarePhysician: {
			name: 'Dr. Ahmed Hassan',
			phone: '(713) 555-0914'
		},
		chronicConditions: [
			{
				name: 'Type 2 Diabetes',
				description: 'Well-controlled diabetes with insulin and metformin'
			},
			{
				name: 'Diabetic Neuropathy',
				description: 'Peripheral nerve pain in feet, managed with gabapentin'
			},
			{
				name: 'Sleep Apnea',
				description: 'Uses CPAP machine nightly'
			},
			{
				name: 'Depression',
				description: 'Mild depression, well-managed with SSRI'
			}
		],
		medications: [
			{
				drugName: 'Insulin Glargine',
				dosage: '20 units',
				frequency: 'Once daily at bedtime',
				duration: 'Long-term',
				notes: 'Long-acting insulin, rotate injection sites'
			},
			{
				drugName: 'Metformin',
				dosage: '1000mg',
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
				drugName: 'Sertraline',
				dosage: '50mg',
				frequency: 'Once daily in morning',
				duration: 'Long-term',
				notes: 'SSRI for depression, avoid alcohol'
			}
		],
		preferredPharmacy: {
			name: 'CVS Pharmacy #8934',
			streetAddress: ['3400 Main Street'],
			city: 'Houston',
			state: 'TX',
			zip: '77002'
		},
		emergencyContactName: {
			name: 'Priya Patel (Wife)',
			phone: '(713) 555-0915'
		}
	}
];
