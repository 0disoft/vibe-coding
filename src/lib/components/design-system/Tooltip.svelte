<script lang="ts">
	import { useId } from "$lib/shared/utils/use-id";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export type TooltipPlacement = "top" | "bottom" | "left" | "right";

	type TriggerProps = {
		"aria-describedby"?: string;
	};

	type As = "span" | "div";

	interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		content?: string;
		disabled?: boolean;
		delayMs?: number;
		closeDelayMs?: number;
		placement?: TooltipPlacement;
		arrow?: boolean;
		as?: As;

		/** 터치 환경에서 툴팁을 기본 비활성(권장) */
		disableOnCoarsePointer?: boolean;

		children?: Snippet<[TriggerProps]>;
		tooltip?: Snippet;
	}

	let {
		content,
		disabled = false,
		delayMs = 500,
		closeDelayMs = 150,
		placement = "top",
		arrow = true,
		as = "span",
		disableOnCoarsePointer = true,
		class: className = "",
		children,
		tooltip,
		...rest
	}: Props = $props();

	const tooltipId = useId("ds-tooltip");

	let isOpen = $state(false);
	let openTimer: number | null = null;
	let closeTimer: number | null = null;

	function isCoarsePointer() {
		return window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
	}

	let isActuallyDisabled = $derived(
		disabled ||
			(disableOnCoarsePointer &&
				typeof window !== "undefined" &&
				isCoarsePointer()),
	);

	function clearOpenTimer() {
		if (openTimer) clearTimeout(openTimer);
		openTimer = null;
	}
	function clearCloseTimer() {
		if (closeTimer) clearTimeout(closeTimer);
		closeTimer = null;
	}
	function clearTimers() {
		clearOpenTimer();
		clearCloseTimer();
	}

	function open() {
		clearTimers();
		isOpen = true;
	}

	function close() {
		clearTimers();
		isOpen = false;
	}

	function scheduleOpen() {
		clearCloseTimer();
		clearOpenTimer();
		openTimer = window.setTimeout(open, delayMs);
	}

	function scheduleClose() {
		clearOpenTimer();
		clearCloseTimer();
		closeTimer = window.setTimeout(close, closeDelayMs);
	}

	function onPointerEnter() {
		if (isActuallyDisabled) return;
		scheduleOpen();
	}

	function onPointerLeave() {
		scheduleClose();
	}

	function onFocusIn() {
		if (isActuallyDisabled) return;
		open();
	}

	function onFocusOut(e: FocusEvent) {
		// wrapper 내부 포커스 이동이면 닫지 않기
		const next = e.relatedTarget as Node | null;
		const current = e.currentTarget as HTMLElement;
		if (next && current.contains(next)) return;
		close();
	}

	function onKeyDown(e: KeyboardEvent) {
		if (e.key === "Escape" && isOpen) {
			e.stopPropagation();
			close();
		}
	}

	// ✅ disabled가 켜지면 강제로 닫기
	$effect(() => {
		if (isActuallyDisabled && isOpen) close();
	});

	// describedby는 content/tooltip이 있을 때만 제공(열렸을 때만 X)
	let describedBy = $derived(
		(content || tooltip) && !isActuallyDisabled ? tooltipId : undefined,
	);
</script>

<svelte:element
	this={as}
	{...rest}
	class={`ds-tooltip-wrapper ${className}`.trim()}
	onpointerenter={onPointerEnter}
	onpointerleave={onPointerLeave}
	onfocusin={onFocusIn}
	onfocusout={onFocusOut}
	onkeydown={onKeyDown}
>
	{#if children}
		{@render children({ "aria-describedby": describedBy })}
	{/if}

	{#if isOpen && !isActuallyDisabled && (content || tooltip)}
		<div
			role="tooltip"
			id={tooltipId}
			class="ds-tooltip"
			data-placement={placement}
			onpointerenter={open}
			onpointerleave={scheduleClose}
		>
			<div class="ds-tooltip-content ds-elevation-2">
				{#if tooltip}
					{@render tooltip()}
				{:else}
					{content}
				{/if}

				{#if arrow}
					<div class="ds-tooltip-arrow" aria-hidden="true"></div>
				{/if}
			</div>
		</div>
	{/if}
</svelte:element>
