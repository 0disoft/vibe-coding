<script lang="ts">
	import { page } from "$app/state";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import {
		DsCard,
		DsDefinitionList,
		DsIcon,
		DsSeparator,
	} from "$lib/components/design-system";
	import * as m from "$lib/paraglide/messages.js";

	import type { PaymentSummaryItem } from "./payment-types";

	interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		title?: string;
		subtitle?: string;
		items?: PaymentSummaryItem[];
		discountLabel?: string;
		discountValue?: string | number | null;
		taxLabel?: string;
		taxValue?: string | number | null;
		totalLabel?: string;
		totalValue?: string;
		note?: string;
		children?: Snippet;
		footer?: Snippet;
		/** Heading level for the summary title (default: 4) */
		headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
	}

	let {
		title,
		subtitle,
		items,
		discountLabel,
		discountValue,
		taxLabel,
		taxValue,
		totalLabel,
		totalValue,
		note,
		children: childrenSnippet,
		footer,
		headingLevel = 4,
		class: className = "",
		...rest
	}: Props = $props();

	// Reactive i18n
	let resolvedTitle = $derived.by(() => {
		void page.url;
		return title ?? m.payment_summary_title();
	});

	let resolvedDiscountLabel = $derived.by(() => {
		void page.url;
		return discountLabel ?? m.payment_summary_discount();
	});

	let resolvedTaxLabel = $derived.by(() => {
		void page.url;
		return taxLabel ?? m.payment_summary_tax();
	});

	let resolvedTotalLabel = $derived.by(() => {
		void page.url;
		return totalLabel ?? m.payment_summary_total();
	});

	let definitionItems = $derived(
		items?.map((item) => ({
			term: item.label,
			description: item.value ?? "-",
		})) ?? [],
	);
	let showHeader = $derived(!!resolvedTitle || !!subtitle);
	let showLines = $derived(
		discountValue !== undefined || taxValue !== undefined,
	);
	let showBody = $derived(
		!!childrenSnippet ||
			definitionItems.length > 0 ||
			showLines ||
			!!totalValue ||
			!!note,
	);

	let headingTag = $derived(`h${headingLevel}`);
</script>

<DsCard
	{...rest}
	class={["ds-payment-summary", className].filter(Boolean).join(" ")}
>
	{#if showHeader}
		{#snippet header()}
			<div class="ds-payment-summary-header">
				{#if title}
					<svelte:element this={headingTag} class="text-h4 font-semibold">
						{title}
					</svelte:element>
				{/if}
				{#if subtitle}
					<p class="text-helper text-muted-foreground mt-1">{subtitle}</p>
				{/if}
			</div>
		{/snippet}
	{/if}

	{#if showBody}
		{#snippet children()}
			{#if childrenSnippet}
				{@render childrenSnippet()}
			{:else}
				{#if definitionItems.length}
					<div class="ds-payment-summary-items">
						<DsDefinitionList items={definitionItems} variant="stacked" />
					</div>
				{/if}

				{#if showLines || totalValue}
					<div class="ds-payment-summary-calculator space-y-3 mt-4">
						{#if definitionItems.length}
							<DsSeparator class="opacity-50" />
						{/if}

						<dl class="ds-payment-summary-lines space-y-2 text-body-secondary">
							{#if discountValue !== undefined && discountValue !== null}
								<div class="flex justify-between items-center">
									<dt>{discountLabel}</dt>
									<dd class="font-medium text-success">{discountValue}</dd>
								</div>
							{/if}
							{#if taxValue !== undefined && taxValue !== null}
								<div class="flex justify-between items-center">
									<dt>{taxLabel}</dt>
									<dd class="font-medium">{taxValue}</dd>
								</div>
							{/if}
						</dl>

						{#if totalValue}
							<div class="ds-payment-summary-total-wrapper pt-2">
								<DsSeparator class="mb-3" />
								<dl
									class="ds-payment-summary-total flex justify-between items-center"
								>
									<dt class="text-body font-semibold">{totalLabel}</dt>
									<dd class="text-h3 font-bold text-primary">{totalValue}</dd>
								</dl>
							</div>
						{/if}
					</div>
				{/if}

				{#if note}
					<div
						class="ds-payment-summary-note mt-6 p-3 bg-muted/30 border border-border rounded-md flex items-start gap-2 text-helper text-muted-foreground"
					>
						<DsIcon name="info" size="xs" class="mt-0.5 shrink-0" />
						<span>{note}</span>
					</div>
				{/if}
			{/if}
		{/snippet}
	{/if}

	{#if footer}
		{#snippet footer()}
			{@render footer()}
		{/snippet}
	{/if}
</DsCard>
