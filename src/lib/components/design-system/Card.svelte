<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export type CardVariant = "outline" | "filled" | "elevated" | "ghost";
	export type CardPadding = "none" | "sm" | "md" | "lg";

	interface Props extends HTMLAttributes<HTMLDivElement> {
		variant?: CardVariant;
		padding?: CardPadding;
		motion?: boolean;
		header?: Snippet;
		children?: Snippet;
		footer?: Snippet;
	}

	let {
		variant = "outline",
		padding = "md",
		motion = false,
		class: className = "",
		header,
		children,
		footer,
		...rest
	}: Props = $props();

	const baseClass = "ds-card";
	let motionClass = $derived(motion ? "ds-motion" : "");
</script>

<div
	{...rest}
	class={`${baseClass} ${motionClass} ${className}`.trim()}
	data-ds-variant={variant}
	data-ds-padding={padding}
>
	{#if header}
		<div class="ds-card-header">
			{@render header()}
		</div>
	{/if}

	{#if children}
		<div class="ds-card-body">
			{@render children()}
		</div>
	{/if}

	{#if footer}
		<div class="ds-card-footer">
			{@render footer()}
		</div>
	{/if}
</div>