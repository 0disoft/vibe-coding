<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import DsSkeleton from "./Skeleton.svelte";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    columns?: number;
    rows?: number;
    showHeader?: boolean;
  }

  let {
    columns = 4,
    rows = 5,
    showHeader = true,
    class: className = "",
    ...rest
  }: Props = $props();

  let safeCols = $derived(Math.min(8, Math.max(1, Math.floor(columns))));
  let safeRows = $derived(Math.min(12, Math.max(1, Math.floor(rows))));

  let colIndexes = $derived(Array.from({ length: safeCols }, (_, i) => i));
  let rowIndexes = $derived(Array.from({ length: safeRows }, (_, i) => i));

  function headerWidth(index: number) {
    return `${45 + (index * 11) % 35}%`;
  }

  function cellWidth(row: number, col: number) {
    return `${40 + ((row + col) * 13) % 50}%`;
  }
</script>

<div {...rest} class={["ds-table-scroll", className].filter(Boolean).join(" ")}>
  <div class="ds-table" aria-hidden="true">
    <table class="ds-table-native" role="presentation">
      {#if showHeader}
        <thead class="ds-table-head">
          <tr class="ds-table-tr">
            {#each colIndexes as i (i)}
              <th class="ds-table-th">
                <div class="px-[0.9rem] py-[0.7rem]">
                  <DsSkeleton width={headerWidth(i)} height={12} />
                </div>
              </th>
            {/each}
          </tr>
      </thead>
      {/if}
      <tbody>
        {#each rowIndexes as r (r)}
          <tr class="ds-table-tr">
            {#each colIndexes as c (c)}
              <td class="ds-table-td">
                <DsSkeleton width={cellWidth(r, c)} height={12} />
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
