<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { ToastItem, ToastIntent } from "$lib/stores/toast.svelte";

	import { DsIcon, DsIconButton } from "$lib/components/design-system";

	export type ToastPosition =
		| "top-left"
		| "top-right"
		| "bottom-left"
		| "bottom-right"
		| "top-center"
		| "bottom-center";

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		toasts: ToastItem[];
		onDismiss: (id: string) => void;
		position?: ToastPosition;
		children?: Snippet;
		action?: Snippet<[ToastItem]>;
	}

	let {
		toasts,
		onDismiss,
		position = "bottom-right",
		class: className = "",
		children,
		action,
		...rest
	}: Props = $props();

	const intentIcon: Record<string, string> = {
		neutral: "bell",
		success: "check",
		warning: "triangle-alert",
		error: "circle-x",
	};
</script>

<div
	{...rest}
	class={`ds-toast-region ${className}`.trim()}
	data-ds-position={position}
	aria-live="polite"
	aria-relevant="additions text"
	role="region"
	aria-label="Notifications"
>
	{#if children}
		{@render children()}
	{/if}

	{#each toasts as t (t.id)}
		<div
			class="ds-toast ds-elevation-2"
			data-intent={t.intent ?? "neutral"}
			role="status"
		>
			<div class="ds-toast-icon" aria-hidden="true">
				<DsIcon name={intentIcon[t.intent ?? "neutral"] ?? "bell"} size="md" />
			</div>
			<div class="min-w-0 flex-1">
				<div class="text-label font-semibold">{t.title}</div>
				{#if t.message}
					<div class="text-helper text-muted-foreground">{t.message}</div>
				{/if}
				{#if action}
					<div class="mt-2">
						{@render action(t)}
					</div>
				{/if}
			</div>
			<DsIconButton
				icon="x"
				label="Dismiss"
				variant="ghost"
				intent="secondary"
				size="sm"
				onclick={() => onDismiss(t.id)}
			/>
		</div>
	{/each}
</div>