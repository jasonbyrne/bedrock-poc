# Claude 3 Response Parsing Fix

## Issue Description

The `generateNeedMoreInfoResponse` method in the `BedrockService` was returning stringified JSON instead of the parsed text content. The response was coming back in this format:

```json
[
	{
		"type": "text",
		"text": "Okay, great! I'd be happy to help you with information about statins..."
	}
]
```

Instead of just the text content, causing issues in the chatbot responses.

## Root Cause

The Claude 3 API returns responses in different formats depending on the specific response structure:

1. **Direct array format**: `[{ type: 'text', text: '...' }]`
2. **Nested in content field**: `{ content: [{ type: 'text', text: '...' }] }`
3. **Stringified in content field**: `{ content: "[{\"type\":\"text\",\"text\":\"...\"}]" }`

The original `parseResponse` method only handled the first two cases, missing the third case where the Claude 3 response is stringified JSON within the content field.

## Solution Implemented

Enhanced the `parseResponse` method in `BedrockService` to handle all three Claude 3 response formats:

### **Updated Code**

```typescript
/**
 * Parse Bedrock response content from various formats.
 */
private parseResponse(responseBody: unknown): string {
    if (typeof responseBody !== 'object' || responseBody === null) {
        return '';
    }

    const responseBodyObject = responseBody as {
        content?: unknown;
        completion?: string;
    };

    // Claude 3 returns an array: [{ type: 'text', text: '...' }]
    let content = '';

    // Check if responseBody is directly the Claude 3 array format
    if (
        Array.isArray(responseBody) &&
        responseBody.length > 0 &&
        typeof responseBody[0].text === 'string'
    ) {
        content = responseBody[0].text;
    }
    // Check if responseBody.content is the Claude 3 array format
    else if (Array.isArray(responseBodyObject.content)) {
        const contentArray = responseBodyObject.content as Array<{ type: string; text: string }>;
        if (contentArray.length > 0 && typeof contentArray[0].text === 'string') {
            content = contentArray[0].text;
        }
    }
    // ✅ NEW: Check if responseBody.content is a stringified Claude 3 array
    else if (typeof responseBodyObject.content === 'string') {
        try {
            const parsedContent = JSON.parse(responseBodyObject.content);
            if (
                Array.isArray(parsedContent) &&
                parsedContent.length > 0 &&
                typeof parsedContent[0].text === 'string'
            ) {
                content = parsedContent[0].text;
            } else {
                content = responseBodyObject.content;
            }
        } catch {
            // If parsing fails, treat as regular string content
            content = responseBodyObject.content;
        }
    }
    // Fallback to other response formats
    else {
        const fallback = responseBodyObject.content || responseBodyObject.completion || '';
        content = typeof fallback === 'string' ? fallback : JSON.stringify(fallback);
    }

    return content;
}
```

### **Key Changes**

1. **Added stringified JSON handling**: New `else if` branch to check if `responseBodyObject.content` is a string that contains JSON
2. **Safe JSON parsing**: Try-catch block to handle cases where the string isn't valid JSON
3. **Graceful fallback**: If JSON parsing fails, treat as regular string content
4. **Type safety**: Changed `content?: string` to `content?: unknown` to accommodate different response formats

## Testing Results

- ✅ **TypeScript compilation**: No errors
- ✅ **Dev server**: Starts and runs correctly
- ✅ **Backward compatibility**: Existing response formats still work
- ✅ **New format support**: Stringified Claude 3 responses now parse correctly

## Impact

This fix ensures that:

1. **`generateNeedMoreInfoResponse`** returns clean text instead of stringified JSON
2. **All BedrockService methods** handle Claude 3 responses consistently
3. **Chatbot responses** display properly formatted text to users
4. **Future resilience** against different Claude API response formats

## Example

### **Before Fix**

```
Response: [{"type":"text","text":"I need more information about the drug you're asking about..."}]
```

### **After Fix**

```
Response: I need more information about the drug you're asking about...
```

The fix ensures that users see clean, properly formatted responses regardless of how the Claude 3 API returns the content structure.
