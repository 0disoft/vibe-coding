<script lang="ts">
  import type { HTMLAnchorAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLAnchorAttributes, "children"> {
    href?: string;
    label?: string;
  }

  type AnchorClickEvent = Parameters<NonNullable<HTMLAnchorAttributes["onclick"]>>[0];

  let {
    href = "#main-content",
    label = "Skip to main content",
    class: className = "",
    onclick,
    ...rest
  }: Props = $props();

  let rootClass = $derived(["ds-skip-link", "ds-focus-ring", className].filter(Boolean).join(" "));

  function handleClick(e: AnchorClickEvent) {
    onclick?.(e);
    if (e.defaultPrevented) return;
    if (!href.startsWith("#")) return;

    const mouse = e as unknown as MouseEvent;
    if (typeof mouse.button === "number" && mouse.button !== 0) return;
    if (mouse.metaKey || mouse.ctrlKey || mouse.shiftKey || mouse.altKey) return;

    e.preventDefault();
    const id = href.slice(1);
    const target = document.getElementById(id) as HTMLElement | null;
    if (!target) return;
    target.scrollIntoView({ block: "start" });
    queueMicrotask(() => target.focus());
  }
</script>

<a {...rest} class={rootClass} href={href} onclick={handleClick}>{label}</a>
