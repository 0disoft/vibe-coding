<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import { DsIcon } from "$lib/components/design-system";

	type Trend = "up" | "down" | "neutral";
	type Size = "sm" | "md" | "lg";
	type RootTag = "section" | "article" | "div";
	type LabelTag = "span" | "p" | "h3" | "h4" | "h5" | "h6";

	interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		label: string;
		value: string | number;
		helper?: string;
		delta?: string;
		trend?: Trend;
		size?: Size;
		icon?: string;
		iconLabel?: string;
		as?: RootTag;
		labelTag?: LabelTag;
		formatValue?: boolean;
		formatLocale?: string;
		formatOptions?: Intl.NumberFormatOptions;
	}

	const generatedId = $props.id();

	let {
		id: idProp,
		label,
		value,
		helper,
		delta,
		trend = "neutral",
		size = "md",
		icon,
		iconLabel,
		as = "section",
		labelTag = "span",
		formatValue = false,
		formatLocale,
		formatOptions,
		class: className = "",
		...rest
	}: Props = $props();

	let hasDelta = $derived(!!delta?.trim());
	let trendIcon = $derived(
		trend === "up" ? "trending-up" : trend === "down" ? "trending-down" : "minus",
	);
	let trendLabel = $derived(
		trend === "up" ? "상승" : trend === "down" ? "하락" : "변동 없음",
	);

	let rootId = $derived(idProp ?? generatedId);
	let labelId = $derived(rootId ? `${rootId}-label` : undefined);
	let valueId = $derived(rootId ? `${rootId}-value` : undefined);
	let ariaLabelledBy = $derived.by(() => {
		const parts = [labelId, valueId].filter(Boolean);
		return parts.length ? parts.join(" ") : undefined;
	});

	let formattedValue = $derived.by(() => {
		if (!formatValue || typeof value !== "number") return value;
		return new Intl.NumberFormat(formatLocale, formatOptions).format(value);
	});
</script>

<svelte:element
	this={as}
	{...rest}
	class={["ds-kpi", className].filter(Boolean).join(" ")}
	data-ds-size={size}
	id={rootId}
	aria-labelledby={ariaLabelledBy}
>
	<div class="ds-kpi-header">
		<div class="ds-kpi-label-row">
			{#if icon}
				<DsIcon name={icon} size="sm" label={iconLabel} class="ds-kpi-icon" />
			{/if}
			<svelte:element this={labelTag} class="ds-kpi-label" id={labelId}>
				{label}
			</svelte:element>
		</div>
		{#if hasDelta}
			<div class="ds-kpi-delta" data-ds-trend={trend}>
				<DsIcon name={trendIcon} size="sm" />
				<span class="sr-only">{trendLabel}</span>
				<span>{delta}</span>
			</div>
		{/if}
	</div>

	<div class="ds-kpi-value" id={valueId}>{formattedValue}</div>

	{#if helper}
		<div class="ds-kpi-helper">{helper}</div>
	{/if}
</svelte:element>

