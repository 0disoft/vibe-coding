<script lang="ts">
	import { DsIconButton } from "$lib/components/design-system";
	import type { Snippet } from "svelte";
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
		// onkeydown prop 전달 지원
		// @ts-ignore - Svelte HTML attributes typing issue
		rest.onkeydown?.(e);
	}

	function onWrapperClick(e: MouseEvent) {
		if (e.target !== ref) {
			ref?.focus();
		}
	}

	let showClearBtn = $derived(
		clearable &&
			value !== "" &&
			value !== null &&
			!rest.disabled &&
			!rest.readonly,
	);
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class={`ds-input-group ${className}`.trim()}
	data-ds-size={size}
	data-ds-variant={variant}
	data-invalid={invalid ? "true" : undefined}
	data-disabled={rest.disabled ? "true" : undefined}
	onclick={onWrapperClick}
	onkeydown={undefined}
	role="presentation"
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
