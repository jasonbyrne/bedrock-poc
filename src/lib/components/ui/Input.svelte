<script lang="ts">
	/**
	 * Reusable Input component with Svelte 5 syntax
	 */

	interface Props {
		type?: 'text' | 'email' | 'password' | 'number' | 'tel';
		placeholder?: string;
		value?: string;
		disabled?: boolean;
		required?: boolean;
		error?: string;
		label?: string;
		id?: string;
		onchange?: (value: string) => void;
		oninput?: (value: string) => void;
	}

	let {
		type = 'text',
		placeholder,
		value = '',
		disabled = false,
		required = false,
		error,
		label,
		id,
		onchange,
		oninput
	}: Props = $props();

	// Generate unique ID if not provided
	let inputId = $derived(id || `input-${Math.random().toString(36).substr(2, 9)}`);

	function handleInput(event: Event): void {
		const target = event.target as HTMLInputElement;
		value = target.value;
		if (oninput) {
			oninput(value);
		}
	}

	function handleChange(event: Event): void {
		const target = event.target as HTMLInputElement;
		value = target.value;
		if (onchange) {
			onchange(value);
		}
	}
</script>

<div class="input-group">
	{#if label}
		<label for={inputId} class="input-label">
			{label}
			{#if required}
				<span class="required">*</span>
			{/if}
		</label>
	{/if}

	<input
		{type}
		id={inputId}
		{placeholder}
		{value}
		{disabled}
		{required}
		class="input {error ? 'input-error' : ''} {disabled ? 'input-disabled' : ''}"
		oninput={handleInput}
		onchange={handleChange}
	/>

	{#if error}
		<p class="error-message" role="alert">
			{error}
		</p>
	{/if}
</div>

<style lang="scss">
	@use '../../../styles/mixins' as m;

	.input-group {
		display: flex;
		flex-direction: column;
		gap: m.space(1);
	}

	.input-label {
		display: block;
		font-size: m.font-size(sm);
		font-weight: m.font-weight(medium);
		color: m.color(gray, 700);
	}

	.required {
		color: m.color(red, 500);
	}

	.input {
		@include m.input-base;

		&.input-error {
			border-color: m.color(red, 300);
			color: m.color(red, 900);

			&::placeholder {
				color: m.color(red, 300);
			}

			&:focus {
				border-color: m.color(red, 500);
				box-shadow: 0 0 0 3px m.color(red, 100);
			}
		}

		&.input-disabled {
			background-color: m.color(gray, 50);
			color: m.color(gray, 500);
			cursor: not-allowed;
		}
	}

	.error-message {
		font-size: m.font-size(sm);
		color: m.color(red, 600);
	}
</style>
