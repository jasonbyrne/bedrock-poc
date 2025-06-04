<script lang="ts">
	/**
	 * Reusable Select component with Svelte 5 syntax
	 */

	interface SelectOption {
		value: string | number;
		label: string;
		description?: string;
		disabled?: boolean;
	}

	interface Props {
		options: SelectOption[];
		value?: string | number;
		placeholder?: string;
		disabled?: boolean;
		required?: boolean;
		error?: string;
		label?: string;
		id?: string;
		onchange?: (value: string | number) => void;
	}

	let {
		options,
		value = '',
		placeholder = 'Select an option...',
		disabled = false,
		required = false,
		error,
		label,
		id,
		onchange
	}: Props = $props();

	// Generate unique ID if not provided
	let selectId = $derived(id || `select-${Math.random().toString(36).substr(2, 9)}`);

	function handleChange(event: Event): void {
		const target = event.target as HTMLSelectElement;
		const newValue = target.value;

		// Convert to number if the original value was a number
		const convertedValue = isNaN(Number(newValue)) ? newValue : Number(newValue);
		value = convertedValue;

		if (onchange) {
			onchange(convertedValue);
		}
	}
</script>

<div class="select-group">
	{#if label}
		<label for={selectId} class="select-label">
			{label}
			{#if required}
				<span class="required">*</span>
			{/if}
		</label>
	{/if}

	<select
		id={selectId}
		{value}
		{disabled}
		{required}
		class="select {error ? 'select-error' : ''} {disabled ? 'select-disabled' : ''}"
		onchange={handleChange}
	>
		{#if placeholder}
			<option value="" disabled selected={!value}>
				{placeholder}
			</option>
		{/if}

		{#each options as option}
			<option value={option.value} disabled={option.disabled} title={option.description}>
				{option.label}
				{#if option.description}
					- {option.description}
				{/if}
			</option>
		{/each}
	</select>

	{#if error}
		<p class="error-message" role="alert">
			{error}
		</p>
	{/if}
</div>

<style lang="scss">
	@use '../../../styles/mixins' as m;

	.select-group {
		display: flex;
		flex-direction: column;
		gap: m.space(1);
	}

	.select-label {
		display: block;
		font-size: m.font-size(sm);
		font-weight: m.font-weight(medium);
		color: m.color(gray, 700);
	}

	.required {
		color: m.color(red, 500);
	}

	.select {
		@include m.input-base;
		appearance: none;
		background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
		background-position: right 0.5rem center;
		background-repeat: no-repeat;
		background-size: 1.5em 1.5em;
		padding-right: 2.5rem;

		&.select-error {
			border-color: m.color(red, 300);
			color: m.color(red, 900);

			&:focus {
				border-color: m.color(red, 500);
				box-shadow: 0 0 0 3px m.color(red, 100);
			}
		}

		&.select-disabled {
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
