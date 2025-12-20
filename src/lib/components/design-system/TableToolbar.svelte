<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { DsIcon, DsInput } from "$lib/components/design-system";

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
		query = $bindable(""),
		onQueryChange,
		placeholder = "Search…",
		start,
		end,
		class: className = "",
		...rest
	}: Props = $props();

	function update(next: string) {
		query = next;
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

	<div class="ds-table-toolbar-controls" role="search">
		<DsInput
			value={query}
			oninput={(e) => update((e.currentTarget as HTMLInputElement).value)}
			placeholder={placeholder}
			clearable
			class="w-full"
		>
			{#snippet start()}
				<DsIcon name="search" size="sm" class="text-muted-foreground" />
			{/snippet}
		</DsInput>

		{#if end}
			<div class="flex items-center justify-end gap-2">
				{@render end()}
			</div>
		{/if}
	</div>
</header>

