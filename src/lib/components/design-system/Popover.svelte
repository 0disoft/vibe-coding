<script lang="ts">
	import type { Snippet } from "svelte";
	import { tick } from "svelte";
	import { scale } from "svelte/transition";
	import type { HTMLAttributes } from "svelte/elements";

	import { useId } from "$lib/shared/utils/use-id";

	export type PopoverSide = "top" | "bottom" | "left" | "right";
	export type PopoverAlign = "start" | "center" | "end";

	export type TriggerProps = {
		id: string;
		"aria-controls": string;
		"aria-haspopup": "dialog";
		"aria-expanded": boolean;
		disabled: boolean;
		onclick: () => void;
		onkeydown: (e: KeyboardEvent) => void;
		ref: (node: HTMLElement) => void;
	};

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		open?: boolean;
		onOpenChange?: (next: boolean) => void;
		disabled?: boolean;
		side?: PopoverSide;
		align?: PopoverAlign;
		offset?: number;
		closeOnOutsideClick?: boolean;
		closeOnEscape?: boolean;
		/** 열릴 때 포커스 대상 (selector 또는 엘리먼트, 기본: 첫 focusable, 없으면 panel) */
		initialFocus?: string | HTMLElement | null;
		/** 닫힐 때 포커스 복귀 */
		returnFocusTo?: HTMLElement | null;
		/** aria-label */
		label?: string;
		trigger?: Snippet<[TriggerProps]>;
		children?: Snippet<[{ close: (opts?: { focusButton?: boolean }) => void }]>;
		panelClass?: string;
	}

	let {
		open = $bindable(false),
		onOpenChange,
		disabled = false,
		side = "bottom",
		align = "center",
		offset = 8,
		closeOnOutsideClick = true,
		closeOnEscape = true,
		initialFocus = null,
		returnFocusTo = null,
		label,
		trigger,
		children,
		panelClass = "",
		class: className = "",
		...rest
	}: Props = $props();

	let rootEl = $state<HTMLDivElement | null>(null);
	let triggerEl = $state<HTMLElement | null>(null);
	let panelEl = $state<HTMLDivElement | null>(null);
	let previousActiveElement: HTMLElement | null = null;

	const triggerId = useId("ds-popover");
	const panelId = `${triggerId}-panel`;

	let isOpen = $derived(open);

	function setOpen(next: boolean): void {
		if (open === next) return;
		open = next;
		onOpenChange?.(next);
	}

	function triggerRef(node: HTMLElement) {
		triggerEl = node;
	}

	function close(options?: { focusButton?: boolean }) {
		setOpen(false);
		if (options?.focusButton) {
			tick().then(() => (returnFocusTo ?? triggerEl)?.focus());
		}
	}

	function toggle(): void {
		if (disabled) return;
		setOpen(!isOpen);
	}

	function focusOnOpen() {
		const panel = panelEl;
		if (!panel) return;

		if (typeof initialFocus === "string") {
			const target = panel.querySelector<HTMLElement>(initialFocus);
			(target ?? panel).focus();
			return;
		}

		if (initialFocus && document.body.contains(initialFocus)) {
			initialFocus.focus();
			return;
		}

		const first = panel.querySelector<HTMLElement>(
			'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
		);
		(first ?? panel).focus();
	}

	function onTriggerKeyDown(e: KeyboardEvent): void {
		if (disabled) return;

		if (e.key === "Escape" && isOpen) {
			e.preventDefault();
			if (closeOnEscape) close({ focusButton: true });
			return;
		}

		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			toggle();
		}
	}

	function onPanelKeyDown(e: KeyboardEvent): void {
		if (e.key === "Escape" && isOpen) {
			e.preventDefault();
			e.stopPropagation();
			if (closeOnEscape) close({ focusButton: true });
		}
	}

	function onDocumentPointerDown(e: PointerEvent): void {
		if (!isOpen || !rootEl) return;
		if (rootEl.contains(e.target as Node)) return;
		if (closeOnOutsideClick) close();
	}

	function onRootFocusOut(e: FocusEvent): void {
		if (!isOpen || !rootEl) return;
		const next = e.relatedTarget as Node | null;
		if (next && rootEl.contains(next)) return;
		close();
	}

	// Positioning (fixed)
	let placementStyles = $state("position: fixed; visibility: hidden;");

	function clamp(v: number, min: number, max: number) {
		return Math.min(Math.max(v, min), max);
	}

	function updatePosition() {
		if (!isOpen || !panelEl || !triggerEl) return;
		if (typeof window === "undefined") return;

		const rect = triggerEl.getBoundingClientRect();
		const panelRect = panelEl.getBoundingClientRect();
		const padding = 8;

		let top = 0;
		let left = 0;

		if (side === "bottom" || side === "top") {
			const baseTop =
				side === "bottom"
					? rect.bottom + offset
					: rect.top - panelRect.height - offset;
			top = baseTop;

			if (align === "start") left = rect.left;
			else if (align === "end") left = rect.right - panelRect.width;
			else left = rect.left + rect.width / 2 - panelRect.width / 2;
		} else {
			const baseLeft =
				side === "right"
					? rect.right + offset
					: rect.left - panelRect.width - offset;
			left = baseLeft;

			if (align === "start") top = rect.top;
			else if (align === "end") top = rect.bottom - panelRect.height;
			else top = rect.top + rect.height / 2 - panelRect.height / 2;
		}

		// viewport clamp
		left = clamp(left, padding, window.innerWidth - panelRect.width - padding);
		top = clamp(top, padding, window.innerHeight - panelRect.height - padding);

		placementStyles = `position: fixed; left: ${left}px; top: ${top}px;`;
	}

	$effect(() => {
		if (isOpen) {
			updatePosition();
			if (typeof window === "undefined") return;
			window.addEventListener("scroll", updatePosition, true);
			window.addEventListener("resize", updatePosition);
			document.addEventListener("pointerdown", onDocumentPointerDown, true);
			return () => {
				window.removeEventListener("scroll", updatePosition, true);
				window.removeEventListener("resize", updatePosition);
				document.removeEventListener("pointerdown", onDocumentPointerDown, true);
			};
		}
	});

	$effect(() => {
		if (isOpen) {
			previousActiveElement = (document.activeElement as HTMLElement) ?? null;
			tick().then(focusOnOpen);
		}

		if (!isOpen) {
			const target = returnFocusTo ?? previousActiveElement;
			if (target && document.body.contains(target)) {
				tick().then(() => target.focus());
			}
		}
	});
