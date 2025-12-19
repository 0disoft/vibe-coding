<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  export type Politeness = "polite" | "assertive";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    politeness?: Politeness;
    duration?: number;
  }

  let {
    politeness = "polite",
    duration = 3000,
    class: className = "",
    ...rest
  }: Props = $props();

  type Message = { id: number; text: string };

  let messages = $state<Message[]>([]);
  let nextId = 0;

  export function announce(next: string) {
    const id = nextId;
    nextId += 1;
    messages = [...messages, { id, text: next }];

    setTimeout(() => {
      messages = messages.filter((msg) => msg.id !== id);
    }, duration);
  }

  let computedRole = $derived(politeness === "assertive" ? "alert" : "status");

  let rootClass = $derived(["sr-only", className].filter(Boolean).join(" "));
</script>

<div {...rest} class={rootClass} aria-live={politeness} aria-atomic="true" role={computedRole}>
  {#each messages as msg (msg.id)}
    <div>{msg.text}</div>
  {/each}
</div>
