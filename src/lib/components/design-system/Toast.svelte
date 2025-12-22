<script lang="ts">
	import { page } from "$app/state";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { DsIcon, DsIconButton } from "$lib/components/design-system";
	import * as m from "$lib/paraglide/messages.js";

	export type ToastIntent = "neutral" | "success" | "warning" | "error";

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		id?: string;
		title: string;
		message?: string;
		intent?: ToastIntent;
		icon?: string;
		dismissible?: boolean;
		dismissLabel?: string;
		onDismiss?: () => void;
		role?: "status" | "alert";
		actions?: Snippet;
	}

	const autoId = $props.id();

	let {
		id = autoId,
		title,
		message,
		intent = "neutral",
		icon,
		dismissible = true,
		dismissLabel,
		onDismiss,
		role = "status",
		actions,
		class: className = "",
		...rest
	}: Props = $props();

	// Reactive i18n
	let resolvedDismissLabel = $derived.by(() => {
		void page.url;
		return dismissLabel ?? m.ds_toast_dismiss();
	});

	let titleId = $derived(`${id}-title`);
	let messageId = $derived(message ? `${id}-message` : undefined);

	const intentIcon: Record<ToastIntent, string> = {
		neutral: "info",
		success: "circle-check",
		warning: "triangle-alert",
		error: "circle-alert",
	};

	function onToastKeyDown(e: KeyboardEvent) {
		if (!dismissible || !onDismiss) return;
		if (e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			onDismiss();
		}
	}
</script>

<div
	{id}
	{...rest}
	class={["ds-toast ds-elevation-3", className].filter(Boolean).join(" ")}
	data-intent={intent}
	{role}
	aria-labelledby={titleId}
	aria-describedby={messageId}
	onkeydown={onToastKeyDown}
>
	<div class="ds-toast-icon" aria-hidden="true">
		<DsIcon name={icon ?? intentIcon[intent]} size="md" />
	</div>

	<div class="ds-toast-content">
		<div class="ds-toast-title" id={titleId}>
			{title}
		</div>
		{#if message}
			<div class="ds-toast-message" id={messageId}>
				{message}
			</div>
		{/if}

		{#if actions}
			<div class="ds-toast-action">
				{@render actions()}
			</div>
		{/if}
	</div>

	{#if dismissible && onDismiss}
		<div class="ds-toast-close">
			<DsIconButton
				type="button"
				icon="x"
				label={resolvedDismissLabel}
				variant="ghost"
				size="sm"
				onclick={onDismiss}
			/>
		</div>
	{/if}
</div>
