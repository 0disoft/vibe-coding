<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import DsSkeleton from "./Skeleton.svelte";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    rows?: number;
    showAvatar?: boolean;
  }

  let { rows = 4, showAvatar = true, class: className = "", ...rest }: Props =
    $props();
</script>

<div {...rest} class={["grid gap-3", className].filter(Boolean).join(" ")} aria-hidden="true">
  {#each Array.from({ length: Math.max(1, rows) }) as _, i (i)}
    <div class="flex items-center gap-3 rounded-md border border-border bg-surface p-3">
      {#if showAvatar}
        <DsSkeleton variant="circular" width={28} height={28} />
      {/if}
      <div class="min-w-0 flex-1 space-y-2">
        <DsSkeleton width="40%" height={12} />
        <DsSkeleton width="85%" height={10} />
      </div>
      <DsSkeleton width={56} height={12} />
    </div>
  {/each}
</div>

