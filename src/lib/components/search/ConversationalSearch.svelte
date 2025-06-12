<script lang="ts">
	/**
	 * Conversational search interface component
	 * Features: Large search input at top, streaming response below
	 */

	import { tick } from 'svelte';
	import SearchInput from './SearchInput.svelte';
	import StreamingResponse from './StreamingResponse.svelte';
	import type { ChatMessageLike as ChatMessageType } from '$lib/types/chatTypes.js';
	import { sessionAwareApi } from '$lib/stores/sessionStore.js';
	import { authToken } from '$lib/stores/authStore.js';

	// Search state using Svelte 5 runes
	let sessionId = $state<string>('');
	let currentResponse = $state<string>('');
	let responseMetadata = $state<any>(null);
	let isLoading = $state(false);
	let isStreaming = $state(false);
	let initializationError = $state<string | null>(null);
	let hasInitialized = $state(false);
	let lastUserQuery = $state<string>('');
	let lastResponseTimestamp = $state<Date | null>(null);

	// Wait for auth token to be available, then initialize session
	$effect(() => {
		const token = $authToken;
		if (token && !hasInitialized && !initializationError) {
			hasInitialized = true;
			initializeSession();
		}
	});

	async function initializeSession(): Promise<void> {
		try {
			isLoading = true;
			initializationError = null;

			const welcomeResponse = await sessionAwareApi.initializeChatSession();
			if (welcomeResponse) {
				sessionId = welcomeResponse.session_id;
			} else {
				// Session expiration is handled globally, just return
				return;
			}
		} catch (error) {
			console.error('Failed to initialize search session:', error);
			initializationError =
				error instanceof Error ? error.message : 'Failed to start search session';
		} finally {
			isLoading = false;
		}
	}

	async function handleSearch(query: string): Promise<void> {
		if (!query.trim() || isLoading || isStreaming) {
			return;
		}

		try {
			isLoading = true;
			lastUserQuery = query;

			// Clear previous response when starting new search
			currentResponse = '';
			responseMetadata = null;
			lastResponseTimestamp = null;

			// If no session, try to initialize
			if (!sessionId) {
				await initializeSession();
				if (!sessionId) {
					throw new Error('Unable to initialize search session');
				}
			}

			// Send search query to API
			const response = await sessionAwareApi.sendMessage(sessionId, query);

			if (response) {
				// Store metadata and timestamp
				responseMetadata = response.message.metadata;
				lastResponseTimestamp = new Date(response.message.timestamp);

				// Start streaming the response
				isLoading = false;
				isStreaming = true;
				await streamResponse(response.message.content);
			} else {
				// Session expiration is handled globally, just clean up loading state
				isLoading = false;
				isStreaming = false;
				return;
			}
		} catch (error) {
			console.error('Error processing search:', error);
			isLoading = false;
			isStreaming = false;
			currentResponse =
				'I apologize, but I encountered an error processing your search. Please try again.';
			responseMetadata = { error: 'Processing failed' };
			lastResponseTimestamp = new Date();
		}
	}

	async function streamResponse(text: string): Promise<void> {
		currentResponse = '';
		const chars = text.split('');

		for (let i = 0; i < chars.length; i++) {
			// Add small delay between characters for streaming effect
			await new Promise((resolve) => setTimeout(resolve, 15));
			currentResponse += chars[i];
		}

		isStreaming = false;
	}
</script>

