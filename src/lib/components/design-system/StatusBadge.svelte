<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import DsBadge from "./Badge.svelte";

  export type ContentStatus = "draft" | "published" | "archived";

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
    status: ContentStatus;
    label?: string;
  }

  let { status, label, class: className = "", ...rest }: Props = $props();

  let mapped = $derived.by(() => {
    if (status === "published") return { intent: "success" as const, text: "Published" };
    if (status === "draft") return { intent: "warning" as const, text: "Draft" };
    return { intent: "neutral" as const, text: "Archived" };
  });
</script>

<DsBadge {...rest} intent={mapped.intent} variant="soft" size="sm" class={className}>
  {label ?? mapped.text}
</DsBadge>

