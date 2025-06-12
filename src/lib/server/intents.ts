import type { Intent } from '$lib/types/intentTypes';

export const INTENTS: Intent[] = [
	{
		name: 'GetSingleDrugPrice',
		userSuggestion: 'Get price of a drug',
		promptInstructions: 'User is asking for the cost of a single drug/medication',
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
		]
	},
	{
		name: 'GetMultiDrugPrice',
		promptInstructions: 'User is asking for the cost of multiple drugs/medications',
		text: 'get drug prices of multiple drugs',
		slots: ['drug_names'],
		criticalSlots: ['drug_names'],
		examples: ['What is the cost of [drug_name], [drug_name], and [drug_name]?']
	},
	{
		name: 'FindProvider',
		userSuggestion: 'Find a doctor, provider, or facility',
		promptInstructions: 'User is asking for a provider, doctor, or facility',
		text: 'find a provider',
		slots: ['provider_type', 'location', 'insurance_plan', 'preferred_provider'],
		criticalSlots: ['provider_type', 'location'],
		examples: [
			'Find a [provider_type] near [location]',
			'Are there any [provider_type] in my network?',
			'Who is my primary care physician?',
			'I need a [specialty] doctor in [location]',
			'Can you help me locate a hospital close to [location]?'
		]
	},
	{
		name: 'GetPlanInfo',
		userSuggestion: 'Learn about plan benefits, coverage details, or eligibility',
		promptInstructions: 'User is asking for information about their plan',
		text: 'get plan information',
		slots: ['plan_type', 'benefit_type', 'coverage_area', 'effective_date', 'network_status'],
		criticalSlots: ['plan_type', 'benefit_type'],
		examples: [
			'What does my [plan_type] cover?',
			'Explain my [benefit_type] benefits',
			'Is [service] covered under my plan?',
			'What is my deductible for [plan_type]?',
			'Does my plan require referrals for specialists?'
		]
	},
	{
		name: 'Welcome',
		promptInstructions:
			'User says hello or other greeting, asks for help, or asks who they are talking to',
		text: 'find out what I can do',
		slots: [],
		criticalSlots: [],
		examples: ['Hello', 'Hi there', 'Good morning', 'I need help', 'Can you assist me?']
	},
	{
		name: 'Unknown',
		isFallback: true,
		promptInstructions: 'Intent does not match any supported category or is unclear/unsupported',
		text: 'unclear',
		slots: [],
		criticalSlots: [],
		examples: [
			'I want to talk about something else',
			'Blah blah',
			'Random text',
			'???',
			'What is the weather today?'
		]
	}
];

export const getIntentByName = (name: string): Intent | null => {
	const intent = INTENTS.find((intent) => intent.name === name);
	return intent || null;
};

export const getSuggestions = (): string[] => {
	return INTENTS.filter((intent) => intent.userSuggestion).map(
		(intent) => intent.userSuggestion || intent.text
	);
};
