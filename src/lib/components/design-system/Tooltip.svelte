<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { useId } from "$lib/shared/utils/use-id";

	export type TooltipPlacement = "top" | "bottom" | "left" | "right";

	type TriggerProps = {
		"aria-describedby"?: string;
	};

	interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
		content?: string;
		disabled?: boolean;
		delayMs?: number;
		closeDelayMs?: number;
		placement?: TooltipPlacement;
		arrow?: boolean;
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
		class: className = "",
		children,
		tooltip,
		...rest
	}: Props = $props();

	const tooltipId = useId("ds-tooltip");

	let isOpen = $state(false);
	let openTimer: number | null = null;
	let closeTimer: number | null = null;

	function clearTimers() {
		if (openTimer) clearTimeout(openTimer);
		if (closeTimer) clearTimeout(closeTimer);
		openTimer = null;
		closeTimer = null;
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
		clearTimers();
		openTimer = window.setTimeout(open, delayMs);
	}

	function scheduleClose() {
		clearTimers();
		closeTimer = window.setTimeout(close, closeDelayMs);
	}

	function onPointerEnter() {
		if (disabled) return;
		scheduleOpen();
	}

	function onPointerLeave() {
		scheduleClose();
	}

	function onFocus() {
		if (disabled) return;
		open();
	}

	function onBlur() {
		close();
	}

	function onKeyDown(e: KeyboardEvent) {
		if (e.key === "Escape" && isOpen) {
			e.stopPropagation();
			close();
		}
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (isOpen && e.key === "Escape") close();
	}}
/>

<span
	{...rest}
	class={`ds-tooltip-wrapper ${className}`.trim()}
	onpointerenter={onPointerEnter}
	onpointerleave={onPointerLeave}
	onfocusin={onFocus}
	onfocusout={onBlur}
	onkeydown={onKeyDown}
>
	{#if children}
		{@render children({ "aria-describedby": isOpen ? tooltipId : undefined })}
	{/if}

	{#if isOpen && !disabled && (content || tooltip)}
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
</span>
