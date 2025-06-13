import type { Intent } from '$lib/types/intent.types';

export const getMultiDrugPriceIntent: Intent = {
	name: 'GetMultiDrugPrice',
	promptInstructions: 'User is asking for the cost of multiple drugs/medications',
	text: 'get drug prices of multiple drugs',
	slots: ['drug_names'],
	criticalSlots: ['drug_names'],
	examples: ['What is the cost of [drug_name], [drug_name], and [drug_name]?']
};
