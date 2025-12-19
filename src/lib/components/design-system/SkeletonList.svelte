<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import DsSkeleton from "./Skeleton.svelte";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    rows?: number;
    showAvatar?: boolean;
    showSecondary?: boolean;
    showAction?: boolean;
  }

  let {
    rows = 4,
    showAvatar = true,
    showSecondary = true,
    showAction = true,
    class: className = "",
    ...rest
  }: Props = $props();
</script>

<div {...rest} class={["grid gap-3", className].filter(Boolean).join(" ")} aria-hidden="true">
  {#each Array.from({ length: Math.max(1, rows) }) as _, i (i)}
    <div class="flex items-center gap-3 rounded-md border border-border bg-card p-3">
      {#if showAvatar}
        <DsSkeleton variant="circular" width={28} height={28} />
      {/if}
      <div class="min-w-0 flex-1 space-y-2">
        <DsSkeleton width={`${35 + (i % 4) * 10}%`} height={12} />
        {#if showSecondary}
          <DsSkeleton width={`${60 + (i % 3) * 12}%`} height={10} />
        {/if}
      </div>
      {#if showAction}
        <DsSkeleton width={56} height={12} />
      {/if}
    </div>
  {/each}
</div>
