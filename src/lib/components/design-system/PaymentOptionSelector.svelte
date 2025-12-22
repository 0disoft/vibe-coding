<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { page } from "$app/state";
	import {
		DsBadge,
		DsIcon,
		DsRadioGroup,
		DsRadioItem,
		DsTag,
	} from "$lib/components/design-system";
	import * as m from "$lib/paraglide/messages.js";
	import { createControllableState } from "$lib/shared/utils/controllable-state.svelte";

	import type {
		PaymentAvailabilityResult,
		PaymentContext,
		PaymentMethodType,
		PaymentOption,
		UnavailabilityReason,
	} from "./payment-types";
	import {
		checkPaymentOptionAvailability,
		getPaymentMethodMeta,
		normalizePaymentMeta,
	} from "./payment-types";

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
		renderOption?: Snippet<[PaymentOption, boolean, OptionContext]>;
	}

	type OptionContext = {
		id: string;
		checked: boolean;
		disabled: boolean;
		describedBy?: string;
		layout: Layout;
		availability: PaymentAvailabilityResult;
	};

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

	const generatedId = $props.id();

	const normalizeOptionId = (value: string) =>
		value.trim().replace(/[^a-zA-Z0-9_-]/g, "-");

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
		emptyText,
		renderOption,
		id: idProp,
		class: className = "",
		...rest
	}: Props = $props();

	// Reactive i18n
	let resolvedEmptyText = $derived.by(() => {
		void page.url;
		return emptyText ?? m.payment_no_options();
	});

	let valueState = createControllableState<string>({
		value: () => value,
		onChange: (next) => onValueChange?.(next),
		defaultValue: () => defaultValue ?? options[0]?.id ?? "",
	});

	let currentValue = $derived(valueState.value);
	let resolvedAriaLabel = $derived(ariaLabel ?? label);
	let rootClass = $derived(
		["ds-payment-option-group", className].filter(Boolean).join(" "),
	);
	let optionIdPrefix = $derived(idProp ?? generatedId);
	let normalizedId = $derived(idProp ?? undefined);
	let optionStates = $derived.by(() => {
		void page.url; // React to locale changes for labels logic
		return options
			.map((option) => {
				const check = checkPaymentOptionAvailability(option, context);
				const available = check.available;
				const disabledResolved =
					disabled ||
					option.disabled ||
					(!available && availabilityMode === "disable");
				return { option, available, disabledResolved, check };
			})
			.filter((state) =>
				availabilityMode === "hide" ? state.available : true,
			);
	});
	let selectableOptions = $derived.by(() =>
		optionStates.filter((state) => !state.disabledResolved),
	);
	let optionsAnnouncement = $derived.by(() => {
		void page.url;
		if (!optionStates.length) return resolvedEmptyText;
		const base = resolvedAriaLabel ?? "";
		return base ? `${base} ${optionStates.length}` : `${optionStates.length}`;
	});

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
		const exists = optionStates.some(
			(state) => state.option.id === currentValue,
		);
		const selectable = selectableOptions.some(
			(state) => state.option.id === currentValue,
		);
		if ((!exists || !selectable) && currentValue !== fallback)
			valueState.value = fallback;
	});

	function resolveMeta(option: PaymentOption, availabilityNote?: string) {
		const meta = normalizePaymentMeta(option.meta);
		const methodLabel = resolveMethodLabel(option.methodType);
		if (methodLabel && !meta.some((item) => item.text === methodLabel))
			meta.unshift({ text: methodLabel });
		// Only add availabilityNote if it's NOT a critical error (which is handled separately)
		if (availabilityNote && !meta.some((item) => item.text === availabilityNote))
			meta.unshift({ text: availabilityNote, intent: "danger" });
		return meta;
	}
</script>

