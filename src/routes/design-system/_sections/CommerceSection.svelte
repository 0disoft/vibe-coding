<script lang="ts">
	import {
		DsButton,
		DsCard,
		DsCheckbox,
		DsField,
		DsPaymentFlowSummary,
		DsPaymentOptionDetails,
		DsPaymentOptionSelector,
		DsSelect,
		DsSeparator,
	} from "$lib/components/design-system";
	import * as m from "$lib/paraglide/messages.js";

	import type {
		CurrencyCode,
		PaymentContext,
		PaymentOption,
		PaymentSummaryItem,
		RegionCode,
	} from "$lib/components/design-system";

	const paymentOptions = $derived.by<PaymentOption[]>(() => [
		{
			id: "card",
			label: m.payment_option_card_label(),
			ariaLabel: `${m.payment_option_card_label()}. ${m.payment_option_card_desc()}`,
			provider: "PortOne",
			methodType: "card",
			description: m.payment_option_card_desc(),
			meta: [
				m.payment_option_card_meta_fee(),
				m.payment_option_card_meta_instant(),
			],
			details: [
				m.payment_option_card_detail_3ds(),
				m.payment_option_card_detail_retry(),
			],
			recommended: true,
		},
		{
			id: "kakao",
			label: m.payment_option_kakao_label(),
			ariaLabel: m.payment_option_kakao_label(),
			provider: "KakaoPay",
			methodType: "wallet",
			badge: m.payment_option_kakao_badge(),
			description: m.payment_option_kakao_desc(),
			meta: [
				m.payment_option_kakao_meta_fee(),
				m.payment_option_kakao_meta_mobile(),
			],
			details: [
				m.payment_option_kakao_detail_inapp(),
				m.payment_option_kakao_detail_realtime(),
			],
		},
		{
			id: "btcpay",
			label: m.payment_option_btc_label(),
			ariaLabel: m.payment_option_btc_label(),
			provider: "BTCPay Server",
			methodType: "crypto",
			description: m.payment_option_btc_desc(),
			meta: [
				m.payment_option_btc_meta_low_fees(),
				m.payment_option_btc_meta_onchain(),
			],
			details: [
				m.payment_option_btc_detail_confirm(),
				m.payment_option_btc_detail_fx_risk(),
			],
			availability: {
				regions: ["US", "EU"] as RegionCode[],
				requireLogin: true,
			},
			availabilityNote: m.payment_option_btc_availability_note(),
		},
		{
			id: "paypal",
			label: "PayPal",
			ariaLabel: "PayPal",
			provider: "PayPal Inc.",
			methodType: "wallet",
			icon: "i-simple-icons-paypal",
			description: "Fast, secure and easy way to pay online.",
			meta: ["Global", "Buyer Protection"],
		},
		{
			id: "bank",
			label: m.payment_option_bank_label(),
			ariaLabel: m.payment_option_bank_label(),
			provider: "PortOne",
			methodType: "bank",
			description: m.payment_option_bank_desc(),
			meta: [
				m.payment_option_bank_meta_fee(),
				m.payment_option_bank_meta_settlement(),
			],
			details: [
				m.payment_option_bank_detail_verification(),
				m.payment_option_bank_detail_b2b(),
			],
			availability: { currencies: ["KRW"] as CurrencyCode[] },
			availabilityNote: m.payment_option_bank_availability_note(),
		},
		{
			id: "alipay",
			label: "Alipay",
			ariaLabel: "Alipay",
			provider: "Alipay (Ant Group)",
			methodType: "wallet",
			icon: "i-simple-icons-alipay",
			description: "The most popular mobile payment in China.",
			meta: ["CNY Support", "QR Payment"],
		},
		{
			id: "wechat",
			label: "WeChat Pay",
			ariaLabel: "WeChat Pay",
			provider: "Tencent",
			methodType: "wallet",
			icon: "i-simple-icons-wechat",
			description: "Pay within the WeChat eco-system.",
			meta: ["CNY Support", "Integrated"],
		},
	]);

	// Context controls for showcase
	let loggedIn = $state(false);
	let region = $state("KR");
	let currency = $state("KRW");
	let currentContext = $derived.by<PaymentContext>(() => ({
		loggedIn,
		region: region as RegionCode,
		currency: currency as CurrencyCode,
	}));

	let selectedId = $state("card");
	let selectedOption = $derived(
		paymentOptions.find((option) => option.id === selectedId) ?? null,
	);
	let listSelectedId = $state("kakao");
	let listSelectedOption = $derived(
		paymentOptions.find((option) => option.id === listSelectedId) ?? null,
	);

	let summaryItems = $derived.by<PaymentSummaryItem[]>(() => [
		{
			label: m.commerce_summary_item_plan_label(),
			value: m.commerce_summary_item_plan_value(),
		},
		{
			label: m.commerce_summary_item_method_label(),
			value: selectedOption?.label ?? m.commerce_none_label(),
		},
		{
			label: m.commerce_summary_item_payout_label(),
			value: m.commerce_summary_item_payout_value(),
		},
	]);
