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

    if (typeof e.button === "number" && e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    e.preventDefault();
    const id = href.slice(1);
    const target = document.getElementById(id) as HTMLElement | null;
    if (!target) return;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.scrollIntoView({ block: "start", behavior: "auto" });
    queueMicrotask(() => target.focus());
  }
</script>

<a {...rest} class={rootClass} href={href} onclick={handleClick}>{label}</a>
