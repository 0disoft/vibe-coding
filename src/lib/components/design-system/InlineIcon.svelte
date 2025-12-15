<script lang="ts">
	import { DsIcon } from "$lib/components/design-system";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	type Size = "sm" | "md" | "lg" | "inherit";
	type Side = "start" | "end";

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		name: string;
		side?: Side;
		size?: Size;
		/**
		 * 텍스트가 없을 때만 의미 아이콘으로 사용.
		 * 텍스트(children)가 있으면 아이콘은 장식용(자동 aria-hidden).
		 */
		label?: string;
		children?: Snippet;
	}

	let {
		name,
		side = "start",
		size = "inherit",
		label,
		class: className = "",
		children,
		...rest
	}: Props = $props();

	// 텍스트(children)가 있으면 아이콘은 장식용이므로 라벨 제거
	let iconLabel = $derived(children ? undefined : label);
</script>

<span
	{...rest}
	class={`ds-inline-icon ${className}`.trim()}
	data-ds-side={side}
>
	{#if side === "start"}
		<DsIcon {name} {size} label={iconLabel} />
	{/if}

	{#if children}
		<span>{@render children()}</span>
	{/if}

	{#if side === "end"}
		<DsIcon {name} {size} label={iconLabel} />
	{/if}
</span>
