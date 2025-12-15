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
		loading?: boolean; // LinkButton도 로딩 상태 시각적 표현 지원 (클릭 방지 포함)
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

	let padding = $derived(
		size === "sm"
			? "var(--button-padding-y-sm) var(--button-padding-x-sm)"
			: size === "lg"
				? "var(--button-padding-y-lg) var(--button-padding-x-lg)"
				: "var(--button-padding-y-md) var(--button-padding-x-md)",
	);

	const baseClass = "ds-button ds-focus-ring ds-touch-target";
	let stateClass = $derived(disabled || loading ? "cursor-not-allowed" : "cursor-pointer");
	let widthClass = $derived(fullWidth ? "w-full flex justify-center" : "");

	let style = $derived(
		`padding: ${padding}; border-radius: var(--button-radius);${disabled || loading ? " opacity: var(--opacity-disabled);" : ""}`,
	);
</script>

<a
	{...rest}
	href={disabled || loading ? undefined : href}
	class={`${baseClass} ${stateClass} ${widthClass} ${className}`.trim()}
	{style}
	aria-disabled={disabled || loading ? "true" : undefined}
	aria-busy={loading || undefined}
	tabindex={disabled || loading ? -1 : undefined}
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
</a>