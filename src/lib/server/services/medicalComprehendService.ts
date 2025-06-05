/**
 * Medical Comprehend Service for extracting and normalizing medical entities
 * Specialized for drug information extraction in Medicare context using RxNorm
 */

import { ComprehendMedicalClient, InferRxNormCommand } from '@aws-sdk/client-comprehendmedical';
import type { InferRxNormCommandInput, RxNormEntity } from '@aws-sdk/client-comprehendmedical';
import {
	AWS_MEDICAL_COMPREHEND_REGION,
	AWS_MEDICAL_COMPREHEND_ACCESS_KEY_ID,
	AWS_MEDICAL_COMPREHEND_SECRET_ACCESS_KEY,
	AWS_BEDROCK_REGION,
	AWS_BEDROCK_ACCESS_KEY_ID,
	AWS_BEDROCK_SECRET_ACCESS_KEY
} from '$env/static/private';

// Use dedicated Medical Comprehend credentials first, fall back to Bedrock credentials
const AWS_REGION = AWS_MEDICAL_COMPREHEND_REGION || AWS_BEDROCK_REGION || 'us-east-1';
const AWS_ACCESS_KEY_ID = AWS_MEDICAL_COMPREHEND_ACCESS_KEY_ID || AWS_BEDROCK_ACCESS_KEY_ID || '';
const AWS_SECRET_ACCESS_KEY =
	AWS_MEDICAL_COMPREHEND_SECRET_ACCESS_KEY || AWS_BEDROCK_SECRET_ACCESS_KEY || '';

// Debug logging for credential configuration
const hasBedrockCreds = !!(AWS_BEDROCK_ACCESS_KEY_ID && AWS_BEDROCK_SECRET_ACCESS_KEY);
const hasMedicalCreds = !!(
	AWS_MEDICAL_COMPREHEND_ACCESS_KEY_ID && AWS_MEDICAL_COMPREHEND_SECRET_ACCESS_KEY
);
const credentialSource = hasMedicalCreds
	? 'Medical Comprehend'
	: hasBedrockCreds
		? 'Bedrock (fallback)'
		: 'None';

console.log(`[DEBUG] Medical Comprehend credential source: ${credentialSource}`);
console.log(`[DEBUG] Region: ${AWS_REGION}`);

// Simple logger fallback
const consoleLogger = {
	info: (message: string, data?: unknown) => console.log(`[INFO] ${message}`, data || ''),
	error: (message: string, error?: unknown) => console.error(`[ERROR] ${message}`, error || ''),
	warn: (message: string, data?: unknown) => console.warn(`[WARN] ${message}`, data || '')
};

/**
 * RxNorm concept for drug normalization
 */
export interface RxNormConcept {
	code: string;
	description: string;
	score: number;
}

/**
 * RxNorm Attribute from AWS Medical Comprehend response
 */
export type RxNormAttribute = {
	BeginOffset: number;
	EndOffset: number;
	Id: number;
	RelationshipScore: number;
	Score: number;
	Text: string;
	Traits: unknown[];
	Type: string; // DOSAGE, FORM, FREQUENCY, DURATION, etc.
};

export interface MedicalEntity {
	text: string;
	category: string;
	type: string;
	score: number;
	beginOffset: number;
	endOffset: number;
	/** RxNorm concepts for drug normalization */
	rxNormConcepts?: RxNormConcept[];
	/** Additional attributes like dosage, strength, etc. */
	attributes?: RxNormAttribute[];
}

export interface MedicalEntitiesResponse {
	entities: MedicalEntity[];
	error?: Error;
	metadata?: {
		characterCount: number;
		entityCount: number;
		categories: string[];
		latency?: number;
	};
}

/**
 * Comprehensive drug information extracted from Medical Comprehend with RxNorm normalization
 */
export interface DrugEntityExtractionResult {
	/** Primary drug name (highest confidence) */
	drugName?: string;
	/** RxNorm normalized drug name */
	normalizedDrugName?: string;
	/** RxNorm concept code for the drug */
	rxNormCode?: string;
	/** Whether this is a brand name or generic name */
	drugType?: 'BRAND_NAME' | 'GENERIC_NAME';
	/** Extracted dosage/strength information */
	dosage?: string;
	/** Drug form (tablet, capsule, liquid, etc.) */
	drugForm?: string;
	/** Route of administration (oral, injection, etc.) */
	route?: string;
	/** Frequency if mentioned */
	frequency?: string;
	/** Duration if mentioned */
	duration?: string;
	/** Rate if mentioned (for IV drugs, etc.) */
	rate?: string;
	/** Strength information (different from dosage) */
	strength?: string;
	/** Alternative/related drugs from RxNorm concepts */
	alternativeDrugs: Array<{
		name: string;
		rxNormCode: string;
		confidence: number;
		isPreferred?: boolean;
	}>;
	/** All medication entities found */
	medications: MedicalEntity[];
	/** All dosage/strength entities */
	dosages: MedicalEntity[];
	/** All drug form entities */
	drugForms: MedicalEntity[];
	/** All route entities */
	routes: MedicalEntity[];
	/** All frequency entities */
	frequencies: MedicalEntity[];
	/** All duration entities */
	durations: MedicalEntity[];
	/** All rate entities */
	rates: MedicalEntity[];
	/** All strength entities */
	strengths: MedicalEntity[];
	/** All RxNorm concepts for normalization */
	rxNormConcepts: RxNormConcept[];
	/** Processing metadata */
	metadata: {
		confidence: number;
		entityCount: number;
		latency: number;
		originalText: string;
		hasRxNormData: boolean;
		hasAlternatives: boolean;
	};
	/** Any errors encountered */
	error?: Error;
}

