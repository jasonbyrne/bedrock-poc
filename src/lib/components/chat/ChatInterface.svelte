<script lang="ts">
	/**
	 * Main chat interface component
	 */

	import ChatMessage from './ChatMessage.svelte';
	import ChatInput from './ChatInput.svelte';
	import { tick } from 'svelte';
	import type {
		ChatMessageLike as ChatMessageType,
		ConversationState
	} from '$lib/types/chatTypes.js';
	import { sessionAwareApi } from '$lib/stores/sessionStore.js';
	import { authToken } from '$lib/stores/authStore.js';

	// Chat state using Svelte 5 runes
	let conversationState = $state({
		session_id: '',
		messages: [] as ChatMessageType[],
		is_loading: false,
		last_activity: new Date()
	});
	let initializationError = $state<string | null>(null);
	let hasInitialized = $state(false);

	// Scroll management
	let messagesScrollArea: HTMLDivElement;

	// Wait for auth token to be available, then initialize session
	$effect(() => {
		const token = $authToken;
		if (token && !hasInitialized && !initializationError) {
			hasInitialized = true;
			initializeChat();
		}
	});

	// Auto-scroll when new messages are added
	$effect(() => {
		// This effect runs when messages change
		conversationState.messages;
		scrollToBottom();
	});

	async function initializeChat(): Promise<void> {
		try {
			conversationState.is_loading = true;
			initializationError = null;

			const welcomeResponse = await sessionAwareApi.initializeChatSession();
			if (welcomeResponse) {
				conversationState.session_id = welcomeResponse.session_id;

				// Ensure timestamp is a Date object
				const welcomeMessage = {
					...welcomeResponse.message,
					timestamp: new Date(welcomeResponse.message.timestamp)
				};
				conversationState.messages = [welcomeMessage];
				conversationState.last_activity = new Date();
			} else {
				// Session expiration is handled globally, just return
				return;
			}
		} catch (error) {
			console.error('Failed to initialize chat session:', error);
			initializationError = error instanceof Error ? error.message : 'Failed to start chat session';

			// Add fallback welcome message
			const fallbackMessage: ChatMessageType = {
				id: `msg_${Date.now()}`,
				content:
					'I apologize, but there was an issue starting our conversation. Please try refreshing the page.',
				role: 'assistant',
				timestamp: new Date(),
				metadata: {
					error: 'Initialization failed'
				}
			};
			conversationState.messages = [fallbackMessage];
		} finally {
			conversationState.is_loading = false;
		}
	}

	function addMessage(
		content: string,
		role: 'user' | 'assistant',
		metadata?: any
	): ChatMessageType {
		const message: ChatMessageType = {
			id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			content,
			role,
			timestamp: new Date(),
			metadata
		};

		conversationState.messages = [...conversationState.messages, message];
		conversationState.last_activity = new Date();

		return message;
	}

	function addTypingIndicator(): ChatMessageType {
		const typingMessage: ChatMessageType = {
			id: `typing_${Date.now()}`,
			content: '',
			role: 'assistant',
			timestamp: new Date(),
			is_typing: true
		};

		conversationState.messages = [...conversationState.messages, typingMessage];

		return typingMessage;
	}

	function removeTypingIndicator(): void {
		conversationState.messages = conversationState.messages.filter((msg) => !msg.is_typing);
	}

	async function scrollToBottom(): Promise<void> {
		await tick();
		if (messagesScrollArea) {
			messagesScrollArea.scrollTo({
				top: messagesScrollArea.scrollHeight,
				behavior: 'smooth'
			});
		}
	}

	async function handleMessage(message: string): Promise<void> {
		if (!message.trim() || conversationState.is_loading) {
			return;
		}

		try {
			conversationState.is_loading = true;

			// Add user message to chat
			const userMessage = addMessage(message, 'user');

			// If no session, try to initialize
			if (!conversationState.session_id) {
				await initializeChat();
				if (!conversationState.session_id) {
					throw new Error('Unable to initialize chat session');
				}
			}

			// Send message to API
			const response = await sessionAwareApi.sendMessage(conversationState.session_id, message);

			if (response) {
				// Add assistant response to chat
				const assistantMessage = addMessage(
					response.message.content,
					'assistant',
					response.message.metadata
				);
				conversationState.last_activity = new Date();
			} else {
				// Session expiration is handled globally, just clean up loading state
				conversationState.is_loading = false;
				return;
			}
		} catch (error) {
			console.error('Error sending message:', error);
			// Add error message to chat
			addMessage(
				'I apologize, but I encountered an error processing your message. Please try again.',
				'assistant',
				{ error: 'Processing failed' }
			);
		} finally {
			conversationState.is_loading = false;
		}
	}
