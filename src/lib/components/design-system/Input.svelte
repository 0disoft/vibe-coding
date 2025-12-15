<script lang="ts">
	import { DsIconButton } from "$lib/components/design-system";
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
		size = "md",
		variant = "outline",
		invalid = false,
		clearable = false,
		value = $bindable(""),
		ref = $bindable(null),
		clearLabel = "값 지우기",
		class: className = "",
		start,
		end,
		...rest
	}: Props = $props();

	async function handleClear() {
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
		// onkeydown prop 전달 지원
		// @ts-ignore - Svelte HTML attributes typing issue
		if (!e.defaultPrevented) rest.onkeydown?.(e);
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
			/>
		</div>
	{/if}
</div>
