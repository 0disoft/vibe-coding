<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	type SkeletonVariant = "rectangular" | "circular" | "text";
	type CSSLength = string | number;

	interface Props extends HTMLAttributes<HTMLDivElement> {
		width?: CSSLength;
		height?: CSSLength;
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

	const toLen = (v: CSSLength | undefined) =>
		v === undefined ? undefined : typeof v === "number" ? `${v}px` : v;

	let defaultStyles = $derived.by(() => {
		const s: string[] = [];
		const w = toLen(width);
		const h = toLen(height);
		if (w) s.push(`width: ${w}`);
		if (h) s.push(`height: ${h}`);
		return s.join("; ");
	});

	let mergedStyle = $derived(
		[defaultStyles, style]
			.map((s) => (s ?? "").trim())
			.filter(Boolean)
			.join("; "),
	);
</script>

<div
	{...rest}
	class={`ds-skeleton ${className}`.trim()}
	style={mergedStyle}
	data-ds-variant={variant}
	data-animate={animate ? "true" : undefined}
	aria-hidden="true"
></div>
