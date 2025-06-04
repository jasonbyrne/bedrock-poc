# Visual Features & Styling System

This document outlines the visual features and styling system for the Medicare Chatbot POC application.

## 🎨 Styling Architecture

### SASS/SCSS Theme System

We use a custom SASS-based theme system with CSS custom properties for consistency and maintainability:

- **CSS Variables**: Runtime theme switching capability
- **SASS Maps**: Easy access to theme values in components
- **Mixins**: Reusable styling patterns
- **Functions**: Theme value getters

### Key Files

- `src/styles/_variables.scss` - CSS custom properties and SASS maps
- `src/styles/_mixins.scss` - Reusable mixins and functions
- `src/app.scss` - Global styles and utility classes

## 🎯 Color System

### Primary Colors

```scss
// Blue theme colors
--color-primary-50: #eff6ff; // Lightest
--color-primary-100: #dbeafe;
--color-primary-500: #3b82f6; // Main brand color
--color-primary-600: #2563eb; // Interactive elements
--color-primary-700: #1d4ed8; // Darker states
```

### Usage in Components

```scss
.my-component {
	background-color: m.color(primary, 600);
	border: 1px solid m.color(primary, 200);

	&:hover {
		background-color: m.color(primary, 700);
	}
}
```

## 🔧 Component Styling

### Button Variants

**Primary Buttons**

```scss
.btn-primary {
	@include m.button-primary;
	// Results in: blue background, white text, hover effects
}
```

**Secondary Buttons**

```scss
.btn-secondary {
	@include m.button-secondary;
	// Results in: gray background, dark text, hover effects
}
```

**Ghost Buttons**

```scss
.btn-ghost {
	@include m.button-ghost;
	// Results in: transparent background, hover background
}
```

### Input Fields

All input components use the base input mixin:

```scss
.input {
	@include m.input-base;
	// Includes: padding, border, focus states, transitions
}
```

**Error States**

```scss
.input-error {
	border-color: m.color(red, 300);
	color: m.color(red, 900);

	&:focus {
		border-color: m.color(red, 500);
		box-shadow: 0 0 0 3px m.color(red, 100);
	}
}
```

## 📱 Responsive Design

### Breakpoint System

```scss
$breakpoints: (
	sm: 640px,
	// Small devices
	md: 768px,
	// Medium devices
	lg: 1024px,
	// Large devices
	xl: 1280px // Extra large devices
);
```

### Usage

```scss
.component {
	padding: m.space(4);

	@include m.responsive(md) {
		padding: m.space(6);
	}

	@include m.responsive(lg) {
		padding: m.space(8);
	}
}
```

## 🎭 Layout Components

### Card Component

```scss
.card {
	@include m.card;
	// Includes: white background, rounded corners, shadow, padding
}
```

### Container

```scss
.container {
	width: 100%;
	margin: 0 auto;
	padding: 0 m.space(4);

	@include m.responsive(lg) {
		max-width: 1024px;
		padding: 0 m.space(8);
	}
}
```

### Flexbox Utilities

```scss
.flex-center {
	@include m.flex-center;
	// display: flex, align-items: center, justify-content: center
}

.flex-between {
	@include m.flex-between;
	// display: flex, align-items: center, justify-content: space-between
}
```

## 🌈 Visual Enhancement Features

### Header Component

- **Logo**: Blue rounded icon with chat bubble SVG
- **User Avatar**: Circular avatar with user initials
- **Plan Badge**: Colored badge showing plan type (e.g., "Plan G")
- **Responsive**: Collapses to mobile-friendly layout

### Login Form

- **Gradient Background**: Blue gradient from top-left to bottom-right
- **Card Design**: White card with rounded corners and shadow
- **Info Banner**: Blue info box explaining demo mode
- **Error States**: Red banner for validation errors
- **Loading States**: Animated spinner during authentication

### Chat Interface

- **Message Bubbles**: Rounded bubbles with different styles for user/assistant
- **Avatar System**: User initials and assistant icon
- **Timestamps**: Relative time display (e.g., "2 minutes ago")
- **Typing Indicator**: Animated dots for assistant responses
- **Empty State**: Welcome message with user greeting

### Form Components

**Input Fields**

- Focus rings with theme colors
- Error states with red coloring
- Disabled states with gray styling
- Smooth transitions

**Select Dropdowns**

- Custom arrow icon
- Hover and focus states
- Option descriptions for personas

**Buttons**

- Multiple variants (primary, secondary, ghost, danger)
- Loading states with spinners
- Disabled states
- Size variants (sm, md, lg)

## 🔍 Accessibility Features

### Focus Management

- Visible focus rings on all interactive elements
- Proper tab order
- Skip links for keyboard navigation

### Color Contrast

- All text meets WCAG AA contrast requirements
- Error states use sufficient contrast ratios

### Screen Reader Support

- Proper ARIA labels and roles
- Error messages announced to screen readers
- Loading states communicated

## ⚡ Animation & Transitions

### Standard Transitions

```scss
// Fast transitions for hover effects
transition: all m.transition(fast); // 150ms

// Normal transitions for state changes
transition: all m.transition(normal); // 250ms

// Slow transitions for complex animations
transition: all m.transition(slow); // 350ms
```

### Loading Animations

```scss
@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

.loading-spinner {
	animation: spin 1s linear infinite;
}
```

## 🎨 Theme Customization

### Adding New Colors

1. Add CSS custom properties to `_variables.scss`
2. Add to the `$colors` SASS map
3. Use via `m.color(name, shade)` function

### Creating New Mixins

1. Add to `_mixins.scss`
2. Include theme functions for consistency
3. Use across components with `@include`

### Example Custom Component

```scss
.custom-component {
	@include m.card;
	background: m.color(blue, 50);
	border-left: 4px solid m.color(primary, 600);

	&:hover {
		transform: translateY(-2px);
		box-shadow: m.shadow(xl);
		transition: all m.transition(normal);
	}

	@include m.responsive(md) {
		padding: m.space(6);
	}
}
```

## 📏 Spacing System

### Consistent Spacing Scale

```scss
// Using the spacing function
margin: m.space(4); // 1rem
padding: m.space(6); // 1.5rem
gap: m.space(2); // 0.5rem
```

### Available Sizes

- `space(1)` - 0.25rem (4px)
- `space(2)` - 0.5rem (8px)
- `space(3)` - 0.75rem (12px)
- `space(4)` - 1rem (16px)
- `space(6)` - 1.5rem (24px)
- `space(8)` - 2rem (32px)
- And more...

## 🔧 Development Guidelines

### Component Styling Best Practices

1. **Always use SCSS**: Include `lang="scss"` in style blocks
2. **Import mixins**: `@use '../../../styles/mixins' as m;`
3. **Use theme functions**: Never hardcode colors or spacing
4. **BEM naming**: Use consistent class naming conventions
5. **Mobile-first**: Start with mobile styles, enhance for larger screens

### Performance Considerations

- CSS custom properties enable runtime theme switching
- SASS compilation happens at build time
- Minimal CSS bundle size through selective imports
- Efficient cascade with proper specificity

This styling system provides a consistent, maintainable, and accessible foundation for the entire application while allowing for easy customization and theme switching.
