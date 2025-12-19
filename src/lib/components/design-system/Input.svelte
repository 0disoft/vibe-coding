<script lang="ts">
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
		clearLabel = m.ds_clear_value(),
		class: className = "",
		start,
		end,
		...rest
	}: Props = $props();

	// onkeydown은 Props(HTMLInputAttributes)에 포함되어 있으나,
	// rest로 넘어올 때 Svelte 5의 이벤트 바인딩 처리와 충돌할 수 있으므로 명시적으로 추출하여 사용 권장
	let { onkeydown } = rest as { onkeydown?: (e: KeyboardEvent) => void };

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

	{#if end}
		<div class="ds-input-adornment end">
			{@render end()}
		</div>
	{:else if showClearBtn}
		<div class="ds-input-adornment end">
			<DsIconButton
				type="button"
				icon="x"
				size="sm"
				variant="ghost"
				intent="secondary"
				label={clearLabel}
				onclick={handleClear}
				onmousedown={(e) => e.preventDefault()}
			/>
		</div>
	{/if}
</div>
