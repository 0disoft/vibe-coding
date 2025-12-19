<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { DsIcon } from "$lib/components/design-system";

	export type SortDirection = "asc" | "desc";

	export type Column = {
		id: string;
		header: string;
		align?: "start" | "center" | "end";
		sortable?: boolean;
	};

	type SortState = {
		columnId: string;
		direction: SortDirection;
	} | null;

	interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		columns: Column[];
		rows: any[];
		/** 셀 값 추출(정렬/기본 렌더링) */
		getValue?: (row: any, columnId: string) => unknown;
		/** Row 고유 키 추출 (미지정 시 row.id fallback) */
		getRowId?: (row: any) => string | number;
		/** 기본 셀 렌더 커스터마이즈 */
		cell?: Snippet<[{ row: any; columnId: string; value: unknown }]>;
		empty?: Snippet;
		sort?: SortState;
		onSortChange?: (next: SortState) => void;
		label?: string;
		caption?: string;
		captionSide?: "top" | "bottom";
		stickyHeader?: boolean;
	}

	let {
		columns,
		rows,
		getValue = (row, id) => row?.[id],
		getRowId = (row) => row?.id,
		cell,
		empty,
		sort = $bindable(null),
		onSortChange,
		label = "Data table",
		caption,
		captionSide = "top",
		stickyHeader = true,
		class: className = "",
		...rest
	}: Props = $props();

	function compare(a: unknown, b: unknown) {
		if (a === b) return 0;
		if (a === null || a === undefined) return -1;
		if (b === null || b === undefined) return 1;
		if (typeof a === "number" && typeof b === "number") return a - b;
		return String(a).localeCompare(String(b));
	}

	let sortedRows = $derived.by(() => {
		const s = sort;
		if (!s) return rows;
		const dir = s.direction === "asc" ? 1 : -1;
		const id = s.columnId;
		return [...rows].sort(
			(r1, r2) => dir * compare(getValue(r1, id), getValue(r2, id)),
		);
	});

	function toggleSort(col: Column) {
		if (!col.sortable) return;
		const cur = sort;
		let next: SortState;
		if (!cur || cur.columnId !== col.id)
			next = { columnId: col.id, direction: "asc" };
		else
			next = {
				columnId: col.id,
				direction: cur.direction === "asc" ? "desc" : "asc",
			};
		sort = next;
		onSortChange?.(next);
	}

	function thAlign(col: Column) {
		if (col.align === "end") return "text-end";
		if (col.align === "center") return "text-center";
		return "text-start";
	}

	let rootClass = $derived(
		["ds-table", stickyHeader ? "is-sticky" : "", className]
			.filter(Boolean)
			.join(" "),
	);

	function ariaSort(col: Column) {
		if (!col.sortable) return undefined;
		if (!sort || sort.columnId !== col.id) return "none";
		return sort.direction === "asc" ? "ascending" : "descending";
	}

	function sortAnnouncement() {
		const currentSort = sort;
		if (!currentSort) return "Sorted: none";
		const col = columns.find((c) => c.id === currentSort.columnId);
		const header = col?.header ?? currentSort.columnId;
		const direction =
			currentSort.direction === "asc" ? "ascending" : "descending";
		return `Sorted by ${header}, ${direction}`;
	}
</script>

<div {...rest} class={rootClass} role="region" aria-label={label}>
	<span class="sr-only" aria-live="polite">{sortAnnouncement()}</span>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div class="ds-table-scroll" tabindex="0" aria-label={`${label} scroll area`}>
		<table class="ds-table-native">
			{#if caption}
				<caption class="ds-table-caption" data-side={captionSide}>
					{caption}
				</caption>
			{/if}
			<thead class="ds-table-head">
				<tr>
					{#each columns as col (col.id)}
						<th
							class={[
								"ds-table-th",
								thAlign(col),
								col.sortable ? "is-sortable" : "",
							].join(" ")}
							aria-sort={ariaSort(col)}
						>
							<button
								type="button"
								class="ds-table-th-button"
								disabled={!col.sortable}
								onclick={() => toggleSort(col)}
								aria-label={col.sortable ? `Sort by ${col.header}` : col.header}
							>
								<span>{col.header}</span>
								{#if sort?.columnId === col.id}
									<span class="ds-table-sort" aria-hidden="true">
										{#if sort?.direction === "asc"}
											<DsIcon name="arrow-up" size="sm" />
										{:else}
											<DsIcon name="arrow-down" size="sm" />
										{/if}
									</span>
								{/if}
							</button>
						</th>
					{/each}
				</tr>
			</thead>

			<tbody class="ds-table-body">
				{#if sortedRows.length === 0}
					<tr>
						<td class="ds-table-empty" colspan={columns.length}>
							{#if empty}
								{@render empty()}
							{:else}
								No rows
							{/if}
						</td>
					</tr>
				{:else}
					{#each sortedRows as row, rowIndex (getRowId(row) ?? rowIndex)}
						<tr class="ds-table-tr">
							{#each columns as col (col.id)}
								{@const v = getValue(row, col.id)}
								<td class={["ds-table-td", thAlign(col)].join(" ")}>
									{#if cell}
										{@render cell({ row, columnId: col.id, value: v })}
									{:else}
										{v as any}
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>
