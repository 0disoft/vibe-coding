<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { useId } from "$lib/shared/utils/use-id";
  import { setRadioGroupContext } from "./radio-group-context";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    value?: string;
    onValueChange?: (next: string) => void;
    name?: string;
    disabled?: boolean;
    required?: boolean;
    /** DsField에서 전달받은 aria-describedby */
    describedBy?: string;
    id?: string;
    children?: Snippet;
  }

  let {
    value = $bindable(""),
    onValueChange,
    name,
    disabled = false,
    required = false,
    describedBy,
    id: idProp,
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  const generatedId = useId("ds-radio-group");
  let id = $derived(idProp ?? generatedId);

  function setValue(next: string) {
    if (disabled) return;
    value = next;
    onValueChange?.(next);
  }

  setRadioGroupContext({
    get name() {
      return name;
    },
    get disabled() {
      return disabled;
    },
    get required() {
      return required;
    },
    get describedBy() {
      return describedBy;
    },
    value: () => value,
    setValue,
  });

  let rootClass = $derived(["ds-radio-group", className].filter(Boolean).join(" "));
</script>

<div
  {...rest}
  id={id}
  class={rootClass}
  role="radiogroup"
  aria-disabled={disabled || undefined}
  aria-required={required || undefined}
  aria-describedby={describedBy}
  data-disabled={disabled ? "true" : undefined}
>
  {#if children}
    {@render children()}
  {/if}
</div>
