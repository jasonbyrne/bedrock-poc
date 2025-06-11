<script lang="ts">
	/**
	 * Large search input component for conversational search
	 */

	// Props using Svelte 5 runes
	interface Props {
		onSearch: (query: string) => void;
		disabled?: boolean;
		placeholder?: string;
	}

	let { onSearch, disabled = false, placeholder = 'Ask anything...' }: Props = $props();

	// Component state
	let searchValue = $state('');
	let textareaElement: HTMLTextAreaElement;

	function handleSubmit(event: SubmitEvent): void {
		event.preventDefault();
		submitSearch();
	}

	function handleKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Enter') {
			if (event.ctrlKey || event.metaKey) {
				// Allow line break on Ctrl+Enter or Cmd+Enter
				return;
			} else {
				// Submit on Enter (without modifiers)
				event.preventDefault();
				submitSearch();
			}
		}
	}

	function submitSearch(): void {
		const query = searchValue.trim();
		if (query && !disabled) {
			onSearch(query);
			// Clear the input after submitting
			searchValue = '';
			// Auto-resize the textarea back to minimum height
			if (textareaElement) {
				textareaElement.style.height = 'auto';
			}
		}
	}

	function handleInput(): void {
		// Auto-resize the textarea
		if (textareaElement) {
			textareaElement.style.height = 'auto';
			textareaElement.style.height = `${textareaElement.scrollHeight}px`;
		}
	}

	// Focus the input when component mounts
	$effect(() => {
		if (textareaElement) {
			textareaElement.focus();
		}
	});
</script>

<form class="search-form" onsubmit={handleSubmit}>
	<div class="search-input-container">
		<div class="input-wrapper">
			<textarea
				bind:this={textareaElement}
				bind:value={searchValue}
				class="search-textarea"
				class:disabled
				{placeholder}
				rows="3"
				{disabled}
				oninput={handleInput}
				onkeydown={handleKeyDown}
			></textarea>

			<button
				type="submit"
				class="search-button"
				class:disabled
				disabled={disabled || !searchValue.trim()}
				aria-label="Search"
			>
				{#if disabled}
					<svg class="button-icon loading" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<circle cx="12" cy="12" r="10" stroke-width="2" />
						<path
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
				{:else}
					<svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<circle cx="11" cy="11" r="8" stroke-width="2" />
						<path d="m21 21-4.35-4.35" stroke-width="2" />
					</svg>
				{/if}
			</button>
		</div>

		<div class="search-hint">
			<span class="hint-text">Press Enter to search • Ctrl+Enter for line breaks</span>
		</div>
	</div>
</form>

<style lang="scss">
	@use '../../../styles/mixins' as m;

	.search-form {
		width: 100%;
	}

	.search-input-container {
		position: relative;
	}

	.input-wrapper {
		position: relative;
		display: flex;
		align-items: flex-end;
		background-color: white;
		border: 2px solid m.color(gray, 300);
		border-radius: m.radius(xl);
		transition: all m.transition(normal);
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);

		&:focus-within {
			border-color: m.color(primary, 500);
			box-shadow:
				0 10px 15px -3px rgba(0, 0, 0, 0.1),
				0 4px 6px -2px rgba(0, 0, 0, 0.05),
				0 0 0 3px rgba(59, 130, 246, 0.1);
		}

		&:hover:not(:focus-within) {
			border-color: m.color(gray, 400);
		}
	}

	.search-textarea {
		flex: 1;
		min-height: 3.5rem;
		max-height: 12rem;
		padding: m.space(4) m.space(5);
		border: none;
		outline: none;
		resize: none;
		font-size: m.font-size(lg);
		line-height: 1.5;
		background: transparent;
		color: m.color(gray, 900);

		&::placeholder {
			color: m.color(gray, 500);
		}

		&.disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}

		// Remove default textarea styling
		&::-webkit-scrollbar {
			width: 6px;
		}

		&::-webkit-scrollbar-track {
			background: m.color(gray, 100);
			border-radius: m.radius(full);
		}

		&::-webkit-scrollbar-thumb {
			background: m.color(gray, 300);
			border-radius: m.radius(full);

			&:hover {
				background: m.color(gray, 400);
			}
		}
	}

	.search-button {
		position: absolute;
		right: m.space(3);
		bottom: m.space(3);
		width: 2.5rem;
		height: 2.5rem;
		border: none;
		border-radius: m.radius(lg);
		background-color: m.color(primary, 600);
		color: white;
		cursor: pointer;
		transition: all m.transition(fast);
		display: flex;
		align-items: center;
		justify-content: center;

		&:hover:not(:disabled) {
			background-color: m.color(primary, 700);
			transform: translateY(-1px);
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
		}

		&:active:not(:disabled) {
			transform: translateY(0);
		}

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
			transform: none;
		}

		&.disabled {
			background-color: m.color(gray, 400);
		}
	}

	.button-icon {
		width: 1.25rem;
		height: 1.25rem;
		stroke-width: 2;

		&.loading {
			animation: spin 1s linear infinite;
		}
	}

	.search-hint {
		margin-top: m.space(2);
		text-align: right;
	}

	.hint-text {
		font-size: m.font-size(sm);
		color: m.color(gray, 500);
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	// Responsive design
	@media (max-width: 768px) {
		.search-button {
			right: m.space(2);
			bottom: m.space(2);
			width: 2.25rem;
			height: 2.25rem;
		}

		.search-textarea {
			padding: m.space(3) m.space(4);
			padding-right: m.space(12); // Make room for button
			font-size: m.font-size(base);
		}

		.button-icon {
			width: 1.125rem;
			height: 1.125rem;
		}
	}
</style>
