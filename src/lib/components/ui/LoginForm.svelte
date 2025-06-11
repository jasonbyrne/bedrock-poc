<script lang="ts">
	/**
	 * Login form component for AI Drug Search POC
	 */

	import { goto } from '$app/navigation';
	import Button from './Button.svelte';
	import Input from './Input.svelte';
	import Select from './Select.svelte';
	import { getPersonaOptions } from '$lib/services/personaService.js';
	import { setAuth } from '$lib/stores/authStore.js';
	import { decodeMockJwt } from '$lib/services/personaService.js';
	import type { LoginRequest, LoginResponse } from '$lib/types/authTypes.js';
	import { publicEnv } from '$lib/config/env.js';

	// Form state using Svelte 5 runes
	let email = $state('');
	let password = $state('');
	let selectedPersona = $state<number | string>('');
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	// Get persona options
	const personaOptions = getPersonaOptions().map((option) => ({
		value: option.value,
		label: option.label,
		description: option.description
	}));

	async function handleSubmit(event: SubmitEvent): Promise<void> {
		event.preventDefault();

		try {
			isLoading = true;
			error = null;

			// Validate persona selection
			if (!selectedPersona) {
				error = 'Please select a persona to continue';
				return;
			}

			// Prepare login request
			const loginRequest: LoginRequest = {
				email: email || undefined,
				password: password || undefined,
				selectedPersona: Number(selectedPersona)
			};

			// Call mock auth API
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(loginRequest)
			});

			const result: LoginResponse = await response.json();

			if (!result.success || !result.token) {
				error = result.error || 'Authentication failed';
				return;
			}

			// Decode JWT and set auth state
			const payload = decodeMockJwt(result.token);
			if (!payload) {
				error = 'Invalid authentication token';
				return;
			}

			// Set authentication in store
			setAuth(result.token, payload);

			// Redirect to feed
			await goto('/feed');
		} catch (err) {
			console.error('Login error:', err);
			error = 'An unexpected error occurred. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	function handlePersonaChange(value: string | number): void {
		selectedPersona = value;
		error = null; // Clear error when persona is selected
	}
</script>

