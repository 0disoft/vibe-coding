<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";

	import { DsIcon } from "$lib/components/design-system";
	import * as m from "$lib/paraglide/messages.js";

	import type { IconButtonVariant, IntentWithNeutral, Size } from "./types";
	import { toIntentCss } from "./types";

	type ButtonClickEvent = Parameters<
		NonNullable<HTMLButtonAttributes["onclick"]>
	>[0];
	type ButtonKeyDownEvent = Parameters<
		NonNullable<HTMLButtonAttributes["onkeydown"]>
	>[0];

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
		/** 로딩 SR 텍스트 */
		loadingLabel?: string;
		/** Svelte 5 ref 바인딩 (액션 콜백 포함) */
		ref?: HTMLButtonElement | null | ((node: HTMLElement) => void);
		/** 터치 타겟(44px) 적용 여부 (기본값 true) */
		touchTarget?: boolean;
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
		loadingLabel = m.ds_loading(),
		type = "button",
		ref = $bindable(null),
		class: className = "",
		children,
		onclick,
		onkeydown,
		touchTarget = true,
		...rest
	}: Props = $props();

	let intentCss = $derived(toIntentCss(intent));
	// 로딩 중에도 포커스 유지를 위해 native disabled는 disabled prop만 반영
	let isNativeDisabled = $derived(disabled);
	let isSoftDisabled = $derived(disabled || loading);
	let computedAriaLabel = $derived(
		loading ? `${label} (${loadingLabel})` : label,
	);

	// 클래스 조합
	let buttonClass = $derived(
		[
			"ds-icon-button ds-focus-ring",
			touchTarget ? "ds-touch-target" : "",
			isSoftDisabled ? "is-disabled" : "",
			className,
		]
			.filter(Boolean)
			.join(" "),
	);

	/** 로딩 중 중복 클릭 방지 래퍼 */
	function handleClick(e: ButtonClickEvent) {
		if (loading) {
			e.preventDefault();
			e.stopPropagation();
			return;
		}
		onclick?.(e);
	}

	function handleKeyDown(e: ButtonKeyDownEvent) {
		if (loading) {
			if (e.key !== "Tab") {
				e.preventDefault();
				e.stopPropagation();
			}
			return;
		}
		onkeydown?.(e);
	}

	function refAction(node: HTMLButtonElement) {
		if (typeof ref === "function") {
			ref(node);
		} else {
			ref = node;
		}

		return {
			destroy() {
				if (typeof ref === "function") {
					// noop
				} else if (ref === node) {
					ref = null;
				}
			},
		};
	}
</script>

<button
	{...rest}
	use:refAction
	{type}
	class={buttonClass}
	disabled={isNativeDisabled}
	aria-disabled={isSoftDisabled || undefined}
	aria-busy={loading || undefined}
	aria-label={computedAriaLabel}
	aria-pressed={pressed === undefined ? undefined : pressed}
	data-ds-size={size}
	data-ds-variant={variant}
	data-ds-intent={intentCss}
	onclick={handleClick}
	onkeydown={handleKeyDown}
>
	{#if loading}
		<DsIcon name="loader-circle" {size} class="animate-spin" />
	{:else}
		{#if icon}
			<DsIcon name={icon} {size} {flipInRtl} />
		{/if}
		{#if children}
			{@render children()}
		{/if}
	{/if}
</button>
