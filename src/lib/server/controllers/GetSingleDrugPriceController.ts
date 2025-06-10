import type { MessageReply } from '$lib/types/message-reply';
import Controller from '$lib/server/core/controller';
import {
	medicalComprehendService,
	type DrugEntityExtractionResult
} from '$lib/server/services/medicalComprehendService';
import type { Medication } from '$lib/types/persona';
import { bedrockService } from '$lib/server/services/bedrockService';
import { toString } from '$lib/server/utils/string';

export class GetSingleDrugPriceController extends Controller {
	protected minConfidence = 0.8;

	public async clarification(): Promise<MessageReply> {
		return {
			message: 'I think you are asking about a drug price. Is that right?'
		};
	}

	private noDrugName(): MessageReply {
		return {
			message:
				"Which drug are you asking about? Please provide the name of the medication you'd like pricing information for."
		};
	}

	private findDrugInBeneficiaryMedications(drugName: string): Medication | null {
		const medications = this.user.medications;

		// Return null if no medications on file
		if (!medications.length) {
			return null;
		}

		// Normalize to lowercase and remove any non-alphanumeric characters
		const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');
		const normalizedDrugName = normalize(drugName);
		const foundMedication = medications.find(
			(medication) => normalize(medication.name) === normalizedDrugName
		);
		console.log('[DEBUG] Found medication:', foundMedication);
		return foundMedication ?? null;
	}

	/**
	 * Backfill medication info with beneficiary medication info or provided slots.
	 * @param drugInfo - The drug info to backfill.
	 * @returns The backfilled drug info.
	 */
	private backfillMedicationInfo(drugInfo: DrugEntityExtractionResult): DrugEntityExtractionResult {
		const drugName = drugInfo.normalizedDrugName || drugInfo.drugName || '';
		const beneficiaryMedication = this.findDrugInBeneficiaryMedications(drugName);
		if (!beneficiaryMedication) return drugInfo;
		return {
			...drugInfo,
			dosage: toString(drugInfo.dosage || beneficiaryMedication.dosage || this.slots.dosage, ''),
			drugForm: toString(
				drugInfo.drugForm || beneficiaryMedication.form || this.slots.drug_form,
				''
			),
			route: toString(drugInfo.route || beneficiaryMedication.route || this.slots.route, ''),
			frequency: toString(
				drugInfo.frequency || beneficiaryMedication.frequency || this.slots.frequency,
				''
			),
			duration: toString(
				drugInfo.duration || beneficiaryMedication.duration || this.slots.duration,
				''
			),
			rate: toString(drugInfo.rate || beneficiaryMedication.rate || this.slots.rate, ''),
			strength: toString(
				drugInfo.strength || beneficiaryMedication.strength || this.slots.strength,
				''
			)
		};
	}

	private async generateNeedMoreInfoResponse(): Promise<MessageReply> {
		const missingSlots = this.slotsWeAreMissing();
		const haveSlots = this.slotsWeHave();
		console.log('[DEBUG] Missing slots:', missingSlots);
		console.log('[DEBUG] Have slots:', haveSlots);
		console.log('[DEBUG] Required slots:', this.session.current_intent?.requiredSlots);
		const clarification = await bedrockService.generateNeedMoreInfoResponse(
			this.session,
			'drug price',
			haveSlots,
			missingSlots
		);
		return {
			message: clarification.content
		};
	}

	async handle(): Promise<MessageReply> {
		// Drug name is required to proceed
		const drugName = this.slots.drug_name as string | undefined;
		if (!drugName) return this.noDrugName();

		// Look up the drug information in AWS Comprehend Medical
		console.log('[DEBUG] Processing drug name with Medical Comprehend:', drugName);
		const medicalComprehendDrugInfo = await medicalComprehendService.extractDrugInformation(
			`
				Slots: ${JSON.stringify(this.slots)}
				User message: ${this.user_message}
			`
		);
		const drugInfo = this.backfillMedicationInfo(medicalComprehendDrugInfo);
		if (drugInfo.error) {
			console.warn('[WARN] Medical Comprehend processing note:', drugInfo.error.message);
			console.log('[INFO] Continuing with available drug information');
		}
		console.log('[DEBUG] Medical Comprehend extraction results:', {
			originalInput: this.user_message,
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
			...this.slots,
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
			intent: this.intent,
			slots: updatedSlots,
			confidence: this.confidence
		});
		// Do we have all of the required info
		if (this.isMissingRequiredSlots()) {
			return await this.generateNeedMoreInfoResponse();
		}
		// Generate comprehensive response with RxNorm data
		return this.generateComprehensiveResponse(drugInfo);
	}

