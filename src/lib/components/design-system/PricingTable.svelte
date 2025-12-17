<script lang="ts">
  import type { Snippet } from "svelte";

  import { DsBadge, DsButton, DsCard } from "$lib/components/design-system";

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

  interface Props {
    plans: PricingPlan[];
    onSelect?: (id: string) => void;
    cta?: Snippet<[PricingPlan]>;
  }

  let { plans, onSelect, cta }: Props = $props();
</script>

<div class="ds-pricing-grid">
  {#each plans as plan (plan.id)}
    <DsCard class={["ds-pricing-card", plan.highlighted ? "is-highlighted" : ""].join(" ")}>
      <div class="ds-pricing-header">
        <div class="flex items-center justify-between gap-3">
          <div class="text-h4 font-semibold">{plan.name}</div>
          {#if plan.badge}
            <DsBadge intent={plan.highlighted ? "primary" : "secondary"} variant="soft" size="sm">
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

      <ul class="ds-pricing-features">
        {#each plan.features as f (f)}
          <li class="ds-pricing-feature">
            <span class="i-lucide-check h-4 w-4 text-primary" aria-hidden="true"></span>
            <span>{f}</span>
          </li>
        {/each}
      </ul>

      <div class="ds-pricing-cta">
        {#if cta}
          {@render cta(plan)}
        {:else}
          <DsButton
            fullWidth
            intent={plan.highlighted ? "primary" : "secondary"}
            variant={plan.highlighted ? "solid" : "outline"}
            onclick={() => onSelect?.(plan.id)}
          >
            {plan.ctaLabel ?? "Get started"}
          </DsButton>
        {/if}
      </div>
    </DsCard>
  {/each}
</div>

