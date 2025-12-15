<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAnchorAttributes, HTMLAttributes } from "svelte/elements";

	export type CardVariant = "outline" | "filled" | "elevated" | "ghost";
	export type CardPadding = "none" | "sm" | "md" | "lg";

	type BaseProps = HTMLAttributes<HTMLElement> &
		Omit<HTMLAnchorAttributes, keyof HTMLAttributes<HTMLElement>>;

	interface Props extends BaseProps {
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

	let hasOnClick = $derived(!!rest.onclick);
	let isLink = $derived(!!href);
	let isInteractive = $derived(isLink || hasOnClick);

	// href가 있으면 'a', 아니면 지정된 tag 사용
	let elementTag = $derived(isLink ? "a" : tag);

	// 클릭 가능한데 button/a가 아니면 role=button + 키보드 지원 필요
	let needsButtonSemantics = $derived(
		isInteractive && !isLink && elementTag !== "button",
	);

	let interactiveClass = $derived(
		isInteractive ? "cursor-pointer ds-focus-ring" : "",
	);
	let motionClass = $derived(motion ? "ds-motion" : "");

	// tabindex: 사용자가 지정했으면 존중, 아니면 클릭 가능한 비-button 엘리먼트에만 0 부여
	let computedTabIndex = $derived(
		rest.tabindex ?? (needsButtonSemantics ? 0 : undefined),
	);

	// role: 사용자가 지정했으면 존중, 아니면 클릭 가능한 비-button 엘리먼트에 role=button
	let computedRole = $derived(
		rest.role ?? (needsButtonSemantics ? "button" : undefined),
	);

	/** role=button 패턴: Enter/Space로 클릭 활성화 */
	function handleKeyDown(e: KeyboardEvent) {
		if (!needsButtonSemantics) return;
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault(); // Space 스크롤 방지
			(e.currentTarget as HTMLElement).click();
		}
	}
</script>

<svelte:element
	this={elementTag}
	{...rest}
	{...elementTag === "a" && href ? { href } : {}}
	class={["ds-card", motionClass, interactiveClass, className]
		.filter(Boolean)
		.join(" ")}
	data-ds-variant={variant}
	data-ds-padding={padding}
	data-ds-interactive={isInteractive || undefined}
	role={computedRole}
	tabindex={computedTabIndex}
	onkeydown={handleKeyDown}
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
