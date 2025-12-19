<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { useId } from "$lib/shared/utils/use-id";
  import { setAccordionContext, type AccordionType } from "./accordion-context";

  type Value = string | string[];

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    type?: AccordionType;
    value?: Value;
    onValueChange?: (next: Value) => void;
    /** type="single"일 때, 열린 항목을 닫을 수 있게 허용 */
    collapsible?: boolean;
    disabled?: boolean;
    id?: string;
    children?: Snippet;
  }

  let {
    type = "single",
    value,
    onValueChange,
    collapsible = true,
    disabled = false,
    id: idProp,
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  const generatedId = useId("ds-accordion");
  let baseId = $derived(idProp ?? generatedId);

  let uncontrolledValue = $state<Value>("");

  function normalizeValue(next: Value): Value {
    if (type === "multiple") {
      if (Array.isArray(next)) return next;
      return next ? [next] : [];
    }
    if (Array.isArray(next)) return next[0] ?? "";
    return next;
  }

  $effect(() => {
    // controlled 모드에서는 내부 값을 건드리지 않음
    if (value !== undefined) return;

    const normalized = normalizeValue(uncontrolledValue);
    if (normalized !== uncontrolledValue) uncontrolledValue = normalized;
  });

  function currentValue(): Value {
    return value === undefined ? uncontrolledValue : value;
  }

  function setValue(next: Value) {
    const normalized = normalizeValue(next);
    if (value === undefined) uncontrolledValue = normalized;
    onValueChange?.(normalized);
  }

  function isOpen(itemValue: string) {
    const active = currentValue();
    if (Array.isArray(active)) return active.includes(itemValue);
    return active === itemValue;
  }

  function toggle(itemValue: string) {
    if (type === "multiple") {
      const active = currentValue();
      const list = Array.isArray(active) ? active : [];
      if (list.includes(itemValue)) {
        setValue(list.filter((v) => v !== itemValue));
      } else {
        setValue([...list, itemValue]);
      }
      return;
    }

    const active = currentValue();
    const isSame = !Array.isArray(active) && active === itemValue;
    if (isSame) {
      if (collapsible) setValue("");
      return;
    }
    setValue(itemValue);
  }

  setAccordionContext({
    get type() {
      return type;
    },
    get disabled() {
      return disabled;
    },
    isOpen,
    toggle,
    get baseId() {
      return baseId;
    },
  });

  let rootClass = $derived(["ds-accordion", className].filter(Boolean).join(" "));
</script>

<div
  {...rest}
  class={rootClass}
  data-ds-accordion-root="true"
  data-disabled={disabled ? "true" : undefined}
>
  {#if children}
    {@render children()}
  {/if}
</div>
