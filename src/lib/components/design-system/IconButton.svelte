<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";

	import { DsIcon } from "$lib/components/design-system";

	import type { IconButtonVariant, IntentWithNeutral, Size } from "./types";
	import { toIntentCss } from "./types";

	interface Props extends HTMLButtonAttributes {
		label: string;
		icon?: string;
		size?: Size;
		variant?: IconButtonVariant;
		intent?: IntentWithNeutral;
		/** 토글 버튼일 때만 사용 (미지정이면 일반 버튼) */
		pressed?: boolean;
		disabled?: boolean;
		loading?: boolean;
		flipInRtl?: boolean;
		/** 툴팁 표시 여부 */
		showTitle?: boolean;
		/** 로딩 SR 텍스트 */
		loadingLabel?: string;
		ref?: HTMLButtonElement | null;
		children?: Snippet;
	}

	let {
		label,
		icon,
		size = "md",
		variant = "ghost",
		intent = "neutral",
		pressed,
		loading = false,
		disabled = false,
		flipInRtl = false,
		showTitle = false,
		loadingLabel = "처리 중…",
		type = "button",
		ref = $bindable(null),
		class: className = "",
		children,
		...rest
	}: Props = $props();

	let intentCss = $derived(toIntentCss(intent));
	// 로딩 중에도 포커스 유지를 위해 native disabled는 disabled prop만 반영
	let isNativeDisabled = $derived(disabled);
	let isSoftDisabled = $derived(disabled || loading);

	// 클래스 조합
	let buttonClass = $derived(
		[
			"ds-icon-button ds-focus-ring ds-touch-target",
			isSoftDisabled ? "is-disabled" : "",
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
	aria-disabled={isSoftDisabled || undefined}
	aria-busy={loading || undefined}
	aria-label={label}
	title={showTitle ? label : undefined}
	aria-pressed={pressed === undefined ? undefined : pressed}
	data-ds-size={size}
	data-ds-variant={variant}
	data-ds-intent={intentCss}
	onclick={guardIfLoading}
	onkeydown={guardIfLoading}
>
	{#if loading}
		<DsIcon name="loader-circle" {size} class="animate-spin" />
		<span class="sr-only" aria-live="polite">{loadingLabel}</span>
	{:else}
		{#if icon}
			<DsIcon name={icon} {size} {flipInRtl} />
		{/if}
		{#if children}
			{@render children()}
		{/if}
	{/if}
</button>
