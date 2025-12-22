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
		PaymentContext,
		PaymentMethodType,
		PaymentOption,
		UnavailabilityReason,
	} from "./payment-types";
	import { checkPaymentOptionAvailability } from "./payment-types";

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
		const meta = option.meta ? [...option.meta] : [];
		if (option.methodType) {
			const label = getMethodLabel(option.methodType);
			if (label && !meta.includes(label)) meta.unshift(label);
		}
		// Only add availabilityNote if it's NOT a critical error (which is handled separately)
		if (availabilityNote && !meta.includes(availabilityNote))
			meta.unshift(availabilityNote);
		return meta;
	}
</script>

{#if optionStates.length === 0}
	<div class="ds-payment-option-empty text-helper text-muted-foreground">
		{resolvedEmptyText}
	</div>
{:else}
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

			<!-- Connect description and availabilityNote to aria-describedby via DsRadioItem's description prop -->
			{@const combinedDescription = [option.description, availabilityNote]
				.filter(Boolean)
				.join(". ")}

			<DsRadioItem
				value={option.id}
				disabled={state.disabledResolved}
				aria-label={option.ariaLabel}
				description={combinedDescription}
				class={["ds-payment-option", isSelected ? "is-selected" : ""]
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
									<DsIcon
										name={option.icon}
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
								{#each metaItems as meta (meta)}
									{#if meta !== availabilityNote}
										<DsTag size="sm" variant="outline" intent="neutral">
											{meta}
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
