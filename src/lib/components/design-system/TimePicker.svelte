<script lang="ts">
	import type { HTMLInputAttributes } from "svelte/elements";

	import { DsIcon, DsInput } from "$lib/components/design-system";

	interface Props {
		value?: string | null;
		onValueChange?: (next: string | null) => void;
		label?: string;
		placeholder?: string;
		clearable?: boolean;
		showIcon?: boolean;
		icon?: string;
		id?: string;
		name?: string;
		disabled?: boolean;
		readonly?: boolean;
		required?: boolean;
		min?: string;
		max?: string;
		step?: number;
		autocomplete?: HTMLInputAttributes["autocomplete"];
		/** 표준 aria-describedby 전달용 */
		"aria-describedby"?: string;
		"aria-labelledby"?: string;
		"aria-label"?: string;
		class?: string;
	}

	const generatedId = $props.id();

	let {
		value = $bindable<string | null>(null),
		onValueChange,
		label = "Time",
		placeholder,
		clearable = true,
		showIcon = true,
		icon = "clock",
		id: idProp,
		min,
		max,
		step,
		"aria-describedby": ariaDescribedByProp,
		"aria-labelledby": ariaLabelledByProp,
		"aria-label": ariaLabelProp,
		class: className = "",
		...rest
	}: Props = $props();

	let ariaLabel = $derived(
		ariaLabelProp ? ariaLabelProp : ariaLabelledByProp ? undefined : label,
	);
	let resolvedId = $derived(idProp ?? generatedId);

	function formatStepDescription(stepValue: number) {
		if (stepValue <= 0) return "";
		if (stepValue % 60 === 0) {
			const minutes = stepValue / 60;
			return `${minutes}분 단위`;
		}
		return `${stepValue}초 단위`;
	}

	let rangeDescription = $derived.by(() => {
		const parts: string[] = [];
		if (min) parts.push(`최소 ${min}`);
		if (max) parts.push(`최대 ${max}`);
		if (typeof step === "number") {
			const stepText = formatStepDescription(step);
			if (stepText) parts.push(stepText);
		}
		return parts.length ? `입력 범위: ${parts.join(", ")}` : "";
	});

	let descriptionId = $derived(
		rangeDescription ? `${resolvedId}-desc` : undefined,
	);
	let resolvedDescribedBy = $derived.by(() => {
		const ids = [ariaDescribedByProp, descriptionId].filter(Boolean);
		return ids.length ? ids.join(" ") : undefined;
	});

	function handleInput(e: Event) {
		const next = (e.target as HTMLInputElement | null)?.value ?? "";
		value = next ? next : null;
		onValueChange?.(value);
	}
</script>

<DsInput
	type="time"
	bind:value
	clearable={clearable}
	aria-label={ariaLabel}
	aria-labelledby={ariaLabelledByProp}
	aria-describedby={resolvedDescribedBy}
	id={resolvedId}
	min={min}
	max={max}
	step={step}
	placeholder={placeholder}
	class={className}
	oninput={handleInput}
	{...rest}
>
	{#if showIcon}
		{#snippet start()}
			<span class="ds-time-picker-icon" aria-hidden="true">
				<DsIcon name={icon} size="sm" />
			</span>
		{/snippet}
	{/if}
</DsInput>

{#if rangeDescription && descriptionId}
	<span class="sr-only" id={descriptionId}>
		{rangeDescription}
	</span>
{/if}
