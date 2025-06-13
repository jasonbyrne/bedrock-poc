<script lang="ts">
	/**
	 * Individual chat message component
	 */

	import type { ChatMessageLike as ChatMessage } from '$lib/types/chatTypes.js';

	interface Props {
		message: ChatMessage;
	}

	let { message }: Props = $props();

	// Format timestamp for display
	let formattedTime = $derived.by(() => {
		const timestamp =
			message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp);
		return timestamp.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit'
		});
	});

	// Determine if message is from user
	let isUser = $derived(message.role === 'user');
</script>

<div class="message-container {isUser ? 'message-user' : 'message-assistant'}">
	{#if !isUser}
		<!-- Assistant Avatar -->
		<div class="avatar assistant-avatar">
			<svg class="avatar-icon" fill="none" stroke="#fff" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
				></path>
			</svg>
		</div>
	{/if}

	<div class="message-content">
		<!-- Message bubble -->
		<div class="message-bubble {isUser ? 'user-bubble' : 'assistant-bubble'}">
			{#if message.is_typing}
				<!-- Typing indicator -->
				<div class="typing-indicator">
					<div class="typing-dots">
						<div class="typing-dot"></div>
						<div class="typing-dot" style="animation-delay: 0.15s"></div>
						<div class="typing-dot" style="animation-delay: 0.3s"></div>
					</div>
					<span class="typing-text">Assistant is typing...</span>
				</div>
			{:else}
				<!-- Message content -->
				<div class="message-text">
					{message.content}
				</div>
			{/if}
		</div>

		<!-- Message metadata -->
		{#if !message.is_typing}
			<div class="message-metadata {isUser ? 'metadata-user' : 'metadata-assistant'}">
				<span class="timestamp">{formattedTime}</span>

				{#if message.metadata?.intent && !isUser}
					<span class="metadata-separator">•</span>
					<span class="intent-badge">
						{message.metadata.intent}
						{#if message.metadata?.confidence_score !== undefined}
							<span class="confidence-score"
								>{(message.metadata.confidence_score * 100).toFixed(2)}%</span
							>
						{/if}
					</span>
				{/if}

				{#if isUser}
					<svg class="sent-indicator" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"
						></path>
					</svg>
				{/if}
			</div>
		{/if}

		<!-- Error indicator -->
		{#if message.metadata?.error}
			<div class="error-indicator">
				<svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					></path>
				</svg>
				<span>Error: {message.metadata.error}</span>
			</div>
		{/if}
	</div>

	{#if isUser}
		<!-- User Avatar -->
		<div class="avatar user-avatar">
			<svg class="avatar-icon" fill="none" stroke="#fff" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
				></path>
			</svg>
		</div>
	{/if}
</div>

<style lang="scss">
	@use '../../../styles/mixins' as m;

	.message-container {
		display: flex;
		align-items: flex-start;
		gap: m.space(3);
		animation: fadeIn 0.3s ease-in-out;

		&.message-user {
			justify-content: flex-end;
			color: #fff;
		}

		&.message-assistant {
			justify-content: flex-start;
		}
	}

	.avatar {
		flex-shrink: 0;
		width: 2rem;
		height: 2rem;
		border-radius: m.radius(full);
		@include m.flex-center;
	}

	.assistant-avatar {
		background-color: m.color(secondary, 600);
	}

	.user-avatar {
		background-color: m.color(primary, 600);
	}

	.avatar-icon {
		width: 1.25rem;
		height: 1.25rem;
		color: m.color(white);
	}

	.message-content {
		display: flex;
		flex-direction: column;
		gap: m.space(2);
		max-width: 20rem;

		@include m.responsive(lg) {
			max-width: 28rem;
		}
	}

	.message-bubble {
		padding: m.space(4);
		border-radius: m.radius(2xl);
		box-shadow: m.shadow(sm);
	}

	.user-bubble {
		background-color: m.color(primary, 600);
		color: m.color(white);
		border-bottom-right-radius: m.radius(sm);

		.message-text {
			color: m.color(white);
		}
	}

	.assistant-bubble {
		background-color: m.color(white);
		color: m.color(gray, 900);
		border: 1px solid m.color(gray, 200);
		border-bottom-left-radius: m.radius(sm);
	}

	.message-text {
		font-size: m.font-size(sm);
		line-height: m.line-height(relaxed);
		white-space: pre-wrap;
		word-break: break-words;
	}

	.typing-indicator {
		display: flex;
		align-items: center;
		gap: m.space(2);
	}

	.typing-dots {
		display: flex;
		gap: m.space(1);
	}

	.typing-dot {
		width: 0.5rem;
		height: 0.5rem;
		background-color: m.color(gray, 400);
		border-radius: m.radius(full);
		animation: typingPulse 1.4s ease-in-out infinite both;
	}

	.typing-text {
		font-size: m.font-size(sm);
		color: m.color(gray, 500);
	}

	.message-metadata {
		display: flex;
		align-items: center;
		gap: m.space(2);
		font-size: m.font-size(xs);
		color: m.color(gray, 500);

		&.metadata-user {
			justify-content: flex-end;
		}

		&.metadata-assistant {
			justify-content: flex-start;
		}
	}

	.timestamp {
		color: var(--text-secondary);
		font-size: 0.75rem;
		margin-top: 0.25rem;
	}

	.metadata-separator {
		display: none;

		@include m.responsive(sm) {
			display: inline;
		}
	}

	.intent-badge {
		display: none;
		background-color: m.color(blue, 100);
		color: m.color(blue, 700);
		padding: m.space(1) m.space(2);
		border-radius: m.radius(full);
		font-size: m.font-size(xs);
		font-weight: m.font-weight(medium);

		@include m.responsive(sm) {
			display: inline;
		}
	}

	.confidence-score {
		font-size: m.font-size(xs);
		color: m.color(blue, 500);
		margin-left: m.space(1);
		font-weight: m.font-weight(normal);
	}

	.sent-indicator {
		width: 1rem;
		height: 1rem;
		color: m.color(primary, 600);
	}

	.error-indicator {
		display: flex;
		align-items: center;
		gap: m.space(2);
		font-size: m.font-size(xs);
		color: m.color(red, 600);
		background-color: m.color(red, 50);
		padding: m.space(3);
		border-radius: m.radius(lg);
	}

	.error-icon {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes typingPulse {
		0%,
		80%,
		100% {
			transform: scale(0);
		}
		40% {
			transform: scale(1);
		}
	}
</style>
