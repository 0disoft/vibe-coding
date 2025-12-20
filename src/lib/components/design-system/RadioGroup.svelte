<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { setRadioGroupContext } from "./radio-group-context";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    value?: string;
    onValueChange?: (next: string) => void;
    name?: string;
    disabled?: boolean;
    required?: boolean;
    /** DsField에서 전달받은 aria-describedby */
    describedBy?: string;
    ariaLabel?: string;
    ariaLabelledby?: string;
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
    ariaLabel,
    ariaLabelledby,
    id: idProp,
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  const generatedId = $props.id();
  let id = $derived(idProp ?? generatedId);
  let groupName = $derived(name ?? `${generatedId}-name`);

  function setValue(next: string) {
    if (disabled) return;
    value = next;
    onValueChange?.(next);
  }

  setRadioGroupContext({
    get name() {
      return groupName;
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
    get value() {
      return value;
    },
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
  aria-label={ariaLabel}
  aria-labelledby={ariaLabelledby}
  data-disabled={disabled ? "true" : undefined}
>
  {#if children}
    {@render children()}
  {/if}
</div>