export class MedicalComprehendService {
	private client: ComprehendMedicalClient;

	constructor() {
		// Validate credentials
		if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
			throw new Error('AWS credentials not configured for Medical Comprehend service');
		}

		// Log credential configuration for debugging
		console.log(
			`[DEBUG] Medical Comprehend initialization - Credential source: ${credentialSource}`
		);
		console.log(`[DEBUG] Using region: ${AWS_REGION}`);
		console.log(`[DEBUG] Access Key ID: ${AWS_ACCESS_KEY_ID.substring(0, 8)}...`);

		this.client = new ComprehendMedicalClient({
			region: AWS_REGION,
			credentials: {
				accessKeyId: AWS_ACCESS_KEY_ID,
				secretAccessKey: AWS_SECRET_ACCESS_KEY
			},
			maxAttempts: 3
		});

		console.log('[DEBUG] Medical Comprehend client initialized successfully');
	}

	/**
	 * Extract and normalize drug information from text using RxNorm
	 * Specialized for Medicare drug price inquiries
	 */
	async extractDrugInformation(text: string): Promise<DrugEntityExtractionResult> {
		const startTime = Date.now();

		try {
			const entities = await this.extractMedicalEntities(text);

			console.log('[DEBUG] Medical Comprehend entities:', entities);

			if (entities.error) {
				throw entities.error;
			}

			// Filter entities by category and type for comprehensive drug information
			const medications = entities.entities.filter(
				(e) =>
					e.category === 'MEDICATION' ||
					e.type === 'GENERIC_NAME' ||
					e.type === 'BRAND_NAME' ||
					e.type === 'DX_NAME'
			);

			// Extract all attributes from entities
			const dosages: MedicalEntity[] = [];
			const drugForms: MedicalEntity[] = [];
			const routes: MedicalEntity[] = [];
			const frequencies: MedicalEntity[] = [];
			const durations: MedicalEntity[] = [];
			const rates: MedicalEntity[] = [];
			const strengths: MedicalEntity[] = [];

			entities.entities.forEach((entity) => {
				entity.attributes?.forEach((attr) => {
					const attributeEntity: MedicalEntity = {
						text: attr.Text,
						category: 'MEDICATION',
						type: attr.Type,
						score: attr.Score,
						beginOffset: attr.BeginOffset,
						endOffset: attr.EndOffset,
						attributes: [attr]
					};

					switch (attr.Type) {
						case 'DOSAGE':
							dosages.push(attributeEntity);
							break;
						case 'FORM':
							drugForms.push(attributeEntity);
							break;
						case 'ROUTE_OR_MODE':
							routes.push(attributeEntity);
							break;
						case 'FREQUENCY':
							frequencies.push(attributeEntity);
							break;
						case 'DURATION':
							durations.push(attributeEntity);
							break;
						case 'RATE':
							rates.push(attributeEntity);
							break;
						case 'STRENGTH':
							strengths.push(attributeEntity);
							break;
					}
				});
			});

			// Extract all RxNorm concepts from all entities
			const rxNormConcepts: RxNormConcept[] = [];
			entities.entities.forEach((entity) => {
				if (entity.rxNormConcepts) {
					rxNormConcepts.push(...entity.rxNormConcepts);
				}
			});

			// Determine primary drug name (highest confidence medication)
			const primaryMedication =
				medications.length > 0
					? medications.reduce((prev, current) => (current.score > prev.score ? current : prev))
					: undefined;

			// Get best RxNorm normalized name and code
			const bestRxNormConcept =
				rxNormConcepts.length > 0
					? rxNormConcepts.reduce((prev, current) => (current.score > prev.score ? current : prev))
					: undefined;

			// Extract alternative drugs from RxNorm concepts (excluding the primary match)
			const alternativeDrugs = rxNormConcepts
				.filter((concept) => concept.code !== bestRxNormConcept?.code)
				.map((concept) => ({
					name: concept.description,
					rxNormCode: concept.code,
					confidence: concept.score,
					isPreferred: concept.score > 0.5
				}))
				.sort((a, b) => b.confidence - a.confidence); // Sort by confidence

			const latency = Date.now() - startTime;

			return {
				drugName: primaryMedication?.text,
				normalizedDrugName: bestRxNormConcept?.description,
				rxNormCode: bestRxNormConcept?.code,
				drugType: primaryMedication?.type as 'BRAND_NAME' | 'GENERIC_NAME' | undefined,
				dosage: dosages[0]?.text,
				drugForm: drugForms[0]?.text,
				route: routes[0]?.text,
				frequency: frequencies[0]?.text,
				duration: durations[0]?.text,
				rate: rates[0]?.text,
				strength: strengths[0]?.text,
				alternativeDrugs,
				medications,
				dosages,
				drugForms,
				routes,
				frequencies,
				durations,
				rates,
				strengths,
				rxNormConcepts,
				metadata: {
					confidence: primaryMedication?.score || 0,
					entityCount: entities.entities.length,
					latency,
					originalText: text,
					hasRxNormData: rxNormConcepts.length > 0,
					hasAlternatives: alternativeDrugs.length > 0
				}
			};
		} catch (error) {
			consoleLogger.error('Error extracting drug information', error);

			return {
				alternativeDrugs: [],
				medications: [],
				dosages: [],
				drugForms: [],
				routes: [],
				frequencies: [],
				durations: [],
				rates: [],
				strengths: [],
				rxNormConcepts: [],
				metadata: {
					confidence: 0,
					entityCount: 0,
					latency: Date.now() - startTime,
					originalText: text,
					hasRxNormData: false,
					hasAlternatives: false
				},
				error: error instanceof Error ? error : new Error('Unknown error')
			};
		}
	}

	async extractMedicalEntities(text: string): Promise<MedicalEntitiesResponse> {
		const startTime = Date.now();

		if (!text.trim()) {
			return {
				entities: [],
				metadata: { characterCount: 0, entityCount: 0, categories: [], latency: 0 }
			};
		}

		try {
			const params: InferRxNormCommandInput = { Text: text };
			console.log('[DEBUG] Medical Comprehend RxNorm params:', params);
			const command = new InferRxNormCommand(params);
			const response = await this.client.send(command);

			console.log('[DEBUG] Medical Comprehend RxNorm response:', JSON.stringify(response, null, 3));

			const entities = this.mapRxNormEntities(response.Entities || []);
			const categories = Array.from(new Set(entities.map((e) => e.category)));
			const latency = Date.now() - startTime;

			return {
				entities,
				metadata: {
					characterCount: text.length,
					entityCount: entities.length,
					categories,
					latency
				}
			};
		} catch (error) {
			consoleLogger.error('Error extracting RxNorm entities', error);
			return {
				entities: [],
				error: error instanceof Error ? error : new Error('Unknown error'),
				metadata: {
					characterCount: text.length,
					entityCount: 0,
					categories: [],
					latency: Date.now() - startTime
				}
			};
		}
	}

	/**
	 * Maps AWS RxNorm entities to our internal format
	 */
	private mapRxNormEntities(entities: RxNormEntity[]): MedicalEntity[] {
		return entities.map((entity) => ({
			text: entity.Text || '',
			category: entity.Category || 'MEDICATION',
			type: entity.Type || 'UNKNOWN',
			score: entity.Score || 0,
			beginOffset: entity.BeginOffset || 0,
			endOffset: entity.EndOffset || 0,
			rxNormConcepts: this.extractRxNormConceptsFromEntity(entity),
			attributes:
				entity.Attributes?.map((attr) => ({
					BeginOffset: attr.BeginOffset || 0,
					EndOffset: attr.EndOffset || 0,
					Id: attr.Id || 0,
					RelationshipScore: attr.RelationshipScore || 0,
					Score: attr.Score || 0,
					Text: attr.Text || '',
					Traits: attr.Traits || [],
					Type: attr.Type || 'UNKNOWN'
				})) || []
		}));
	}

	/**
	 * Extracts RxNorm concepts from RxNorm entity
	 */
	private extractRxNormConceptsFromEntity(entity: RxNormEntity): RxNormConcept[] | undefined {
		if (!entity.RxNormConcepts || !Array.isArray(entity.RxNormConcepts)) return undefined;

		const concepts: RxNormConcept[] = [];

		for (const concept of entity.RxNormConcepts) {
			if (concept.Code && concept.Description && concept.Score !== undefined) {
				concepts.push({
					code: concept.Code,
					description: concept.Description,
					score: concept.Score
				});
			}
		}

		return concepts.length > 0 ? concepts : undefined;
	}
}

export const medicalComprehendService = new MedicalComprehendService();
