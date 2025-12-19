<script lang="ts">
	import type { Snippet } from "svelte";
	import { tick } from "svelte";
	import { fade, fly } from "svelte/transition";
	import type { HTMLAttributes } from "svelte/elements";

	import { DsIconButton } from "$lib/components/design-system";

	type Side = "right" | "left" | "bottom";
	type Size = "sm" | "md" | "lg";

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		id: string;
		title: string;
		description?: string;
		open?: boolean;
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
		open = $bindable(false),
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

	let panelEl = $state<HTMLDivElement | null>(null);
	let previousActiveElement: HTMLElement | null = null;

	let titleId = $derived(`${id}-title`);
	let descId = $derived(`${id}-desc`);

	let prevBodyOverflow = "";
	let prevBodyPaddingRight = "";

	function setOpen(next: boolean) {
		if (open === next) return;
		open = next;
		onOpenChange?.(next);
	}

	function requestClose() {
		setOpen(false);
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
		const panel = panelEl;
		if (!panel) {
			return;
		}

		if (!initialFocus) {
			panel.focus();
			return;
		}

		if (typeof initialFocus === "string") {
			const target = panel.querySelector<HTMLElement>(initialFocus);
			(target ?? panel).focus();
			return;
		}

		if (document.body.contains(initialFocus)) initialFocus.focus();
		else panel.focus();
	}

	$effect(() => {
		if (open) {
			previousActiveElement = (document.activeElement as HTMLElement) ?? null;
			lockScroll();
			tick().then(() => focusOnOpen());
		} else {
			unlockScroll();
			const target = returnFocusTo ?? previousActiveElement;
			if (target && document.body.contains(target)) {
				tick().then(() => target.focus());
			}
		}
	});

	$effect(() => {
		return () => {
			unlockScroll();
		};
	});

	function onPanelKeydown(e: KeyboardEvent) {
		if (e.key === "Escape" && closeOnEscape) {
			e.preventDefault();
			requestClose();
		}
	}

	function onBackdropClick() {
		if (closeOnOutsideClick) requestClose();
	}

	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				if (node.parentNode) node.parentNode.removeChild(node);
			},
		};
	}
</script>

{#if open}
	<div
		use:portal
		class={["ds-sheet", className].filter(Boolean).join(" ")}
		data-ds-side={side}
		data-ds-size={size}
	>
		<div
			class="ds-sheet-backdrop"
			transition:fade={{ duration: 160 }}
			onclick={onBackdropClick}
			aria-hidden="true"
		></div>
		<div
			{...rest}
			bind:this={panelEl}
			id={id}
			class="ds-sheet-panel"
			transition:fly={{
				duration: 200,
				x: side === "right" ? 260 : side === "left" ? -260 : 0,
				y: side === "bottom" ? 260 : 0,
				opacity: 1,
			}}
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
			aria-describedby={description ? descId : undefined}
			onkeydown={onPanelKeydown}
			tabindex="-1"
		>
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
	</div>
{/if}
