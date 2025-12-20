<script lang="ts">
	import { DsDropdown, DsIcon } from "$lib/components/design-system";
	type Option = {
		value: string;
		label: string;
		disabled?: boolean;
	};

	type Size = "sm" | "md" | "lg";

	interface Props {
		options: Option[];
		value?: string;
		placeholder?: string;
		name?: string;
		disabled?: boolean;
		invalid?: boolean;
		required?: boolean;
		size?: Size;
		/** Field와 연결용 */
		id?: string;
		/** aria-describedby (Field에서 전달) */
		describedBy?: string;
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
		size = "md",
		id: idProp,
		describedBy,
		class: className = "",
	}: Props = $props();

	const generatedId = $props.id();
	let triggerId = $derived(idProp ?? generatedId);

	let selectedOption = $derived(options.find((o) => o.value === value));
	let displayLabel = $derived(selectedOption?.label ?? placeholder);
	let isPlaceholder = $derived(!selectedOption);

	let triggerWidth = $state(0);

	function handleSelect(nextValue: string) {
		value = nextValue;
	}

	function triggerAction(node: HTMLElement, refFn: (el: HTMLElement) => void) {
		refFn(node);

		const ro = new ResizeObserver((entries) => {
			for (const entry of entries) {
				triggerWidth = entry.contentRect.width;
			}
		});
		ro.observe(node);

		return {
			destroy() {
				ro.disconnect();
			},
		};
	}
</script>

<input type="hidden" {name} {value} {disabled} />

<DsDropdown
	{disabled}
	class={`w-full ${className}`.trim()}
	menuClass="min-w-[var(--trigger-width)]"
	align="start"
	style={`--trigger-width: ${triggerWidth}px`}
	itemSelector={'[role="menuitemradio"]'}
>
	{#snippet trigger(triggerProps)}
		{@const { ref, id: _triggerId, ...a11y } = triggerProps}

		<button
			type="button"
			id={triggerId}
			use:triggerAction={ref}
			class={["ds-select-trigger", invalid ? "border-destructive" : ""]
				.filter(Boolean)
				.join(" ")}
			{...a11y}
			data-ds-size={size}
			data-placeholder={isPlaceholder}
			data-invalid={invalid || undefined}
			data-required={required || undefined}
			aria-describedby={describedBy}
		>
			<span class="truncate">
				{displayLabel}
			</span>
			<DsIcon
				name="chevron-down"
				size="sm"
				class={`transition-transform duration-200 opacity-50 ${a11y["aria-expanded"] ? "rotate-180" : ""}`}
			/>
		</button>
	{/snippet}

	{#snippet children({ close })}
		{#each options as option (option.value)}
			{@const isSelected = option.value === value}

			<button
				type="button"
				class="ds-select-item"
				role="menuitemradio"
				aria-checked={isSelected}
				disabled={option.disabled}
				onclick={() => {
					if (option.disabled) return;
					handleSelect(option.value);
					close();
				}}
			>
				<span class="ds-select-check">
					{#if isSelected}
						<DsIcon name="check" size="sm" />
					{/if}
				</span>

				<span class="truncate">
					{option.label}
				</span>
			</button>
		{/each}
	{/snippet}
</DsDropdown>
