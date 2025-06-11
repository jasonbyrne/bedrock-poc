<script lang="ts">
	/**
	 * Streaming response component that displays text with typing effect
	 */

	// Props using Svelte 5 runes
	interface Props {
		text: string;
		isStreaming?: boolean;
	}

	let { text, isStreaming = false }: Props = $props();
</script>

<div class="streaming-response">
	<div class="response-text">
		{text}
		{#if isStreaming}
			<span class="typing-cursor">|</span>
		{/if}
	</div>
</div>

<style lang="scss">
	@use '../../../styles/mixins' as m;

	.streaming-response {
		min-height: 1.5rem; // Prevent layout shift
	}

	.response-text {
		font-size: m.font-size(lg);
		line-height: 1.7;
		color: m.color(gray, 900);
		white-space: pre-wrap; // Preserve formatting
		word-wrap: break-word;

		// Enhanced typography for better readability
		font-weight: 400;
		letter-spacing: 0.01em;

		// Improve text rendering
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-rendering: optimizeLegibility;

		// Ensure proper spacing
		margin: 0;
		padding: 0;
	}

	.typing-cursor {
		display: inline-block;
		animation: blink 1s infinite;
		color: m.color(primary, 600);
		font-weight: normal;
		margin-left: 1px;
	}

	@keyframes blink {
		0%,
		50% {
			opacity: 1;
		}
		51%,
		100% {
			opacity: 0;
		}
	}

	// Responsive typography
	@media (max-width: 768px) {
		.response-text {
			font-size: m.font-size(base);
			line-height: 1.6;
		}
	}

	// Dark mode support (if needed in the future)
	@media (prefers-color-scheme: dark) {
		.response-text {
			color: m.color(gray, 100);
		}

		.typing-cursor {
			color: m.color(primary, 400);
		}
	}
</style>
