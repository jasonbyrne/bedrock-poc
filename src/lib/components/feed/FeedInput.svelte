<script lang="ts">
	/**
	 * Compact feed input component for bottom placement
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
			// Reset textarea height
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

<form class="feed-input-form" onsubmit={handleSubmit}>
	<div class="input-wrapper">
		<textarea
			bind:this={textareaElement}
			bind:value={searchValue}
			class="feed-textarea"
			class:disabled
			{placeholder}
			rows="1"
			{disabled}
			oninput={handleInput}
			onkeydown={handleKeyDown}
		></textarea>

		<button
			type="submit"
			class="submit-button"
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
					<path
						d="m5 12 4-4m0 0L9 4m0 4H1"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			{/if}
		</button>
	</div>

	<div class="input-hint">
		<span class="hint-text">Press Enter to search • Ctrl+Enter for line breaks</span>
	</div>
</form>

<style lang="scss">
	@use '../../../styles/mixins' as m;

	.feed-input-form {
		width: 100%;
	}

	.input-wrapper {
		position: relative;
		display: flex;
		align-items: flex-end;
		background-color: white;
		border: 2px solid m.color(gray, 300);
		border-radius: m.radius(xl);
		transition: all m.transition(normal);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

		&:focus-within {
			border-color: m.color(primary, 500);
			box-shadow:
				0 4px 6px rgba(0, 0, 0, 0.1),
				0 0 0 3px rgba(59, 130, 246, 0.1);
		}

		&:hover:not(:focus-within) {
			border-color: m.color(gray, 400);
		}
	}

	.feed-textarea {
		flex: 1;
		min-height: 2.75rem;
		max-height: 8rem;
		padding: m.space(3) m.space(4);
		border: none;
		outline: none;
		resize: none;
		font-size: m.font-size(base);
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

		// Custom scrollbar
		&::-webkit-scrollbar {
			width: 4px;
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

	.submit-button {
		position: absolute;
		right: m.space(2);
		bottom: m.space(2);
		width: 2.25rem;
		height: 2.25rem;
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
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
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
		width: 1.125rem;
		height: 1.125rem;
		stroke-width: 2;

		&.loading {
			animation: spin 1s linear infinite;
		}
	}

	.input-hint {
		margin-top: m.space(2);
		text-align: center;
	}

	.hint-text {
		font-size: m.font-size(xs);
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
		.submit-button {
			right: m.space(1.5);
			bottom: m.space(1.5);
			width: 2rem;
			height: 2rem;
		}

		.feed-textarea {
			padding: m.space(2.5) m.space(3);
			padding-right: m.space(10); // Make room for button
			font-size: m.font-size(sm);
		}

		.button-icon {
			width: 1rem;
			height: 1rem;
		}
	}
</style>
