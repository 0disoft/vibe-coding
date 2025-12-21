<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { DsBadge } from "$lib/components/design-system";

  import type { PaymentMethodType, PaymentOption } from "./payment-types";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    option?: PaymentOption | null;
    title?: string;
    emptyText?: string;
    children?: Snippet<[PaymentOption]>;
  }

  const METHOD_LABELS: Record<PaymentMethodType, string> = {
    card: "Card",
    bank: "Bank transfer",
    crypto: "Crypto",
    wallet: "Wallet",
    mobile: "Mobile",
    virtual: "Virtual account",
    transfer: "Wire transfer",
    other: "Other",
  };

  let {
    option = null,
    title,
    emptyText = "Select a payment option to see details.",
    children: childrenSnippet,
    class: className = "",
    ...rest
  }: Props = $props();

  let badgeLabel = $derived(
    option?.badge ?? (option?.recommended ? "Recommended" : undefined),
  );
  let badgeIntent = $derived(
    option?.badgeIntent ?? (option?.recommended ? "primary" : "secondary"),
  );
  let methodLabel = $derived(
    option?.methodType ? METHOD_LABELS[option.methodType] : undefined,
  );
  let metaItems = $derived.by(() => {
    if (!option) return [];
    const meta = option.meta ? [...option.meta] : [];
    if (methodLabel && !meta.includes(methodLabel)) meta.unshift(methodLabel);
    return meta;
  });
  let rootClass = $derived(["ds-payment-details", className].filter(Boolean).join(" "));
</script>

<div {...rest} class={rootClass}>
  {#if option}
    {#if title}
      <div class="ds-payment-details-title text-label text-muted-foreground">
        {title}
      </div>
    {/if}
    <div class="ds-payment-details-header">
      <div class="text-h4 font-semibold">{option.label}</div>
      {#if badgeLabel}
        <DsBadge intent={badgeIntent} variant="soft" size="sm">
          {badgeLabel}
        </DsBadge>
      {/if}
    </div>
    {#if option.provider}
      <div class="ds-payment-details-provider text-helper text-muted-foreground">
        {option.provider}
      </div>
    {/if}
    {#if option.description}
      <div class="ds-payment-details-desc text-body-secondary text-muted-foreground">
        {option.description}
      </div>
    {/if}
    {#if childrenSnippet}
      {@render childrenSnippet(option)}
    {:else}
      {#if metaItems.length}
        <ul class="ds-payment-details-meta">
          {#each metaItems as item (item)}
            <li>{item}</li>
          {/each}
        </ul>
      {/if}
      {#if option.details?.length}
        <ul class="ds-payment-details-list">
          {#each option.details as item (item)}
            <li>{item}</li>
          {/each}
        </ul>
      {/if}
    {/if}
  {:else}
    <div class="ds-payment-details-empty text-helper text-muted-foreground">
      {emptyText}
    </div>
  {/if}
</div>
