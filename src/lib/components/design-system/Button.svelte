<script lang="ts">
	import { page } from "$app/state";
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";

	import { DsIcon } from "$lib/components/design-system";
	import * as m from "$lib/paraglide/messages.js";

	import type { ButtonVariant, Intent, Size } from "./types";
	import { toIntentCss } from "./types";

	type ButtonClickEvent = Parameters<
		NonNullable<HTMLButtonAttributes["onclick"]>
	>[0];
	type ButtonKeyDownEvent = Parameters<
		NonNullable<HTMLButtonAttributes["onkeydown"]>
	>[0];

	interface Props extends HTMLButtonAttributes {
		size?: Size;
		variant?: ButtonVariant;
		intent?: Intent;
		loading?: boolean;
		fullWidth?: boolean;
		/** 로딩 시 SR에 읽힐 텍스트 */
		loadingLabel?: string;
		// Support both binding and callback (for actions)
		ref?: HTMLButtonElement | null | ((node: HTMLButtonElement) => void);
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
		loadingLabel,
		disabled = false,
		type = "button",
		ref = $bindable(null),
		class: className = "",
		children,
		start,
		end,
		onclick,
		onkeydown,
		...rest
	}: Props = $props();

	// Reactive i18n
	let resolvedLoadingLabel = $derived.by(() => {
		void page.url;
		return loadingLabel ?? m.ds_loading();
	});

	let intentCss = $derived(toIntentCss(intent));
	// 로딩 중에도 포커스 유지를 위해 native disabled는 disabled prop만 반영
	let isNativeDisabled = $derived(disabled);
	// UX상 비활성처럼 동작해야 하는 상태(로딩 포함)
	let isSoftDisabled = $derived(disabled || loading);

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

	/** Ref Action to handle both binding and callback */
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

	/** 로딩 중 중복 클릭 방지 */
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
			e.preventDefault();
			e.stopPropagation();
			return;
		}
		onkeydown?.(e);
	}
</script>

<button
	{...rest}
	use:refAction
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
	data-ds-disabled={isSoftDisabled ? "true" : undefined}
	onclick={handleClick}
	onkeydown={handleKeyDown}
>
	{#if loading}
		<DsIcon
			name="loader-circle"
			size="inherit"
			class="ds-button__loader animate-spin"
			aria-hidden="true"
		/>
		<!-- SR용 로딩 상태 안내 -->
		<span class="sr-only" aria-live="polite">{resolvedLoadingLabel}</span>
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
