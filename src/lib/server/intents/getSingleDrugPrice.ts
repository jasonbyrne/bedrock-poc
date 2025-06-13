import type { Intent } from '$lib/types/intent.types';

export const getSingleDrugPriceIntent: Intent = {
	name: 'GetSingleDrugPrice',
	userSuggestion: 'Get price of a drug',
	promptInstructions: 'User is asking for the cost of a single drug/medication',
	text: 'get drug prices',
	slots: ['drug_name', 'drug_form', 'dosage', 'frequency', 'duration', 'rate', 'strength', 'route'],
	criticalSlots: ['drug_name'],
	requiredSlots: ['drug_name', 'dosage', 'frequency'],
	examples: [
		'What is the [duration] cost for [dosage]mg of [drug_name]?',
		'How much does [dosage] of [drug_name] cost for [duration]?',
		'Is [drug_name] covered under my plan?',
		'What is my copay for [drug_name]?',
		'How much will I pay for [drug_name] at [pharmacy]?'
	]
};
