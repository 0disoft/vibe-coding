<script lang="ts">
	import { page } from "$app/state";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { DsBadge, DsIcon } from "$lib/components/design-system";
	import * as m from "$lib/paraglide/messages.js";

	import type {
		PaymentMethodType,
		PaymentOption,
		UnavailabilityReason,
	} from "./payment-types";
	import { checkPaymentOptionAvailability } from "./payment-types";

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		option?: PaymentOption | null;
		title?: string;
		emptyText?: string;
		children?: Snippet<[PaymentOption]>;
		/** Heading level for the option label (default: 4) */
		headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
	}

	const getMethodLabel = (type: PaymentMethodType): string => {
		switch (type) {
			case "card":
				return m.payment_method_card();
			case "bank":
				return m.payment_method_bank();
			case "crypto":
				return m.payment_method_crypto();
			case "wallet":
				return m.payment_method_wallet();
			case "mobile":
				return m.payment_method_mobile();
			case "virtual":
				return m.payment_method_virtual();
			case "transfer":
				return m.payment_method_transfer();
			default:
				return m.payment_method_other();
		}
	};

	const getReasonLabel = (
		reason?: UnavailabilityReason,
	): string | undefined => {
		switch (reason) {
			case "LOGIN_REQUIRED":
				return m.payment_reason_login_required();
			case "UNSUPPORTED_REGION":
				return m.payment_reason_unsupported_region();
			case "UNSUPPORTED_CURRENCY":
				return m.payment_reason_unsupported_currency();
			case "DISABLED":
				return m.payment_reason_disabled();
			default:
				return undefined;
		}
	};

	let {
		option = null,
		title,
		emptyText,
		children: childrenSnippet,
		headingLevel = 4,
		class: className = "",
		...rest
	}: Props = $props();

	// Reactive i18n
	let resolvedEmptyText = $derived.by(() => {
		void page.url;
		return emptyText ?? m.payment_details_select_prompt();
	});

	let checkResult = $derived(
		option ? checkPaymentOptionAvailability(option) : null,
	);
	let badgeLabel = $derived(
		option?.badge ??
			(option?.recommended ? m.payment_recommended() : undefined),
	);
	let badgeIntent = $derived(
		option?.badgeIntent ?? (option?.recommended ? "primary" : "secondary"),
	);
	let methodLabel = $derived(
		option?.methodType ? getMethodLabel(option.methodType) : undefined,
	);
	let availabilityNote = $derived.by(() => {
		if (!option || !checkResult) return undefined;
		if (checkResult.available) return undefined;
		return (
			checkResult.message ??
			getReasonLabel(checkResult.reason) ??
			option.availabilityNote
		);
	});

	let metaItems = $derived.by(() => {
		if (!option) return [];
		const meta = option.meta ? [...option.meta] : [];
		if (methodLabel && !meta.includes(methodLabel)) meta.unshift(methodLabel);
		return meta;
	});

	let headingTag = $derived(`h${headingLevel}`);
	let rootClass = $derived(
		["ds-payment-details", className].filter(Boolean).join(" "),
	);
</script>

<div {...rest} class={rootClass} aria-live="polite">
	{#if option}
		{#if title}
			<div class="ds-payment-details-title text-label text-muted-foreground">
				{title}
			</div>
		{/if}
		<div class="ds-payment-details-header">
			<svelte:element this={headingTag} class="text-h4 font-semibold">
				{option.label}
			</svelte:element>
			{#if badgeLabel}
				<DsBadge intent={badgeIntent} variant="soft" size="sm">
					{badgeLabel}
				</DsBadge>
			{/if}
		</div>

		{#if availabilityNote}
			<div
				class="ds-payment-details-alert text-helper text-destructive flex items-start gap-1.5 mt-2 font-medium"
			>
				<DsIcon name="alert-circle" size="xs" class="mt-0.5" />
				<span>{availabilityNote}</span>
			</div>
		{/if}

		{#if option.provider}
			<div
				class="ds-payment-details-provider text-helper text-muted-foreground"
			>
				{option.provider}
			</div>
		{/if}
		{#if option.description}
			<div
				class="ds-payment-details-desc text-body-secondary text-muted-foreground"
			>
				{option.description}
			</div>
		{/if}

		{#if childrenSnippet}
			<div class="ds-payment-details-custom mt-4">
				{@render childrenSnippet(option)}
			</div>
		{:else}
			{#if metaItems.length}
				<ul
					class="ds-payment-details-meta list-none p-0 flex flex-wrap gap-2 mt-4"
					aria-label={m.payment_details_meta_label()}
				>
					{#each metaItems as item (item)}
						<li
							class="text-xs bg-muted/50 px-2 py-0.5 rounded-full border border-border"
						>
							{item}
						</li>
					{/each}
				</ul>
			{/if}

			{#if option.details?.length}
				<div class="ds-payment-details-section mt-4">
					<ul class="ds-payment-details-list space-y-2 p-0 list-none">
						{#each option.details as item (item)}
							<li class="text-body-secondary flex items-start gap-2">
								<DsIcon
									name="check-circle-2"
									size="xs"
									class="text-success mt-1 shrink-0"
								/>
								<span>{item}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		{/if}
	{:else}
		<div
			class="ds-payment-details-empty text-helper text-muted-foreground py-8 text-center border-2 border-dashed border-border rounded-lg"
		>
			{emptyText}
		</div>
	{/if}
</div>
