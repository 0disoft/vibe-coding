<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { DsIcon } from "$lib/components/design-system";
	import * as m from "$lib/paraglide/messages.js";

	type AdSlotVariant = "sidebar" | "infeed" | "infeed-wide" | "banner" | "native";
	type CSSLength = string | number;

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		variant?: AdSlotVariant;
		minHeight?: CSSLength;
		height?: CSSLength;
		ratio?: string;
		reserveRatio?: boolean;
		sticky?: boolean;
		stickyTop?: CSSLength;
		label?: string;
		showLabel?: boolean;
		showPlaceholder?: boolean;
		infoHref?: string;
		infoLabel?: string;
		infoTarget?: string;
		infoRel?: string;
		lazy?: boolean;
		lazyMargin?: string;
		children?: Snippet;
	}

	const generatedId = $props.id();

	let {
		id: idProp,
		variant = "infeed",
		minHeight,
		height,
		ratio,
		reserveRatio,
		sticky = false,
		stickyTop,
		label, // Optional override for m.common_advertisement()
		showLabel = true,
		showPlaceholder = false,
		infoHref,
		infoLabel,
		infoTarget,
		infoRel,
		lazy = false,
		lazyMargin = "200px",
		role = "complementary",
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledBy,
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

	const DEFAULT_RATIOS: Partial<Record<AdSlotVariant, string>> = {
		banner: "728 / 90",
		sidebar: "300 / 600",
		infeed: "300 / 250",
		"infeed-wide": "970 / 250",
	};

	const toLen = (v: CSSLength | undefined) =>
		v === undefined ? undefined : typeof v === "number" ? `${v}px` : v;

	let id = $derived(idProp ?? generatedId);
	let labelId = $derived(`${id}-label`);
	let resolvedLabel = $derived(label ?? m.common_advertisement());
	let resolvedInfoLabel = $derived(infoLabel ?? resolvedLabel);
	let shouldReserveRatio = $derived(reserveRatio ?? showPlaceholder);
	let resolvedRatio = $derived(ratio ?? (shouldReserveRatio ? DEFAULT_RATIOS[variant] : undefined));
	let resolvedLabelledBy = $derived(
		ariaLabelledBy ?? (showLabel && !ariaLabel ? labelId : undefined),
	);
	let resolvedAriaLabel = $derived(
		ariaLabel ?? (!showLabel ? resolvedLabel : undefined),
	);
	let labelAriaHidden = $derived(
		!resolvedLabelledBy || resolvedLabelledBy !== labelId ? "true" : undefined,
	);

	let defaultStyles = $derived.by(() => {
		const styles: string[] = [];
		const min = toLen(minHeight) ?? DEFAULT_MIN_HEIGHTS[variant];
		const h = toLen(height);
		const top = toLen(stickyTop);

		if (min) styles.push(`--ad-slot-min-height: ${min}`);
		if (h) styles.push(`--ad-slot-height: ${h}`);
		if (resolvedRatio) styles.push(`--ad-slot-ratio: ${resolvedRatio}`);
		if (top) styles.push(`--ad-slot-sticky-top: ${top}`);
		return styles.join("; ");
	});

	let mergedStyle = $derived(
		[defaultStyles, style]
			.map((v) => (v ?? "").trim())
			.filter(Boolean)
			.join("; "),
	);

	let rootEl = $state<HTMLDivElement | null>(null);
	let isVisible = $state(!lazy);

	$effect(() => {
		if (!lazy) {
			isVisible = true;
			return;
		}
		if (typeof window === "undefined" || !rootEl) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				isVisible = true;
				observer.disconnect();
			},
			{ rootMargin: lazyMargin },
		);

		observer.observe(rootEl);

		return () => observer.disconnect();
	});
</script>

<div
	{...rest}
	{id}
	bind:this={rootEl}
	class={["ds-ad-slot", className].filter(Boolean).join(" ")}
	style={mergedStyle}
	data-variant={variant}
	data-sticky={sticky ? "true" : undefined}
	data-placeholder={showPlaceholder ? "true" : undefined}
	{role}
	aria-label={resolvedAriaLabel}
	aria-labelledby={resolvedLabelledBy}
	aria-roledescription={m.common_advertisement()}
>
	{#if showLabel}
		<div class="ds-ad-slot-header">
			<span id={labelId} class="ds-ad-slot-label" aria-hidden={labelAriaHidden}>
				{resolvedLabel}
			</span>
			{#if infoHref}
				<a
					class="ds-ad-slot-info ds-focus-ring"
					href={infoHref}
					target={infoTarget}
					rel={infoRel}
					aria-label={resolvedInfoLabel}
					title={resolvedInfoLabel}
				>
					<DsIcon name="info" size="xs" aria-hidden="true" />
				</a>
			{/if}
		</div>
	{/if}
	<div class="ds-ad-slot-body">
		{#if children && (!lazy || isVisible)}
			{@render children()}
		{:else if showPlaceholder}
			<div class="ds-ad-slot-placeholder-box">
				<span class="ds-ad-slot-placeholder-text">{m.common_ad_placeholder()}</span>
			</div>
		{/if}
	</div>
</div>
