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
		ref = $bindable(null),
		class: className = "",
		children,
		start,
		end,
		...rest
	}: Props = $props();

	let intentCss = $derived(toIntentCss(intent));
	let isDisabled = $derived(disabled || loading);

	// 클래스 조합
	let buttonClass = $derived(
		[
			"ds-button ds-focus-ring ds-touch-target",
			fullWidth ? "w-full justify-center" : "",
			className,
		]
			.filter(Boolean)
			.join(" "),
	);
</script>

<button
	{...rest}
	bind:this={ref}
	{type}
	class={buttonClass}
	disabled={isDisabled}
	aria-busy={loading || undefined}
	aria-disabled={isDisabled ? "true" : undefined}
	data-ds-size={size}
	data-ds-variant={variant}
	data-ds-intent={intentCss}
	data-ds-full-width={fullWidth ? "true" : undefined}
>
	{#if loading}
		<span
			class="ds-icon i-lucide-loader-circle animate-spin"
			aria-hidden="true"
			style:width="var(--size-icon-{size})"
			style:height="var(--size-icon-{size})"
		></span>
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
