<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export type CardVariant = "outline" | "filled" | "elevated" | "ghost";
	export type CardPadding = "none" | "sm" | "md" | "lg";

	interface Props extends HTMLAttributes<HTMLElement> {
		variant?: CardVariant;
		padding?: CardPadding;
		motion?: boolean;
		tag?: string;
		href?: string;
		header?: Snippet;
		children?: Snippet;
		footer?: Snippet;
	}

	let {
		variant = "outline",
		padding = "md",
		motion = false,
		tag = "div",
		href,
		class: className = "",
		header,
		children,
		footer,
		...rest
	}: Props = $props();

	// href가 있으면 'a', 아니면 지정된 tag 사용
	let elementTag = $derived(href ? "a" : tag);

	let interactiveClass = $derived(href || rest.onclick ? "cursor-pointer" : "");

	let motionClass = $derived(motion ? "ds-motion" : "");

	// 패딩 처리는 CSS 변수로 위임하지 않고 data attribute로 넘겨서 CSS에서 처리
	// 전역 CSS (src/styles/design-system.css)에 이미 정의되어 있음
</script>

<svelte:element
	this={elementTag}
	{...rest}
	{...href ? { href } : {}}
	class={["ds-card", motionClass, interactiveClass, className]
		.filter(Boolean)
		.join(" ")}
	data-ds-variant={variant}
	data-ds-padding={padding}
	role={href || rest.onclick ? undefined : rest.role}
	tabindex={rest.onclick && !href ? 0 : rest.tabindex}
>
	{#if header}
		<div class="ds-card-header">
			{@render header()}
		</div>
	{/if}

	{#if children}
		<div class="ds-card-body">
			{@render children()}
		</div>
	{/if}

	{#if footer}
		<div class="ds-card-footer">
			{@render footer()}
		</div>
	{/if}
</svelte:element>