</script>

<div
	{...rest}
	bind:this={rootEl}
	class={["ds-popover", className].filter(Boolean).join(" ")}
	onfocusout={onRootFocusOut}
>
	{#if trigger}
		{@render trigger({
			id: triggerId,
			"aria-controls": panelId,
			"aria-haspopup": "dialog",
			"aria-expanded": isOpen,
			disabled,
			onclick: toggle,
			onkeydown: onTriggerKeyDown,
			ref: triggerRef,
		})}
	{:else}
		<button
			type="button"
			id={triggerId}
			class="ds-popover-trigger"
			{disabled}
			aria-controls={panelId}
			aria-haspopup="dialog"
			aria-expanded={isOpen}
			onclick={toggle}
			onkeydown={onTriggerKeyDown}
			bind:this={triggerEl}
		>
			Open
		</button>
	{/if}

	{#if isOpen}
		<div
			bind:this={panelEl}
			id={panelId}
			class={["ds-popover-panel ds-elevation-2", panelClass]
				.filter(Boolean)
				.join(" ")}
			transition:scale={{ duration: 140, start: 0.97, opacity: 0 }}
			style={placementStyles}
			role="dialog"
			aria-label={label}
			tabindex="-1"
			onkeydown={onPanelKeyDown}
			data-side={side}
			data-align={align}
		>
			{#if children}
				{@render children({ close })}
			{/if}
		</div>
	{/if}
</div>
