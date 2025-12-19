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
    disabled?: boolean;
    children?: Snippet;
  }

  let {
    href,
    type = "button",
    role = "menuitem",
    intent,
    disabled = false,
    class: className = "",
    children,
    onclick,
    ...rest
  }: Props = $props();

  let isLink = $derived(!!href && !disabled);
  let computedHref = $derived(isLink ? href : undefined);
  let tabIndexValue = $derived(rest.tabindex ?? -1);

  let itemClass = $derived(
    ["ds-dropdown-item ds-focus-ring", className].filter(Boolean).join(" "),
  );

  function handleClick(e: MouseEvent) {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onclick?.(e as any);
  }
</script>

{#if isLink}
  <a
    {...rest}
    href={computedHref}
    class={itemClass}
    role={role}
    tabindex={tabIndexValue}
    aria-disabled={disabled || undefined}
    data-ds-dropdown-item="true"
    data-ds-intent={intent === "destructive" ? "destructive" : undefined}
    data-disabled={disabled ? "true" : undefined}
    onclick={handleClick}
  >
    {#if children}
      {@render children()}
    {/if}
  </a>
{:else}
  <button
    {...rest}
    {type}
    class={itemClass}
    role={role}
    tabindex={tabIndexValue}
    disabled={disabled}
    aria-disabled={disabled || undefined}
    data-ds-dropdown-item="true"
    data-ds-intent={intent === "destructive" ? "destructive" : undefined}
    data-disabled={disabled ? "true" : undefined}
    onclick={handleClick}
  >
    {#if children}
      {@render children()}
    {/if}
  </button>
{/if}