<div class="conversational-search">
	<!-- Fixed search input at top -->
	<div class="search-header">
		<div class="search-container">
			<SearchInput
				onSearch={handleSearch}
				disabled={isLoading || isStreaming}
				placeholder="Ask about Medicare benefits, drug prices, or plan information..."
			/>

			{#if initializationError}
				<div class="error-message">
					<svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						></path>
					</svg>
					<span>Error: {initializationError}</span>
				</div>
			{/if}
		</div>
	</div>

	<!-- Response area -->
	<div class="response-area">
		<div class="response-container">
			{#if isLoading}
				<div class="loading-state">
					<div class="loading-spinner"></div>
					<p class="loading-text">Searching...</p>
				</div>
			{:else if currentResponse || isStreaming}
				<div class="response-content">
					{#if lastUserQuery}
						<div class="user-query">
							<h3 class="query-label">You asked:</h3>
							<p class="query-text">"{lastUserQuery}"</p>
						</div>
					{/if}

					<div class="response-section">
						<h3 class="response-label">Answer:</h3>
						<StreamingResponse text={currentResponse} {isStreaming} />

						<!-- Response metadata for debugging -->
						{#if (responseMetadata || lastResponseTimestamp) && !isStreaming}
							<div class="response-metadata">
								{#if lastResponseTimestamp}
									<span class="metadata-item timestamp">
										{lastResponseTimestamp.toLocaleTimeString('en-US', {
											hour: '2-digit',
											minute: '2-digit',
											second: '2-digit'
										})}
									</span>
								{/if}

								{#if responseMetadata?.intent}
									<span class="metadata-separator">•</span>
									<span class="metadata-item intent-badge">
										Intent: {responseMetadata.intent}
										{#if responseMetadata?.confidence_score !== undefined}
											<span class="confidence-score">
												({(responseMetadata.confidence_score * 100).toFixed(2)}%)
											</span>
										{/if}
									</span>
								{/if}

								{#if responseMetadata?.session_context && Object.keys(responseMetadata.session_context).length > 0}
									<span class="metadata-separator">•</span>
									<span class="metadata-item context-info">
										Context: {Object.keys(responseMetadata.session_context).join(', ')}
									</span>
								{/if}

								{#if responseMetadata?.processing_time_ms}
									<span class="metadata-separator">•</span>
									<span class="metadata-item processing-time">
										{responseMetadata.processing_time_ms}ms
									</span>
								{/if}

								{#if responseMetadata?.error}
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
										Error: {responseMetadata.error}
									</span>
								{/if}
							</div>
						{/if}

						<!-- Placeholder for future data cards -->
						<div class="data-cards-placeholder">
							<!-- Future: Data cards will be inserted here -->
						</div>
					</div>
				</div>
			{:else}
				<div class="empty-state">
					<div class="empty-content">
						<svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							></path>
						</svg>
						<h3 class="empty-title">Ready to help with your Medicare questions</h3>
						<p class="empty-description">
							Ask about Part D coverage, find nearby pharmacies, compare drug prices, or get help
							with your benefits.
						</p>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	@use '../../../styles/mixins' as m;

	.conversational-search {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: calc(100vh - 4rem); // Account for header
		padding-top: 4rem; // Add padding to account for fixed header
	}

	.search-header {
		position: sticky;
		top: 4rem; // Account for fixed header (4rem = 64px)
		z-index: 10;
		background-color: white;
		border-bottom: 1px solid m.color(gray, 200);
		padding: m.space(6) 0;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
	}

	.search-container {
		max-width: 48rem;
		margin: 0 auto;
		padding: 0 m.space(4);
	}

	.error-message {
		display: flex;
		align-items: center;
		gap: m.space(2);
		margin-top: m.space(3);
		padding: m.space(3);
		background-color: m.color(red, 50);
		border: 1px solid m.color(red, 200);
		border-radius: m.radius(md);
		color: m.color(red, 800);
		font-size: m.font-size(sm);
	}

	.error-icon {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}

	.response-area {
		flex: 1;
		overflow-y: auto;
		padding: m.space(6) 0;
	}

	.response-container {
		max-width: 48rem;
		margin: 0 auto;
		padding: 0 m.space(4);
	}

	.loading-state {
		text-align: center;
		padding: m.space(8) 0;
	}

	.loading-spinner {
		animation: spin 1s linear infinite;
		border-radius: m.radius(full);
		height: 2rem;
		width: 2rem;
		border: 2px solid transparent;
		border-bottom-color: m.color(primary, 600);
		margin: 0 auto m.space(4);
	}

	.loading-text {
		color: m.color(gray, 600);
		font-size: m.font-size(lg);
	}

	.response-content {
		animation: fadeIn 0.3s ease-in;
	}

	.user-query {
		margin-bottom: m.space(6);
		padding: m.space(4);
		background-color: m.color(gray, 50);
		border-radius: m.radius(lg);
		border-left: 4px solid m.color(primary, 500);
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
	}

	.response-section {
		margin-bottom: m.space(6);
	}

	.response-label {
		font-size: m.font-size(sm);
		font-weight: m.font-weight(medium);
		color: m.color(gray, 600);
		margin-bottom: m.space(3);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.response-metadata {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: m.space(2);
		margin-top: m.space(4);
		padding: m.space(3);
		background-color: m.color(gray, 50);
		border-radius: m.radius(lg);
		border: 1px solid m.color(gray, 200);
		font-size: m.font-size(xs);
		color: m.color(gray, 600);
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
		background-color: m.color(gray, 200);
		padding: m.space(1) m.space(2);
		border-radius: m.radius(md);
		font-size: m.font-size(xs);
	}

	.intent-badge {
		background-color: m.color(blue, 100);
		color: m.color(blue, 700);
		padding: m.space(1) m.space(2);
		border-radius: m.radius(full);
		font-weight: m.font-weight(medium);
	}

	.confidence-score {
		color: m.color(blue, 500);
		font-weight: m.font-weight(normal);
		margin-left: m.space(1);
	}

	.context-info {
		background-color: m.color(green, 100);
		color: m.color(green, 700);
		padding: m.space(1) m.space(2);
		border-radius: m.radius(full);
		font-weight: m.font-weight(medium);
	}

	.processing-time {
		background-color: m.color(purple, 100);
		color: m.color(purple, 700);
		padding: m.space(1) m.space(2);
		border-radius: m.radius(full);
		font-weight: m.font-weight(medium);
		font-family:
			'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
	}

	.error-info {
		background-color: m.color(red, 100);
		color: m.color(red, 700);
		padding: m.space(1) m.space(2);
		border-radius: m.radius(full);
		font-weight: m.font-weight(medium);
	}

	.error-icon {
		width: 0.875rem;
		height: 0.875rem;
		flex-shrink: 0;
	}

	.data-cards-placeholder {
		margin-top: m.space(6);
		// Future: Styles for data cards will go here
	}

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 20rem;
		padding: m.space(8) 0;
	}

	.empty-content {
		text-align: center;
		max-width: 24rem;
	}

	.empty-icon {
		width: 3rem;
		height: 3rem;
		color: m.color(gray, 400);
		margin: 0 auto m.space(4);
	}

	.empty-title {
		font-size: m.font-size(xl);
		font-weight: m.font-weight(semibold);
		color: m.color(gray, 900);
		margin-bottom: m.space(2);
	}

	.empty-description {
		color: m.color(gray, 600);
		line-height: 1.6;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(1rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	// Responsive metadata display
	@media (max-width: 768px) {
		.response-metadata {
			flex-direction: column;
			align-items: flex-start;
			gap: m.space(2);
		}

		.metadata-separator {
			display: none !important;
		}

		.metadata-item {
			font-size: m.font-size(xs);
		}
	}
</style>
