<script lang="ts">
	/**
	 * Header component for the chat interface
	 */

	import { goto } from '$app/navigation';
	import Button from './Button.svelte';
	import { currentUser, clearAuth, getUserDisplayName } from '$lib/stores/authStore.js';

	interface Props {
		title?: string;
	}

	let { title = 'Medicare Chatbot' }: Props = $props();

	function handleLogout(): void {
		clearAuth();
		goto('/');
	}
</script>

<header class="header">
	<div class="header-container">
		<div class="header-content">
			<!-- Left side - Title and user info -->
			<div class="header-left">
				<div class="title-section">
					<!-- Logo/Icon -->
					<div class="logo">
						<svg class="logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
							></path>
						</svg>
					</div>
					<h1 class="title">
						{title}
					</h1>
				</div>

				<!-- User welcome message -->
				{#if $currentUser}
					<div class="welcome-message">
						<span class="welcome-text">Welcome,</span>
						<span class="user-name">{getUserDisplayName()}</span>
						<span class="plan-badge">
							{$currentUser.plan_type}
						</span>
					</div>
				{/if}
			</div>

			<!-- Right side - User actions -->
			<div class="header-right">
				{#if $currentUser}
					<!-- Mobile user info -->
					<div class="mobile-user-info">
						<span class="mobile-user-name">
							{$currentUser.first_name}
						</span>
						<span class="mobile-plan-badge">
							{$currentUser.plan_type}
						</span>
					</div>

					<!-- User avatar -->
					<div class="user-section">
						<div class="avatar">
							<span class="avatar-initials">
								{$currentUser.first_name.charAt(0)}{$currentUser.last_name.charAt(0)}
							</span>
						</div>

						<!-- Logout button -->
						<Button variant="ghost" size="sm" onclick={handleLogout}>
							<svg class="logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
								></path>
							</svg>
							Logout
						</Button>
					</div>
				{/if}
			</div>
		</div>
	</div>
</header>

<style lang="scss">
	@use '../../../styles/mixins' as m;

	.header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000; /* High z-index to ensure it's on top */
		background-color: #fff;
		border-bottom: 1px solid m.color(gray, 200);
		box-shadow: m.shadow(sm);
	}

	.header-container {
		max-width: 1280px;
		margin: 0 auto;
		padding: 0 m.space(4);

		@include m.responsive(sm) {
			padding: 0 m.space(6);
		}

		@include m.responsive(lg) {
			padding: 0 m.space(8);
		}
	}

	.header-content {
		@include m.flex-between;
		height: 4rem;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: m.space(6);
	}

	.title-section {
		display: flex;
		align-items: center;
		gap: m.space(3);
	}

	.logo {
		flex-shrink: 0;
		width: 2rem;
		height: 2rem;
		background-color: m.color(primary, 600);
		border-radius: m.radius(lg);
		@include m.flex-center;
	}

	.logo-icon {
		width: 1.25rem;
		height: 1.25rem;
		color: m.color(white);
	}

	.title {
		font-size: m.font-size(xl);
		font-weight: m.font-weight(semibold);
		color: m.color(gray, 900);
	}

	.welcome-message {
		display: none;
		align-items: center;
		gap: m.space(2);
		font-size: m.font-size(sm);

		@include m.responsive(md) {
			display: flex;
		}
	}

	.welcome-text {
		color: m.color(gray, 500);
	}

	.user-name {
		font-weight: m.font-weight(medium);
		color: m.color(gray, 900);
	}

	.plan-badge {
		display: inline-flex;
		align-items: center;
		padding: m.space(1) m.space(2);
		border-radius: m.radius(full);
		font-size: m.font-size(xs);
		font-weight: m.font-weight(medium);
		background-color: m.color(blue, 100);
		color: m.color(blue, 800);
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: m.space(4);
	}

	.mobile-user-info {
		display: flex;
		align-items: center;
		gap: m.space(2);

		@include m.responsive(md) {
			display: none;
		}
	}

	.mobile-user-name {
		font-size: m.font-size(sm);
		font-weight: m.font-weight(medium);
		color: m.color(gray, 900);
	}

	.mobile-plan-badge {
		@extend .plan-badge;
	}

	.user-section {
		display: flex;
		align-items: center;
		gap: m.space(3);
	}

	.avatar {
		flex-shrink: 0;
		width: 2rem;
		height: 2rem;
		background-color: m.color(gray, 300);
		border-radius: m.radius(full);
		@include m.flex-center;
	}

	.avatar-initials {
		font-size: m.font-size(sm);
		font-weight: m.font-weight(medium);
		color: m.color(gray, 700);
	}

	.logout-icon {
		width: 1rem;
		height: 1rem;
		margin-right: m.space(2);
	}
</style>
