<script lang="ts">
	import { tick } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { DsInput } from "$lib/components/design-system";
	import * as m from "$lib/paraglide/messages.js";

	export type SearchItem = {
		id: string;
		title: string;
		description?: string;
		meta?: string;
		keywords?: string[];
		disabled?: boolean;
	};

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		query?: string;
		onQueryChange?: (next: string) => void;
		items: ReadonlyArray<SearchItem>;
		onSelect?: (id: string) => void;
		label?: string;
		placeholder?: string;
		emptyText?: string;
		maxResults?: number;
		showCount?: boolean;
	}

	let {
		query = $bindable(""),
		onQueryChange,
		items,
		onSelect,
		label = m.search_panel_label(),
		placeholder = m.search_panel_placeholder(),
		emptyText = m.search_panel_empty(),
		maxResults = 30,
		showCount = true,
		class: className = "",
		...rest
	}: Props = $props();

	const generatedId = $props.id();
	let inputId = $derived(rest.id ?? generatedId);
	let listboxId = $derived(`${inputId}__listbox`);

	let activeIndex = $state<number>(-1);
	let lastInteraction = $state<"keyboard" | "pointer">("pointer");

	function normalize(s: string) {
		return s.trim().toLowerCase();
	}

	function escapeRegExp(value: string) {
		return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}

	function matches(item: SearchItem, q: string) {
		if (!q) return true;
		const hay = [
			item.title,
			item.description ?? "",
			item.meta ?? "",
			...(item.keywords ?? []),
		]
			.join(" ")
			.toLowerCase();
		return hay.includes(q);
	}

	let qNorm = $derived(normalize(query));
	let queryText = $derived(query.trim());
	let highlightRegExp = $derived(
		queryText ? new RegExp(`(${escapeRegExp(queryText)})`, "gi") : null,
	);
	let filtered = $derived(items.filter((it) => matches(it, qNorm)));
	let limited = $derived(filtered.slice(0, maxResults));

	$effect(() => {
		// query 변경 시 activeIndex는 첫 활성 항목으로 정렬
		if (limited.length === 0) {
			activeIndex = -1;
			return;
		}
		if (activeIndex >= 0 && activeIndex < limited.length) return;
		activeIndex = limited.findIndex((it) => !it.disabled);
	});

	function optionId(i: number) {
		return `${listboxId}__opt__${i}`;
	}

	let activeDescendant = $derived(
		activeIndex >= 0 && activeIndex < limited.length
			? optionId(activeIndex)
			: undefined,
	);

	function setQuery(next: string) {
		query = next;
		onQueryChange?.(next);
	}

	function move(delta: number) {
		if (limited.length === 0) return;

		let idx = activeIndex;
		for (let step = 0; step < limited.length; step++) {
			idx = (idx + delta + limited.length) % limited.length;
			if (!limited[idx]?.disabled) {
				activeIndex = idx;
				void scrollToOption(idx);
				return;
			}
		}
	}

	function selectActive() {
		if (activeIndex < 0 || activeIndex >= limited.length) return;
		const item = limited[activeIndex];
		if (!item || item.disabled) return;
		onSelect?.(item.id);
	}

	async function scrollToOption(i: number) {
		await tick();
		const el = document.getElementById(optionId(i));
		el?.scrollIntoView({ block: "nearest" });
	}

	function onInputKeydown(e: KeyboardEvent) {
		lastInteraction = "keyboard";
		if (e.key === "ArrowDown") {
			e.preventDefault();
			move(1);
			return;
		}
		if (e.key === "ArrowUp") {
			e.preventDefault();
			move(-1);
			return;
		}
		if (e.key === "Enter") {
			e.preventDefault();
			selectActive();
			return;
		}
		if (e.key === "Escape") {
			if (query) {
				e.preventDefault();
				setQuery("");
				return;
			}
		}
	}
</script>

{#snippet highlight(text: string)}
	{#if !queryText}
		{text}
	{:else}
		{@const parts = text.split(highlightRegExp ?? /$^/)}
		{#each parts as part}
			{#if part.toLowerCase() === queryText.toLowerCase()}
				<span class="ds-search-highlight">{part}</span>
			{:else}
				{part}
			{/if}
		{/each}
	{/if}
{/snippet}

<div {...rest} class={["ds-search-panel", className].filter(Boolean).join(" ")}>
	<div class="ds-search-panel-header flex items-center justify-between gap-3">
		<div class="ds-search-input flex-1 min-w-0">
			<DsInput
				id={inputId}
				{placeholder}
				clearable
				bind:value={query}
				aria-label={label}
				role="combobox"
				aria-autocomplete="list"
				aria-controls={listboxId}
				aria-expanded={limited.length > 0}
				aria-activedescendant={activeDescendant}
				oninput={(e) => setQuery((e.target as HTMLInputElement).value)}
				onkeydown={onInputKeydown}
			>
				{#snippet start()}
					<span class="i-lucide-search h-4 w-4 text-muted-foreground"></span>
				{/snippet}
			</DsInput>
		</div>

		{#if showCount}
			<div
				class="ds-search-count flex shrink-0 items-center gap-2 text-sm text-muted-foreground whitespace-nowrap"
			>
				<span
					class="ds-search-count-badge rounded-full bg-surface-hover px-2 py-0.5 text-xs font-semibold text-text"
					>{filtered.length.toLocaleString()}</span
				>
				<span class="ds-search-count-label">{m.search_panel_results()}</span>
			</div>
		{/if}
	</div>

	<div class="ds-search-results">
		{#if limited.length === 0}
			<div
				class="ds-search-empty flex min-h-[100px] items-center justify-center text-body-secondary text-muted-foreground"
			>
				{emptyText}
			</div>
		{:else}
			<ul
				id={listboxId}
				class="ds-search-list"
				role="listbox"
				aria-label={`${label} ${m.search_panel_results()}`}
				onpointermove={() => {
					lastInteraction = "pointer";
				}}
			>
				{#each limited as item, i (item.id)}
					<li>
						<button
							id={optionId(i)}
							type="button"
							role="option"
							class="ds-search-item ds-focus-ring"
							aria-selected={i === activeIndex}
							disabled={item.disabled}
							onclick={() => {
								if (item.disabled) return;
								onSelect?.(item.id);
							}}
							onmousemove={() => {
								if (lastInteraction !== "pointer") return;
								if (activeIndex !== i && !item.disabled) activeIndex = i;
							}}
							data-testid={`ds-search-option-${item.id}`}
						>
							<div class="ds-search-item-main">
								<div class="ds-search-title">
									{@render highlight(item.title)}
								</div>
								{#if item.description}
									<div class="ds-search-desc text-helper text-muted-foreground">
										{@render highlight(item.description)}
									</div>
								{/if}
							</div>

							{#if item.meta}
								<div class="ds-search-meta text-helper text-muted-foreground">
									{item.meta}
								</div>
							{/if}
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
