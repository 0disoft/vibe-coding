<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** table caption (권장: 문서 페이지에서 테이블 목적을 짧게 설명) */
    caption?: string;
    captionSide?: "top" | "bottom";
    /** 헤더 sticky 처리 (내부적으로 .ds-table.is-sticky 사용) */
    stickyHeader?: boolean;
    /** 가로 스크롤 래퍼 제공 */
    scroll?: boolean;
    children?: Snippet;
  }

  let {
    caption,
    captionSide = "top",
    stickyHeader = false,
    scroll = true,
    children,
    class: className = "",
    ...rest
  }: Props = $props();
</script>

<div
  {...rest}
  class={["ds-table-wrap", scroll ? "ds-table-scroll" : "", className]
    .filter(Boolean)
    .join(" ")}
>
  <div class={["ds-table", stickyHeader ? "is-sticky" : ""].filter(Boolean).join(" ")}>
    <table class="ds-table-native">
      {#if caption}
        <caption class="ds-table-caption" data-side={captionSide}>
          {caption}
        </caption>
      {/if}

      {#if children}
        {@render children()}
      {/if}
    </table>
  </div>
</div>

