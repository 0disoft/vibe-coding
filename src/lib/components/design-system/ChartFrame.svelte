<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { slide } from "svelte/transition";

  import { createControllableState } from "$lib/shared/utils/controllable-state.svelte";

  import DsButton from "./Button.svelte";

  type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    title: string;
    description?: string;
    headingLevel?: HeadingLevel;
    /** 차트 영역 */
    children?: Snippet;
    /** 우측 상단 액션 영역 */
    actions?: Snippet;
    /** 범례 영역 */
    legend?: Snippet;
    /** 데이터 테이블(접근성/검증용) */
    table?: Snippet;
    tableToggleLabel?: string;

    showTable?: boolean;
    onShowTableChange?: (next: boolean) => void;
    defaultShowTable?: boolean;
  }

  let {
    title,
    description,
    headingLevel = 3,
    children,
    actions,
    legend,
    table,
    tableToggleLabel = "Show data",
    showTable,
    onShowTableChange,
    defaultShowTable = false,
    class: className = "",
    ...rest
  }: Props = $props();

  const generatedId = $props.id();
  let chartId = $derived(rest.id ?? generatedId);
  let tableId = $derived(`${chartId}-table`);
  let headingTag = $derived(`h${headingLevel}`);

  let showTableState = createControllableState<boolean>({
    value: () => showTable ?? undefined,
    onChange: (next) => onShowTableChange?.(next),
    defaultValue: () => defaultShowTable,
  });

  let canShowTable = $derived(Boolean(table));
</script>

<section
  {...rest}
  class={["ds-chart-frame", className].filter(Boolean).join(" ")}
  aria-label={title}
>
  <header class="ds-chart-header">
    <div class="ds-chart-heading">
      <svelte:element this={headingTag} class="ds-chart-title">{title}</svelte:element>
      {#if description}
        <div class="ds-chart-desc">{description}</div>
      {/if}
    </div>

    {#if actions}
      <div class="ds-chart-actions">
        {@render actions()}
      </div>
    {/if}
  </header>

  <div class="ds-chart-body">
    {#if children}
      {@render children()}
    {/if}
  </div>

  {#if legend}
    <div class="ds-chart-legend">
      {@render legend()}
    </div>
  {/if}

  {#if canShowTable}
    <div class="ds-chart-footer">
      <DsButton
        size="sm"
        variant="outline"
        intent="secondary"
        aria-controls={tableId}
        aria-expanded={showTableState.value ? "true" : "false"}
        onclick={() => (showTableState.value = !showTableState.value)}
      >
        {tableToggleLabel}
      </DsButton>
    </div>

    {#if showTableState.value}
      <div class="ds-chart-table" id={tableId} transition:slide={{ duration: 200 }}>
        {@render table?.()}
      </div>
    {/if}
  {/if}
</section>
