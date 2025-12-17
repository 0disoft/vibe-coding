<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { useId } from "$lib/shared/utils/use-id";
  import {
    setTabsContext,
    type TabsActivationMode,
    type TabsOrientation,
  } from "./tabs-context";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    value?: string;
    onValueChange?: (next: string) => void;
    orientation?: TabsOrientation;
    activationMode?: TabsActivationMode;
    id?: string;
    children?: Snippet;
  }

  let {
    value,
    onValueChange,
    orientation = "horizontal",
    activationMode = "automatic",
    id: idProp,
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  const generatedId = useId("ds-tabs");
  let baseId = $derived(idProp ?? generatedId);

  let uncontrolledValue = $state("");

  function currentValue(): string {
    return value === undefined ? uncontrolledValue : value;
  }

  function setValue(next: string) {
    if (value === undefined) uncontrolledValue = next;
    onValueChange?.(next);
  }

  function normalizeValue(raw: string) {
    return encodeURIComponent(raw).replace(/%/g, "_");
  }

  function tabId(tabValue: string) {
    return `${baseId}-tab-${normalizeValue(tabValue)}`;
  }

  function panelId(tabValue: string) {
    return `${baseId}-panel-${normalizeValue(tabValue)}`;
  }

  function isSelected(tabValue: string) {
    return currentValue() === tabValue;
  }

  setTabsContext({
    get orientation() {
      return orientation;
    },
    get activationMode() {
      return activationMode;
    },
    get baseId() {
      return baseId;
    },
    isSelected,
    setValue,
    tabId,
    panelId,
  });

  let rootClass = $derived(["ds-tabs", className].filter(Boolean).join(" "));
</script>

<div {...rest} class={rootClass} data-ds-orientation={orientation}>
  {#if children}
    {@render children()}
  {/if}
</div>
