<script lang="ts">
	/**
	 * Feed results component - displays persistent search entries with clean search UI style
	 */

	// Props using Svelte 5 runes
	interface Props {
		searchEntries: Array<{
			id: string;
			query: string;
			response: string;
			metadata: any;
			timestamp: Date;
			isStreaming: boolean;
		}>;
	}

	let { searchEntries }: Props = $props();
</script>

<div class="feed-results">
	{#each searchEntries as entry (entry.id)}
		<div class="search-entry" class:streaming={entry.isStreaming}>
			<!-- User query section -->
			<div class="user-query">
				<h3 class="query-label">You said:</h3>
				<p class="query-text">"{entry.query}"</p>
				<span class="query-timestamp">
					{entry.timestamp.toLocaleTimeString('en-US', {
						hour: '2-digit',
						minute: '2-digit'
					})}
				</span>
			</div>

			<!-- AI response section -->
			<div class="response-section">
				<h3 class="response-label">Answer:</h3>
				<div class="response-content">
					<div class="response-text">
						{entry.response}
						{#if entry.isStreaming}
							<span class="typing-cursor">|</span>
						{/if}
					</div>

					<!-- Metadata display (only after streaming is complete) -->
					{#if entry.metadata && !entry.isStreaming}
						<div class="response-metadata">
							<span class="metadata-item timestamp">
								{entry.timestamp.toLocaleTimeString('en-US', {
									hour: '2-digit',
									minute: '2-digit',
									second: '2-digit'
								})}
							</span>

							{#if entry.metadata.intent}
								<span class="metadata-separator">•</span>
								<span class="metadata-item intent-badge">
									Intent: {entry.metadata.intent}
									{#if entry.metadata.confidence_score !== undefined}
										<span class="confidence-score">
											({(entry.metadata.confidence_score * 100).toFixed(2)}%)
										</span>
									{/if}
								</span>
							{/if}

							{#if entry.metadata.session_context && Object.keys(entry.metadata.session_context).length > 0}
								<span class="metadata-separator">•</span>
								<span class="metadata-item context-info">
									Context: {Object.keys(entry.metadata.session_context).join(', ')}
								</span>
							{/if}

							{#if entry.metadata.processing_time_ms}
								<span class="metadata-separator">•</span>
								<span class="metadata-item processing-time">
									{entry.metadata.processing_time_ms}ms
								</span>
							{/if}

							{#if entry.metadata.error}
								<span class="metadata-separator">•</span>
								<span class="metadata-item error-info">
									<svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										></path>
									</svg>
									Error: {entry.metadata.error}
								</span>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/each}
</div>

<style lang="scss">
	@use '../../../styles/mixins' as m;

	.feed-results {
		display: flex;
		flex-direction: column;
		gap: m.space(8);
	}

	.search-entry {
		animation: slideIn 0.3s ease-out;

		&:not(:last-child) {
			border-bottom: 1px solid m.color(gray, 200);
			padding-bottom: m.space(8);
		}

		&.streaming {
			.response-content {
				background: linear-gradient(
					90deg,
					rgba(59, 130, 246, 0.05) 0%,
					rgba(59, 130, 246, 0.02) 50%,
					rgba(59, 130, 246, 0.05) 100%
				);
				background-size: 200% 100%;
				animation: shimmer 2s ease-in-out infinite;
			}
		}
	}

	.user-query {
		margin-bottom: m.space(6);
		padding: m.space(4);
		background-color: m.color(gray, 50);
		border-radius: m.radius(lg);
		border-left: 4px solid m.color(primary, 500);
		position: relative;
	}

	.query-label {
		font-size: m.font-size(sm);
		font-weight: m.font-weight(medium);
		color: m.color(gray, 600);
		margin-bottom: m.space(2);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.query-text {
		font-size: m.font-size(lg);
		color: m.color(gray, 900);
		font-style: italic;
		margin-bottom: m.space(2);
		line-height: 1.5;
	}

	.query-timestamp {
		position: absolute;
		top: m.space(3);
		right: m.space(4);
		font-size: m.font-size(xs);
		color: m.color(gray, 500);
		font-family:
			'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
	}

	.response-section {
		margin-bottom: m.space(4);
	}

	.response-label {
		font-size: m.font-size(sm);
		font-weight: m.font-weight(medium);
		color: m.color(gray, 600);
		margin-bottom: m.space(3);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.response-content {
		// Clean, borderless styling
	}

	.response-text {
		font-size: m.font-size(base);
		line-height: 1.7;
		color: m.color(gray, 900);
		white-space: pre-wrap;
		word-wrap: break-word;
	}

	.typing-cursor {
		display: inline-block;
		animation: blink 1s infinite;
		color: m.color(primary, 600);
		font-weight: normal;
		margin-left: 2px;
	}

	.response-metadata {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: m.space(2);
		margin-top: m.space(4);
		font-size: m.font-size(xs);
		color: m.color(gray, 400);
		opacity: 0.5;
	}

	.metadata-item {
		display: flex;
		align-items: center;
		gap: m.space(1);
	}

	.metadata-separator {
		color: m.color(gray, 400);
		display: none;

		@include m.responsive(sm) {
			display: inline;
		}
	}

	.timestamp {
		font-family:
			'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
		font-weight: m.font-weight(medium);
	}

	.intent-badge {
		font-weight: m.font-weight(medium);
	}

	.confidence-score {
		font-weight: m.font-weight(normal);
		margin-left: m.space(1);
	}

	.context-info {
		font-weight: m.font-weight(medium);
	}

	.processing-time {
		font-weight: m.font-weight(medium);
		font-family:
			'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
	}

	.error-info {
		font-weight: m.font-weight(medium);
		color: m.color(red, 500);
	}

	.error-icon {
		width: 0.875rem;
		height: 0.875rem;
		flex-shrink: 0;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(1rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
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

	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	// Responsive adjustments
	@media (max-width: 768px) {
		.query-timestamp {
			position: static;
			display: block;
			margin-top: m.space(2);
		}

		.response-metadata {
			flex-direction: column;
			align-items: flex-start;
			gap: m.space(2);
		}

		.metadata-separator {
			display: none !important;
		}
	}
</style>
