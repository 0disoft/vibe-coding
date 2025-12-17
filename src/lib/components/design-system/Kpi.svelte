<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import { DsIcon } from "$lib/components/design-system";

	type Trend = "up" | "down" | "neutral";
	type Size = "sm" | "md" | "lg";

	interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		label: string;
		value: string | number;
		helper?: string;
		delta?: string;
		trend?: Trend;
		size?: Size;
		icon?: string;
		iconLabel?: string;
	}

	let {
		label,
		value,
		helper,
		delta,
		trend = "neutral",
		size = "md",
		icon,
		iconLabel,
		class: className = "",
		...rest
	}: Props = $props();

	let hasDelta = $derived(!!delta?.trim());
	let trendIcon = $derived(
		trend === "up" ? "trending-up" : trend === "down" ? "trending-down" : "minus",
	);
</script>

<div
	{...rest}
	class={["ds-kpi", className].filter(Boolean).join(" ")}
	data-ds-size={size}
>
	<div class="ds-kpi-header">
		<div class="ds-kpi-label-row">
			{#if icon}
				<DsIcon name={icon} size="sm" label={iconLabel} class="ds-kpi-icon" />
			{/if}
			<div class="ds-kpi-label">{label}</div>
		</div>
		{#if hasDelta}
			<div class="ds-kpi-delta" data-ds-trend={trend}>
				<DsIcon name={trendIcon} size="sm" />
				<span>{delta}</span>
			</div>
		{/if}
	</div>

	<div class="ds-kpi-value">{value}</div>

	{#if helper}
		<div class="ds-kpi-helper">{helper}</div>
	{/if}
</div>

