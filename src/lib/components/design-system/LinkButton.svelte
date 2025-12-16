<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAnchorAttributes } from "svelte/elements";

	import * as m from "$lib/paraglide/messages.js";

	import type { ButtonVariant, Intent, Size } from "./types";
	import { toIntentCss } from "./types";

	interface Props extends HTMLAnchorAttributes {
		size?: Size;
		variant?: ButtonVariant;
		intent?: Intent;
		disabled?: boolean;
		fullWidth?: boolean;
		loading?: boolean;
		/** 로딩 SR 텍스트 (i18n) */
		loadingLabel?: string;
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
		loadingLabel = m.ds_navigating(),
		href,
		tabindex,
		class: className = "",
		children,
		start,
		end,
		...rest
	}: Props = $props();

	let intentCss = $derived(toIntentCss(intent));
	let isDisabled = $derived(disabled || loading);
	// CSS 변수 보간 수정
	let iconSize = $derived(`var(--size-icon-${size})`);

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
	tabindex={isDisabled ? -1 : tabindex}
	draggable={isDisabled ? "false" : undefined}
	onclick={handleClick}
	data-ds-size={size}
	data-ds-variant={variant}
	data-ds-intent={intentCss}
	data-ds-full-width={fullWidth ? "true" : undefined}
	data-ds-disabled={isDisabled ? "true" : undefined}
>
	{#if loading}
		<span
			class="ds-icon i-lucide-loader-circle animate-spin"
			aria-hidden="true"
			style:width={iconSize}
			style:height={iconSize}
		></span>
		<span class="sr-only" aria-live="polite">{loadingLabel}</span>
	{:else if start}
		{@render start()}
	{/if}

	{#if children}
		{@render children()}
	{/if}

	{#if !loading && end}
		{@render end()}
	{/if}
</a>
