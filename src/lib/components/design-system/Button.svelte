<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";

	import type { ButtonVariant, Intent, Size } from "./types";
	import { toIntentCss } from "./types";

	interface Props extends HTMLButtonAttributes {
		size?: Size;
		variant?: ButtonVariant;
		intent?: Intent;
		loading?: boolean;
		fullWidth?: boolean;
		/** 로딩 시 SR에 읽힐 텍스트 */
		loadingLabel?: string;
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
		loadingLabel = "처리 중…",
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
	// 로딩 중에도 포커스 유지를 위해 native disabled는 disabled prop만 반영
	let isNativeDisabled = $derived(disabled);
	// UX상 비활성처럼 동작해야 하는 상태(로딩 포함)
	let isSoftDisabled = $derived(disabled || loading);
	// CSS 변수 보간 수정
	let iconSize = $derived(`var(--size-icon-${size})`);

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

	/** 로딩 중 중복 클릭 방지 */
	function guardIfLoading(e: Event) {
		if (!loading) return;
		e.preventDefault();
		e.stopPropagation();
	}
</script>

<button
	{...rest}
	bind:this={ref}
	{type}
	class={buttonClass}
	disabled={isNativeDisabled}
	aria-busy={loading || undefined}
	aria-disabled={isSoftDisabled || undefined}
	data-ds-size={size}
	data-ds-variant={variant}
	data-ds-intent={intentCss}
	data-ds-full-width={fullWidth ? "true" : undefined}
	data-ds-loading={loading || undefined}
	onclick={guardIfLoading}
	onkeydown={guardIfLoading}
>
	{#if loading}
		<span
			class="ds-icon i-lucide-loader-circle animate-spin"
			aria-hidden="true"
			style:width={iconSize}
			style:height={iconSize}
		></span>
		<!-- SR용 로딩 상태 안내 -->
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
</button>
