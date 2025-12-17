<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import { DsButton, DsCalendar, DsPopover } from "$lib/components/design-system";

	import { parseIsoDate } from "./date-utils";

	interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		value?: string | null;
		onValueChange?: (next: string | null) => void;
		disabled?: boolean;
		label?: string;
		placeholder?: string;
		locale?: string;
		min?: string;
		max?: string;
		name?: string;
		closeOnSelect?: boolean;
		clearable?: boolean;
	}

	let {
		value = $bindable<string | null>(null),
		onValueChange,
		disabled = false,
		label = "Date",
		placeholder = "Select date…",
		locale,
		min,
		max,
		name,
		closeOnSelect = true,
		clearable = true,
		class: className = "",
		...rest
	}: Props = $props();

	let open = $state(false);

	function set(next: string | null) {
		value = next;
		onValueChange?.(next);
	}

	function display(v: string | null) {
		if (!v) return placeholder;
		const d = parseIsoDate(v);
		if (!d) return v;
		const fmt = new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "2-digit" });
		return fmt.format(d);
	}

	function applyRef(node: HTMLElement, refFn: (node: HTMLElement) => void) {
		refFn(node);
		return {
			update(next: (node: HTMLElement) => void) {
				next(node);
			},
		};
	}
</script>

<div {...rest} class={["ds-date-picker", className].filter(Boolean).join(" ")}>
	{#if name}
		<input type="hidden" {name} value={value ?? ""} />
	{/if}

	<DsPopover
		open={open}
		onOpenChange={(next) => (open = next)}
		disabled={disabled}
		label={label}
		side="bottom"
		align="start"
		panelClass="ds-date-picker-panel"
	>
		{#snippet trigger(props)}
			<button
				type="button"
				class="ds-combobox-trigger ds-focus-ring"
				id={props.id}
				aria-label={label}
				aria-controls={props["aria-controls"]}
				aria-haspopup="dialog"
				aria-expanded={props["aria-expanded"]}
				disabled={props.disabled}
				onclick={props.onclick}
				onkeydown={props.onkeydown}
				use:applyRef={props.ref}
			>
				<span class={value ? "truncate" : "truncate text-muted-foreground"}>{display(value)}</span>
				<span class="i-lucide-calendar h-4 w-4 opacity-60"></span>
			</button>
		{/snippet}

		{#snippet children({ close })}
			<div class="ds-date-picker-body">
				<DsCalendar
					bind:value
					{min}
					{max}
					{locale}
					label={label}
					onValueChange={(next) => {
						set(next);
						if (closeOnSelect && next) close({ focusButton: true });
					}}
				/>

				{#if clearable}
					<div class="ds-date-picker-actions">
						<DsButton
							size="sm"
							variant="outline"
							intent="secondary"
							disabled={disabled || !value}
							onclick={() => set(null)}
						>
							Clear
						</DsButton>
						<DsButton size="sm" onclick={() => close({ focusButton: true })}>Done</DsButton>
					</div>
				{:else}
					<div class="ds-date-picker-actions">
						<DsButton size="sm" onclick={() => close({ focusButton: true })}>Done</DsButton>
					</div>
				{/if}
			</div>
		{/snippet}
	</DsPopover>
</div>
