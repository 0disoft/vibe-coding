<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import * as m from "$lib/paraglide/messages.js";

	type AdSlotVariant = "sidebar" | "infeed" | "infeed-wide" | "banner" | "native";
	type CSSLength = string | number;

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		variant?: AdSlotVariant;
		minHeight?: CSSLength;
		height?: CSSLength;
		ratio?: string;
		sticky?: boolean;
		stickyTop?: CSSLength;
		label?: string;
		showLabel?: boolean;
		showPlaceholder?: boolean;
		children?: Snippet;
	}

	const generatedId = $props.id();

	let {
		id: idProp,
		variant = "infeed",
		minHeight,
		height,
		ratio,
		sticky = false,
		stickyTop,
		label, // Optional override for m.common_advertisement()
		showLabel = true,
		showPlaceholder = false,
		role = "complementary",
		"aria-label": ariaLabel,
		class: className = "",
		style = "",
		children,
		...rest
	}: Props = $props();

	// Default min-heights by variant to prevent CLS
	const DEFAULT_MIN_HEIGHTS: Record<AdSlotVariant, string> = {
		banner: "90px",
		sidebar: "500px",
		infeed: "250px",
		"infeed-wide": "120px",
		native: "160px",
	};

	const toLen = (v: CSSLength | undefined) =>
		v === undefined ? undefined : typeof v === "number" ? `${v}px` : v;

	let id = $derived(idProp ?? generatedId);
	let labelId = $derived(`${id}-label`);
	let resolvedLabel = $derived(label ?? m.common_advertisement());
	let resolvedAriaLabel = $derived(ariaLabel ?? resolvedLabel);

	let defaultStyles = $derived.by(() => {
		const styles: string[] = [];
		const min = toLen(minHeight) ?? DEFAULT_MIN_HEIGHTS[variant];
		const h = toLen(height);
		const top = toLen(stickyTop);

		if (min) styles.push(`--ad-slot-min-height: ${min}`);
		if (h) styles.push(`--ad-slot-height: ${h}`);
		if (ratio) styles.push(`--ad-slot-ratio: ${ratio}`);
		if (top) styles.push(`--ad-slot-sticky-top: ${top}`);
		return styles.join("; ");
	});

	let mergedStyle = $derived(
		[defaultStyles, style]
			.map((v) => (v ?? "").trim())
			.filter(Boolean)
			.join("; "),
	);
</script>

<div
	{...rest}
	{id}
	class={["ds-ad-slot", className].filter(Boolean).join(" ")}
	style={mergedStyle}
	data-variant={variant}
	data-sticky={sticky ? "true" : undefined}
	{role}
	aria-label={resolvedAriaLabel}
	aria-roledescription={m.common_advertisement()}
>
	{#if showLabel}
		<span id={labelId} class="ds-ad-slot-label" aria-hidden="true">
			{resolvedLabel}
		</span>
	{/if}
	<div class="ds-ad-slot-body">
		{#if children}
			{@render children()}
		{:else if showPlaceholder}
			<div class="ds-ad-slot-placeholder-box">
				<span class="ds-ad-slot-placeholder-text">{m.common_ad_placeholder()}</span>
			</div>
		{/if}
	</div>
</div>
