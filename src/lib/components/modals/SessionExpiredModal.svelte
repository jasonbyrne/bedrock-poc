<script lang="ts">
	import { goto } from '$app/navigation';
	import { clearAuth } from '$lib/stores/authStore';
	import Button from '../ui/Button.svelte';

	interface Props {
		isOpen?: boolean;
		onContinue?: () => void;
	}

	let { isOpen = false, onContinue }: Props = $props();

	const redirect = () => {
		clearAuth();
		if (onContinue) {
			onContinue();
		} else {
			goto('/');
		}
		isOpen = false;
	};
</script>

{#if isOpen}
	<!-- Modal backdrop -->
	<div class="modal-backdrop" role="presentation">
		<!-- Modal content -->
		<div
			class="modal-content"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
			tabindex="-1"
		>
			<!-- Header -->
			<div class="modal-header">
				<div class="icon-container">
					<svg class="session-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
						/>
					</svg>
				</div>
				<h2 id="modal-title" class="modal-title">Session Expired</h2>
			</div>

			<!-- Body -->
			<div class="modal-body">
				<p class="message">
					Your session has expired for security reasons. This helps protect your Medicare
					information and personal data.
				</p>
				<div class="modal-actions">
					<Button onclick={redirect}>Continue to Login</Button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	@use '../../../styles/mixins' as m;

	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: m.space(4);
	}

	.modal-content {
		background: white;
		border-radius: m.radius(lg);
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
		max-width: 28rem;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal-header {
		padding: m.space(6) m.space(6) m.space(4);
		text-align: center;
	}

	.icon-container {
		display: flex;
		justify-content: center;
		margin-bottom: m.space(4);
	}

	.session-icon {
		width: 3rem;
		height: 3rem;
		color: m.color(amber, 500);
	}

	.modal-title {
		font-size: m.font-size(xl);
		font-weight: m.font-weight(semibold);
		color: m.color(gray, 900);
		margin: 0;
	}

	.modal-body {
		padding: 0 m.space(6) m.space(6);
		text-align: center;
	}

	.message {
		font-size: m.font-size(base);
		color: m.color(gray, 700);
		margin: 0 0 m.space(3);
		line-height: 1.5;
	}

	.modal-actions {
		margin-top: m.space(8);
		display: flex;
		justify-content: center;
		gap: m.space(3);
	}

	// Mobile responsive
	@media (max-width: 640px) {
		.modal-backdrop {
			padding: m.space(2);
		}

		.modal-header {
			padding: m.space(4) m.space(4) m.space(3);
		}

		.modal-body {
			padding: 0 m.space(4) m.space(4);
		}
	}
</style>
