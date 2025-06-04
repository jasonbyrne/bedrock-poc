// moved from lib/services/medicalComprehendService.ts

import { ComprehendMedicalClient, DetectEntitiesCommand } from '@aws-sdk/client-comprehendmedical';
import type { DetectEntitiesCommandInput, Entity } from '@aws-sdk/client-comprehendmedical';
import {
	AWS_MEDICAL_COMPREHEND_REGION,
	AWS_MEDICAL_COMPREHEND_ACCESS_KEY_ID,
	AWS_MEDICAL_COMPREHEND_SECRET_ACCESS_KEY
} from '$env/static/private';

// Simple logger fallback
const consoleLogger = {
	info: (message: string, data?: unknown) => console.log(`[INFO] ${message}`, data || ''),
	error: (message: string, error?: unknown) => console.error(`[ERROR] ${message}`, error || ''),
	warn: (message: string, data?: unknown) => console.warn(`[WARN] ${message}`, data || '')
};

/**
 * Represents a medical entity extracted from AWS Comprehend Medical, optionally with RxNorm concepts.
 */
export interface RxNormConcept {
	code: string;
	description: string;
	score: number;
}

/**
 * Local extension for AWS ComprehendMedical Attribute objects that may include Concepts (not in upstream types).
 */
export type RxNormAttribute = {
	Concepts?: Array<{
		Code: string;
		Description: string;
		Score: number;
	}>;
	[key: string]: unknown;
};

export interface MedicalEntity {
	text: string;
	category: string;
	type: string;
	score: number;
	beginOffset: number;
	endOffset: number;
	/** RxNorm concepts, if present for this entity (medications) */
	rxNormConcepts?: RxNormConcept[];
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

export interface PHIResponse {
	phi: MedicalEntity[];
	error?: Error;
	metadata?: {
		characterCount: number;
		phiCount: number;
		categories: string[];
		latency?: number;
	};
}

export class MedicalComprehendService {
	private client: ComprehendMedicalClient;

	constructor() {
		this.client = new ComprehendMedicalClient({
			region: AWS_MEDICAL_COMPREHEND_REGION,
			credentials: {
				accessKeyId: AWS_MEDICAL_COMPREHEND_ACCESS_KEY_ID,
				secretAccessKey: AWS_MEDICAL_COMPREHEND_SECRET_ACCESS_KEY
			},
			maxAttempts: 3
		});
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
			const params: DetectEntitiesCommandInput = { Text: text };
			const command = new DetectEntitiesCommand(params);
			const response = await this.client.send(command);
			const entities = this.mapEntities(response.Entities || []);
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
			consoleLogger.error('Error extracting medical entities', error);
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

	async extractProtectedHealthInformation(text: string): Promise<PHIResponse> {
		const startTime = Date.now();
		if (!text.trim()) {
			return {
				phi: [],
				metadata: { characterCount: 0, phiCount: 0, categories: [], latency: 0 }
			};
		}
		try {
			const params: DetectEntitiesCommandInput = { Text: text };
			const command = new DetectEntitiesCommand(params);
			const response = await this.client.send(command);
			const phi = this.mapEntities(response.Entities || []).filter(
				(entity) => entity.category === 'PROTECTED_HEALTH_INFORMATION'
			);
			const categories = Array.from(new Set(phi.map((e) => e.category)));
			const latency = Date.now() - startTime;
			return {
				phi,
				metadata: {
					characterCount: text.length,
					phiCount: phi.length,
					categories,
					latency
				}
			};
		} catch (error) {
			consoleLogger.error('Error extracting PHI', error);
			return {
				phi: [],
				error: error instanceof Error ? error : new Error('Unknown error'),
				metadata: {
					characterCount: text.length,
					phiCount: 0,
					categories: [],
					latency: Date.now() - startTime
				}
			};
		}
	}

	/**
	 * Maps AWS ComprehendMedical entities to our internal MedicalEntity format, extracting RxNorm concepts if present.
	 */
	private mapEntities(entities: Entity[]): MedicalEntity[] {
		return entities.map((entity) => ({
			text: entity.Text || '',
			category: entity.Category || 'UNKNOWN',
			type: entity.Type || 'UNKNOWN',
			score: entity.Score || 0,
			beginOffset: entity.BeginOffset || 0,
			endOffset: entity.EndOffset || 0,
			rxNormConcepts: this.extractRxNormConcepts(entity)
		}));
	}

	/**
	 * Extracts RxNorm concepts from a ComprehendMedical entity's Attributes field, if present.
	 */
	private extractRxNormConcepts(entity: Entity): RxNormConcept[] | undefined {
		if (!entity.Attributes || !Array.isArray(entity.Attributes)) return undefined;
		const concepts: RxNormConcept[] = [];
		for (const attr of entity.Attributes as RxNormAttribute[]) {
			if (Array.isArray(attr.Concepts)) {
				for (const concept of attr.Concepts) {
					if (concept.Code && concept.Description && concept.Score !== undefined) {
						concepts.push({
							code: concept.Code,
							description: concept.Description,
							score: concept.Score
						});
					}
				}
			}
		}
		return concepts.length > 0 ? concepts : undefined;
	}
}

export const medicalComprehendService = new MedicalComprehendService();
