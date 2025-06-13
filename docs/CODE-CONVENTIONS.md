# Code Conventions for Medicare Chatbot POC

This document outlines the coding standards and conventions for the Medicare Chatbot POC project.

## 🎯 Project Overview

- **Framework**: SvelteKit with Svelte 5
- **Language**: TypeScript (strict mode)
- **Styling**: CSS/SASS with custom theme system
- **Testing**: Vitest
- **Build Tool**: Vite
- **AI Services**: AWS Bedrock (Claude 3 Haiku), Medical Comprehend, Lex
- **External APIs**: MCT (stubbed for now)

## 🚨 Critical: Svelte 5 Syntax Only

This project uses **Svelte 5** exclusively. Never use deprecated Svelte 4 syntax.

### ✅ Svelte 5 (Use This)

```svelte
<script lang="ts">
	// Props
	interface Props {
		name: string;
		count?: number;
	}
	let { name, count = 0 }: Props = $props();

	// State
	let message = $state('Hello');

	// Derived values (simple expressions)
	let greeting = $derived(`${message}, ${name}!`);
	let isActive = $derived(count > 0);

	// Derived values (complex computations with functions)
	let expensiveCalculation = $derived.by(() => {
		// Use $derived.by() when you need a function
		return someComplexCalculation(data);
	});

	// Effects
	$effect(() => {
		console.log('Count changed:', count);
	});

	// Event handlers
	function handleClick() {
		count++;
	}
</script>

<button onclick={handleClick}>
	{greeting} (clicked {count} times)
</button>
```

### ❌ Svelte 4 (Never Use)

```svelte
<!-- DON'T USE THESE -->
<script>
  export let name; // ❌ Use $props() instead
  let count = 0;

  $: greeting = `Hello, ${name}!`; // ❌ Use $derived() instead

  $: { // ❌ Use $effect() instead
    console.log('Count changed:', count);
  }
</script>

<button on:click={handleClick}> <!-- ❌ Use onclick={} instead -->
```

## 🎨 Styling System

### SASS/SCSS Architecture

We use a custom SASS-based theme system with CSS custom properties:

```scss
// Import theme functions and mixins
@use '../styles/mixins' as m;

.my-component {
	// Use theme functions
	background-color: m.color(primary, 600);
	padding: m.space(4);
	border-radius: m.radius(lg);

	// Use mixins
	@include m.button-primary;
	@include m.flex-center;
}
```

### Available Theme Functions

```scss
// Colors
m.color(primary, 600)    // Theme colors with shades
m.color(gray, 100)
m.color(red, 500)

// Spacing
m.space(4)               // Consistent spacing scale

// Border radius
m.radius(lg)             // Border radius values

// Shadows
m.shadow(md)             // Box shadow variants

// Typography
m.font-size(lg)          // Font size scale
m.font-weight(semibold)  // Font weight scale
m.line-height(normal)    // Line height scale

// Transitions
m.transition(normal)     // Transition timing
```

### Available Mixins

```scss
// Layout
@include m.flex-center; // Center items with flexbox
@include m.flex-between; // Space between with flexbox

// Components
@include m.button-primary; // Primary button styles
@include m.button-secondary;
@include m.button-ghost;
@include m.input-base; // Input field styles
@include m.card; // Card container styles
@include m.gradient-bg; // Gradient background

// Responsive
@include m.responsive(md) {
	// Styles for medium screens and up
}
```

### Component Styling Best Practices

1. **Always use SCSS**: Use `<style lang="scss">` in components
2. **Import mixins**: `@use '../../../styles/mixins' as m;`
3. **Use theme functions**: Don't hardcode colors or spacing values
4. **Consistent naming**: Use BEM-like class naming
5. **Responsive design**: Use the responsive mixin for breakpoints

```svelte
<!-- Example component -->
<div class="my-component">
	<h2 class="component-title">Title</h2>
	<p class="component-text">Content</p>
</div>

<style lang="scss">
	@use '../../../styles/mixins' as m;

	.my-component {
		@include m.card;

		@include m.responsive(md) {
			padding: m.space(6);
		}
	}

	.component-title {
		font-size: m.font-size(xl);
		font-weight: m.font-weight(semibold);
		color: m.color(gray, 900);
		margin-bottom: m.space(2);
	}

	.component-text {
		color: m.color(gray, 600);
		line-height: m.line-height(relaxed);
	}
</style>
```