</script>

<section id="ds-commerce" class="space-y-6" aria-labelledby="commerce-title">
	<h2 id="commerce-title" class="text-h2 font-semibold">
		{m.commerce_title()}
	</h2>

	<!-- Showcase Context Controls -->
	<DsCard class="bg-muted/20 border-primary/20">
		<div class="space-y-4">
			<h3 class="text-h4 font-medium flex items-center gap-2">
				<span class="i-lucide-settings-2 text-primary"></span>
				{m.commerce_context_controls_label()}
			</h3>
			<div class="grid gap-4 sm:grid-cols-3 items-end">
				<DsField label={m.commerce_context_region()}>
					<DsSelect
						options={[
							{ value: "KR", label: m.commerce_region_kr_label() },
							{ value: "US", label: m.commerce_region_us_label() },
							{ value: "DE", label: m.commerce_region_de_label() },
						]}
						bind:value={region}
					/>
				</DsField>
				<DsField label={m.commerce_context_currency()}>
					<DsSelect
						options={[
							{ value: "KRW", label: m.commerce_currency_krw_label() },
							{ value: "USD", label: m.commerce_currency_usd_label() },
							{ value: "EUR", label: m.commerce_currency_eur_label() },
						]}
						bind:value={currency}
					/>
				</DsField>
				<div class="pb-2">
					<DsCheckbox bind:checked={loggedIn}>
						{m.commerce_context_logged_in()}
					</DsCheckbox>
				</div>
			</div>
		</div>
	</DsCard>

	<section class="space-y-4" aria-labelledby="commerce-main-demo">
		<DsCard class="space-y-6">
			<div class="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
				<div class="space-y-4">
					<h3
						id="commerce-main-demo"
						class="text-label text-muted-foreground font-semibold uppercase tracking-wider"
					>
						{m.commerce_selector_label()}
					</h3>
					<DsPaymentOptionSelector
						options={paymentOptions}
						value={selectedId}
						onValueChange={(next) => (selectedId = next)}
						ariaLabel={m.commerce_selector_label()}
						layout="grid"
						context={currentContext}
						availabilityMode="disable"
					/>
					<p
						class="text-helper text-muted-foreground flex items-center gap-1.5"
						aria-live="polite"
					>
						<span class="i-lucide-check-circle text-success h-3.5 w-3.5"></span>
						{m.commerce_selected_label()}
						{" "}
						<strong class="text-foreground">
							{selectedOption?.label ?? m.commerce_none_label()}
						</strong>
					</p>
				</div>

				<div class="space-y-6">
					<section class="space-y-3" aria-labelledby="commerce-details-title">
						<h3
							id="commerce-details-title"
							class="text-label text-muted-foreground font-semibold uppercase tracking-wider"
						>
							{m.commerce_details_label()}
						</h3>
						<DsPaymentOptionDetails
							option={selectedOption}
							title={m.commerce_details_label()}
							headingLevel={4}
						/>
					</section>

					<DsSeparator />

					<section class="space-y-3" aria-labelledby="commerce-summary-title">
						<h3
							id="commerce-summary-title"
							class="text-label text-muted-foreground font-semibold uppercase tracking-wider"
						>
							{m.commerce_summary_label()}
						</h3>
						<DsPaymentFlowSummary
							title={m.payment_summary_title()}
							items={summaryItems}
							discountLabel={m.payment_summary_discount()}
							discountValue="-$5.00"
							taxLabel={m.payment_summary_tax()}
							taxValue="$3.20"
							totalLabel={m.payment_summary_total()}
							totalValue="$49.00"
							note={m.commerce_summary_note()}
							headingLevel={4}
						>
							{#snippet footer()}
								<DsButton intent="primary" fullWidth size="lg">
									{m.commerce_continue_button()}
								</DsButton>
							{/snippet}
						</DsPaymentFlowSummary>
					</section>
				</div>
			</div>
		</DsCard>
	</section>

	<section class="space-y-4" aria-labelledby="commerce-list-demo">
		<DsCard class="space-y-4">
			<div class="space-y-1">
				<h3
					id="commerce-list-demo"
					class="text-label text-muted-foreground font-semibold uppercase tracking-wider"
				>
					{m.commerce_list_layout_label()}
				</h3>
				<p class="text-helper text-muted-foreground">
					{m.commerce_list_layout_desc()}
				</p>
			</div>

			<DsPaymentOptionSelector
				options={paymentOptions}
				value={listSelectedId}
				onValueChange={(next) => (listSelectedId = next)}
				ariaLabel={m.commerce_list_layout_label()}
				layout="list"
				availabilityMode="disable"
				context={currentContext}
			/>

			<p class="text-helper text-muted-foreground" aria-live="polite">
				{m.commerce_selected_label()}
				{" "}
				<strong class="text-foreground">
					{listSelectedOption?.label ?? m.commerce_none_label()}
				</strong>
			</p>
		</DsCard>
	</section>
</section>
