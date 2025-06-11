<script lang="ts">
	/**
	 * Feed-style search page with persistent results and bottom input
	 */

	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import Header from '$lib/components/ui/Header.svelte';
	import SearchFeed from '$lib/components/feed/SearchFeed.svelte';
	import { authState, isAuthenticated, initializeAuth } from '$lib/stores/authStore.js';
	import { getPageTitle, getPageDescription, publicEnv } from '$lib/config/env.js';

	// Authentication check
	onMount(() => {
		// Initialize auth store if in browser
		if (browser) {
			initializeAuth();

			// Check authentication after a brief delay to allow store initialization
			setTimeout(() => {
				if (!isAuthenticated()) {
					goto('/');
				}
			}, 100);
		}
	});

	// Reactive check for authentication state changes
	$effect(() => {
		if (browser && $authState === 'unauthenticated') {
			goto('/');
		}
	});
</script>

<svelte:head>
	<title>{getPageTitle('Search Feed')}</title>
	<meta name="description" content={getPageDescription('search')} />
</svelte:head>

{#if $authState === 'loading'}
	<!-- Loading state -->
	<div class="page-loading">
		<div class="loading-content">
			<div class="loading-spinner"></div>
			<p class="loading-text">Loading...</p>
		</div>
	</div>
{:else if $authState === 'authenticated'}
	<!-- Authenticated feed interface -->
	<div class="feed-page">
		<Header title={publicEnv.app.name} />

		<main class="feed-main">
			<SearchFeed />
		</main>
	</div>
{:else}
	<!-- Fallback for unauthenticated state -->
	<div class="access-denied">
		<div class="denied-content">
			<h2 class="denied-title">Access Denied</h2>
			<p class="denied-text">Please log in to access the search feed.</p>
			<a href="/" class="denied-link">Return to Login</a>
		</div>
	</div>
{/if}

<style lang="scss">
	@use '../../styles/mixins' as m;

	.page-loading {
		min-height: 100vh;
		@include m.flex-center;
		background-color: m.color(gray, 50);
	}

	.loading-content {
		text-align: center;
	}

	.loading-spinner {
		animation: spin 1s linear infinite;
		border-radius: m.radius(full);
		height: 3rem;
		width: 3rem;
		border: 2px solid transparent;
		border-bottom-color: m.color(primary, 600);
		margin: 0 auto;
	}

	.loading-text {
		margin-top: m.space(4);
		color: m.color(gray, 600);
	}

	.feed-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: m.color(gray, 50);
	}

	.feed-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	.access-denied {
		min-height: 100vh;
		@include m.flex-center;
		background-color: m.color(gray, 50);
	}

	.denied-content {
		text-align: center;
	}

	.denied-title {
		font-size: m.font-size(2xl);
		font-weight: m.font-weight(bold);
		color: m.color(gray, 900);
		margin-bottom: m.space(4);
	}

	.denied-text {
		color: m.color(gray, 600);
		margin-bottom: m.space(4);
	}

	.denied-link {
		color: m.color(primary, 600);
		text-decoration: underline;
		transition: color m.transition(fast);

		&:hover {
			color: m.color(primary, 800);
		}
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
