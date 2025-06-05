import type { MessageReply } from '$lib/types/message-reply';
import Controller from '$lib/server/core/controller';
import {
	medicalComprehendService,
	type DrugEntityExtractionResult
} from '$lib/server/services/medicalComprehendService';

export class GetDrugPriceController extends Controller {
	protected minConfidence = 0.8;

	public async clarification(): Promise<MessageReply> {
		return {
			message:
				'I think you are asking about a drug price, but I am not sure enough to answer that. Is that right?'
		};
	}

	async handle(): Promise<MessageReply> {
		try {
			const drugName = this.slots.drug_name as string | undefined;

			// If we have a drug name in slots, use Medical Comprehend to normalize and extract additional info
			if (drugName) {
				console.log('[DEBUG] Processing drug name with Medical Comprehend:', drugName);

				const drugInfo = await medicalComprehendService.extractDrugInformation(this.user_message);

				// Log the extraction results for debugging
				console.log('[DEBUG] Medical Comprehend extraction results:', {
					originalInput: drugName,
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
					normalized_drug_name: drugInfo.normalizedDrugName,
					rxnorm_code: drugInfo.rxNormCode,
					drug_type: drugInfo.drugType,
					medical_comprehend_confidence: drugInfo.metadata.confidence,
					medical_comprehend_latency: drugInfo.metadata.latency,
					has_rxnorm_data: drugInfo.metadata.hasRxNormData,
					alternative_drugs: drugInfo.alternativeDrugs
				};

				// Update the session context with enriched slot data
				this.session.updateContext({
					intent: this.intent,
					slots: updatedSlots,
					confidence: this.confidence
				});

				// Handle processing errors gracefully
				if (drugInfo.error) {
					console.warn('[WARN] Medical Comprehend processing note:', drugInfo.error.message);
					console.log('[INFO] Continuing with available drug information');
				}

				// Generate comprehensive response with RxNorm data
				return this.generateComprehensiveResponse(drugInfo);
			}

			// Still require a drug name to proceed
			if (!drugName) {
				return {
					message:
						"Which drug are you asking about? Please provide the name of the medication you'd like pricing information for."
				};
			}

			// Fallback for when no RxNorm processing occurred
			return {
				message: `Let me look up the cost information for ${drugName}.\n\n📊 **Pricing Information (Placeholder)**\n- Generic: $25.00/month\n- Brand: $180.00/month\n\n*Note: Actual pricing may vary by plan and pharmacy.*`
			};
		} catch (error) {
			console.error('[ERROR] Error in GetDrugPriceController:', error);

			return {
				message:
					'I apologize, but I encountered an error while looking up drug pricing information. Please try again or contact support if the problem persists.'
			};
		}
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
