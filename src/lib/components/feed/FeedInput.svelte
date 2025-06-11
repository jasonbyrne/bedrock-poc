<script lang="ts">
	/**
	 * Feed input component - identical to ChatInput for consistency
	 */

	import Button from '../ui/Button.svelte';

	interface Props {
		onSearch: (query: string) => void;
		disabled?: boolean;
		placeholder?: string;
	}

	let { onSearch, disabled = false, placeholder = 'Ask anything...' }: Props = $props();

	// Input state using Svelte 5 runes
	let message = $state('');
	let textareaElement: HTMLTextAreaElement;

	// Check if message can be sent
	let canSend = $derived(message.trim().length > 0 && !disabled);

	// Generate unique ID for focusing
	const textareaId = `feed-input-${Math.random().toString(36).substr(2, 9)}`;

	function handleSend(): void {
		if (!canSend || !onSearch) return;

		const messageToSend = message.trim();
		message = ''; // Clear input

		// Reset textarea height and maintain focus
		if (textareaElement) {
			textareaElement.style.height = 'auto';
		}

		onSearch(messageToSend);
	}

	function handleKeyDown(event: KeyboardEvent): void {
		// Send on Enter (but not Shift+Enter)
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSend();
		}
	}

	function handleInput(): void {
		// Auto-resize textarea
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

<div class="chat-input-container">
	<div class="chat-input-wrapper">
		<div class="input-group">
			<!-- Message input -->
			<div class="textarea-container">
				<textarea
					id={textareaId}
					bind:this={textareaElement}
					bind:value={message}
					{placeholder}
					{disabled}
					rows="2"
					class="chat-textarea"
					onkeydown={handleKeyDown}
					oninput={handleInput}
				></textarea>
			</div>

			<!-- Send button -->
			<div class="send-button-container">
				<Button variant="primary" size="lg" disabled={!canSend} onclick={handleSend}>
					<svg class="send-icon" fill="none" stroke="#fff" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
						></path>
					</svg>
					<span class="sr-only">Send message</span>
				</Button>
			</div>
		</div>

		<!-- Helper text -->
		<div class="helper-text">Press Enter to search, Shift+Enter for new line</div>
	</div>
</div>

<style lang="scss">
	@use '../../../styles/mixins' as m;

	.chat-input-wrapper {
		max-width: 64rem;
		margin: 0 auto;
	}

	.input-group {
		display: flex;
		align-items: stretch;
		gap: m.space(3);
	}

	.textarea-container {
		flex: 1;
	}

	.chat-textarea {
		display: block;
		width: 100%;
		resize: none;
		border: 1px solid m.color(gray, 300);
		border-radius: m.radius(lg);
		padding: m.space(3);
		font-size: m.font-size(sm);
		line-height: m.line-height(normal);
		color: m.color(gray, 900);
		background-color: m.color(white);
		transition:
			border-color m.transition(fast),
			box-shadow m.transition(fast);
		max-height: 120px;
		min-height: 60px;

		&::placeholder {
			color: m.color(gray, 400);
		}

		&:focus {
			outline: none;
			border-color: m.color(primary, 600);
			box-shadow: 0 0 0 3px m.color(primary, 100);
		}

		&:disabled {
			background-color: m.color(gray, 50);
			color: m.color(gray, 500);
			cursor: not-allowed;
		}
	}

	.send-button-container {
		flex-shrink: 0;
		display: flex;
		align-items: flex-start;
	}

	.send-icon {
		width: 1rem;
		height: 1rem;
		color: m.color(white);
	}

	.helper-text {
		margin-top: m.space(2);
		font-size: m.font-size(xs);
		color: m.color(gray, 500);
	}
</style>
