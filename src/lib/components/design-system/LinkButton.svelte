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
		fullWidth?: boolean;
		loading?: boolean;
		children?: Snippet;
		start?: Snippet;
		end?: Snippet;
	}

	let {
		size = "md",
		variant = "solid",
		intent = "primary",
		disabled = false,
		fullWidth = false,
		loading = false,
		href,
		class: className = "",
		children,
		start,
		end,
		...rest
	}: Props = $props();

	let intentCss = $derived(toIntentCss(intent));
	let isDisabled = $derived(disabled || loading);

	function handleClick(e: MouseEvent) {
		if (isDisabled) {
			e.preventDefault();
			e.stopPropagation();
			return;
		}
		// @ts-ignore
		rest.onclick?.(e);
	}

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

<a
	{...rest}
	href={isDisabled ? undefined : href}
	class={buttonClass}
	aria-disabled={isDisabled ? "true" : undefined}
	aria-busy={loading || undefined}
	tabindex={isDisabled ? -1 : undefined}
	draggable={isDisabled ? "false" : undefined}
	role="button"
	onclick={handleClick}
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
</a>
