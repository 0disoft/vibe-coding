<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import DsSkeleton from "./Skeleton.svelte";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** 상단 미디어(썸네일) 블록 표시 */
    showMedia?: boolean;
    /** 미디어 비율 */
    mediaAspect?: "video" | "square" | "wide";
    /** 아바타(원형) 표시 */
    showAvatar?: boolean;
    /** 본문 라인 개수 */
    lines?: number;
  }

  let {
    showMedia = false,
    mediaAspect = "video",
    showAvatar = true,
    lines = 3,
    class: className = "",
    ...rest
  }: Props = $props();

  let lineCount = $derived(Math.max(1, lines));
  let lineIndexes = $derived(Array.from({ length: lineCount }, (_, i) => i));

  let mediaClass = $derived(
    mediaAspect === "square"
      ? "aspect-square"
      : mediaAspect === "wide"
        ? "aspect-[2/1]"
        : "aspect-video",
  );
</script>

<div
  {...rest}
  class={["rounded-md border border-border bg-card p-4", className]
    .filter(Boolean)
    .join(" ")}
  aria-hidden="true"
>
  {#if showMedia}
    <DsSkeleton class={`mb-4 w-full ${mediaClass}`.trim()} />
  {/if}

  <div class="flex items-start gap-3">
    {#if showAvatar}
      <DsSkeleton variant="circular" width={40} height={40} />
    {/if}
    <div class="flex-1 space-y-2">
      <DsSkeleton width="60%" height={14} />
      {#each lineIndexes as i (i)}
        <DsSkeleton width={i === lineCount - 1 ? "55%" : "90%"} height={12} />
      {/each}
    </div>
  </div>
</div>
