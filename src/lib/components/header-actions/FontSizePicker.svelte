<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import { type FontSize, fontSize } from '$lib/stores';
  import { tick } from 'svelte';

  let showFontSizeModal = $state(false);
  let modalRef = $state<HTMLDivElement | null>(null);
  let buttonRef = $state<HTMLButtonElement | null>(null);

  // 닫기 로직 통합 헬퍼
  function closeFontSizeModal(options?: { focusButton?: boolean }) {
    if (!showFontSizeModal) return;
    showFontSizeModal = false;
    if (options?.focusButton) {
      buttonRef?.focus();
    }
  }

  async function toggleFontSizeModal() {
    if (showFontSizeModal) {
      closeFontSizeModal({ focusButton: true });
    } else {
      showFontSizeModal = true;
      await tick();
      // 현재 선택된 폰트 크기 항목에 포커스, 없으면 첫 번째 항목
      const selectedItem = modalRef?.querySelector('[aria-checked="true"]') as HTMLElement;
      const firstItem = modalRef?.querySelector('[role="menuitemradio"]') as HTMLElement;
      (selectedItem ?? firstItem)?.focus();
    }
  }

  function selectFontSize(level: FontSize) {
    fontSize.set(level);
    closeFontSizeModal({ focusButton: true }); // 선택 후 모달 닫힘 -> 버튼 포커스 복귀
  }

  function handleOutsideClick(event: MouseEvent) {
    if (
      showFontSizeModal &&
      modalRef &&
      !modalRef.contains(event.target as Node) &&
      buttonRef &&
      !buttonRef.contains(event.target as Node)
    ) {
      closeFontSizeModal(); // 마우스 클릭 닫기: 포커스 이동 없음
    }
  }

  // ESC 키로 모달 닫기 (접근성 필수)
  function handleKeyDown(event: KeyboardEvent) {
    if (showFontSizeModal && event.key === 'Escape') {
      event.stopPropagation();
      closeFontSizeModal({ focusButton: true });
    }
  }

  // 메뉴 내부 화살표 키 탐색 (3x3 그리드용)
  function handleMenuKeyDown(event: KeyboardEvent) {
    if (!modalRef) return;
    const items = Array.from(modalRef.querySelectorAll('[role="menuitemradio"]')) as HTMLElement[];
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    const cols = 3; // 3열 그리드

    let nextIndex = currentIndex;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      nextIndex = (currentIndex + cols) % items.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      nextIndex = (currentIndex - cols + items.length) % items.length;
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      nextIndex = (currentIndex + 1) % items.length;
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      nextIndex = (currentIndex - 1 + items.length) % items.length;
    }
    items[nextIndex]?.focus();
  }
</script>

<svelte:window onclick={handleOutsideClick} onkeydown={handleKeyDown} />

<div class="relative">
  <button
    type="button"
    id="font-size-menu-button"
    bind:this={buttonRef}
    onclick={toggleFontSizeModal}
    class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    aria-label={m.font_size_change()}
    aria-haspopup="dialog"
    aria-expanded={showFontSizeModal}
    aria-controls="font-size-menu"
    data-testid="header-font-size-picker"
  >
    <span class="i-lucide-type h-4 w-4"></span>
  </button>

  <!-- 폰트 크기 모달 -->
  {#if showFontSizeModal}
    <div
      id="font-size-menu"
      bind:this={modalRef}
      class="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-border bg-popover p-2 shadow-lg"
      role="menu"
      aria-labelledby="font-size-menu-button"
      tabindex="-1"
      onkeydown={handleMenuKeyDown}
    >
      <div class="mb-2 px-2 text-xs font-medium text-muted-foreground">
        {m.font_size_current({ value: fontSize.current })}
      </div>
      <div class="grid grid-cols-3 gap-1">
        {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as const as level (level)}
          <button
            type="button"
            onclick={() => selectFontSize(level)}
            class="inline-flex h-8 w-full items-center justify-center rounded-md text-sm outline-none transition-colors {fontSize.current ===
            level
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'}"
            aria-checked={fontSize.current === level}
            role="menuitemradio"
          >
            {level}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>
