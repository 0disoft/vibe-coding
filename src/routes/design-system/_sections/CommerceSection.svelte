<script lang="ts">
  import {
    DsButton,
    DsCard,
    DsPaymentFlowSummary,
    DsPaymentOptionDetails,
    DsPaymentOptionSelector,
  } from "$lib/components/design-system";

  import type { PaymentOption, PaymentSummaryItem } from "$lib/components/design-system";

  const paymentOptions: PaymentOption[] = [
    {
      id: "card",
      label: "Card payment",
      provider: "PortOne",
      methodType: "card",
      description: "Domestic and international card approvals with receipts",
      meta: ["Fee 2.9%", "Instant approval"],
      details: ["3DS supported", "Auto-retry on failure"],
      recommended: true,
    },
    {
      id: "kakao",
      label: "KakaoPay",
      provider: "KakaoPay",
      methodType: "wallet",
      badge: "Fast",
      description: "One-tap mobile wallet checkout",
      meta: ["Fee 2.7%", "Mobile friendly"],
      details: ["In-app verification", "Real-time approvals"],
    },
    {
      id: "btcpay",
      label: "Bitcoin",
      provider: "BTCPay Server",
      methodType: "crypto",
      description: "Self-hosted crypto checkout flow",
      meta: ["Low fees", "On-chain"],
      details: ["Active after 1 confirmation", "FX volatility risk"],
      availability: { regions: ["US", "EU"], requireLogin: true },
      availabilityNote: "US/EU only",
    },
    {
      id: "bank",
      label: "Bank transfer",
      provider: "PortOne",
      methodType: "bank",
      description: "Instant bank transfer checkout",
      meta: ["Fee 1.5%", "Settlement D+1"],
      details: ["Real-time account verification", "Popular with B2B"],
      availability: { currencies: ["KRW"] },
      availabilityNote: "KRW only",
    },
  ];

  let selectedId = $state(paymentOptions[0]?.id ?? "");
  let selectedOption = $derived(
    paymentOptions.find((option) => option.id === selectedId) ?? null,
  );
  let listSelectedId = $state(paymentOptions[1]?.id ?? "");
  let listSelectedOption = $derived(
    paymentOptions.find((option) => option.id === listSelectedId) ?? null,
  );
  let summaryItems = $derived.by<PaymentSummaryItem[]>(() => [
    { label: "Plan", value: "Pro / Monthly" },
    { label: "Method", value: selectedOption?.label ?? "-" },
    { label: "Payout", value: "D+7" },
  ]);
</script>

<section id="ds-commerce" class="space-y-4">
  <h2 class="text-h2 font-semibold">Commerce</h2>
  <DsCard class="space-y-6">
    <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div class="space-y-3">
        <div class="text-label text-muted-foreground">
          Payment option selector
        </div>
        <DsPaymentOptionSelector
          options={paymentOptions}
          value={selectedId}
          onValueChange={(next) => (selectedId = next)}
          ariaLabel="Payment option selection"
          layout="grid"
        />
        <div class="text-helper text-muted-foreground">
          selected: {selectedOption?.label ?? "None"}
        </div>
      </div>

      <div class="space-y-4">
        <div class="space-y-2">
          <div class="text-label text-muted-foreground">Details</div>
          <DsPaymentOptionDetails option={selectedOption} title="Selected method" />
        </div>

        <div class="space-y-2">
          <div class="text-label text-muted-foreground">Summary</div>
          <DsPaymentFlowSummary
            title="Payment summary"
            items={summaryItems}
            discountLabel="Discount"
            discountValue="-$5.00"
            taxLabel="Tax"
            taxValue="$3.20"
            totalLabel="Total"
            totalValue="$49.00"
            note="Taxes and FX are finalized at checkout."
          >
            {#snippet footer()}
              <DsButton intent="primary" fullWidth>Continue to payment</DsButton>
            {/snippet}
          </DsPaymentFlowSummary>
        </div>
      </div>
    </div>
  </DsCard>

  <DsCard class="space-y-4">
    <div class="text-label text-muted-foreground">List layout (mobile friendly)</div>
    <div class="text-helper text-muted-foreground">
      Use list layout when you need longer descriptions or narrow containers.
    </div>
    <DsPaymentOptionSelector
      options={paymentOptions}
      value={listSelectedId}
      onValueChange={(next) => (listSelectedId = next)}
      ariaLabel="Payment option list"
      layout="list"
      availabilityMode="disable"
      context={{ region: "KR", currency: "KRW", loggedIn: false }}
    />
    <div class="text-helper text-muted-foreground">
      selected: {listSelectedOption?.label ?? "None"}
    </div>
  </DsCard>
</section>
