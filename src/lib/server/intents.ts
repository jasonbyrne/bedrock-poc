import type { Intent } from '$lib/types/intentTypes';

export const INTENTS: Intent[] = [
	{
		name: 'GetSingleDrugPrice',
		text: 'get drug prices',
		slots: [
			'drug_name',
			'drug_form',
			'dosage',
			'frequency',
			'duration',
			'rate',
			'strength',
			'route'
		],
		criticalSlots: ['drug_name'],
		requiredSlots: ['drug_name', 'dosage', 'frequency'],
		examples: [
			'What is the [duration] cost for [dosage]mg of [drug_name]?',
			'How much does [dosage] of [drug_name] cost for [duration]?',
			'Is [drug_name] covered under my plan?',
			'What is my copay for [drug_name]?',
			'How much will I pay for [drug_name] at [pharmacy]?'
		],
		description: 'User asks about the cost of a single drug/medication'
	},
	{
		name: 'GetMultiDrugPrice',
		text: 'get drug prices',
		slots: ['drug_names'],
		criticalSlots: ['drug_names'],
		examples: ['What is the cost of [drug_name], [drug_name], and [drug_name]?'],
		description: 'User asks about the cost of multiple drugs/medications'
	},
	{
		name: 'FindProvider',
		text: 'find a provider',
		slots: ['provider_type', 'location', 'insurance_plan', 'preferred_provider'],
		criticalSlots: ['provider_type', 'location'],
		examples: [
			'Find a [provider_type] near [location]',
			'Are there any [provider_type] in my network?',
			'Who is my primary care physician?',
			'I need a [specialty] doctor in [location]',
			'Can you help me locate a hospital close to [location]?'
		],
		description: 'User wants to find a doctor, provider, or facility'
	},
	{
		name: 'GetPlanInfo',
		text: 'get plan information',
		slots: ['plan_type', 'benefit_type', 'coverage_area', 'effective_date', 'network_status'],
		criticalSlots: ['plan_type', 'benefit_type'],
		examples: [
			'What does my [plan_type] cover?',
			'Explain my [benefit_type] benefits',
			'Is [service] covered under my plan?',
			'What is my deductible for [plan_type]?',
			'Does my plan require referrals for specialists?'
		],
		description: 'User asks about plan benefits, coverage details, or eligibility'
	},
	{
		name: 'Welcome',
		text: 'find out what I can do',
		slots: [],
		criticalSlots: [],
		examples: ['Hello', 'Hi there', 'Good morning', 'I need help', 'Can you assist me?'],
		description: 'User greets, says hello, or asks for help'
	},
	{
		name: 'Unknown',
		isFallback: true,
		text: 'unclear',
		slots: [],
		criticalSlots: [],
		examples: [
			'I want to talk about something else',
			'Blah blah',
			'Random text',
			'???',
			'What is the weather today?'
		],
		description: 'Intent does not match any supported category or is unclear/unsupported'
	}
];

export const getIntentByName = (name: string): Intent | null => {
	const intent = INTENTS.find((intent) => intent.name === name);
	return intent || null;
};
