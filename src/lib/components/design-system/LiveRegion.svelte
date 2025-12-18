<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  export type Politeness = "polite" | "assertive";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    politeness?: Politeness;
  }

  let { politeness = "polite", class: className = "", ...rest }: Props = $props();

  let message = $state("");

  export function announce(next: string) {
    message = "";
    queueMicrotask(() => (message = next));
  }

  let rootClass = $derived(["sr-only", className].filter(Boolean).join(" "));
</script>

<div {...rest} class={rootClass} aria-live={politeness} aria-atomic="true" role="status">
  {message}
</div>
