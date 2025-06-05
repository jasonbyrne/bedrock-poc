# Medical Comprehend Integration Guide

This document explains how AWS Medical Comprehend is integrated into the Medicare Chatbot POC for drug entity extraction and normalization using RxNorm.

## Overview

The Medical Comprehend service extracts and normalizes drug information from user inputs using AWS Medical Comprehend with RxNorm integration, providing:

- **Drug Name Normalization**: Converts informal drug names to RxNorm standardized names
- **Entity Extraction**: Identifies dosage, drug form, route, frequency, and other medication details
- **RxNorm Integration**: Links to standardized medical codes for accurate pricing and identification
- **Confidence Scoring**: Provides reliability metrics for extracted information

## Service Architecture

### Core Components

1. **`MedicalComprehendService`** - Main service class using real AWS Medical Comprehend
2. **`DrugEntityExtractionResult`** - Comprehensive interface for drug information with RxNorm data
3. **RxNorm Integration** - Standardized drug codes and names for Medicare systems

### Key Features

- **Environment Variable Management**: Uses SvelteKit's `$env/static/private` for secure credential handling
- **Comprehensive Entity Extraction**: Extracts drug name, dosage, form, route, frequency from natural language
- **RxNorm Normalization**: Maps informal drug names to standardized RxNorm concepts
- **Performance Metrics**: Tracks processing time and confidence scores
- **Error Handling**: Graceful error handling with detailed logging

## Usage Example: GetDrugPriceController

### Input Processing Flow

```typescript
// 1. User input: "I need the price for atorvastatin 20mg tablets"
const userInput = this.slots.drug_name; // "atorvastatin 20mg tablets"

// 2. Medical Comprehend extraction with RxNorm
const drugInfo = await medicalComprehendService.extractDrugInformation(userInput);

// 3. Results processing
console.log(drugInfo);
// Output:
{
  drugName: "atorvastatin",
  normalizedDrugName: "Atorvastatin Calcium",
  rxNormCode: "83367",
  dosage: "20mg",
  drugForm: "tablets",
  route: "oral",
  frequency: undefined,
  metadata: {
    confidence: 0.95,
    entityCount: 3,
    latency: 245,
    originalText: "atorvastatin 20mg tablets",
    hasRxNormData: true
  },
  rxNormConcepts: [
    {
      code: "83367",
      description: "Atorvastatin Calcium",
      score: 0.95
    }
  ]
}
```

### Integration Pattern

```typescript
export class GetDrugPriceController extends Controller {
	async handle(): Promise<MessageReply> {
		let drugName = this.slots.drug_name as string | undefined;

		// Extract and normalize drug information using RxNorm
		if (drugName) {
			const drugInfo = await medicalComprehendService.extractDrugInformation(drugName);

			// Use RxNorm normalized name if confidence is high
			if (drugInfo.normalizedDrugName && drugInfo.metadata.confidence > 0.7) {
				drugName = drugInfo.normalizedDrugName;
			}

			// Extract comprehensive drug details
			const dosage = drugInfo.dosage || this.slots.dosage;
			const drugForm = drugInfo.drugForm || this.slots.drug_form;
			const route = drugInfo.route;
			const frequency = drugInfo.frequency;
			const rxNormCode = drugInfo.rxNormCode;

			// Update session with enriched RxNorm data
			this.session.updateContext({
				intent: this.intent,
				slots: {
					...this.slots,
					drug_name: drugName,
					normalized_drug_name: drugInfo.normalizedDrugName,
					rxnorm_code: drugInfo.rxNormCode,
					dosage,
					drug_form: drugForm,
					route,
					frequency,
					has_rxnorm_data: drugInfo.metadata.hasRxNormData
				}
			});
		}

		// Continue with pricing logic using normalized data...
	}
}
```

## API Reference

### `extractDrugInformation(text: string)`

Primary method for comprehensive drug entity extraction with RxNorm normalization.

**Parameters:**

- `text`: Raw user input containing drug information

**Returns:** `DrugEntityExtractionResult`

```typescript
interface DrugEntityExtractionResult {
	drugName?: string; // Primary extracted drug name
	normalizedDrugName?: string; // RxNorm standardized drug name
	rxNormCode?: string; // RxNorm concept code
	dosage?: string; // Extracted dosage/strength
	drugForm?: string; // Form (tablet, capsule, liquid, etc.)
	route?: string; // Route of administration
	frequency?: string; // Frequency if mentioned
	medications: MedicalEntity[]; // All medication entities
	dosages: MedicalEntity[]; // All dosage entities
	drugForms: MedicalEntity[]; // All form entities
	routes: MedicalEntity[]; // All route entities
	frequencies: MedicalEntity[]; // All frequency entities
	rxNormConcepts: RxNormConcept[]; // All RxNorm concepts
	metadata: {
		confidence: number; // Overall confidence score
		entityCount: number; // Total entities found
		latency: number; // Processing time (ms)
		originalText: string; // Input text
		hasRxNormData: boolean; // Whether RxNorm data was found
	};
	error?: Error; // Any processing errors
}
```

### RxNorm Concepts

```typescript
interface RxNormConcept {
	code: string; // RxNorm concept unique identifier
	description: string; // Standardized drug name
	score: number; // Confidence score for this concept
}
```

## Configuration

### Environment Variables

Uses SvelteKit's secure environment variable system:

