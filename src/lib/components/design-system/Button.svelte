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
		ref?: HTMLButtonElement | null;
		children?: Snippet;
	}

	let {
		size = "md",
		variant = "solid",
		intent = "primary",
		loading = false,
		disabled = false,
		type = "button",
		ref = $bindable<HTMLButtonElement | null>(null),
		class: className = "",
		children,
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
	let style = $derived(
		`padding: ${padding}; border-radius: var(--button-radius);`,
	);
</script>

<button
	{...rest}
	bind:this={ref}
	{type}
	class={`${baseClass} ${stateClass} ${className}`.trim()}
	style={`${style}${disabled || loading ? ` opacity: var(--opacity-disabled);` : ""}`}
	disabled={disabled || loading}
	aria-busy={loading || undefined}
	data-ds-size={size}
	data-ds-variant={variant}
	data-ds-intent={intentCss}
>
	{#if children}
		{@render children()}
	{/if}
</button>
