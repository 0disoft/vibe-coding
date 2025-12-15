<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAnchorAttributes } from "svelte/elements";

	import type { ButtonVariant, Intent, Size } from "./types";
	import { toIntentCss } from "./types";

	interface Props extends HTMLAnchorAttributes {
		size?: Size;
		variant?: ButtonVariant;
		intent?: Intent;
		disabled?: boolean;
		children?: Snippet;
	}

	let {
		size = "md",
		variant = "solid",
		intent = "primary",
		disabled = false,
		href,
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
	let stateClass = $derived(disabled ? "cursor-not-allowed" : "cursor-pointer");
	let style = $derived(
		`padding: ${padding}; border-radius: var(--button-radius);${disabled ? " opacity: var(--opacity-disabled);" : ""}`,
	);
</script>

<a
	{...rest}
	href={disabled ? undefined : href}
	class={`${baseClass} ${stateClass} ${className}`.trim()}
	{style}
	aria-disabled={disabled ? "true" : undefined}
	tabindex={disabled ? -1 : undefined}
	data-ds-size={size}
	data-ds-variant={variant}
	data-ds-intent={intentCss}
>
	{#if children}
		{@render children()}
	{/if}
</a>
