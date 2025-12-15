<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";

	import type { Size, Intent, ButtonVariant } from "./types";
	import { toIntentCss } from "./types";

	interface Props extends HTMLButtonAttributes {
		size?: Size;
		variant?: ButtonVariant;
		intent?: Intent;
		loading?: boolean;
		fullWidth?: boolean;
		ref?: HTMLButtonElement | null;
		children?: Snippet;
		start?: Snippet;
		end?: Snippet;
	}

	let {
		size = "md",
		variant = "solid",
		intent = "primary",
		loading = false,
		fullWidth = false,
		disabled = false,
		type = "button",
		ref = $bindable<HTMLButtonElement | null>(null),
		class: className = "",
		children,
		start,
		end,
		...rest
	}: Props = $props();

	let intentCss = $derived(toIntentCss(intent));

	let padding = $derived(
		size === "sm"
			? "var(--button-padding-y-sm) var(--button-padding-x-sm)"
			: size === "lg"
				? "var(--button-padding-y-lg) var(--button-padding-x-lg)"
				: "var(--button-padding-y-md) var(--button-padding-x-md)",
	);

	const baseClass = "ds-button ds-focus-ring ds-touch-target";
	let stateClass = $derived(
		disabled || loading ? "cursor-not-allowed" : "cursor-pointer",
	);
	let widthClass = $derived(fullWidth ? "w-full flex justify-center" : "");
	
	let style = $derived(
		`padding: ${padding}; border-radius: var(--button-radius);`,
	);
</script>

<button
	{...rest}
	bind:this={ref}
	{type}
	class={`${baseClass} ${stateClass} ${widthClass} ${className}`.trim()}
	style={`${style}${disabled || loading ? ` opacity: var(--opacity-disabled);` : ""}`}
	disabled={disabled || loading}
	aria-busy={loading || undefined}
	data-ds-size={size}
	data-ds-variant={variant}
	data-ds-intent={intentCss}
	data-ds-full-width={fullWidth ? "true" : undefined}
>
	{#if loading}
		<span class="ds-icon i-lucide-loader-circle animate-spin" aria-hidden="true" style:width="var(--size-icon-{size})" style:height="var(--size-icon-{size})"></span>
	{:else if start}
		{@render start()}
	{/if}

	{#if children}
		{@render children()}
	{/if}

	{#if end}
		{@render end()}
	{/if}
</button>