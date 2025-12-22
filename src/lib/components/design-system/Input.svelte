<script lang="ts">
	import { page } from "$app/state";
	import { DsIconButton } from "$lib/components/design-system";
	import * as m from "$lib/paraglide/messages.js";
	import type { Snippet } from "svelte";
	import { tick } from "svelte";
	import type { HTMLInputAttributes } from "svelte/elements";

	type Size = "sm" | "md" | "lg";
	type Variant = "outline" | "filled" | "ghost";

	interface Props extends Omit<HTMLInputAttributes, "size"> {
		size?: Size;
		variant?: Variant;
		invalid?: boolean;
		clearable?: boolean;
		value?: string | number | null;
		ref?: HTMLInputElement | null;
		start?: Snippet;
		end?: Snippet;
		/** 지우기 버튼 레이블 (i18n) */
		clearLabel?: string;
		onkeydown?: (e: KeyboardEvent) => void;
	}

	let {
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledby,
		size = "md",
		variant = "outline",
		invalid = false,
		clearable = false,
		value = $bindable(""),
		ref = $bindable(null),
		clearLabel,
		class: className = "",
		start,
		end,
		onkeydown,
		...rest
	}: Props = $props();

	// Reactive i18n
	let resolvedClearLabel = $derived.by(() => {
		void page.url;
		return clearLabel ?? m.ds_clear_value();
	});

	async function handleClear(e?: Event) {
		e?.stopPropagation();
		value = "";
		await tick();

		if (ref) {
			// 폼/검증 라이브러리들이 input 이벤트를 기대하는 경우 대비
			ref.dispatchEvent(new Event("input", { bubbles: true }));
			ref.focus();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (clearable && value && e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			handleClear();
			return;
		}

		if (!e.defaultPrevented) onkeydown?.(e);
	}

	function triggerFocus(node: HTMLElement) {
		function handler(e: MouseEvent) {
			const t = e.target as HTMLElement | null;
			if (!t || !ref) return;
			if (t === ref) return;
			const interactive = t.closest(
				'button, a, input, select, textarea, [role="button"], [role="link"]',
			);
			if (interactive) return;
			ref.focus();
		}
		node.addEventListener("click", handler);
		return {
			destroy() {
				node.removeEventListener("click", handler);
			},
		};
	}

	let showClearBtn = $derived(
		clearable &&
			value !== "" &&
			value !== null &&
			!rest.disabled &&
			!rest.readonly,
	);

	let shouldReserveEnd = $derived(!!end || showClearBtn);
</script>

<div
	class={`ds-input-group ${className}`.trim()}
	data-ds-size={size}
	data-ds-variant={variant}
	data-invalid={invalid ? "true" : undefined}
	data-disabled={rest.disabled ? "true" : undefined}
	use:triggerFocus
>
	{#if start}
		<div class="ds-input-adornment start">
			{@render start()}
		</div>
	{/if}

	<input
		{...rest}
		bind:this={ref}
		bind:value
		class="ds-input-native"
		aria-label={ariaLabel}
		aria-labelledby={ariaLabelledby}
		aria-invalid={invalid ? "true" : undefined}
		onkeydown={handleKeydown}
	/>

	{#if shouldReserveEnd}
		<div class="ds-input-adornment end">
			{#if end}
				{@render end()}
			{/if}
			{#if showClearBtn}
				<DsIconButton
					type="button"
					icon="x"
					size="sm"
					variant="ghost"
					intent="secondary"
					touchTarget={false}
					label={resolvedClearLabel}
					onclick={handleClear}
					onmousedown={(e) => e.preventDefault()}
				/>
			{/if}
		</div>
	{/if}
</div>