</script>

<div class="chat-interface">
	<!-- Chat messages area -->
	<div class="messages-container">
		<div bind:this={messagesScrollArea} class="messages-scroll-area">
			<div class="messages-wrapper">
				{#if conversationState.messages.length === 0}
					{#if initializationError}
						<!-- Error state -->
						<div class="error-state">
							<div class="error-content">
								<div class="error-icon">
									<svg class="error-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										></path>
									</svg>
								</div>
								<p class="error-text">Failed to start chat session</p>
								<p class="error-message">{initializationError}</p>
								<button
									class="retry-button"
									onclick={() => {
										hasInitialized = false;
										initializationError = null;
									}}>Try Again</button
								>
							</div>
						</div>
					{:else if conversationState.is_loading}
						<!-- Loading state -->
						<div class="loading-state">
							<div class="loading-content">
								<div class="loading-icon">
									<svg class="chat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
										></path>
									</svg>
								</div>
								<p class="loading-text">Starting conversation...</p>
							</div>
						</div>
					{/if}
				{:else}
					<!-- Messages -->
					<div class="messages-list">
						{#each conversationState.messages as message (message.id)}
							<ChatMessage {message} />
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Input area -->
	<div class="input-area">
		<div class="input-wrapper">
			<ChatInput
				disabled={conversationState.is_loading ||
					!conversationState.session_id ||
					!!initializationError}
				placeholder="Ask about Medicare benefits, drug prices, or plan information..."
				onSendMessage={handleMessage}
			/>
		</div>
	</div>
</div>

<style lang="scss">
	@use '../../../styles/mixins' as m;

	.chat-interface {
		position: relative;
		height: 100vh;
		width: 100vw;
		overflow: hidden;
	}

	.messages-container {
		position: absolute;
		top: 64px; // height of header
		bottom: 96px; // height of input
		left: 0;
		right: 0;
		display: flex;
		flex-direction: column;
	}

	.messages-scroll-area {
		flex: 1;
		overflow-y: auto;
		min-height: 0;
	}

	.messages-wrapper {
		max-width: 64rem;
		margin: 0 auto;
		padding: m.space(4);
		padding-bottom: 40px;

		@include m.responsive(md) {
			padding: m.space(6);
			padding-bottom: 48px;
		}
	}

	.loading-state,
	.error-state {
		@include m.flex-center;
		padding: m.space(16) 0;
	}

	.loading-content,
	.error-content {
		text-align: center;
	}

	.loading-icon,
	.error-icon {
		width: 4rem;
		height: 4rem;
		margin: 0 auto m.space(4);
		border-radius: m.radius(full);
		@include m.flex-center;
	}

	.loading-icon {
		background-color: m.color(primary, 100);
	}

	.error-icon {
		background-color: m.color(red, 100);
	}

	.chat-icon {
		width: 2rem;
		height: 2rem;
		color: m.color(primary, 600);
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.error-svg {
		width: 2rem;
		height: 2rem;
		color: m.color(red, 600);
	}

	.loading-text {
		color: m.color(gray, 500);
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.error-text {
		color: m.color(gray, 900);
		font-weight: m.font-weight(semibold);
		margin-bottom: m.space(2);
	}

	.error-message {
		color: m.color(gray, 600);
		font-size: m.font-size(sm);
		margin-bottom: m.space(4);
	}

	.retry-button {
		@include m.button-primary;
		padding: m.space(2) m.space(4);
		font-size: m.font-size(sm);
	}

	.messages-list {
		display: flex;
		flex-direction: column;
		gap: m.space(6);
	}

	.input-area {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		border-top: 1px solid m.color(gray, 200);
		background-color: m.color(white);
		backdrop-filter: blur(8px);
		z-index: 10;
	}

	.input-wrapper {
		max-width: 64rem;
		margin: 0 auto;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
</style>
