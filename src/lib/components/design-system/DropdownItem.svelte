<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";

  type DropdownItemIntent = "destructive";

  type NativeAttrs = Omit<
    HTMLAnchorAttributes & HTMLButtonAttributes,
    "children" | "href" | "type" | "role"
  >;

  interface Props extends NativeAttrs {
    href?: string;
    type?: "button" | "submit" | "reset";
    role?: string;
    intent?: DropdownItemIntent;
    children?: Snippet;
  }

  let {
    href,
    type = "button",
    role = "menuitem",
    intent,
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  let elementTag = $derived(href ? "a" : "button");

  let itemClass = $derived(
    ["ds-dropdown-item ds-focus-ring", className].filter(Boolean).join(" "),
  );
</script>

<svelte:element
  this={elementTag}
  {...rest}
  {...(href ? { href } : {})}
  {...(href ? {} : { type })}
  class={itemClass}
  role={role}
  data-ds-dropdown-item="true"
  data-ds-intent={intent === "destructive" ? "destructive" : undefined}
>
  {#if children}
    {@render children()}
  {/if}
</svelte:element>
