import type { MedicareBeneficiary } from '$lib/types/persona';

export const STATIC_PERSONAS: MedicareBeneficiary[] = [
	{
		beneficiary_key: 1001,
		first_name: 'Eleanor',
		last_name: 'Rodriguez',
		birth_date: '1943-07-12',
		gender: 'Female',
		mailing_address: {
			street_address: ['1247 Sunset Boulevard', 'Apt 3B'],
			city: 'Los Angeles',
			state: 'CA',
			zip: '90026'
		},
		phone_numbers: [
			{
				phone_number: '(213) 555-0891',
				phone_type: 'home'
			},
			{
				phone_number: '(213) 555-0892',
				phone_type: 'mobile'
			}
		],
		medicare_id: 'MED001947123A',
		plan_type: 'Medicare Advantage',
		effective_date: '2008-07-01',
		primary_care_physician: {
			name: 'Dr. Maria Gonzalez',
			phone: '(213) 555-0893'
		},
		chronic_conditions: [
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
				name: 'metformin',
				dosage: '1000mg',
				route: 'Oral',
				strength: '500mg',
				form: 'Tablet',
				frequency: 'Twice daily',
				duration: 'Long-term',
				notes: 'Take with meals to reduce GI upset'
			},
			{
				name: 'Gabapentin',
				dosage: '300mg',
				frequency: 'Three times daily',
				duration: 'Long-term',
				notes: 'For diabetic nerve pain'
			},
			{
				name: 'Simvastatin',
				dosage: '20mg',
				frequency: 'Once daily at bedtime',
				duration: 'Long-term',
				notes: 'Monitor liver function annually'
			}
		],
		preferred_pharmacy: {
			name: 'CVS Pharmacy #2847',
			street_address: ['1250 Sunset Boulevard'],
			city: 'Los Angeles',
			state: 'CA',
			zip: '90026'
		},
		emergency_contact_name: {
			name: 'Carlos Rodriguez (Son)',
			phone: '(213) 555-0894'
		}
	},
	{
		beneficiary_key: 1002,
		first_name: 'William',
		last_name: 'Thompson',
		birth_date: '1950-11-03',
		gender: 'Male',
		mailing_address: {
			street_address: ['8924 Prairie View Drive'],
			city: 'Des Moines',
			state: 'IA',
			zip: '50312'
		},
		phone_numbers: [
			{
				phone_number: '(515) 555-0234',
				phone_type: 'home'
			}
		],
		medicare_id: 'MED002850119B',
		plan_type: 'Original Medicare',
		effective_date: '2015-11-01',
		primary_care_physician: {
			name: 'Dr. Jennifer Walsh',
			phone: '(515) 555-0235'
		},
		chronic_conditions: [
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
				name: 'Albuterol Inhaler',
				dosage: '90mcg',
				frequency: '2 puffs every 4-6 hours as needed',
				duration: 'Long-term',
				notes: 'Rescue inhaler for breathing difficulty'
			},
			{
				name: 'Spiriva',
				dosage: '18mcg',
				frequency: 'Once daily',
				duration: 'Long-term',
				notes: 'Long-acting bronchodilator'
			},
			{
				name: 'Atorvastatin',
				dosage: '40mg',
				frequency: 'Once daily at bedtime',
				duration: 'Long-term',
				notes: 'Monitor liver function annually'
			}
		],
		preferred_pharmacy: {
			name: 'Hy-Vee Pharmacy',
			street_address: ['8900 University Avenue'],
			city: 'Des Moines',
			state: 'IA',
			zip: '50314'
		},
		emergency_contact_name: {
			name: 'Margaret Thompson (Wife)',
			phone: '(515) 555-0236'
		}
	},
	{
		beneficiary_key: 1003,
		first_name: 'Joyce',
		last_name: 'Washington',
		birth_date: '1941-02-28',
		gender: 'Female',
		mailing_address: {
			street_address: ['567 Magnolia Street'],
			city: 'Memphis',
			state: 'TN',
			zip: '38103'
		},
		phone_numbers: [
			{
				phone_number: '(901) 555-0456',
				phone_type: 'home'
			}
		],
		medicare_id: 'MED003741022C',
		plan_type: 'Medicare Supplement',
		effective_date: '2006-03-01',
		primary_care_physician: {
			name: 'Dr. Robert Jackson',
			phone: '(901) 555-0457'
		},
		chronic_conditions: [
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
				name: 'Metoprolol',
				dosage: '50mg',
				frequency: 'Twice daily',
				duration: 'Long-term',
				notes: 'Beta-blocker for heart rate control'
			},
			{
				name: 'Warfarin',
				dosage: '5mg',
				frequency: 'Once daily',
				duration: 'Long-term',
				notes: 'Blood thinner, requires regular INR monitoring'
			},
			{
				name: 'Furosemide',
				dosage: '40mg',
				frequency: 'Once daily',
				duration: 'Long-term',
				notes: 'Diuretic, monitor potassium levels'
			},
			{
				name: 'Lisinopril',
				dosage: '5mg',
				frequency: 'Once daily',
				duration: 'Long-term',
				notes: 'ACE inhibitor for heart protection'
			}
		],
		preferred_pharmacy: {
			name: 'Walgreens #4521',
			street_address: ['589 Union Avenue'],
			city: 'Memphis',
			state: 'TN',
			zip: '38103'
		},
		emergency_contact_name: {
			name: 'Denise Washington (Daughter)',
			phone: '(901) 555-0458'
		}
	},
	{
		beneficiary_key: 1004,
		first_name: 'Robert',
		last_name: 'Kim',
		birth_date: '1956-09-15',
		gender: 'Male',
		mailing_address: {
			street_address: ['42 Cherry Hill Lane'],
			city: 'Portland',
			state: 'OR',
			zip: '97201'
		},
		phone_numbers: [
			{
				phone_number: '(503) 555-0678',
				phone_type: 'home'
			},
			{
				phone_number: '(503) 555-0679',
				phone_type: 'mobile'
			}
		],
		medicare_id: 'MED004456091D',
		plan_type: 'Medicare Advantage',
		effective_date: '2021-09-01',
		primary_care_physician: {
			name: 'Dr. Lisa Chen',
			phone: '(503) 555-0680'
		},
		chronic_conditions: [
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
				name: 'Donepezil',
				dosage: '5mg',
				frequency: 'Once daily',
				duration: 'Long-term',
				notes: 'For cognitive function, started 6 months ago'
			},
			{
				name: 'Tamsulosin',
				dosage: '0.4mg',
				frequency: 'Once daily at bedtime',
				duration: 'Long-term',
				notes: 'Alpha-blocker for prostate symptoms'
			},
			{
				name: 'Multivitamin',
				dosage: '1 tablet',
				frequency: 'Once daily',
				duration: 'Long-term',
				notes: 'General health maintenance'
			}
		],
		preferred_pharmacy: {
			name: 'Fred Meyer Pharmacy',
			street_address: ['100 NW 20th Place'],
			city: 'Portland',
			state: 'OR',
			zip: '97209'
		},
		emergency_contact_name: {
			name: 'Grace Kim (Wife)',
			phone: '(503) 555-0681'
		}
	},
	{
		beneficiary_key: 1005,
		first_name: 'Betty',
		last_name: "O'Brien",
		birth_date: '1945-05-22',
		gender: 'Female',
		mailing_address: {
			street_address: ['1832 Ocean View Drive'],
			city: 'Miami',
			state: 'FL',
			zip: '33139'
		},
		phone_numbers: [
			{
				phone_number: '(305) 555-0789',
				phone_type: 'home'
			}
		],
		medicare_id: 'MED005445052E',
		plan_type: 'Original Medicare',
		effective_date: '2010-05-01',
		primary_care_physician: {
			name: 'Dr. Carlos Mendez',
			phone: '(305) 555-0790'
		},
		chronic_conditions: [
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
				name: 'Alendronate',
				dosage: '70mg',
				frequency: 'Once weekly',
				duration: 'Long-term',
				notes: 'Take on empty stomach, remain upright 30 minutes'
			},
			{
				name: 'Calcium Carbonate with Vitamin D',
				dosage: '600mg/400IU',
				frequency: 'Twice daily',
				duration: 'Long-term',
				notes: 'Take with meals for better absorption'
			},
			{
				name: 'AREDS2 Formula',
				dosage: '2 capsules',
				frequency: 'Once daily',
				duration: 'Long-term',
				notes: 'Eye vitamin for macular degeneration'
			},
			{
				name: 'Omeprazole',
				dosage: '20mg',
				frequency: 'Once daily before breakfast',
				duration: 'Long-term',
				notes: 'Proton pump inhibitor for acid reflux'
			}
		],
		preferred_pharmacy: {
			name: 'Publix Pharmacy #1247',
			street_address: ['1801 Alton Road'],
			city: 'Miami Beach',
			state: 'FL',
			zip: '33139'
		},
		emergency_contact_name: {
			name: "Patricia O'Brien (Daughter)",
			phone: '(305) 555-0791'
		}
	},
	{
		beneficiary_key: 1006,
		first_name: 'James',
		last_name: 'Patel',
		birth_date: '1952-12-08',
		gender: 'Male',
		mailing_address: {
			street_address: ['3456 Elm Street', 'Unit 12'],
			city: 'Houston',
			state: 'TX',
			zip: '77002'
		},
		phone_numbers: [
			{
				phone_number: '(713) 555-0912',
				phone_type: 'home'
			},
			{
				phone_number: '(713) 555-0913',
				phone_type: 'mobile'
			}
		],
		medicare_id: 'MED006652120F',
		plan_type: 'Medicare Advantage',
		effective_date: '2017-12-01',
		primary_care_physician: {
			name: 'Dr. Ahmed Hassan',
			phone: '(713) 555-0914'
		},
		chronic_conditions: [
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
				name: 'Insulin Glargine',
				dosage: '20 units',
				frequency: 'Once daily at bedtime',
				duration: 'Long-term',
				notes: 'Long-acting insulin, rotate injection sites'
			},
			{
				name: 'Metformin',
				dosage: '1000mg',
				frequency: 'Twice daily',
				duration: 'Long-term',
				notes: 'Take with meals to reduce GI upset'
			},
			{
				name: 'Gabapentin',
				dosage: '300mg',
				frequency: 'Three times daily',
				duration: 'Long-term',
				notes: 'For diabetic nerve pain'
			},
			{
				name: 'Sertraline',
				dosage: '50mg',
				frequency: 'Once daily in morning',
				duration: 'Long-term',
				notes: 'SSRI for depression, avoid alcohol'
			}
		],
		preferred_pharmacy: {
			name: 'CVS Pharmacy #8934',
			street_address: ['3400 Main Street'],
			city: 'Houston',
			state: 'TX',
			zip: '77002'
		},
		emergency_contact_name: {
			name: 'Priya Patel (Wife)',
			phone: '(713) 555-0915'
		}
	}
];
