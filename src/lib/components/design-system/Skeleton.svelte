<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	type SkeletonVariant = "rectangular" | "circular" | "text";

	interface Props extends HTMLAttributes<HTMLDivElement> {
		width?: string;
		height?: string;
		variant?: SkeletonVariant;
		animate?: boolean;
	}

	let {
		width,
		height,
		variant = "rectangular",
		animate = true,
		class: className = "",
		style = "",
		...rest
	}: Props = $props();

	let defaultStyles = $derived.by(() => {
		const s = [];
		if (width) s.push(`width: ${width}`);
		if (height) s.push(`height: ${height}`);
		return s.join("; ");
	});
</script>

<div
	{...rest}
	class={`ds-skeleton ${className}`.trim()}
	style={`${defaultStyles}; ${style}`}
	data-ds-variant={variant}
	data-animate={animate ? "true" : undefined}
	aria-hidden="true"
></div>