## 🏗️ Backend Architecture Patterns

### Intent Controller Pattern

The project uses a controller pattern for handling chatbot intents. Each intent has its own dedicated controller that handles the specific logic for that intent.

#### Folder Structure

```
src/lib/server/
├── controllers/           # Intent-specific controllers
├── services/             # External service integrations
│   ├── bedrockService.ts # AWS Bedrock integration
│   ├── lexService.ts     # AWS Lex integration
│   ├── mctService.ts     # MCT API integration (stubbed)
│   └── medicalComprehendService.ts # Medical entity extraction
├── core/
│   └── controller.ts     # Abstract Controller class
└── router.ts             # Maps intents to controllers
```

#### Key Concepts

- Each intent has a dedicated controller class
- The router maps intent names to their corresponding controllers
- Controllers handle intent-specific logic and responses
- Services handle external API integrations

### Service Pattern

Services follow a consistent pattern for external API integration:

```typescript
// Example: mctService.ts
export function getDrugPricePerDose(drugName: string, dosage: string): number {
	// Log for debugging
	console.log('[DEBUG] Getting drug price per dose for:', drugName, dosage);

	// TODO: Replace with real MCT API call
	const minPrice = 0.5;
	const maxPrice = 10.0;
	return Number((Math.random() * (maxPrice - minPrice) + minPrice).toFixed(2));
}
```

#### Service Conventions

1. **Function Naming**: Use clear, descriptive names that indicate the action
2. **Type Safety**: Always use TypeScript types for parameters and return values
3. **Error Handling**: Include proper error handling and logging
4. **Debugging**: Add debug logging for important operations
5. **Documentation**: Include JSDoc comments for public functions
6. **Stubbing**: When stubbing external services:
   - Use realistic data ranges
   - Add TODO comments for future implementation
   - Include debug logging

## 🚀 API Endpoints

### Chatbot API

The application provides RESTful API endpoints for chatbot functionality:

#### POST `/api/chatbot/welcome`

Creates a new chat session and returns personalized welcome message.

**Headers:**

- `Authorization: Bearer <jwt_token>` (required)
- `Content-Type: application/json`

**Response:**

```typescript
interface ChatbotWelcomeResponse {
	success: boolean;
	session_id: string;
	message: ChatMessage;
	error?: string;
}
```

#### POST `/api/chatbot/message`

Send a message within an existing chat session.

**Headers:**

- `Authorization: Bearer <jwt_token>` (required)
- `Content-Type: application/json`

**Request Body:**

```typescript
interface ChatbotMessageRequest {
	session_id: string;
	message: string;
}
```

**Response:**

```typescript
interface ChatbotMessageResponse {
	success: boolean;
	message: ChatMessage;
	session_updated: boolean;
	error?: string;
}
```

### Authentication

All chatbot endpoints require JWT authentication:

- Include `Authorization: Bearer <token>` header
- Returns 401 for invalid/missing tokens
- Returns 403 for session access violations

### Error Handling

API endpoints return consistent error format:

```typescript
interface ApiError {
	success: false;
	error: string;
	code?: string;
}
```

### Using the API Client

Use the provided API client service:

```typescript
import { initializeChatSession, sendChatMessage } from '$lib/services/chatbotApi.js';

// Initialize session
const welcome = await initializeChatSession(token);
const sessionId = welcome.session_id;

// Send message
const response = await sendChatMessage(sessionId, 'Hello', token);
```

## 🔧 TypeScript Standards

### Strict Mode

Always use TypeScript in strict mode. Never use `any` type.

```typescript
// ✅ Good
interface User {
	id: number;
	name: string;
	email?: string;
}

function getUser(id: number): Promise<User | null> {
	// implementation
}

// ❌ Bad
function getUser(id: any): any {
	// Don't use any!
}
```

### Component Props

Always define TypeScript interfaces for component props:

```svelte
<script lang="ts">
	interface Props {
		title: string;
		count?: number;
		items: Array<{ id: number; name: string }>;
		onUpdate?: (value: string) => void;
	}

	let { title, count = 0, items, onUpdate }: Props = $props();
</script>
```

## 📁 File Structure & Naming

