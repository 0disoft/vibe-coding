<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	type SkeletonVariant = "rectangular" | "circular" | "text";
	type CSSLength = string | number;

	interface Props extends HTMLAttributes<HTMLDivElement> {
		width?: CSSLength;
		height?: CSSLength;
		variant?: SkeletonVariant;
		animate?: boolean;
		label?: string;
		busy?: boolean;
	}

	let {
		width,
		height,
		variant = "rectangular",
		animate = true,
		label,
		busy,
		class: className = "",
		"aria-hidden": ariaHidden,
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

	let resolvedLabel = $derived.by(() => label?.trim() || undefined);
	let resolvedAriaHidden = $derived.by(() => {
		if (ariaHidden !== undefined) return ariaHidden;
		return resolvedLabel ? undefined : "true";
	});
	let resolvedBusy = $derived.by(() => {
		if (busy !== undefined) return busy;
		return resolvedLabel ? true : undefined;
	});
</script>

<div
	{...rest}
	class={`ds-skeleton ${className}`.trim()}
	style={mergedStyle}
	data-ds-variant={variant}
	data-animate={animate ? "true" : undefined}
	aria-hidden={resolvedAriaHidden}
	aria-busy={resolvedBusy}
>
	{#if resolvedLabel}
		<span class="sr-only" aria-live="polite">{resolvedLabel}</span>
	{/if}
</div>
