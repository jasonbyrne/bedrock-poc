<script lang="ts">
	/**
	 * Header component for the chat interface
	 */

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Button from './Button.svelte';
	import { currentUser, clearAuth, getUserDisplayName } from '$lib/stores/authStore.js';
	import { publicEnv } from '$lib/config/env.js';

	interface Props {
		title?: string;
	}

	let { title = publicEnv.app.name }: Props = $props();

	function handleLogout(): void {
		clearAuth();
		goto('/');
	}

	// Navigation functions and state
	let isDropdownOpen = $state(false);

	function goToChat(): void {
		goto('/chat');
		isDropdownOpen = false;
	}

	function goToSearch(): void {
		goto('/search');
		isDropdownOpen = false;
	}

	function goToFeed(): void {
		goto('/feed');
		isDropdownOpen = false;
	}

	function toggleDropdown(): void {
		isDropdownOpen = !isDropdownOpen;
	}

	function closeDropdown(): void {
		isDropdownOpen = false;
	}

	// Check current route and get current page info
	let currentPath = $derived($page.url.pathname);
	let currentPageInfo = $derived(() => {
		switch (currentPath) {
			case '/chat':
				return {
					name: 'Chat',
					icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
				};
			case '/search':
				return {
					name: 'Search',
					icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
				};
			case '/feed':
				return {
					name: 'Feed',
					icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z'
				};
			default:
				return { name: 'Navigate', icon: 'M4 6h16M4 12h16M4 18h16' };
		}
	});

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent): void {
		const target = event.target as Element;
		if (isDropdownOpen && !target.closest('.navigation-dropdown')) {
			isDropdownOpen = false;
		}
	}
</script>

<svelte:document onclick={handleClickOutside} />

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
							{$currentUser.planType}
						</span>
					</div>
				{/if}
			</div>

			<!-- Middle - Navigation Dropdown -->
			<div class="header-middle">
				{#if $currentUser}
					<div class="navigation-dropdown">
						<button class="dropdown-trigger" onclick={toggleDropdown}>
							<svg class="dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d={currentPageInfo().icon}
								></path>
							</svg>
							<span class="dropdown-label">{currentPageInfo().name}</span>
							<svg
								class="dropdown-chevron"
								class:dropdown-chevron-open={isDropdownOpen}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 9l-7 7-7-7"
								></path>
							</svg>
						</button>

						{#if isDropdownOpen}
							<div class="dropdown-menu">
								<button
									class="dropdown-item"
									class:dropdown-item-active={currentPath === '/chat'}
									onclick={goToChat}
								>
									<svg
										class="dropdown-item-icon"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
										></path>
									</svg>
									<span>Chat</span>
								</button>

								<button
									class="dropdown-item"
									class:dropdown-item-active={currentPath === '/search'}
									onclick={goToSearch}
								>
									<svg
										class="dropdown-item-icon"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
										></path>
									</svg>
									<span>Search</span>
								</button>

								<button
									class="dropdown-item"
									class:dropdown-item-active={currentPath === '/feed'}
									onclick={goToFeed}
								>
									<svg
										class="dropdown-item-icon"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
										></path>
									</svg>
									<span>Feed</span>
								</button>
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Right side - User actions -->
			<div class="header-right">
				{#if $currentUser}
					<!-- Mobile user info -->
					<div class="mobile-user-info">
						<span class="mobile-user-name">
							{$currentUser.firstName}
						</span>
						<span class="mobile-plan-badge">
							{$currentUser.planType}
						</span>
					</div>

					<!-- User avatar -->
					<div class="user-section">
						<div class="avatar">
							<span class="avatar-initials">
								{$currentUser.firstName.charAt(0)}{$currentUser.lastName.charAt(0)}
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
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 4rem;
		gap: m.space(4);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: m.space(6);
		flex-shrink: 0;
	}

	.header-middle {
		flex: 1;
		display: flex;
		justify-content: center;

		@media (max-width: 768px) {
			display: none;
		}
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

	.navigation-dropdown {
		position: relative;
		display: inline-block;
	}

	.dropdown-trigger {
		display: flex;
		align-items: center;
		gap: m.space(2);
		padding: m.space(2) m.space(4);
		border: 1px solid m.color(gray, 200);
		background: white;
		border-radius: m.radius(lg);
		font-size: m.font-size(sm);
		font-weight: m.font-weight(medium);
		color: m.color(gray, 700);
		cursor: pointer;
		transition: all m.transition(fast);
		box-shadow: m.shadow(sm);

		&:hover {
			background-color: m.color(gray, 50);
			border-color: m.color(gray, 300);
		}

		&:focus {
			outline: none;
			border-color: m.color(primary, 500);
			box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
		}
	}

	.dropdown-icon {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		color: m.color(primary, 600);
	}

	.dropdown-label {
		white-space: nowrap;
		min-width: 4rem;
	}

	.dropdown-chevron {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		transition: transform m.transition(fast);

		&.dropdown-chevron-open {
			transform: rotate(180deg);
		}
	}

	.dropdown-menu {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		margin-top: m.space(1);
		background: white;
		border: 1px solid m.color(gray, 200);
		border-radius: m.radius(lg);
		box-shadow: m.shadow(lg);
		z-index: 50;
		overflow: hidden;
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		gap: m.space(3);
		width: 100%;
		padding: m.space(3) m.space(4);
		border: none;
		background: transparent;
		font-size: m.font-size(sm);
		font-weight: m.font-weight(medium);
		color: m.color(gray, 700);
		cursor: pointer;
		transition: all m.transition(fast);
		text-align: left;

		&:hover {
			background-color: m.color(gray, 50);
		}

		&.dropdown-item-active {
			background-color: m.color(primary, 50);
			color: m.color(primary, 700);

			.dropdown-item-icon {
				color: m.color(primary, 600);
			}
		}
	}

	.dropdown-item-icon {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		color: m.color(gray, 500);
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: m.space(4);
		flex-shrink: 0;
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