```typescript
// In src/lib/server/services/medicalComprehendService.ts
import {
	AWS_MEDICAL_COMPREHEND_REGION,
	AWS_MEDICAL_COMPREHEND_ACCESS_KEY_ID,
	AWS_MEDICAL_COMPREHEND_SECRET_ACCESS_KEY,
	AWS_BEDROCK_REGION,
	AWS_BEDROCK_ACCESS_KEY_ID,
	AWS_BEDROCK_SECRET_ACCESS_KEY
} from '$env/static/private';
```

### Environment File Setup

```env
# Primary Medical Comprehend credentials
AWS_MEDICAL_COMPREHEND_REGION=us-east-1
AWS_MEDICAL_COMPREHEND_ACCESS_KEY_ID=your_key
AWS_MEDICAL_COMPREHEND_SECRET_ACCESS_KEY=your_secret

# Fallback to Bedrock credentials if Medical Comprehend not set
AWS_BEDROCK_REGION=us-east-1
AWS_BEDROCK_ACCESS_KEY_ID=your_key
AWS_BEDROCK_SECRET_ACCESS_KEY=your_secret
```

## Error Handling

### Credential Validation

```typescript
// Service validates credentials at initialization
constructor() {
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS credentials not configured for Medical Comprehend service');
  }

  this.client = new ComprehendMedicalClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
  });
}
```

### Error Recovery

```typescript
try {
	const drugInfo = await medicalComprehendService.extractDrugInformation(text);

	if (drugInfo.error) {
		console.warn('Medical Comprehend error:', drugInfo.error.message);
		// Continue with partial data if available
	}

	// Process extracted information
	const drugName = drugInfo.normalizedDrugName || drugInfo.drugName || originalInput;
} catch (error) {
	console.error('Medical Comprehend service error:', error);
	// Handle service unavailable scenario
}
```

## RxNorm Integration Benefits

### Standardization

- **Consistent Drug Names**: Maps "tylenol" → "Acetaminophen"
- **Unique Identifiers**: RxNorm codes for precise drug identification
- **Cross-System Compatibility**: Standard codes work across Medicare systems

### Enhanced Data Quality

- **Dosage Normalization**: Extracts and standardizes dosage information
- **Form Recognition**: Identifies tablets, capsules, liquids, etc.
- **Route Information**: Oral, injection, topical administration routes
- **Frequency Data**: Daily, twice daily, as needed, etc.

### Medicare Integration

- **Formulary Lookup**: Use RxNorm codes for plan coverage checks
- **Pricing APIs**: Standardized names for accurate pricing
- **Prior Authorization**: Consistent drug identification for PA requirements

## Performance Considerations

### Latency Optimization

- **Single API Call**: One Medical Comprehend call extracts all entities
- **Efficient Filtering**: Service pre-filters relevant drug entities
- **Session Caching**: Store normalized data in session for reuse

### Cost Management

- **Input Validation**: Only process meaningful drug-related text
- **Character Limits**: Medical Comprehend charges per character
- **Batch Processing**: Consider batching for high-volume scenarios

## Debugging

### Enable Detailed Logging

```typescript
// Service provides comprehensive debug information
console.log('[DEBUG] Medical Comprehend extraction results:', {
	originalInput: drugName,
	extractedDrugName: drugInfo.drugName,
	normalizedDrugName: drugInfo.normalizedDrugName,
	rxNormCode: drugInfo.rxNormCode,
	hasRxNormData: drugInfo.metadata.hasRxNormData,
	confidence: drugInfo.metadata.confidence,
	latency: drugInfo.metadata.latency
});
```

### Common Debug Scenarios

1. **No RxNorm Data**: Check if drug name is recognized in RxNorm database
2. **Low Confidence**: Review input text quality and drug name spelling
3. **Missing Entities**: Verify Medical Comprehend service permissions
4. **Slow Performance**: Monitor latency and consider input optimization

## Testing

### Unit Test Example

```typescript
describe('Medical Comprehend RxNorm Integration', () => {
	it('should extract drug with RxNorm normalization', async () => {
		const result = await medicalComprehendService.extractDrugInformation(
			'atorvastatin 20mg tablets'
		);

		expect(result.drugName).toBe('atorvastatin');
		expect(result.normalizedDrugName).toContain('Atorvastatin');
		expect(result.rxNormCode).toBeDefined();
		expect(result.dosage).toBe('20mg');
		expect(result.drugForm).toBe('tablets');
		expect(result.metadata.hasRxNormData).toBe(true);
		expect(result.metadata.confidence).toBeGreaterThan(0.8);
	});

	it('should handle unrecognized drugs gracefully', async () => {
		const result = await medicalComprehendService.extractDrugInformation('xyz123 unknown medicine');

		expect(result.medications).toHaveLength(0);
		expect(result.metadata.hasRxNormData).toBe(false);
		expect(result.error).toBeUndefined();
	});
});
```

## Future Enhancements

### Planned Features

1. **Batch Processing**: Process multiple drugs in single request
2. **Advanced Caching**: Redis-based caching for RxNorm lookups
3. **Custom Models**: Fine-tuned models for Medicare-specific terminology
4. **Real-time Validation**: Validate against current drug databases

### Integration Opportunities

- **Pharmacy APIs**: Use RxNorm codes for pharmacy integration
- **Drug Interaction Services**: Standardized names for interaction checking
- **Insurance Formularies**: Map to plan coverage using RxNorm codes
- **Clinical Decision Support**: Integrate with medical decision systems
