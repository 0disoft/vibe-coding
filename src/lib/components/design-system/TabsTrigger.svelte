<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  import { getTabsContext } from "./tabs-context";

  interface Props extends Omit<HTMLButtonAttributes, "children" | "type"> {
    value: string;
    disabled?: boolean;
    children?: Snippet;
  }

  let {
    value,
    disabled = false,
    class: className = "",
    children,
    onclick,
    ...rest
  }: Props = $props();

  const tabs = getTabsContext();

  let selected = $derived(tabs.isSelected(value));
  let id = $derived(tabs.tabId(value));
  let panelId = $derived(tabs.panelId(value));

  function handleClick(e: MouseEvent) {
    if (disabled) {
      e.preventDefault();
      return;
    }
    tabs.setValue(value);
    onclick?.(e as any);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (tabs.activationMode !== "manual") return;
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    tabs.setValue(value);
  }

  let rootClass = $derived(["ds-tabs-trigger", className].filter(Boolean).join(" "));
</script>

<button
  {...rest}
  type="button"
  class={rootClass}
  id={id}
  role="tab"
  data-value={value}
  aria-selected={selected}
  aria-controls={panelId}
  tabindex={selected ? 0 : -1}
  aria-disabled={disabled || undefined}
  onclick={handleClick}
  onkeydown={onKeyDown}
>
  {#if children}
    {@render children()}
  {/if}
</button>

