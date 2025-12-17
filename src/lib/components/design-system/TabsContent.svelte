<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { getTabsContext } from "./tabs-context";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    value: string;
    children?: Snippet;
  }

  let {
    value,
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  const tabs = getTabsContext();

  let selected = $derived(tabs.isSelected(value));
  let id = $derived(tabs.panelId(value));
  let tabId = $derived(tabs.tabId(value));

  let rootClass = $derived(["ds-tabs-content", className].filter(Boolean).join(" "));
</script>

<div
  {...rest}
  class={rootClass}
  id={id}
  role="tabpanel"
  aria-labelledby={tabId}
  tabindex={0}
  hidden={!selected}
  data-state={selected ? "active" : "inactive"}
>
  {#if children}
    {@render children()}
  {/if}
</div>

