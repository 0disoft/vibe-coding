<script lang="ts">
	import { DsDropdown, DsIcon } from "$lib/components/design-system";

	type Option = {
		value: string;
		label: string;
		disabled?: boolean;
	};

	interface Props {
		options: Option[];
		values?: string[];
		placeholder?: string;
		name?: string;
		disabled?: boolean;
		invalid?: boolean;
		required?: boolean;
		/** Field와 연결용 */
		id?: string;
		/** aria-describedby (Field에서 전달) */
		describedBy?: string;
		class?: string;
		maxChips?: number;
	}

	let {
		options,
		values = $bindable<string[]>([]),
		placeholder = "Select options",
		name,
		disabled = false,
		invalid = false,
		required = false,
		id: idProp,
		describedBy,
		class: className = "",
		maxChips = 2,
	}: Props = $props();

	const generatedId = $props.id();
	let triggerId = $derived(idProp ?? generatedId);

	function isSelected(value: string) {
		return values.includes(value);
	}

	function toggleValue(value: string) {
		if (isSelected(value)) {
			values = values.filter((v) => v !== value);
			return;
		}
		values = [...values, value];
	}

	function clearAll() {
		values = [];
	}

	let selectedOptions = $derived(
		options.filter((o) => values.includes(o.value)),
	);
	let isPlaceholder = $derived(selectedOptions.length === 0);

	let visibleChips = $derived(selectedOptions.slice(0, Math.max(0, maxChips)));
	let overflowCount = $derived(
		Math.max(0, selectedOptions.length - visibleChips.length),
	);

	let triggerWidth = $state(0);

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

{#if name}
	{#each values as v (v)}
		<input type="hidden" {name} value={v} {disabled} />
	{/each}
{/if}

<DsDropdown
	{disabled}
	class={`w-full ${className}`.trim()}
	menuClass="min-w-[var(--trigger-width)]"
	align="start"
	style={`--trigger-width: ${triggerWidth}px`}
	itemSelector={'[role="menuitemcheckbox"], [role="menuitem"]'}
>
	{#snippet trigger(triggerProps)}
		{@const { ref, id: _triggerId, ...a11y } = triggerProps}

		<button
			type="button"
			id={triggerId}
			use:triggerAction={ref}
			class={["ds-multiselect-trigger", invalid ? "border-destructive" : ""]
				.filter(Boolean)
				.join(" ")}
			{...a11y}
			data-placeholder={isPlaceholder}
			data-invalid={invalid || undefined}
			data-required={required || undefined}
			aria-describedby={describedBy}
		>
			<span class="min-w-0 flex-1">
				{#if isPlaceholder}
					<span class="truncate">{placeholder}</span>
				{:else}
					<span class="ds-multiselect-chips">
						{#each visibleChips as option (option.value)}
							<span class="ds-multiselect-chip">
								<span class="truncate">{option.label}</span>
							</span>
						{/each}
						{#if overflowCount > 0}
							<span class="ds-multiselect-chip">+{overflowCount}</span>
						{/if}
					</span>
				{/if}
			</span>

			<DsIcon
				name="chevron-down"
				size="sm"
				class={`transition-transform duration-200 opacity-50 ${a11y["aria-expanded"] ? "rotate-180" : ""}`}
			/>
		</button>
	{/snippet}

	{#snippet children()}
		{#if values.length > 0}
			<button
				type="button"
				class="ds-multiselect-item"
				role="menuitem"
				onclick={(event) => {
					event.preventDefault();
					event.stopPropagation();
					clearAll();
				}}
			>
				<span class="ds-multiselect-check" aria-hidden="true">
					<DsIcon name="x" size="sm" />
				</span>
				Clear selection
			</button>
			<div
				class="ds-multiselect-divider ds-separator"
				role="separator"
				data-ds-orientation="horizontal"
			></div>
		{/if}

		{#each options as option (option.value)}
			{@const selected = isSelected(option.value)}

			<button
				type="button"
				class="ds-multiselect-item"
				role="menuitemcheckbox"
				aria-checked={selected}
				aria-disabled={option.disabled || undefined}
				tabindex="-1"
				onclick={(event) => {
					if (option.disabled) return;
					event.preventDefault();
					event.stopPropagation();
					toggleValue(option.value);
				}}
			>
				<span class="ds-multiselect-check" aria-hidden="true">
					{#if selected}
						<DsIcon name="check" size="sm" />
					{/if}
				</span>
				<span class="truncate">{option.label}</span>
			</button>
		{/each}
	{/snippet}
</DsDropdown>
