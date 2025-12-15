<script lang="ts">
	import { DsDropdown, DsIcon } from "$lib/components/design-system";

	type Option = {
		value: string;
		label: string;
		disabled?: boolean;
	};

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
	let isPlaceholder = $derived(!selectedOption);

	let triggerWidth = $state(0);

	function handleSelect(id: string) {
		value = id;
	}

	function triggerAction(node: HTMLElement, refFn: (el: HTMLElement) => void) {
		refFn(node); // Dropdown에 ref 전달
		
		// ResizeObserver로 너비 감지
		const ro = new ResizeObserver((entries) => {
			for (const entry of entries) {
				triggerWidth = entry.contentRect.width;
			}
		});
		ro.observe(node);

		return {
			destroy() {
				ro.disconnect();
			}
		};
	}
</script>

<input
	type="hidden"
	{name}
	{value}
	{required}
	aria-hidden="true"
	tabindex="-1"
/>

<DsDropdown
	open={false}
	{disabled}
	class={`w-full ${className}`.trim()}
	menuClass="min-w-[var(--trigger-width)]"
	align="start"
	style={`--trigger-width: ${triggerWidth}px`}
>
	{#snippet trigger(triggerProps)}
		<button
			type="button"
			use:triggerAction={triggerProps.ref}
			class={[
				"ds-select-trigger",
				invalid ? "border-destructive" : "",
				className,
			]
				.filter(Boolean)
				.join(" ")}
			{...triggerProps}
			// ref는 use:action으로 처리했으므로 제외 (중복 호출 방지)
			ref={undefined} 
			data-placeholder={isPlaceholder}
			aria-disabled={triggerProps.disabled ? "true" : undefined}
		>
			<span class="truncate">
				{displayLabel}
			</span>
			<DsIcon
				name="chevron-down"
				size="sm"
				class={`transition-transform duration-200 opacity-50 ${triggerProps["aria-expanded"] ? "rotate-180" : ""}`}
			/>
		</button>
	{/snippet}

	{#snippet children({ close })}
		<div role="group" aria-label={placeholder}>
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
		</div>
	{/snippet}
</DsDropdown>