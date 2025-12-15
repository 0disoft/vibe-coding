<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	type Size = "sm" | "md" | "lg" | "xl" | "inherit";

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		name: string;
		size?: Size;
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

	let ariaHidden = $derived(label ? undefined : true);
	let role = $derived(label ? "img" : undefined);
</script>

<span
	{...rest}
	class={`ds-icon i-lucide-${name} ${className}`.trim()}
	{role}
	aria-label={label}
	aria-hidden={ariaHidden}
	data-ds-size={size}
	data-ds-flip-rtl={flipInRtl ? "true" : undefined}
></span>
