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

	const generatedId = $props.id();
	const FLASH_DURATION = 900;

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
		id: idProp,
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

	let definitionItems = $derived.by(() => {
		void page.url;
		return (
			items?.map((item) => ({
				term: item.label,
				description: item.value ?? "-",
			})) ?? []
		);
	});
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
	let summaryId = $derived(idProp ?? generatedId);
	let summaryTitleId = $derived.by(() =>
		resolvedTitle ? `${summaryId}-title` : undefined,
	);

	let flashTotal = $state(false);
	let flashLines = $state(false);
	let lastTotalValue: string | null | undefined = undefined;
	let lastDiscountValue: string | number | null | undefined = undefined;
	let lastTaxValue: string | number | null | undefined = undefined;
	let isInitialized = false;
	let totalFlashTimer: ReturnType<typeof setTimeout> | null = null;
	let linesFlashTimer: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		if (!isInitialized) {
			isInitialized = true;
			lastTotalValue = totalValue ?? null;
			lastDiscountValue = discountValue ?? null;
			lastTaxValue = taxValue ?? null;
			return;
		}

		const nextTotal = totalValue ?? null;
		const nextDiscount = discountValue ?? null;
		const nextTax = taxValue ?? null;

		if (nextTotal !== lastTotalValue) {
			flashTotal = true;
			if (totalFlashTimer) clearTimeout(totalFlashTimer);
			totalFlashTimer = setTimeout(() => {
				flashTotal = false;
			}, FLASH_DURATION);
		}

		if (nextDiscount !== lastDiscountValue || nextTax !== lastTaxValue) {
			flashLines = true;
			if (linesFlashTimer) clearTimeout(linesFlashTimer);
			linesFlashTimer = setTimeout(() => {
				flashLines = false;
			}, FLASH_DURATION);
		}

		lastTotalValue = nextTotal;
		lastDiscountValue = nextDiscount;
		lastTaxValue = nextTax;
	});
</script>

<DsCard
	{...rest}
	tag="section"
	id={summaryId}
	aria-labelledby={summaryTitleId}
	class={["ds-payment-summary", className].filter(Boolean).join(" ")}
>
	{#if showHeader}
		{#snippet header()}
			<div class="ds-payment-summary-header">
				{#if resolvedTitle}
					<svelte:element
						this={headingTag}
						class="text-h4 font-semibold"
						id={summaryTitleId}
					>
						{resolvedTitle}
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
								<div
									class="ds-payment-summary-line"
									role="group"
									aria-label={`${resolvedDiscountLabel}: ${discountValue}`}
									data-flash={flashLines ? "true" : undefined}
								>
									<dt>{resolvedDiscountLabel}</dt>
									<dd class="font-medium text-success">{discountValue}</dd>
								</div>
							{/if}
							{#if taxValue !== undefined && taxValue !== null}
								<div
									class="ds-payment-summary-line"
									role="group"
									aria-label={`${resolvedTaxLabel}: ${taxValue}`}
									data-flash={flashLines ? "true" : undefined}
								>
									<dt>{resolvedTaxLabel}</dt>
									<dd class="font-medium">{taxValue}</dd>
								</div>
							{/if}
						</dl>

						{#if totalValue}
							<div class="ds-payment-summary-total-wrapper pt-2">
								<DsSeparator class="mb-3" />
								<dl
									class="ds-payment-summary-total flex justify-between items-center"
									data-flash={flashTotal ? "true" : undefined}
								>
									<dt class="text-body font-semibold">{resolvedTotalLabel}</dt>
									<dd class="ds-payment-summary-total-value text-h3 font-bold">
										{totalValue}
									</dd>
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
