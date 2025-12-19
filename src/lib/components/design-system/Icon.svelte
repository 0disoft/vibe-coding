<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	type Size = "xs" | "sm" | "md" | "lg" | "xl" | "inherit";

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		name: string;
		size?: Size;
		/** 아이콘이 의미를 가질 때만 제공 (장식용이면 비워두기) */
		label?: string;
		flipInRtl?: boolean;
	}

	let {
		name,
		size = "md",
		label,
		flipInRtl = false,
		class: className = "",
		...rest
	}: Props = $props();

	let hasLabel = $derived(!!label?.trim());
	let role = $derived(hasLabel ? "img" : undefined);
</script>

<span
	{...rest}
	class={`ds-icon i-lucide-${name} ${className}`.trim()}
	{role}
	aria-label={hasLabel ? label : undefined}
	aria-hidden={hasLabel ? undefined : true}
	data-ds-size={size}
	data-ds-flip-rtl={flipInRtl ? "true" : undefined}
></span>