### Directory Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   └── forms/           # Form-specific components
│   ├── services/            # Business logic & API calls
│   ├── stores/              # Svelte stores
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
├── routes/                  # SvelteKit routes
├── styles/                  # Global styles and theme
└── app.scss                 # Main stylesheet
```

### Naming Conventions

| Type             | Convention           | Example                         |
| ---------------- | -------------------- | ------------------------------- |
| Components       | PascalCase           | `UserProfile.svelte`            |
| Files            | camelCase            | `userService.ts`                |
| Directories      | camelCase            | `userComponents/`               |
| Variables        | camelCase            | `userName`                      |
| Constants        | SCREAMING_SNAKE_CASE | `MAX_RETRIES`                   |
| Types/Interfaces | PascalCase           | `UserProfile`                   |
| CSS Classes      | kebab-case or BEM    | `user-card`, `user-card__title` |

### Component Naming

- UI components: `src/lib/components/ui/Button.svelte`
- Form components: `src/lib/components/forms/LoginForm.svelte`
- Page components: `src/routes/chat/+page.svelte`

## 🔄 State Management

### Svelte 5 Runes

Use Svelte 5 runes for component state:

```svelte
<script lang="ts">
	// Reactive state
	let count = $state(0);
	let user = $state<User | null>(null);

	// Derived state (simple expressions)
	let doubled = $derived(count * 2);
	let isLoggedIn = $derived(user !== null);
	let status = $derived(count > 10 ? 'high' : 'low');

	// Derived state (functions and complex computations)
	let formattedDate = $derived.by(() =>
		new Date().toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	);

	let expensiveComputation = $derived.by(() => {
		if (!data) return null;
		return performComplexCalculation(data);
	});

	// Effects
	$effect(() => {
		console.log('User changed:', user);
	});
</script>
```

### ✅ Correct $derived Usage

```typescript
// Simple expressions - use $derived()
let doubled = $derived(count * 2);
let isActive = $derived(status === 'active');
let fullName = $derived(`${firstName} ${lastName}`);

// Functions and complex logic - use $derived.by()
let formattedTime = $derived.by(() =>
	timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
);

let filteredItems = $derived.by(() => {
	if (!items) return [];
	return items.filter((item) => item.active);
});
```

### ❌ Incorrect $derived Usage

```typescript
// ❌ Don't use $derived() with functions
let formattedTime = $derived(() => {
	return timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
});

// ✅ Use $derived.by() instead
let formattedTime = $derived.by(() =>
	timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
);
```

### Svelte Stores

For global state, use traditional Svelte stores:

```typescript
// stores/authStore.ts
import { writable, derived } from 'svelte/store';

export const currentUser = writable<User | null>(null);
export const authToken = writable<string | null>(null);

export const isAuthenticated = derived(
	[currentUser, authToken],
	([$currentUser, $authToken]) => $currentUser !== null && $authToken !== null
);
```

## 🧪 Testing

### Component Tests

```typescript
import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import Button from './Button.svelte';

test('renders button with text', () => {
	render(Button, { children: 'Click me' });
	expect(screen.getByRole('button')).toHaveTextContent('Click me');
});
```

## 🌍 Environment Variables

### Server-side (Private)

```bash
BEDROCK_REGION=us-east-1
BEDROCK_ACCESS_KEY_ID=your_key
```

### Client-side (Public)

Must be prefixed with `PUBLIC_`:

```bash
PUBLIC_APP_NAME=Medicare Chatbot POC
PUBLIC_VERSION=1.0.0
```

## 📋 Code Review Checklist

- [ ] Uses Svelte 5 syntax only (no Svelte 4)
- [ ] TypeScript interfaces defined for props
- [ ] No `any` types used
- [ ] SCSS styling with theme functions
- [ ] Proper naming conventions followed
- [ ] Component is properly typed
- [ ] Responsive design considered
- [ ] Accessibility attributes included
- [ ] Error handling implemented

## 🚀 Quick Start Template

```svelte
<script lang="ts">
	/**
	 * Brief description of component
	 */

	interface Props {
		// Define your props here
	}

	let {} /* destructure props */ : Props = $props();

	// Component logic here
</script>

<!-- Template here -->

<style lang="scss">
	@use '../../../styles/mixins' as m;

	// Styles here using theme functions
</style>
```

Remember: When in doubt, check existing components for patterns and always prioritize type safety and Svelte 5 syntax!