{#if optionStates.length === 0}
	<div class="ds-payment-option-empty text-helper text-muted-foreground">
		{resolvedEmptyText}
	</div>
{:else}
	{#if optionsAnnouncement}
		<span class="sr-only" aria-live="polite">{optionsAnnouncement}</span>
	{/if}
	<DsRadioGroup
		{...rest}
		id={normalizedId}
		class={rootClass}
		value={currentValue}
		onValueChange={(next) => (valueState.value = next)}
		{name}
		{disabled}
		{required}
		describedBy={ariaDescribedby}
		ariaLabel={resolvedAriaLabel}
		{ariaLabelledby}
		data-ds-layout={layout}
	>
		{#each optionStates as state (state.option.id)}
			{@const option = state.option}
			{@const isSelected = currentValue === option.id}
			{@const optionDomId = `${optionIdPrefix}-${normalizeOptionId(option.id)}`}
			{@const badgeLabel =
				option.badge ??
				(option.recommended ? m.payment_recommended() : undefined)}
			{@const badgeIntent =
				option.badgeIntent ?? (option.recommended ? "primary" : "secondary")}
			{@const reasonLabel = getReasonLabel(state.check.reason)}
			{@const availabilityNote =
				!state.available && availabilityMode === "disable"
					? (state.check.message ?? reasonLabel ?? option.availabilityNote)
					: undefined}
			{@const metaItems = resolveMeta(option, availabilityNote)}
			{@const methodMeta = getPaymentMethodMeta(option.methodType)}
			{@const resolvedIcon = option.icon ?? methodMeta?.icon}

			<!-- Connect description and availabilityNote to aria-describedby via DsRadioItem's description prop -->
			{@const combinedDescription = [
				option.description,
				option.ariaHint,
				availabilityNote,
			]
				.filter(Boolean)
				.join(". ")}
			{@const optionDescriptionId = combinedDescription
				? `${optionDomId}-desc`
				: undefined}
			{@const optionContext = {
				id: optionDomId,
				checked: isSelected,
				disabled: state.disabledResolved,
				describedBy: [ariaDescribedby, optionDescriptionId]
					.filter(Boolean)
					.join(" ") || undefined,
				layout,
				availability: state.check,
			}}

			<DsRadioItem
				id={optionDomId}
				value={option.id}
				disabled={state.disabledResolved}
				aria-label={option.ariaLabel}
				description={combinedDescription}
				class={["ds-payment-option", isSelected ? "is-selected" : ""]
					.filter(Boolean)
					.join(" ")}
			>
				{#if renderOption}
					{@render renderOption(option, isSelected, optionContext)}
				{:else}
					<div class="ds-payment-option-content">
						<div class="ds-payment-option-title-row">
							<div class="ds-payment-option-title">
								{#if resolvedIcon}
									<DsIcon
										name={resolvedIcon}
										size="sm"
										class="ds-payment-option-icon"
									/>
								{/if}
								<span>{option.label}</span>
							</div>
							{#if badgeLabel}
								<DsBadge intent={badgeIntent} variant="soft" size="sm">
									{badgeLabel}
								</DsBadge>
							{/if}
							{#if isSelected}
								<DsIcon
									name="check-circle-2"
									size="xs"
									class="ds-payment-option-selected-icon"
									aria-hidden="true"
								/>
							{/if}
						</div>
						{#if option.provider}
							<div
								class="ds-payment-option-provider text-helper text-muted-foreground"
							>
								{option.provider}
							</div>
						{/if}

						<!-- availabilityNote gets special treatment for better visibility when disabled -->
						{#if availabilityNote}
							<div
								class="ds-payment-option-error text-helper text-destructive mt-1 font-medium"
								role="status"
							>
								<DsIcon
									name="alert-circle"
									size="xs"
									class="mr-1 inline-block"
								/>
								{availabilityNote}
							</div>
						{/if}

						{#if option.description}
							<div
								class="ds-payment-option-desc text-body-secondary text-muted-foreground"
							>
								{option.description}
							</div>
						{/if}

						{#if metaItems.length}
							<div class="ds-payment-option-meta">
								{#each metaItems as item (item.text)}
									{#if item.text !== availabilityNote}
										<DsTag
											size="sm"
											variant="outline"
											intent={item.intent ?? "neutral"}
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
										</DsTag>
									{/if}
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</DsRadioItem>
		{/each}
	</DsRadioGroup>
{/if}
