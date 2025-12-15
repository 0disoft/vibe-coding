<script lang="ts">
	import type { HTMLInputAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";
	import DsIconButton from "./IconButton.svelte"; // 순환 참조 방지

	type Size = "sm" | "md" | "lg";
	type Variant = "outline" | "filled";

	interface Props extends Omit<HTMLInputAttributes, "size"> {
		size?: Size;
		variant?: Variant;
		invalid?: boolean;
		clearable?: boolean;
		ref?: HTMLInputElement | null;
		start?: Snippet;
		end?: Snippet;
	}

	let {
		size = "md",
		variant = "outline",
		invalid = false,
		clearable = false,
		value = $bindable(""),
		ref = $bindable(null),
		class: className = "",
		start,
		end,
		...rest
	}: Props = $props();

	let minHeight = $derived(
		size === "sm" ? "36px" : size === "lg" ? "48px" : "44px",
	);

	let bgClass = $derived(variant === "filled" ? "bg-muted" : "bg-background");
	let borderClass = $derived(invalid ? "border-destructive" : "border-input");

	let variantClass = $derived(
		`ds-focus-ring w-full border ${borderClass} ${bgClass} text-body placeholder:text-muted-foreground/60`,
	);

	// Padding 계산
	let paddingStyle = $derived.by(() => {
		let pl = "var(--input-padding-x)";
		let pr = "var(--input-padding-x)";

		// start 슬롯 존재 시 왼쪽 패딩 확보 (기본 2.5rem = 40px)
		if (start) pl = "var(--input-padding-start, 2.5rem)";
		// end 슬롯 또는 clear 버튼 존재 시 오른쪽 패딩 확보
		if (end || (clearable && value)) pr = "var(--input-padding-end, 2.5rem)";

		return `padding-left: ${pl}; padding-right: ${pr};`;
	});

	let style = $derived(
		`border-radius: var(--input-radius); min-height: ${minHeight}; ${paddingStyle}`,
	);

	function handleClear() {
		value = "";
		ref?.focus();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (clearable && value && e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			handleClear();
		}
	}
</script>

<div class={`relative w-full ${className}`}>
	{#if start}
		<div
			class="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground"
		>
			{@render start()}
		</div>
	{/if}

	<input
		{...rest}
		bind:this={ref}
		bind:value
		class={variantClass}
		style={style}
		aria-invalid={invalid ? "true" : undefined}
		onkeydown={handleKeydown}
	/>

	{#if end}
		<div
			class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground"
		>
			{@render end()}
		</div>
	{:else if clearable && value && !rest.disabled && !rest.readonly}
		<div class="absolute right-2 top-1/2 -translate-y-1/2">
			<DsIconButton
				icon="x"
				size="sm"
				variant="ghost"
				intent="secondary"
				label="Clear value"
				onclick={handleClear}
				tabindex={-1}
			/>
		</div>
	{/if}
</div>