<div class="login-container">
	<div class="login-wrapper">
		<!-- Main Card -->
		<div class="login-card">
			<!-- Header -->
			<div class="login-header">
				<!-- Logo -->
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

				<h2 class="login-title">{publicEnv.app.name}</h2>
				<p class="login-subtitle">Select a persona to test the chatbot experience</p>

				<!-- Info Banner -->
				<div class="info-banner">
					<div class="info-content">
						<svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
						<p class="info-text">
							<strong>Demo Mode:</strong> Email and password fields are optional and for visual purposes
							only.
						</p>
					</div>
				</div>
			</div>

			<!-- Form -->
			<form class="login-form" onsubmit={handleSubmit}>
				<div class="form-fields">
					<!-- Email (optional, for show) -->
					<Input
						type="email"
						label="Email Address (Optional)"
						placeholder="Enter email address"
						value={email}
						oninput={(value) => (email = value)}
					/>

					<!-- Password (optional, for show) -->
					<Input
						type="password"
						label="Password (Optional)"
						placeholder="Enter password"
						value={password}
						oninput={(value) => (password = value)}
					/>

					<!-- Persona Selection (required) -->
					<Select
						label="Select Test Persona"
						placeholder="Choose a Medicare beneficiary..."
						options={personaOptions}
						value={selectedPersona}
						required={true}
						error={error && !selectedPersona ? 'Persona selection is required' : undefined}
						onchange={handlePersonaChange}
					/>
				</div>

				<!-- Error Message -->
				{#if error}
					<div class="error-banner">
						<div class="error-content">
							<svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
							<p class="error-text" role="alert">
								{error}
							</p>
						</div>
					</div>
				{/if}

				<!-- Submit Button -->
				<div class="submit-section">
					<Button
						type="submit"
						variant="primary"
						size="lg"
						loading={isLoading}
						disabled={isLoading}
						class="submit-button"
					>
						{#if isLoading}
							<svg class="loading-icon" fill="none" viewBox="0 0 24 24">
								<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Authenticating...
						{:else}
							Continue to Chat
							<svg class="arrow-icon" fill="none" stroke="#fff" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 7l5 5m0 0l-5 5m5-5H6"
								></path>
							</svg>
						{/if}
					</Button>
				</div>
			</form>

			<!-- Footer -->
			<div class="login-footer">
				<p class="footer-text">{publicEnv.app.name} • AWS Bedrock Integration Demo</p>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	@use '../../../styles/mixins' as m;

	.login-container {
		min-height: 100vh;
		@include m.flex-center;
		@include m.gradient-bg;
		padding: m.space(12) m.space(4);

		@include m.responsive(sm) {
			padding: m.space(12) m.space(6);
		}

		@include m.responsive(lg) {
			padding: m.space(12) m.space(8);
		}
	}

	.login-wrapper {
		max-width: 28rem;
		width: 100%;
	}

	.login-card {
		@include m.card;
		display: flex;
		flex-direction: column;
		gap: m.space(8);
		padding: m.space(8);
		border-radius: m.radius(2xl);
		box-shadow: m.shadow(xl);
	}

	.login-header {
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: m.space(6);
	}

	.logo {
		margin: 0 auto;
		width: 4rem;
		height: 4rem;
		background-color: m.color(primary, 600);
		border-radius: m.radius(2xl);
		@include m.flex-center;
		margin-bottom: m.space(6);
	}

	.logo-icon {
		width: 2rem;
		height: 2rem;
		color: m.color(white);
	}

	.login-title {
		font-size: m.font-size(3xl);
		font-weight: m.font-weight(bold);
		color: m.color(gray, 900);
		margin-bottom: m.space(2);
	}

	.login-subtitle {
		color: m.color(gray, 600);
		margin-bottom: m.space(6);
	}

	.info-banner {
		background-color: m.color(blue, 50);
		border: 1px solid m.color(blue, 200);
		border-radius: m.radius(xl);
		padding: m.space(4);
		margin-bottom: m.space(6);
	}

	.info-content {
		display: flex;
		align-items: flex-start;
		gap: m.space(3);
	}

	.info-icon {
		width: 1.25rem;
		height: 1.25rem;
		color: m.color(blue, 600);
		margin-top: 0.125rem;
		flex-shrink: 0;
	}

	.info-text {
		font-size: m.font-size(sm);
		color: m.color(blue, 800);
	}

	.login-form {
		display: flex;
		flex-direction: column;
		gap: m.space(6);
	}

	.form-fields {
		display: flex;
		flex-direction: column;
		gap: m.space(5);
	}

	.error-banner {
		background-color: m.color(red, 50);
		border: 1px solid m.color(red, 200);
		border-radius: m.radius(xl);
		padding: m.space(4);
	}

	.error-content {
		display: flex;
		align-items: flex-start;
		gap: m.space(3);
	}

	.error-icon {
		width: 1.25rem;
		height: 1.25rem;
		color: m.color(red, 600);
		margin-top: 0.125rem;
		flex-shrink: 0;
	}

	.error-text {
		font-size: m.font-size(sm);
		color: m.color(red, 800);
	}

	.submit-section {
		padding-top: m.space(2);
	}

	:global(.submit-button) {
		width: 100%;
	}

	.loading-icon {
		animation: spin 1s linear infinite;
		margin-left: -0.25rem;
		margin-right: 0.75rem;
		height: 1.25rem;
		width: 1.25rem;
		color: m.color(white);

		circle {
			opacity: 0.25;
		}

		path {
			opacity: 0.75;
		}
	}

	.arrow-icon {
		margin-left: m.space(2);
		width: 1.25rem;
		height: 1.25rem;
	}

	.login-footer {
		text-align: center;
		padding-top: m.space(4);
		border-top: 1px solid m.color(gray, 100);
	}

	.footer-text {
		font-size: m.font-size(xs);
		color: m.color(gray, 500);
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
