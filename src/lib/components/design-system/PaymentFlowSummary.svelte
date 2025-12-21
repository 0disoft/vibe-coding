<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { DsCard, DsDefinitionList } from "$lib/components/design-system";

  import type { PaymentSummaryItem } from "./payment-types";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
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
  }

  let {
    title = "Payment summary",
    subtitle,
    items,
    discountLabel = "Discount",
    discountValue,
    taxLabel = "Tax",
    taxValue,
    totalLabel = "Total",
    totalValue,
    note,
    children: childrenSnippet,
    footer,
    class: className = "",
    ...rest
  }: Props = $props();

  let definitionItems = $derived(
    items?.map((item) => ({
      term: item.label,
      description: item.value ?? "-",
    })) ?? [],
  );
  let showHeader = $derived(!!title || !!subtitle);
  let showLines = $derived(discountValue !== undefined || taxValue !== undefined);
  let showBody = $derived(
    !!childrenSnippet ||
      definitionItems.length > 0 ||
      showLines ||
      !!totalValue ||
      !!note,
  );
</script>

<DsCard {...rest} class={["ds-payment-summary", className].filter(Boolean).join(" ")}>
  {#if showHeader}
    {#snippet header()}
      <div class="ds-payment-summary-header">
        {#if title}
          <div class="text-h4 font-semibold">{title}</div>
        {/if}
        {#if subtitle}
          <div class="text-helper text-muted-foreground">{subtitle}</div>
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
          <DsDefinitionList items={definitionItems} variant="stacked" />
        {/if}
        {#if showLines}
          <div class="ds-payment-summary-lines">
            {#if discountValue !== undefined && discountValue !== null}
              <div class="ds-payment-summary-line">
                <span>{discountLabel}</span>
                <span>{discountValue}</span>
              </div>
            {/if}
            {#if taxValue !== undefined && taxValue !== null}
              <div class="ds-payment-summary-line">
                <span>{taxLabel}</span>
                <span>{taxValue}</span>
              </div>
            {/if}
          </div>
        {/if}
        {#if totalValue}
          <div class="ds-payment-summary-total">
            <span>{totalLabel}</span>
            <span>{totalValue}</span>
          </div>
        {/if}
        {#if note}
          <div class="ds-payment-summary-note text-helper text-muted-foreground">
            {note}
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
