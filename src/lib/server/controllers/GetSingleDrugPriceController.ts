import type { MessageReply } from '$lib/types/message-reply';
import Controller from '$lib/server/core/controller';
import {
	medicalComprehendService,
	type DrugEntityExtractionResult
} from '$lib/server/services/medicalComprehendService';
import type { Medication } from '$lib/types/persona';
import { bedrockService } from '$lib/server/services/bedrockService';
import { backfillObject } from '$lib/utils/objectMerge';

export class GetSingleDrugPriceController extends Controller {
	protected minConfidence = 0.8;

	/**
	 * Response when we are not confident in the intent.
	 */
	public async clarification(): Promise<MessageReply> {
		return this.reply('I think you are asking about a drug price. Is that right?');
	}

	/**
	 * Response when they didn't tell us the name of the drug.
	 */
	private noDrugName(): MessageReply {
		return this.reply(
			"Which drug are you asking about? Please provide the name of the medication you'd like pricing information for."
		);
	}

	/**
	 * Find the drug in the user's beneficiary medications.
	 * @param drugName - The name of the drug to find.
	 * @returns The medication if found, otherwise null.
	 */
	private findDrugInBeneficiaryMedications(drugName: string): Medication | null {
		const medications = this.user.medications ?? [];

		// Return null if no medications on file
		if (!medications.length) return null;

		// Normalize to lowercase and remove any non-alphanumeric characters
		const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');
		const normalizedDrugName = normalize(drugName);
		const foundMedication = medications.find(
			(medication) => normalize(medication.drugName) === normalizedDrugName
		);
		console.log('[DEBUG] Found medication:', foundMedication);
		return foundMedication ?? null;
	}

	/**
	 * Backfill medication info with beneficiary medication info or provided slots.
	 * Uses a utility pattern where the base object (drugInfo) wins, and missing values
	 * are filled from overlays in priority order.
	 * @param drugInfo - The drug info to backfill.
	 * @returns The backfilled drug info.
	 */
	private backfillMedicationInfo(drugInfo: DrugEntityExtractionResult): DrugEntityExtractionResult {
		const drugName = drugInfo.normalizedDrugName || drugInfo.drugName || '';
		const beneficiaryMedication = this.findDrugInBeneficiaryMedications(drugName);
		const defaultValues = {
			duration: 'monthly'
		};
		return backfillObject(
			drugInfo,
			beneficiaryMedication ?? {},
			this.session.collectedSlots,
			defaultValues
		);
	}

	private async generateNeedMoreInfoResponse(): Promise<MessageReply> {
		return this.reply(
			await bedrockService.generateMissingInformationMessage(this.session, {
				topic: 'drug price',
				providedSlots: this.slotsWeHave(),
				missingSlots: this.slotsWeAreMissing()
			})
		);
	}

	private async queryMedicalComprehend() {
		const slotsToUse = [
			'drug_name',
			'dosage',
			'frequency',
			'duration',
			'rate',
			'strength',
			'route',
			'drug_form'
		];
		const slots = slotsToUse
			.filter((slot) => this.session.collectedSlots[slot])
			.map((slot) => `${slot}: ${this.session.collectedSlots[slot]}`)
			.join('\n');
		return await medicalComprehendService.extractDrugInformation(`
			Data: ${slots}
			User Asked:  ${this.session.lastUserMessage || ''}
		`);
	}

	async handle(): Promise<MessageReply> {
		// Drug name is required to proceed
		const drugName = this.session.collectedSlots.drug_name as string | undefined;
		if (!drugName) return this.noDrugName();

		// Look up the drug information in AWS Comprehend Medical
		console.log('[DEBUG] Processing drug name with Medical Comprehend:', drugName);
		const medicalComprehendDrugInfo = await this.queryMedicalComprehend();
		const drugInfo = this.backfillMedicationInfo(medicalComprehendDrugInfo);
		if (drugInfo.error) {
			console.warn('[WARN] Medical Comprehend processing note:', drugInfo.error.message);
			console.log('[INFO] Continuing with available drug information');
		}
		console.log('[DEBUG] Medical Comprehend extraction results:', {
			originalInput: this.session.lastUserMessage || '',
			extractedDrugName: drugInfo.drugName,
			normalizedDrugName: drugInfo.normalizedDrugName,
			rxNormCode: drugInfo.rxNormCode,
			drugType: drugInfo.drugType,
			dosage: drugInfo.dosage,
			drugForm: drugInfo.drugForm,
			route: drugInfo.route,
			frequency: drugInfo.frequency,
			duration: drugInfo.duration,
			rate: drugInfo.rate,
			strength: drugInfo.strength,
			alternativeDrugs: drugInfo.alternativeDrugs,
			confidence: drugInfo.metadata.confidence,
			entityCount: drugInfo.metadata.entityCount,
			latency: drugInfo.metadata.latency,
			hasRxNormData: drugInfo.metadata.hasRxNormData,
			hasAlternatives: drugInfo.metadata.hasAlternatives,
			hadError: !!drugInfo.error
		});
		// Update session slots with comprehensive normalized information
		const updatedSlots = {
			...this.session.collectedSlots,
			drug_name: drugInfo.drugName || drugName,
			...(drugInfo.dosage && { dosage: drugInfo.dosage }),
			...(drugInfo.drugForm && { drug_form: drugInfo.drugForm }),
			...(drugInfo.route && { route: drugInfo.route }),
			...(drugInfo.frequency && { frequency: drugInfo.frequency }),
			...(drugInfo.duration && { duration: drugInfo.duration }),
			...(drugInfo.strength && { strength: drugInfo.strength }),
			...(drugInfo.rate && { rate: drugInfo.rate }),
			normalized_drug_name: drugInfo.normalizedDrugName,
			rxnorm_code: drugInfo.rxNormCode,
			drug_type: drugInfo.drugType,
			medical_comprehend_confidence: drugInfo.metadata.confidence,
			medical_comprehend_latency: drugInfo.metadata.latency,
			has_rxnorm_data: drugInfo.metadata.hasRxNormData,
			alternative_drugs: drugInfo.alternativeDrugs
		};
		console.log('[DEBUG] Updated slots:', updatedSlots);
		// Update the session context with enriched slot data
		this.session.updateContext({
			slots: updatedSlots,
			confidence: this.session.currentConfidence
		});
		// Do we have all of the required info
		if (this.isMissingRequiredSlots()) {
			return await this.generateNeedMoreInfoResponse();
		}
		// Generate comprehensive response with RxNorm data
		return this.generateComprehensiveResponse(drugInfo);
	}

	private async generateComprehensiveResponse(
		drugInfo: DrugEntityExtractionResult
	): Promise<MessageReply> {
		const answer = {
			'Drug Name': drugInfo.drugName,
			'Normalized Drug Name': drugInfo.normalizedDrugName,
			'Per Dose Cost': 2.5,
			'Length of Supply': drugInfo.duration,
			'Taken Via/Route': drugInfo.route,
			'Frequency Taken': drugInfo.frequency,
			'Drug Form': drugInfo.drugForm
		};

		const response = await bedrockService.generateAnswerMessage(this.session, {
			topic: 'drug price',
			answer,
			additionalPrompts: [
				`Include the cost per dose, length of supply, and the total cost for the duration of the supply.`
			]
		});

		return this.reply(response);
	}
}
