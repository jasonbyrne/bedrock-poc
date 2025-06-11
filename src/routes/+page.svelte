<script lang="ts">
	/**
	 * Main landing page with login form
	 */

	import LoginForm from '$lib/components/ui/LoginForm.svelte';
	import { getPageTitle, getPageDescription } from '$lib/config/env.js';
</script>

<svelte:head>
	<title>{getPageTitle('Login')}</title>
	<meta name="description" content={getPageDescription('default')} />
</svelte:head>

<LoginForm />
