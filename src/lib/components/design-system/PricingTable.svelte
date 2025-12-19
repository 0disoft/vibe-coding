<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { DsBadge, DsButton, DsCard, DsIcon } from "$lib/components/design-system";

  export type PricingPlan = {
    id: string;
    name: string;
    price: string;
    period?: string;
    description?: string;
    highlighted?: boolean;
    badge?: string;
    features: string[];
    ctaLabel?: string;
  };

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    plans: PricingPlan[];
    onSelect?: (id: string) => void;
    cta?: Snippet<[PricingPlan]>;
  }

  let { plans, onSelect, cta, class: className = "", ...rest }: Props = $props();
</script>

<div
  {...rest}
  class={["ds-pricing-grid grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-3", className]
    .filter(Boolean)
    .join(" ")}
>
  {#each plans as plan (plan.id)}
    {@const isHighlighted = plan.highlighted}

    <DsCard
      class={[
        "ds-pricing-card h-full transition-all duration-200",
        isHighlighted ? "is-highlighted" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {#snippet header()}
        <div class="ds-pricing-header">
          <div class="flex items-center justify-between gap-3">
            <div class="text-h4 font-semibold">{plan.name}</div>
            {#if plan.badge}
              <DsBadge intent={isHighlighted ? "primary" : "secondary"} variant="soft" size="sm">
                {plan.badge}
              </DsBadge>
            {/if}
          </div>
          <div class="ds-pricing-price">
            <span class="ds-pricing-amount">{plan.price}</span>
            {#if plan.period}
              <span class="ds-pricing-period">{plan.period}</span>
            {/if}
          </div>
          {#if plan.description}
            <div class="text-body-secondary text-muted-foreground">{plan.description}</div>
          {/if}
        </div>
      {/snippet}

      {#snippet children()}
        <ul class="ds-pricing-features">
          {#each plan.features as f (f)}
            <li class="ds-pricing-feature">
              <DsIcon name="check" size="sm" class={isHighlighted ? "text-primary" : ""} />
              <span>{f}</span>
            </li>
          {/each}
        </ul>
      {/snippet}

      {#snippet footer()}
        <div class="ds-pricing-cta">
          {#if cta}
            {@render cta(plan)}
          {:else}
            <DsButton
              fullWidth
              intent={isHighlighted ? "primary" : "secondary"}
              variant={isHighlighted ? "solid" : "outline"}
              onclick={() => onSelect?.(plan.id)}
            >
              {plan.ctaLabel ?? "Get started"}
            </DsButton>
          {/if}
        </div>
      {/snippet}
    </DsCard>
  {/each}
</div>

