# BedrockService Refactoring Documentation

## Overview

The `BedrockService` has been completely refactored to implement a singleton pattern with purpose-built methods for different types of AI interactions. This refactoring improves code organization, reduces duplication, and provides a cleaner API for working with AWS Bedrock.

## 🔄 **Changes Made**

### **1. Singleton Pattern Implementation**

The `BedrockService` is now a singleton with:

- **Private constructor**: Prevents direct instantiation
- **Static `getInstance()` method**: Returns the singleton instance
- **Exported instance**: `bedrockService` for easy import

```typescript
// Before
const service = new BedrockService();

// After
import { bedrockService } from '$lib/server/services/bedrockService';
```

### **2. Purpose-Built Public Methods**

#### **`detectIntent(args: IntentDetectionArgs)`**

- Merged functionality from `detectIntentWithBedrock` in `intentDetection.ts`
- Handles conversation context and message preparation for Claude API
- Returns structured `IntentDetectionResult`

#### **`generateFallbackMessage(args: FallbackMessageArgs)`**

- For when intent cannot be determined
- Provides helpful suggestions and asks for clarification
- Uses dynamic fallback prompts

#### **`generateClarificationMessage(args: ClarificationMessageArgs)`**

- For when intent is suspected but confidence is low
- Confirms understanding and asks for clarification
- Uses extracted slots to provide context

#### **`generateMissingInformationMessage(args: MissingInformationArgs)`**

- For when intent is confident but slots are incomplete
- Requests specific missing information
- Explains why the information is needed

### **3. Enhanced Interfaces**

```typescript
// New interfaces for better type safety
interface IntentDetectionResult {
	intent: string;
	confidence: number;
	slots?: Record<string, unknown>;
}

interface IntentDetectionArgs {
	session: ChatSession;
	maxContextMessages?: number;
}

interface FallbackMessageArgs {
	session: ChatSession;
	originalMessage: string;
	suggestedActions?: string[];
}

interface ClarificationMessageArgs {
	session: ChatSession;
	suspectedIntent: string;
	confidence: number;
	extractedSlots?: Record<string, unknown>;
}

interface MissingInformationArgs {
	session: ChatSession;
	intent: string;
	topic: string;
	providedSlots: string[];
	missingSlots: string[];
	confidence: number;
}
```

### **4. Function-Based System Prompts**

System prompts are now functions that can accept arguments for dynamic generation:

```typescript
// Before
export const INTENT_DETECTION_PROMPT = "...";

// After
export function createIntentDetectionPrompt(): string { ... }
export function createFallbackPrompt(args: { originalMessage: string; suggestedActions?: string[]; }): string { ... }
export function createClarificationPrompt(args: { suspectedIntent: string; confidence: number; extractedSlots?: Record<string, unknown>; originalMessage: string; }): string { ... }
export function createMissingInformationPrompt(args: { intent: string; topic: string; providedSlots: string[]; missingSlots: string[]; confidence: number; }): string { ... }
```

### **5. Private Method Organization**

Core functionality is now organized in private methods:

- **`generateResponse()`**: Core Bedrock API interaction
- **`parseResponse()`**: Response content parsing
- **`parseIntentDetectionResponse()`**: Intent-specific response parsing
- **`prepareMessagesForClaude()`**: Message preparation with role alternation
- **`buildMessages()`**: Claude 3 Messages API formatting

## 🎯 **Usage Examples**

### **Intent Detection**

```typescript
import { bedrockService } from '$lib/server/services/bedrockService';

const result = await bedrockService.detectIntent({
	session,
	maxContextMessages: 4
});

if (result) {
	const { intent, confidence, slots } = result;
	// Handle intent...
}
```

### **Fallback Message Generation**

```typescript
const response = await bedrockService.generateFallbackMessage({
	session,
	originalMessage: 'unclear user input',
	suggestedActions: ['Ask about drug prices', 'Check Medicare coverage', 'Find providers']
});
```

### **Clarification Message Generation**

```typescript
const response = await bedrockService.generateClarificationMessage({
	session,
	suspectedIntent: 'GetDrugPrice',
	confidence: 0.6,
	extractedSlots: { drug_name: 'something' },
	originalMessage: "user's unclear request"
});
```

### **Missing Information Message Generation**

```typescript
const response = await bedrockService.generateMissingInformationMessage({
	session,
	intent: 'GetDrugPrice',
	topic: 'drug pricing',
	providedSlots: ['drug_name'],
	missingSlots: ['dosage', 'quantity'],
	confidence: 0.9
});
```

## 🔧 **Migration Impact**

### **Files Updated**

1. **`src/lib/server/services/bedrockService.ts`** - Complete refactor
2. **`src/lib/server/systemPrompts.ts`** - Converted to functions
3. **`src/lib/server/utils/intentDetection.ts`** - Simplified to use singleton
4. **`src/lib/server/controllers/GetSingleDrugPriceController.ts`** - Updated imports

### **Backward Compatibility**

- **Legacy method preserved**: `generateNeedMoreInfoResponse()` still works
- **Legacy exports maintained**: `INTENT_DETECTION_PROMPT` and `NEED_MORE_INFO_PROMPT` still available
- **Existing controllers**: Continue to work without changes

### **Benefits**

- **Reduced code duplication**: Intent detection logic consolidated
- **Better separation of concerns**: Purpose-built methods for different scenarios
- **Improved maintainability**: Singleton pattern reduces instantiation overhead
- **Enhanced type safety**: Comprehensive interfaces for all operations
- **Dynamic prompts**: System prompts can now be customized with arguments

## 🚀 **Future Enhancements**

The refactored architecture enables:

1. **Easy prompt experimentation**: Modify functions without touching core logic
2. **A/B testing**: Different prompt variations for different users
3. **Caching strategies**: Singleton enables shared caching mechanisms
4. **Monitoring integration**: Centralized logging and metrics collection
5. **Multi-model support**: Easy extension to support different AI models

## 📝 **Testing**

The refactoring maintains all existing functionality:

- ✅ TypeScript compilation successful
- ✅ Dev server starts without errors
- ✅ Existing API endpoints continue to work
- ✅ Intent detection flow preserved
- ✅ Backward compatibility maintained

This refactoring provides a solid foundation for future AI service enhancements while maintaining the existing API surface for seamless integration.
