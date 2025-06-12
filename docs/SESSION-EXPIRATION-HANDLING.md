# Session Expiration Handling

This document explains how the Medicare Chatbot POC handles session expiration gracefully to provide a good user experience.

## Overview

When a user's session expires (due to inactivity timeout or server restart), the application detects this condition and presents a user-friendly modal dialog instead of showing cryptic error messages.

## Implementation

### 1. Enhanced Error Types (`chatbotApi.ts`)

The API service now creates typed errors that distinguish between different failure modes:

- **`SessionExpiredError`**: Session not found or expired (404 with `SESSION_ERROR` code)
- **`AuthError`**: Authentication failed (401 with `AUTH_ERROR` code)
- **`ApiRequestError`**: Generic API errors

### 2. Session Expired Modal (`SessionExpiredModal.svelte`)

A dedicated modal component that:

- Explains why the session expired (security reasons)
- Provides clear next steps for the user
- Cannot be dismissed - user must continue
- Clears all local authentication data before navigation
- Automatically navigates to home page when user clicks "Continue"
- Supports accessibility standards

### 3. Enhanced Error Handling (`SearchFeed.svelte`)

The search feed component now:

- Detects session expiration errors using type guards
- Shows the session expired modal instead of generic error messages
- Handles both initialization and message sending failures
- Distinguishes between different error types for appropriate responses

## User Experience Flow

1. **Session Expires**: User's session times out or becomes invalid
2. **Error Detection**: API call fails with 404 and `SESSION_ERROR` code
3. **Modal Display**: Session expired modal appears with clear explanation
4. **User Action**: User must click "Continue to Home" (no cancel option)
5. **Logout & Navigation**: Local auth data is cleared and user is redirected to home page to start fresh

## Error Scenarios Handled

### During Session Initialization

- Session expired → Show modal
- Authentication failed → Show auth error message
- Network/server errors → Show generic error message

### During Message Sending

- Session expired → Show modal
- Authentication failed → Show auth error message
- Network/server errors → Update message with error state

## Benefits

- **User-Friendly**: Clear explanation instead of technical error messages
- **Secure**: Explains that session expiration protects user data
- **Actionable**: Provides clear path forward (return to home)
- **Accessible**: Modal supports keyboard navigation and screen readers
- **Consistent**: Same handling across all session expiration scenarios

## Technical Details

### Type Guards

```typescript
export function isSessionExpiredError(error: unknown): error is SessionExpiredError {
	return error instanceof Error && 'type' in error && error.type === 'SESSION_EXPIRED';
}
```

### Error Creation

```typescript
function createTypedError(
	error: ApiError,
	status: number
): SessionExpiredError | AuthError | ApiRequestError {
	if (error.code === 'SESSION_ERROR' && status === 404) {
		const sessionError = new Error(error.error) as SessionExpiredError;
		sessionError.type = 'SESSION_EXPIRED';
		sessionError.code = 'SESSION_ERROR';
		return sessionError;
	}
	// ... other error types
}
```

### Modal Integration

```typescript
// Handle specific error types
if (isSessionExpiredError(error)) {
	showSessionExpiredModal = true;
	return;
}
```

This implementation ensures that session expiration is handled gracefully throughout the application, providing users with a clear understanding of what happened and how to proceed.
