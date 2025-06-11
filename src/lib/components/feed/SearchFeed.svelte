<script lang="ts">
	/**
	 * Search feed interface with bottom input and persistent results
	 */

	import { tick } from 'svelte';
	import FeedInput from './FeedInput.svelte';
	import FeedResults from './FeedResults.svelte';
	import type { ChatMessageLike as ChatMessageType } from '$lib/types/chatTypes.js';
	import { initializeChatSession, sendMessage } from '$lib/services/chatbotApi.js';
	import { authToken } from '$lib/stores/authStore.js';

	// Feed state using Svelte 5 runes
	let sessionId = $state<string>('');
	let searchEntries = $state<
		Array<{
			id: string;
			query: string;
			response: string;
			metadata: any;
			timestamp: Date;
			isStreaming: boolean;
		}>
	>([]);
	let isLoading = $state(false);
	let initializationError = $state<string | null>(null);
	let hasInitialized = $state(false);

	// Scroll management
	let resultsScrollArea: HTMLDivElement;

	// Wait for auth token to be available, then initialize session
	$effect(() => {
		const token = $authToken;
		if (token && !hasInitialized && !initializationError) {
			hasInitialized = true;
			initializeSession();
		}
	});

	// Auto-scroll when new entries are added or content changes
	$effect(() => {
		// This effect runs when searchEntries changes
		searchEntries;
		scrollToBottom();
	});

	async function initializeSession(): Promise<void> {
		try {
			isLoading = true;
			initializationError = null;

			const welcomeResponse = await initializeChatSession();
			sessionId = welcomeResponse.session_id;
		} catch (error) {
			console.error('Failed to initialize search session:', error);
			initializationError =
				error instanceof Error ? error.message : 'Failed to start search session';
		} finally {
			isLoading = false;
		}
	}

	async function handleSearch(query: string): Promise<void> {
		if (!query.trim() || isLoading) {
			return;
		}

		try {
			isLoading = true;

			// Create new entry with placeholder response
			const newEntry = {
				id: `entry_${Date.now()}`,
				query,
				response: '',
				metadata: null,
				timestamp: new Date(),
				isStreaming: true
			};

			// Add to entries array
			searchEntries = [...searchEntries, newEntry];

			const token = $authToken;
			if (!token) {
				throw new Error('No authentication token available');
			}

			// If no session, try to initialize
			if (!sessionId) {
				await initializeSession();
				if (!sessionId) {
					throw new Error('Unable to initialize search session');
				}
			}

			// Send search query to API
			const response = await sendMessage(sessionId, query);

			// Update the entry with response data
			const updatedEntries = searchEntries.map((entry) =>
				entry.id === newEntry.id
					? {
							...entry,
							response: response.message.content,
							metadata: response.message.metadata,
							timestamp: new Date(response.message.timestamp),
							isStreaming: false
						}
					: entry
			);

			// Start streaming effect
			isLoading = false;
			await streamResponseToEntry(newEntry.id, response.message.content, updatedEntries);
		} catch (error) {
			console.error('Error processing search:', error);
			isLoading = false;

			// Update entry with error
			searchEntries = searchEntries.map((entry) =>
				entry.id === searchEntries[searchEntries.length - 1].id
					? {
							...entry,
							response:
								'I apologize, but I encountered an error processing your search. Please try again.',
							metadata: { error: 'Processing failed' },
							isStreaming: false
						}
					: entry
			);
		}
	}

	async function streamResponseToEntry(
		entryId: string,
		text: string,
		finalEntries: typeof searchEntries
	): Promise<void> {
		const chars = text.split('');

		for (let i = 0; i < chars.length; i++) {
			// Add small delay between characters for streaming effect
			await new Promise((resolve) => setTimeout(resolve, 15));

			// Update the specific entry's response
			searchEntries = searchEntries.map((entry) =>
				entry.id === entryId ? { ...entry, response: chars.slice(0, i + 1).join('') } : entry
			);
		}

		// Finalize with complete data
		searchEntries = finalEntries.map((entry) =>
			entry.id === entryId ? { ...entry, isStreaming: false } : entry
		);
	}

	async function scrollToBottom(): Promise<void> {
		await tick();
		if (resultsScrollArea) {
			resultsScrollArea.scrollTo({
				top: resultsScrollArea.scrollHeight,
				behavior: 'smooth'
			});
		}
	}
</script>

<div class="search-feed">
	<!-- Results area - takes up remaining space -->
	<div class="results-area">
		<div bind:this={resultsScrollArea} class="results-scroll-area">
			<div class="results-container">
				{#if initializationError}
					<div class="error-state">
						<div class="error-content">
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
					</div>
				{:else if searchEntries.length === 0}
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
							<h3 class="empty-title">Start your search</h3>
							<p class="empty-description">
								Ask about Medicare Part D coverage, find nearby pharmacies, compare drug prices, or
								get help with your benefits.
							</p>
						</div>
					</div>
				{:else}
					<FeedResults {searchEntries} />
				{/if}
			</div>
		</div>
	</div>

	<!-- Fixed input at bottom of screen -->
	<div class="input-area">
		<div class="input-container">
			<FeedInput
				onSearch={handleSearch}
				disabled={isLoading}
				placeholder="Ask anything about your Medicare Part D coverage, pharmacy locations, or drug pricing..."
			/>
		</div>
	</div>
</div>

<style lang="scss">
	@use '../../../styles/mixins' as m;

	.search-feed {
		position: fixed;
		top: 4rem; // Below header
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		flex-direction: column;
		background-color: m.color(gray, 50);
	}

	.results-area {
		flex: 1;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		margin-bottom: 120px; // Make room for fixed input area
	}

	.results-scroll-area {
		flex: 1;
		overflow-y: auto;
		padding: m.space(6) 0;
	}

	.results-container {
		max-width: 48rem;
		margin: 0 auto;
		padding: 0 m.space(4);
	}

	.error-state {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 12rem;
		padding: m.space(8) 0;
	}

	.error-content {
		display: flex;
		align-items: center;
		gap: m.space(2);
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

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
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

	.input-area {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: white;
		border-top: 1px solid m.color(gray, 200);
		box-shadow: 0 -2px 8px 0 rgba(0, 0, 0, 0.1);
		padding: m.space(4) 0;
		z-index: 100;
	}

	.input-container {
		max-width: 48rem;
		margin: 0 auto;
		padding: 0 m.space(4);
	}
</style>
