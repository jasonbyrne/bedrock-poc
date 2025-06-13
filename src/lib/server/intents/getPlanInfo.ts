import type { Intent } from '$lib/types/intent.types';

export const getPlanInfoIntent: Intent = {
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
};
