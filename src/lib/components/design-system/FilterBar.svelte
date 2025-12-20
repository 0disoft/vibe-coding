<script lang="ts">
	import type { Snippet } from "svelte";
	import { tick, untrack } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { createDebouncedRunner } from "$lib/shared/utils/debounce";

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

	const queryDebouncer = createDebouncedRunner();
	let inputRef = $state<HTMLInputElement | null>(null);
	let inputValue = $state(query);
	let liveMessage = $state("");
	let shouldAnnounce = $state(false);

	let hasSort = $derived(sortOptions.length > 0);
	let hasActiveFilters = $derived(
		inputValue.trim().length > 0 || (sort ?? null) !== null,
	);
	let canClear = $derived(showClear && hasActiveFilters);

	$effect(() => {
		const currentInput = untrack(() => inputValue);
		if (query !== currentInput) {
			queryDebouncer.cancel();
			inputValue = query;
		}
	});

	function setQuery(next: string) {
		if (next === query) return;
		query = next;
		onQueryChange?.(next);
		shouldAnnounce = true;
	}

	function setSort(next: string) {
		const normalized = next.trim();
		const v = normalized.length ? normalized : null;
		if (v === sort) return;
		sort = v;
		onSortChange?.(v);
		shouldAnnounce = true;
	}

	let sortProxy = $derived({
		get value() {
			return sort ?? "";
		},
		set value(next: string) {
			setSort(next);
		},
	});

	function scheduleQuery(next: string) {
		queryDebouncer.run(() => setQuery(next), debounceMs);
	}

	function handleInputValue(next: string) {
		inputValue = next;
		scheduleQuery(next);
	}

	let inputProxy = $derived({
		get value() {
			return inputValue;
		},
		set value(next: string) {
			handleInputValue(next);
		},
	});

	function getSortLabel(value: string | null) {
		if (!value) return "";
		const match = sortOptions.find((option) => option.value === value);
		return match?.label ?? value;
	}

	function buildLiveMessage(nextQuery: string, nextSort: string | null) {
		const trimmedQuery = nextQuery.trim();
		const sortLabel = getSortLabel(nextSort);
		if (!trimmedQuery && !sortLabel) return "Filters cleared.";
		const parts: string[] = [];
		if (trimmedQuery) parts.push(`Query: ${trimmedQuery}`);
		if (sortLabel) parts.push(`Sort: ${sortLabel}`);
		return `Filters updated. ${parts.join(". ")}`;
	}

	$effect(() => {
		if (!shouldAnnounce) return;
		liveMessage = buildLiveMessage(query, sort ?? null);
		shouldAnnounce = false;
	});

	function clearAll() {
		queryDebouncer.cancel();
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
			bind:value={inputProxy.value}
			{placeholder}
			clearable={true}
			class="ds-filter-bar-query"
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
		{#if showClear}
			<div
				class="ds-filter-bar-clear"
				data-hidden={!canClear ? "true" : undefined}
				aria-hidden={!canClear ? "true" : undefined}
			>
				<DsButton
					size="sm"
					variant="outline"
					intent="secondary"
					disabled={!canClear}
					tabindex={!canClear ? -1 : undefined}
					onclick={clearAll}
				>
					{clearLabel}
				</DsButton>
			</div>
		{/if}
		{#if actions}
			{@render actions()}
		{/if}
	</div>
	<span class="sr-only" aria-live="polite" aria-atomic="true">
		{liveMessage}
	</span>
</div>
