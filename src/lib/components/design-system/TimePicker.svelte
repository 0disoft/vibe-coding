<script lang="ts">
	import type { HTMLInputAttributes } from "svelte/elements";

	import { DsInput } from "$lib/components/design-system";

	interface Props {
		value?: string | null;
		onValueChange?: (next: string | null) => void;
		label?: string;
		placeholder?: string;
		clearable?: boolean;
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

	let {
		value = $bindable<string | null>(null),
		onValueChange,
		label = "Time",
		placeholder,
		clearable = true,
		class: className = "",
		...rest
	}: Props = $props();

	let ariaLabel = $derived(
		rest["aria-label"] ? rest["aria-label"] : rest.id ? undefined : label,
	);

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
	placeholder={placeholder}
	class={className}
	oninput={handleInput}
	{...rest}
/>
