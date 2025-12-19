<script lang="ts">
	import type { Snippet } from "svelte";
	import { tick } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { DsIconButton } from "$lib/components/design-system";

	type Side = "right" | "left" | "bottom";
	type Size = "sm" | "md" | "lg";

	interface Props extends Omit<HTMLAttributes<HTMLDialogElement>, "children"> {
		id: string;
		title: string;
		description?: string;
		open: boolean;
		onOpenChange?: (next: boolean) => void;
		side?: Side;
		size?: Size;
		closeOnOutsideClick?: boolean;
		closeOnEscape?: boolean;
		returnFocusTo?: HTMLElement | null;
		initialFocus?: string | HTMLElement | null;
		closeLabel?: string;
		children?: Snippet;
		footer?: Snippet;
	}

	let {
		id,
		title,
		description,
		open,
		onOpenChange,
		side = "right",
		size = "md",
		closeOnOutsideClick = true,
		closeOnEscape = true,
		returnFocusTo = null,
		initialFocus = null,
		closeLabel = "Close",
		class: className = "",
		children,
		footer,
		...rest
	}: Props = $props();

	let dialogEl = $state<HTMLDialogElement | null>(null);
	let previousActiveElement: HTMLElement | null = null;

	let titleId = $derived(`${id}-title`);
	let descId = $derived(`${id}-desc`);

	let prevBodyOverflow = "";
	let prevBodyPaddingRight = "";

	function requestClose() {
		onOpenChange?.(false);
	}

	function lockScroll() {
		prevBodyOverflow = document.body.style.overflow;
		prevBodyPaddingRight = document.body.style.paddingRight;

		const scrollBarWidth =
			window.innerWidth - document.documentElement.clientWidth;
		document.body.style.overflow = "hidden";
		if (scrollBarWidth > 0) {
			document.body.style.paddingRight = `calc(${prevBodyPaddingRight || "0px"} + ${scrollBarWidth}px)`;
		}
	}

	function unlockScroll() {
		document.body.style.overflow = prevBodyOverflow;
		document.body.style.paddingRight = prevBodyPaddingRight;
	}

	function focusOnOpen() {
		const el = dialogEl;
		if (!el) return;

		const panel = el.querySelector<HTMLElement>(".ds-sheet-panel");
		if (!panel) {
			el.focus();
			return;
		}

		if (!initialFocus) {
			panel.focus();
			return;
		}

		if (typeof initialFocus === "string") {
			const target = el.querySelector<HTMLElement>(initialFocus);
			(target ?? panel).focus();
			return;
		}

		if (document.body.contains(initialFocus)) initialFocus.focus();
		else panel.focus();
	}

	function closeNow() {
		const el = dialogEl;
		if (!el || !el.open) return;
		el.close();
		unlockScroll();

		const target = returnFocusTo ?? previousActiveElement;
		if (target && document.body.contains(target)) {
			tick().then(() => target.focus());
		}
	}

	$effect(() => {
		const el = dialogEl;
		if (!el) return;

		if (open) {
			if (!el.open) {
				previousActiveElement = (document.activeElement as HTMLElement) ?? null;
				el.showModal();
				lockScroll();
				tick().then(() => focusOnOpen());
			}
		} else {
			if (el.open) tick().then(closeNow);
			else unlockScroll();
		}
	});

	$effect(() => {
		return () => {
			unlockScroll();
		};
	});

	function onCancel(e: Event) {
		e.preventDefault();
		if (closeOnEscape) requestClose();
	}

	function onClose() {
		if (open) onOpenChange?.(false);
	}

	function onBackdropClick(e: MouseEvent) {
		if (!closeOnOutsideClick || !dialogEl) return;
		if (e.target !== dialogEl) return;

		const panel = dialogEl.querySelector<HTMLElement>(".ds-sheet-panel");
		if (!panel) return;
		const rect = panel.getBoundingClientRect();
		const inPanel =
			e.clientX >= rect.left &&
			e.clientX <= rect.right &&
			e.clientY >= rect.top &&
			e.clientY <= rect.bottom;
		if (!inPanel) requestClose();
	}
</script>

<dialog
	bind:this={dialogEl}
	{id}
	class={["ds-sheet", className].filter(Boolean).join(" ")}
	aria-labelledby={titleId}
	aria-describedby={description ? descId : undefined}
	aria-modal="true"
	data-ds-side={side}
	data-ds-size={size}
	oncancel={onCancel}
	onclose={onClose}
	onclick={onBackdropClick}
	{...rest}
>
	<div class="ds-sheet-panel" tabindex="-1">
		<header class="ds-sheet-header">
			<div class="min-w-0">
				<h2 class="text-h3 font-semibold" id={titleId}>{title}</h2>
				{#if description}
					<p class="text-body-secondary text-muted-foreground" id={descId}>
						{description}
					</p>
				{/if}
			</div>
			<DsIconButton
				icon="x"
				label={closeLabel}
				intent="secondary"
				variant="ghost"
				size="sm"
				onclick={requestClose}
			/>
		</header>

		<div class="ds-sheet-body">
			{#if children}
				{@render children()}
			{/if}
		</div>

		{#if footer}
			<footer class="ds-sheet-footer">
				{@render footer()}
			</footer>
		{/if}
	</div>
</dialog>
