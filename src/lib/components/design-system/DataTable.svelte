<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export type SortDirection = "asc" | "desc";

  export type Column = {
    id: string;
    header: string;
    align?: "start" | "center" | "end";
    sortable?: boolean;
  };

  interface SortState {
    columnId: string;
    direction: SortDirection;
  }

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    columns: Column[];
    rows: any[];
    /** 셀 값 추출(정렬/기본 렌더링) */
    getValue?: (row: any, columnId: string) => unknown;
    /** 기본 셀 렌더 커스터마이즈 */
    cell?: Snippet<[{ row: any; columnId: string; value: unknown }]>;
    empty?: Snippet;
    sort?: SortState;
    onSortChange?: (next: SortState) => void;
    label?: string;
    stickyHeader?: boolean;
  }

  let {
    columns,
    rows,
    getValue = (row, id) => row?.[id],
    cell,
    empty,
    sort,
    onSortChange,
    label = "Data table",
    stickyHeader = true,
    class: className = "",
    ...rest
  }: Props = $props();

  let sortState = $state<SortState | null>(null);

  $effect(() => {
    // controlled 모드 sync
    if (sort !== undefined) sortState = sort;
  });

  function compare(a: unknown, b: unknown) {
    if (a === b) return 0;
    if (a === null || a === undefined) return -1;
    if (b === null || b === undefined) return 1;
    if (typeof a === "number" && typeof b === "number") return a - b;
    return String(a).localeCompare(String(b));
  }

  let sortedRows = $derived.by(() => {
    const s = sortState;
    if (!s) return rows;
    const dir = s.direction === "asc" ? 1 : -1;
    const id = s.columnId;
    return [...rows].sort((r1, r2) => dir * compare(getValue(r1, id), getValue(r2, id)));
  });

  function toggleSort(col: Column) {
    if (!col.sortable) return;
    const cur = sortState;
    let next: SortState;
    if (!cur || cur.columnId !== col.id) next = { columnId: col.id, direction: "asc" };
    else next = { columnId: col.id, direction: cur.direction === "asc" ? "desc" : "asc" };
    sortState = next;
    onSortChange?.(next);
  }

  function thAlign(col: Column) {
    if (col.align === "end") return "text-end";
    if (col.align === "center") return "text-center";
    return "text-start";
  }

  let rootClass = $derived(["ds-table", stickyHeader ? "is-sticky" : "", className].filter(Boolean).join(" "));
</script>

<div {...rest} class={rootClass} role="region" aria-label={label}>
  <table class="ds-table-native">
    <thead class="ds-table-head">
      <tr>
        {#each columns as col (col.id)}
          <th class={["ds-table-th", thAlign(col), col.sortable ? "is-sortable" : ""].join(" ")}>
            <button
              type="button"
              class="ds-table-th-button"
              disabled={!col.sortable}
              onclick={() => toggleSort(col)}
              aria-label={col.sortable ? `Sort by ${col.header}` : col.header}
            >
              <span>{col.header}</span>
              {#if sortState?.columnId === col.id}
                <span class="ds-table-sort" aria-hidden="true">
                  {sortState.direction === "asc" ? "▲" : "▼"}
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
        {#each sortedRows as row, rowIndex (row?.id ?? rowIndex)}
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
