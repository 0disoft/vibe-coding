<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributeAnchorTarget, HTMLAttributes } from "svelte/elements";

	import { DsCard, DsIcon } from "$lib/components/design-system";

	type Trend = "up" | "down" | "neutral";

	interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		label: string;
		value: string | number;
		helper?: string;
		delta?: string;
		trend?: Trend;
		icon?: string;
		action?: Snippet;
		bottom?: Snippet;
		href?: string | null;
		target?: HTMLAttributeAnchorTarget | null;
		rel?: string | null;
	}

	let {
		label,
		value,
		helper,
		delta,
		trend = "neutral",
		icon,
		action,
		bottom,
		href,
		target,
		rel,
		class: className = "",
		...rest
	}: Props = $props();

	let hasDelta = $derived(!!delta?.trim());
	let trendIcon = $derived(
		trend === "up" ? "trending-up" : trend === "down" ? "trending-down" : "minus",
	);

	// Spread 타입 추론 비용을 줄이기 위한 forwarding
	let forwarded = $derived(rest as Record<string, any>);
</script>

<DsCard
	{...forwarded}
	href={href ?? undefined}
	target={target ?? undefined}
	rel={rel ?? undefined}
	class={["ds-stat-card", className].filter(Boolean).join(" ")}
>
	{#snippet children()}
		<div class="ds-stat-card-top">
			<div class="ds-stat-card-label">
				{#if icon}
					<DsIcon name={icon} size="sm" />
				{/if}
				<span>{label}</span>
			</div>
			{#if action}
				<div class="ds-stat-card-action">
					{@render action()}
				</div>
			{/if}
		</div>

		<div class="ds-stat-card-value">{value}</div>

		{#if hasDelta || helper}
			<div class="ds-stat-card-meta">
				{#if hasDelta}
					<div class="ds-stat-card-delta" data-ds-trend={trend}>
						<DsIcon name={trendIcon} size="sm" />
						<span>{delta}</span>
					</div>
				{/if}
				{#if helper}
					<div class="ds-stat-card-helper">{helper}</div>
				{/if}
			</div>
		{/if}

		{#if bottom}
			<div class="ds-stat-card-bottom">
				{@render bottom()}
			</div>
		{/if}
	{/snippet}
</DsCard>
