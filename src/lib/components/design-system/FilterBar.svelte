<script lang="ts">
	import type { Snippet } from "svelte";
	import { tick, untrack } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import DsButton from "./Button.svelte";
	import DsInput from "./Input.svelte";
	import DsSelect from "./Select.svelte";

	export type FilterBarSortOption = { value: string; label: string };

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		query?: string;
		onQueryChange?: (next: string) => void;
		placeholder?: string;

		sort?: string | null;
		onSortChange?: (next: string | null) => void;
		sortOptions?: FilterBarSortOption[];
		sortPlaceholder?: string;

		showClear?: boolean;
		clearLabel?: string;
		debounceMs?: number;
		ariaLabel?: string;

		children?: Snippet;
		actions?: Snippet;
	}

	let {
		query = $bindable(""),
		onQueryChange,
		placeholder = "Search…",
		sort = $bindable<string | null>(null),
		onSortChange,
		sortOptions = [],
		sortPlaceholder = "Sort",
		showClear = true,
		clearLabel = "Clear",
		debounceMs = 300,
		ariaLabel = "Filters",
		children,
		actions,
		class: className = "",
		...rest
	}: Props = $props();

	let inputRef = $state<HTMLInputElement | null>(null);
	let inputValue = $state(query);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	let hasSort = $derived(sortOptions.length > 0);
	let canClear = $derived(
		showClear && (inputValue.trim().length > 0 || (sort ?? null) !== null),
	);

	$effect(() => {
		const currentInput = untrack(() => inputValue);
		if (query !== currentInput) {
			if (debounceTimer) {
				clearTimeout(debounceTimer);
				debounceTimer = null;
			}
			inputValue = query;
		}
	});

	function setQuery(next: string) {
		if (next === query) return;
		query = next;
		onQueryChange?.(next);
	}

	function setSort(next: string) {
		const normalized = next.trim();
		const v = normalized.length ? normalized : null;
		if (v === sort) return;
		sort = v;
		onSortChange?.(v);
	}

	let sortProxy = $derived({
		get value() {
			return sort ?? "";
		},
		set value(next: string) {
			setSort(next);
		},
	});

	function handleInput(e: Event) {
		const next = (e.currentTarget as HTMLInputElement).value;
		inputValue = next;
		if (debounceTimer) clearTimeout(debounceTimer);
		if (debounceMs <= 0) {
			setQuery(next);
			return;
		}
		debounceTimer = setTimeout(() => {
			setQuery(next);
		}, debounceMs);
	}

	function clearAll() {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
			debounceTimer = null;
		}
		inputValue = "";
		setQuery("");
		setSort("");
		tick().then(() => inputRef?.focus());
	}
</script>

<div
	{...rest}
	class={["ds-filter-bar", className].filter(Boolean).join(" ")}
	role="search"
	aria-label={ariaLabel}
>
	<div class="ds-filter-bar-main">
		<DsInput
			bind:ref={inputRef}
			value={inputValue}
			{placeholder}
			clearable={true}
			class="ds-filter-bar-query"
			oninput={handleInput}
		>
			{#snippet start()}
				<span
					class="i-lucide-search h-4 w-4 text-muted-foreground"
					aria-hidden="true"
				></span>
			{/snippet}
		</DsInput>

		{#if hasSort}
			<div class="ds-filter-bar-sort">
				<DsSelect
					options={sortOptions}
					placeholder={sortPlaceholder}
					bind:value={sortProxy.value}
				/>
			</div>
		{/if}

		{#if children}
			<div class="ds-filter-bar-filters">
				{@render children()}
			</div>
		{/if}
	</div>

	<div class="ds-filter-bar-actions">
		{#if canClear}
			<DsButton
				size="sm"
				variant="outline"
				intent="secondary"
				onclick={clearAll}
			>
				{clearLabel}
			</DsButton>
		{/if}
		{#if actions}
			{@render actions()}
		{/if}
	</div>
</div>
