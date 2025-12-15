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
		pressed?: boolean;
		disabled?: boolean;
		loading?: boolean;
		flipInRtl?: boolean;
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
		type = "button",
		ref = $bindable(null),
		class: className = "",
		children,
		...rest
	}: Props = $props();

	let intentCss = $derived(toIntentCss(intent));
	let isDisabled = $derived(disabled || loading);

	// 클래스 조합
	let buttonClass = $derived(
		[
			"ds-icon-button ds-focus-ring ds-touch-target",
			isDisabled ? "is-disabled" : "",
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
	aria-label={label}
	title={label}
	aria-pressed={pressed}
	data-ds-size={size}
	data-ds-variant={variant}
	data-ds-intent={intentCss}
>
	{#if loading}
		<DsIcon name="loader-circle" size={size} class="animate-spin" />
	{:else}
		{#if icon}
			<DsIcon name={icon} size={size} {flipInRtl} />
		{/if}
		{#if children}
			{@render children()}
		{/if}
	{/if}
</button>
