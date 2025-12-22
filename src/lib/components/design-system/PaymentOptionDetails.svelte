<script lang="ts">
	import { page } from "$app/state";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { DsBadge, DsIcon } from "$lib/components/design-system";
	import * as m from "$lib/paraglide/messages.js";

	import type {
		PaymentAvailabilityResult,
		PaymentMethodType,
		PaymentOption,
		UnavailabilityReason,
	} from "./payment-types";
	import {
		checkPaymentOptionAvailability,
		normalizePaymentMeta,
	} from "./payment-types";

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		option?: PaymentOption | null;
		title?: string;
		emptyText?: string;
		children?: Snippet<[PaymentOption, PaymentAvailabilityResult | null]>;
		/** Heading level for the option label (default: 4) */
		headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
		/** When true, move focus to the details container on option change */
		autoFocusOnChange?: boolean;
	}

	const METHOD_LABELS: Record<PaymentMethodType, () => string> = {
		card: m.payment_method_card,
		bank: m.payment_method_bank,
		crypto: m.payment_method_crypto,
		wallet: m.payment_method_wallet,
		mobile: m.payment_method_mobile,
		virtual: m.payment_method_virtual,
		transfer: m.payment_method_transfer,
		other: m.payment_method_other,
	};

	const resolveMethodLabel = (
		type?: PaymentMethodType,
	): string | undefined => {
		if (!type) return undefined;
		const resolver = METHOD_LABELS[type] ?? METHOD_LABELS.other;
		return resolver();
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
		autoFocusOnChange = false,
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
	let selectedAnnouncement = $derived.by(() => {
		void page.url;
		if (!option) return resolvedEmptyText;
		return `${option.label} ${m.commerce_selected_label()}`;
	});
	let methodLabel = $derived(resolveMethodLabel(option?.methodType));
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
		const meta = normalizePaymentMeta(option.meta);
		if (methodLabel && !meta.some((item) => item.text === methodLabel))
			meta.unshift({ text: methodLabel });
		return meta;
	});

	let headingTag = $derived(`h${headingLevel}`);
	let rootClass = $derived(
		["ds-payment-details", className].filter(Boolean).join(" "),
	);
	let rootRef: HTMLDivElement | null = null;
	let lastOptionId: string | null = null;

	$effect(() => {
		if (!autoFocusOnChange) return;
		if (!option) return;
		if (option.id === lastOptionId) return;
		lastOptionId = option.id;
		rootRef?.focus();
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	{...rest}
	bind:this={rootRef}
	class={rootClass}
	tabindex={-1}
	aria-atomic="true"
>
	<span class="sr-only" aria-live="polite">{selectedAnnouncement}</span>
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
		{#if option.ariaHint}
			<span class="sr-only">{option.ariaHint}</span>
		{/if}

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
				{@render childrenSnippet(option, checkResult)}
			</div>
		{:else}
			{#if metaItems.length}
				<ul
					class="ds-payment-details-meta list-none p-0 flex flex-wrap gap-2 mt-4"
					aria-label={m.payment_details_meta_label()}
				>
					{#each metaItems as item (item.text)}
						<li
							class="text-xs bg-muted/50 px-2 py-0.5 rounded-full border border-border"
						>
							{#if item.icon}
								<DsIcon
									name={item.icon}
									size="xs"
									class="mr-1 inline-block"
									aria-hidden="true"
								/>
							{/if}
							{item.text}
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
			role="status"
			aria-live="polite"
		>
			{emptyText}
		</div>
	{/if}
</div>
