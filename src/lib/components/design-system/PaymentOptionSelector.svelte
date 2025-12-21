<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import {
    DsBadge,
    DsIcon,
    DsRadioGroup,
    DsRadioItem,
    DsTag,
  } from "$lib/components/design-system";
  import { createControllableState } from "$lib/shared/utils/controllable-state.svelte";

  import type { PaymentContext, PaymentMethodType, PaymentOption } from "./payment-types";
  import { isPaymentOptionAvailable } from "./payment-types";

  type Layout = "grid" | "list";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    options: PaymentOption[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    layout?: Layout;
    name?: string;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    ariaLabel?: string;
    ariaLabelledby?: string;
    ariaDescribedby?: string;
    context?: PaymentContext;
    availabilityMode?: "hide" | "disable";
    emptyText?: string;
    renderOption?: Snippet<[PaymentOption, boolean]>;
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
    options,
    value,
    defaultValue,
    onValueChange,
    layout = "grid",
    name,
    disabled = false,
    required = false,
    label,
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    context,
    availabilityMode = "hide",
    emptyText = "No payment options available.",
    renderOption,
    class: className = "",
    ...rest
  }: Props = $props();

  let valueState = createControllableState<string>({
    value: () => value,
    onChange: (next) => onValueChange?.(next),
    defaultValue: () => defaultValue ?? options[0]?.id ?? "",
  });

  let currentValue = $derived(valueState.value);
  let resolvedAriaLabel = $derived(ariaLabel ?? label);
  let rootClass = $derived(["ds-payment-option-group", className].filter(Boolean).join(" "));
  let optionStates = $derived.by(() =>
    options
      .map((option) => {
        const available = isPaymentOptionAvailable(option, context);
        const disabledResolved = disabled || option.disabled || (!available && availabilityMode === "disable");
        return { option, available, disabledResolved };
      })
      .filter((state) => (availabilityMode === "hide" ? state.available : true)),
  );
  let selectableOptions = $derived.by(() =>
    optionStates.filter((state) => !state.disabledResolved),
  );

  $effect(() => {
    if (valueState.isControlled) return;
    if (!optionStates.length) return;
    const fallback =
      defaultValue ??
      selectableOptions[0]?.option.id ??
      optionStates[0]?.option.id ??
      "";
    if (!currentValue) {
      if (currentValue !== fallback) valueState.value = fallback;
      return;
    }
    const exists = optionStates.some((state) => state.option.id === currentValue);
    const selectable = selectableOptions.some((state) => state.option.id === currentValue);
    if ((!exists || !selectable) && currentValue !== fallback) valueState.value = fallback;
  });

  function resolveMeta(option: PaymentOption, availabilityNote?: string) {
    const meta = option.meta ? [...option.meta] : [];
    if (option.methodType) {
      const label = METHOD_LABELS[option.methodType];
      if (label && !meta.includes(label)) meta.unshift(label);
    }
    if (availabilityNote && !meta.includes(availabilityNote)) meta.unshift(availabilityNote);
    return meta;
  }
</script>

{#if optionStates.length === 0}
  <div class="ds-payment-option-empty text-helper text-muted-foreground">
    {emptyText}
  </div>
{:else}
  <DsRadioGroup
    {...rest}
    class={rootClass}
    value={currentValue}
    onValueChange={(next) => (valueState.value = next)}
    name={name}
    disabled={disabled}
    required={required}
    describedBy={ariaDescribedby}
    ariaLabel={resolvedAriaLabel}
    ariaLabelledby={ariaLabelledby}
    data-ds-layout={layout}
  >
    {#each optionStates as state (state.option.id)}
      {@const option = state.option}
      {@const isSelected = currentValue === option.id}
      {@const badgeLabel = option.badge ?? (option.recommended ? "Recommended" : undefined)}
      {@const badgeIntent = option.badgeIntent ?? (option.recommended ? "primary" : "secondary")}
      {@const availabilityNote =
        !state.available && availabilityMode === "disable" ? option.availabilityNote : undefined}
      {@const metaItems = resolveMeta(option, availabilityNote)}
      <DsRadioItem
        value={option.id}
        disabled={state.disabledResolved}
        class={[
          "ds-payment-option",
          isSelected ? "is-selected" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {#if renderOption}
          {@render renderOption(option, isSelected)}
        {:else}
          <div class="ds-payment-option-content">
            <div class="ds-payment-option-title-row">
              <div class="ds-payment-option-title">
                {#if option.icon}
                  <DsIcon name={option.icon} size="sm" class="ds-payment-option-icon" />
                {/if}
                <span>{option.label}</span>
              </div>
              {#if badgeLabel}
                <DsBadge intent={badgeIntent} variant="soft" size="sm">
                  {badgeLabel}
                </DsBadge>
              {/if}
            </div>
            {#if option.provider}
              <div class="ds-payment-option-provider text-helper text-muted-foreground">
                {option.provider}
              </div>
            {/if}
            {#if option.description}
              <div class="ds-payment-option-desc text-body-secondary text-muted-foreground">
                {option.description}
              </div>
            {/if}
            {#if metaItems.length}
              <div class="ds-payment-option-meta">
                {#each metaItems as meta (meta)}
                  <DsTag size="sm" variant="outline" intent="neutral">
                    {meta}
                  </DsTag>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </DsRadioItem>
    {/each}
  </DsRadioGroup>
{/if}