	private generateComprehensiveResponse(drugInfo: DrugEntityExtractionResult): MessageReply {
		const {
			drugName,
			normalizedDrugName,
			rxNormCode,
			drugType,
			dosage,
			drugForm,
			route,
			frequency,
			duration,
			strength,
			alternativeDrugs,
			metadata
		} = drugInfo;

		// Start with main drug information
		const displayName = normalizedDrugName || drugName || 'Unknown Drug';
		let response = `🔍 **Drug Information for ${displayName}**\n\n`;

		// Add RxNorm normalization info if available
		if (metadata.hasRxNormData) {
			response += `📋 **RxNorm Details:**\n`;
			if (rxNormCode) response += `- RxNorm Code: ${rxNormCode}\n`;
			if (drugType) response += `- Type: ${drugType.replace('_', ' ')}\n`;
			response += `- Confidence: ${Math.round(metadata.confidence * 100)}%\n\n`;
		}

		// Add extracted drug characteristics
		const characteristics: string[] = [];
		if (dosage) characteristics.push(`Dosage: ${dosage}`);
		if (strength && strength !== dosage) characteristics.push(`Strength: ${strength}`);
		if (drugForm) characteristics.push(`Form: ${drugForm}`);
		if (route) characteristics.push(`Route: ${route}`);
		if (frequency) characteristics.push(`Frequency: ${frequency}`);
		if (duration) characteristics.push(`Duration: ${duration}`);

		if (characteristics.length > 0) {
			response += `💊 **Drug Characteristics:**\n`;
			characteristics.forEach((char) => (response += `- ${char}\n`));
			response += '\n';
		}

		// Add placeholder pricing information
		response += `💰 **Pricing Information (Placeholder)**\n`;

		// Generate realistic pricing based on drug type
		const isGeneric = drugType === 'GENERIC_NAME';
		const genericPrice = Math.round(Math.random() * 50 + 10); // $10-60
		const brandPrice = Math.round(genericPrice * (2.5 + Math.random() * 2)); // 2.5-4.5x generic

		if (isGeneric) {
			response += `- Generic ${displayName}: $${genericPrice}.00/month\n`;
		} else {
			response += `- Brand ${displayName}: $${brandPrice}.00/month\n`;
			response += `- Generic equivalent: $${genericPrice}.00/month\n`;
		}

		response += '\n';

		// Add alternative/related drugs if available
		if (metadata.hasAlternatives && alternativeDrugs.length > 0) {
			response += `🔄 **Alternative Options:**\n`;

			// Show top 3 alternatives
			const topAlternatives = alternativeDrugs.slice(0, 3);
			topAlternatives.forEach((alt: { name: string; rxNormCode: string; confidence: number }) => {
				const altPrice = Math.round(Math.random() * 40 + 15); // $15-55
				const confidence = Math.round(alt.confidence * 100);
				response += `- ${alt.name} (RxNorm: ${alt.rxNormCode}): ~$${altPrice}.00/month (${confidence}% match)\n`;
			});

			if (alternativeDrugs.length > 3) {
				response += `- ...and ${alternativeDrugs.length - 3} more alternatives\n`;
			}
			response += '\n';
		}

		// Add Medicare-specific information
		response += `🏥 **Medicare Coverage Notes:**\n`;
		response += `- Most Medicare Part D plans cover this medication\n`;
		response += `- Your actual cost depends on your specific plan and tier placement\n`;
		response += `- Consider discussing generic alternatives with your doctor\n\n`;

		// Add processing metadata
		if (metadata.latency) {
			response += `⚙️ *Processed in ${metadata.latency}ms with ${metadata.entityCount} entities extracted*\n`;
		}

		// Add normalization note if applicable
		if (normalizedDrugName && normalizedDrugName !== drugName) {
			response += `\n*Note: I normalized "${drugName}" to "${normalizedDrugName}" using RxNorm for accurate pricing.*`;
		}

		return { message: response };
	}
}
