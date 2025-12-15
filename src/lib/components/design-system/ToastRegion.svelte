<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { flip } from "svelte/animate";
	import { fly } from "svelte/transition";
	import { cubicOut } from "svelte/easing";

	import { DsIcon, DsIconButton } from "$lib/components/design-system";
	import type { ToastItem } from "$lib/stores/toast.svelte";

	export type ToastPosition =
		| "top-left"
		| "top-right"
		| "bottom-left"
		| "bottom-right"
		| "top-center"
		| "bottom-center";

	interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		toasts: ToastItem[];
		onDismiss: (id: string) => void;
		onPause?: () => void;
		onResume?: () => void;
		position?: ToastPosition;
		class?: string;
		action?: Snippet<[ToastItem]>;
	}

	let {
		toasts,
		onDismiss,
		onPause,
		onResume,
		position = "bottom-right",
		class: className = "",
		action,
		...rest
	}: Props = $props();

	const intentIcon: Record<string, string> = {
		neutral: "info",
		success: "circle-check",
		warning: "triangle-alert",
		error: "circle-alert",
	};

	let flyY = $derived(position.startsWith("top") ? -20 : 20);
	let isTop = $derived(position.startsWith("top"));
</script>

<section
	{...rest}
	class={`ds-toast-region ${className}`.trim()}
	aria-label="Notifications"
	aria-live="polite"
	aria-relevant="additions text"
	data-ds-position={position}
	onmouseenter={onPause}
	onmouseleave={onResume}
	onfocusin={onPause}
	onfocusout={onResume}
>
	<ol class={`flex w-full ${isTop ? "flex-col" : "flex-col-reverse"}`}>
		{#each toasts as t (t.id)}
			<li
				class="ds-toast-wrapper pointer-events-auto py-1"
				animate:flip={{ duration: 300, easing: cubicOut }}
				transition:fly={{ y: flyY, duration: 300, easing: cubicOut }}
			>
				<div
					class="ds-toast ds-elevation-3"
					data-intent={t.intent ?? "neutral"}
					role="status"
				>
					<div class="ds-toast-icon" aria-hidden="true">
						<DsIcon
							name={intentIcon[t.intent ?? "neutral"] ?? "info"}
							size="md"
						/>
					</div>

					<div class="ds-toast-content">
						<div class="ds-toast-title">{t.title}</div>
						{#if t.message}
							<div class="ds-toast-message">{t.message}</div>
						{/if}

						{#if action}
							<div class="ds-toast-action">
								{@render action(t)}
							</div>
						{/if}
					</div>

					<div class="ds-toast-close">
						<DsIconButton
							icon="x"
							label="Dismiss notification"
							variant="ghost"
							size="sm"
							onclick={() => onDismiss(t.id)}
						/>
					</div>
				</div>
			</li>
		{/each}
	</ol>
</section>
