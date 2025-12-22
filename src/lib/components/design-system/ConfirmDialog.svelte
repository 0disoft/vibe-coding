<script lang="ts">
	import { page } from "$app/state";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { DsButton, DsDialog } from "$lib/components/design-system";
	import * as m from "$lib/paraglide/messages.js";

	import type { ButtonVariant, Intent } from "./types";

	type Size = "sm" | "md" | "lg";
	type CloseReason = "confirm" | "cancel" | undefined;

	interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		id: string;
		title: string;
		description?: string;
		open?: boolean;
		onOpenChange?: (next: boolean) => void;
		onConfirm?: () => void;
		onCancel?: () => void;
		confirmLabel?: string;
		cancelLabel?: string;
		confirmIntent?: Intent;
		cancelIntent?: Intent;
		confirmVariant?: ButtonVariant;
		cancelVariant?: ButtonVariant;
		confirmDisabled?: boolean;
		confirmLoading?: boolean;
		confirmLoadingLabel?: string;
		confirmDelayMs?: number;
		size?: Size;
		closeOnOutsideClick?: boolean;
		closeOnEscape?: boolean;
		initialFocus?: string | HTMLElement | null;
		returnFocusTo?: HTMLElement | null;
		closeLabel?: string;
		dialogRole?: "dialog" | "alertdialog";
		content?: Snippet;
		children?: Snippet;
		actions?: Snippet;
	}

	let {
		id,
		title,
		description,
		open = $bindable(false),
		onOpenChange,
		onConfirm,
		onCancel,
		confirmLabel,
		cancelLabel,
		confirmIntent = "danger",
		cancelIntent = "secondary",
		confirmVariant = "solid",
		cancelVariant = "outline",
		confirmDisabled = false,
		confirmLoading = false,
		confirmLoadingLabel,
		confirmDelayMs,
		size = "sm",
		closeOnOutsideClick = false,
		closeOnEscape = true,
		initialFocus,
		returnFocusTo = null,
		closeLabel,
		dialogRole = "alertdialog",
		content,
		children,
		actions,
		class: className = "",
		...rest
	}: Props = $props();

	// Reactive i18n defaults
	let resolvedConfirmLabel = $derived.by(() => {
		void page.url;
		return confirmLabel ?? m.ds_confirm();
	});

	let resolvedCancelLabel = $derived.by(() => {
		void page.url;
		return cancelLabel ?? m.ds_cancel();
	});

	let resolvedConfirmLoadingLabel = $derived.by(() => {
		void page.url;
		return confirmLoadingLabel ?? m.ds_processing();
	});

	let resolvedCloseLabel = $derived.by(() => {
		void page.url;
		return closeLabel ?? m.ds_dialog_close();
	});

	let cancelButtonRef = $state<HTMLButtonElement | null>(null);

	let resolvedConfirmDelayMs = $derived(
		confirmDelayMs ?? (confirmIntent === "danger" ? 1200 : 0),
	);
	let confirmReady = $state(true);
	let bodyId = $derived(`${id}-body`);
	let dialogDescId = $derived(`${id}-desc`);
	let bodyContent = $derived(children ?? content);
	let resolvedAriaDescribedBy = $derived.by(() => {
		const ids: string[] = [];
		if (description) ids.push(dialogDescId);
		if (bodyContent) ids.push(bodyId);
		return ids.length > 0 ? ids.join(" ") : undefined;
	});

	let resolvedInitialFocus = $derived.by(() => {
		if (initialFocus !== undefined) return initialFocus;
		return confirmIntent === "danger" ? cancelButtonRef : null;
	});
	let isConfirmDisabled = $derived(
		confirmDisabled || confirmLoading || !confirmReady,
	);

	$effect(() => {
		if (!open) {
			confirmReady = true;
			return;
		}

		if (typeof window === "undefined") {
			confirmReady = true;
			return;
		}

		if (resolvedConfirmDelayMs <= 0) {
			confirmReady = true;
			return;
		}

		confirmReady = false;
		const timer = window.setTimeout(() => {
			confirmReady = true;
		}, resolvedConfirmDelayMs);

		return () => {
			window.clearTimeout(timer);
		};
	});

	function setOpen(next: boolean, reason?: CloseReason) {
		if (open === next) return;
		open = next;
		onOpenChange?.(next);
		if (!next && reason !== "confirm") onCancel?.();
	}

	function handleOpenChange(next: boolean) {
		setOpen(next, next ? undefined : "cancel");
	}

	function handleConfirm() {
		if (isConfirmDisabled) return;
		onConfirm?.();
		setOpen(false, "confirm");
	}

	function handleCancel() {
		setOpen(false, "cancel");
	}
</script>

<DsDialog
	{...rest}
	{id}
	{title}
	{description}
	{open}
	{size}
	{closeOnOutsideClick}
	{closeOnEscape}
	onOpenChange={handleOpenChange}
	aria-describedby={resolvedAriaDescribedBy}
	role={dialogRole}
	initialFocus={resolvedInitialFocus}
	{returnFocusTo}
	closeLabel={resolvedCloseLabel}
	class={className}
>
	{#snippet children()}
		{#if bodyContent}
			<div class="ds-confirm-dialog-body" id={bodyId}>
				{@render bodyContent()}
			</div>
		{/if}
	{/snippet}

	{#snippet footer()}
		{#if actions}
			{@render actions()}
		{:else}
			<div class="ds-confirm-dialog-actions">
				<DsButton
					variant={cancelVariant}
					intent={cancelIntent}
					onclick={handleCancel}
					ref={cancelButtonRef}
				>
					{resolvedCancelLabel}
				</DsButton>
				<DsButton
					variant={confirmVariant}
					intent={confirmIntent}
					loading={confirmLoading}
					loadingLabel={resolvedConfirmLoadingLabel}
					disabled={isConfirmDisabled}
					onclick={handleConfirm}
				>
					{resolvedConfirmLabel}
				</DsButton>
			</div>
		{/if}
	{/snippet}
</DsDialog>
