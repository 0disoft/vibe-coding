<script lang="ts">
	import { DsDropdown, DsIcon } from "$lib/components/design-system";

	type Option = { value: string; label: string; disabled?: boolean };

	interface Props {
		options: Option[];
		value?: string;
		placeholder?: string;
		name?: string;
		disabled?: boolean;
		invalid?: boolean;
		required?: boolean;
		class?: string;
	}

	let {
		options,
		value = $bindable(""),
		placeholder = "Select an option",
		name,
		disabled = false,
		invalid = false,
		required = false,
		class: className = "",
	}: Props = $props();

	let selectedOption = $derived(options.find((o) => o.value === value));
	let displayLabel = $derived(selectedOption?.label ?? placeholder);

	// Dropdown Items 변환
	let dropdownItems = $derived(
		options.map((o) => ({
			id: o.value,
			label: o.label,
			disabled: o.disabled,
		})),
	);

	function handleSelect(id: string) {
		value = id;
	}
</script>

<input type="hidden" {name} {value} {required} />

<DsDropdown
	items={dropdownItems}
	onSelect={handleSelect}
	{disabled}
	class={`w-full ${className}`.trim()}
	trigger={selectTrigger}
/>

{#snippet selectTrigger(props)}
	<button
		type="button"
		class={`ds-select-trigger ds-focus-ring w-full flex items-center justify-between border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${invalid ? "border-destructive" : "border-input"} rounded-md`}
		{...props}
	>
		<span class={!selectedOption ? "text-muted-foreground" : "text-foreground"}>
			{displayLabel}
		</span>
		<DsIcon name="chevron-down" size="sm" class="opacity-50" />
	</button>
{/snippet}
