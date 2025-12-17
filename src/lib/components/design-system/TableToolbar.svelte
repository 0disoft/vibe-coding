<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { DsInput } from "$lib/components/design-system";

	interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		title?: string;
		description?: string;
		count?: number;

		/** 검색어(제어형) */
		query?: string;
		onQueryChange?: (next: string) => void;
		placeholder?: string;

		start?: Snippet;
		end?: Snippet;
	}

	let {
		title,
		description,
		count,
		query,
		onQueryChange,
		placeholder = "Search…",
		start,
		end,
		class: className = "",
		...rest
	}: Props = $props();

	let localQuery = $state("");

	$effect(() => {
		if (query !== undefined) localQuery = query;
	});

	function update(next: string) {
		localQuery = next;
		onQueryChange?.(next);
	}
</script>

<header
	{...rest}
	class={["ds-table-toolbar", className].filter(Boolean).join(" ")}
>
	<div class="min-w-0">
		{#if title}
			<div class="flex items-center gap-2">
				<h2 class="text-h3 font-semibold truncate">{title}</h2>
				{#if typeof count === "number"}
					<span class="text-label text-muted-foreground">({count})</span>
				{/if}
			</div>
		{/if}
		{#if description}
			<p class="text-body-secondary text-muted-foreground">{description}</p>
		{/if}
		{#if start}
			<div class="pt-2">
				{@render start()}
			</div>
		{/if}
	</div>

	<div class="ds-table-toolbar-controls">
		<DsInput
			value={localQuery}
			oninput={(e) => update((e.currentTarget as HTMLInputElement).value)}
			placeholder={placeholder}
			clearable
			class="w-full"
		>
			{#snippet start()}
				<span class="i-lucide-search h-4 w-4 text-muted-foreground"></span>
			{/snippet}
		</DsInput>

		{#if end}
			<div class="flex items-center justify-end gap-2">
				{@render end()}
			</div>
		{/if}
	</div>
</header>

