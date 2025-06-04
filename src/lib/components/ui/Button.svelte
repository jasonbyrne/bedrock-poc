<script lang="ts">
	/**
	 * Reusable Button component with Svelte 5 syntax
	 */
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		loading?: boolean;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
		onclick?: () => void;
		children?: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		loading = false,
		type = 'button',
		class: additionalClasses = '',
		onclick,
		children
	}: Props = $props();

	function handleClick(): void {
		if (!disabled && !loading && onclick) {
			onclick();
		}
	}
</script>

<button
	{type}
	class="btn btn-{variant} btn-{size} {additionalClasses}"
	disabled={disabled || loading}
	onclick={handleClick}
>
	{#if loading}
		<svg class="loading-spinner" fill="none" viewBox="0 0 24 24">
			<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
			<path
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			></path>
		</svg>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</button>

<style lang="scss">
	@use '../../../styles/mixins' as m;

	.btn {
		@include m.button-base;
		padding: m.space(2) m.space(4);
		font-size: m.font-size(sm);

		&.btn-primary {
			@include m.button-primary;
		}

		&.btn-secondary {
			@include m.button-secondary;
		}

		&.btn-danger {
			background-color: m.color(red, 600);
			color: m.color(white);

			&:hover:not(:disabled) {
				background-color: m.color(red, 700);
			}

			&:focus {
				box-shadow: 0 0 0 3px m.color(red, 100);
			}
		}

		&.btn-ghost {
			@include m.button-ghost;
		}

		&.btn-sm {
			padding: m.space(1) m.space(3);
			font-size: m.font-size(xs);
		}

		&.btn-md {
			padding: m.space(2) m.space(4);
			font-size: m.font-size(sm);
		}

		&.btn-lg {
			padding: m.space(3) m.space(6);
			font-size: m.font-size(base);
		}
	}

	.loading-spinner {
		animation: spin 1s linear infinite;
		margin-left: -0.25rem;
		margin-right: 0.5rem;
		height: 1rem;
		width: 1rem;

		circle {
			opacity: 0.25;
		}

		path {
			opacity: 0.75;
		}
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
