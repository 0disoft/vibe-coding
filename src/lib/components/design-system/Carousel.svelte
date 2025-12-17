<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { createControllableState } from "$lib/shared/utils/controllable-state.svelte";

  import DsIconButton from "./IconButton.svelte";

  export type CarouselItem = {
    id: string;
    title?: string;
    description?: string;
    imageSrc?: string;
    href?: string;
  };

  type SlideCtx = {
    item: CarouselItem;
    index: number;
    isActive: boolean;
  };

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    items: CarouselItem[];
    /** 현재 슬라이드 index (controlled) */
    index?: number;
    onIndexChange?: (next: number) => void;
    defaultIndex?: number;
    /** 컨트롤 표시 */
    showArrows?: boolean;
    showDots?: boolean;
    /** 키보드 이동 활성화 */
    keyboard?: boolean;
    /** 슬라이드 렌더 커스터마이즈 */
    slide?: Snippet<[SlideCtx]>;
  }

  let {
    items,
    index,
    onIndexChange,
    defaultIndex = 0,
    showArrows = true,
    showDots = true,
    keyboard = true,
    slide,
    class: className = "",
    ...rest
  }: Props = $props();

  let indexState = createControllableState<number>({
    value: () => index ?? undefined,
    onChange: (next) => onIndexChange?.(next),
    defaultValue: defaultIndex,
  });

  let viewportEl = $state<HTMLDivElement | null>(null);
  let slideEls = $state<(HTMLElement | null)[]>([]);
  let scrollRaf = 0;

  function slideRef(node: HTMLElement, params: { i: number }) {
    slideEls[params.i] = node;
    return {
      destroy() {
        if (slideEls[params.i] === node) slideEls[params.i] = null;
      },
    };
  }

  function clampIndex(i: number) {
    if (items.length <= 0) return 0;
    return Math.min(items.length - 1, Math.max(0, i));
  }

  function scrollToIndex(i: number, behavior: ScrollBehavior) {
    const el = slideEls[i];
    el?.scrollIntoView({ behavior, block: "nearest", inline: "start" });
  }

  function goTo(i: number, opts?: { focus?: boolean; behavior?: ScrollBehavior }) {
    const next = clampIndex(i);
    if (next === indexState.value) {
      scrollToIndex(next, opts?.behavior ?? "smooth");
      if (opts?.focus) viewportEl?.focus();
      return;
    }
    indexState.value = next;
    scrollToIndex(next, opts?.behavior ?? "smooth");
    if (opts?.focus) viewportEl?.focus();
  }

  function prev() {
    goTo(indexState.value - 1, { focus: true });
  }

  function next() {
    goTo(indexState.value + 1, { focus: true });
  }

  function onScroll() {
    if (!viewportEl) return;
    if (scrollRaf) cancelAnimationFrame(scrollRaf);

    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0;
      if (!viewportEl) return;
      const viewportRect = viewportEl.getBoundingClientRect();
      let bestIndex = indexState.value;
      let bestDist = Number.POSITIVE_INFINITY;

      for (let i = 0; i < slideEls.length; i++) {
        const el = slideEls[i];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const dist = Math.abs(r.left - viewportRect.left);
        if (dist < bestDist) {
          bestDist = dist;
          bestIndex = i;
        }
      }

      if (bestIndex !== indexState.value) {
        indexState.value = bestIndex;
      }
    });
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!keyboard) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0, { focus: true });
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(items.length - 1, { focus: true });
    }
  }

  $effect(() => {
    // items 길이가 바뀌면 index를 안전 범위로 보정
    const safe = clampIndex(indexState.value);
    if (safe !== indexState.value) {
      indexState.value = safe;
    }
  });

  $effect(() => {
    // 외부에서 index가 바뀌는 경우에도 뷰포트를 동기화
    if (!viewportEl) return;
    const safe = clampIndex(indexState.value);
    queueMicrotask(() => scrollToIndex(safe, "auto"));
  });
</script>

<div {...rest} class={["ds-carousel", className].filter(Boolean).join(" ")}>
  <div class="ds-carousel-header">
    {#if showArrows}
      <div class="ds-carousel-controls">
        <DsIconButton
          icon="chevron-left"
          label="Previous slide"
          size="sm"
          variant="ghost"
          intent="neutral"
          disabled={indexState.value <= 0}
          onclick={prev}
        />
        <DsIconButton
          icon="chevron-right"
          label="Next slide"
          size="sm"
          variant="ghost"
          intent="neutral"
          disabled={indexState.value >= items.length - 1}
          onclick={next}
        />
      </div>
    {/if}

    {#if showDots}
      <div class="ds-carousel-dots" role="tablist" aria-label="Carousel slides">
        {#each items as item, i (item.id)}
          <button
            type="button"
            class="ds-carousel-dot"
            role="tab"
            aria-label={`Go to slide ${i + 1}`}
            aria-selected={i === indexState.value ? "true" : "false"}
            aria-current={i === indexState.value ? "true" : undefined}
            tabindex={i === indexState.value ? 0 : -1}
            onclick={() => goTo(i, { focus: true })}
          ></button>
        {/each}
      </div>
    {/if}
  </div>

  <div
    class="ds-carousel-viewport"
    bind:this={viewportEl}
    tabindex="0"
    onscroll={onScroll}
    onkeydown={onKeyDown}
    aria-roledescription="carousel"
  >
    <div class="ds-carousel-track">
      {#each items as item, i (item.id)}
        <div class="ds-carousel-slide" use:slideRef={{ i }} data-active={i === indexState.value ? "true" : undefined}>
          {#if slide}
            {@render slide({ item, index: i, isActive: i === indexState.value })}
          {:else}
            <div class="ds-carousel-fallback">
              {#if item.imageSrc}
                <img class="ds-carousel-image" src={item.imageSrc} alt={item.title ?? ""} />
              {/if}
              <div class="ds-carousel-meta">
                <div class="ds-carousel-title">{item.title ?? `Slide ${i + 1}`}</div>
                {#if item.description}
                  <div class="ds-carousel-desc">{item.description}</div>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>
