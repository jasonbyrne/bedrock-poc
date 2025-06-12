<script lang="ts">
	/**
	 * Root layout for the AI Drug Search POC application
	 */
	import type { Snippet } from 'svelte';
	import '../app.scss';
	import SessionExpiredModal from '$lib/components/modals/SessionExpiredModal.svelte';
	import { showSessionExpiredModal, handleSessionExpiredContinue } from '$lib/stores/sessionStore';

	interface Props {
		children?: Snippet;
	}

	// Destructure children from props (Svelte 5 syntax)
	let { children }: Props = $props();
</script>

<div class="app-layout">
	{#if children}
		{@render children()}
	{/if}
</div>

<!-- Global Session Expired Modal -->
<SessionExpiredModal isOpen={$showSessionExpiredModal} onContinue={handleSessionExpiredContinue} />

<style lang="scss">
	@use '../styles/mixins' as m;

	.app-layout {
		min-height: 100vh;
		background-color: m.color(gray, 50);
		font-family:
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			sans-serif;
	}
</style>
