<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import { type FontSize, fontSize } from '$lib/stores';

  import { DsDropdown, DsIconButton } from '$lib/components/design-system';

  function selectFontSize(level: FontSize) {
    fontSize.set(level);
  }

  // 메뉴 내부 키보드 탐색 (3x3 그리드용)
  function handleMenuKeyDown(event: KeyboardEvent) {
    // DsDropdown의 기본 네비게이션 방지 (상하 이동만 지원하므로 그리드 이동을 위해 차단)
    event.stopPropagation();

    const container = event.currentTarget as HTMLElement;
    const items = Array.from(container.querySelectorAll<HTMLElement>('[role="menuitemradio"]'));
    if (items.length === 0) return; // 빈 배열 가드

    const active = document.activeElement;
    const currentIndex = active ? items.indexOf(active as HTMLElement) : -1;
    const cols = 3; // 3열 그리드

    let nextIndex = currentIndex;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = (currentIndex + cols) % items.length;
        break;
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = (currentIndex - cols + items.length) % items.length;
        break;
      case 'ArrowRight':
        event.preventDefault();
        nextIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowLeft':
        event.preventDefault();
        nextIndex = (currentIndex - 1 + items.length) % items.length;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = items.length - 1;
        break;
      case 'Escape':
        // ESC 처리는 DsDropdown에게 위임 (stopPropagation 하지 않음)
        // 단, 여기서는 stopPropagation()을 함수 시작 부분에서 호출했으므로
        // ESC 처리를 별도로 해주거나, ESC일 때는 stopPropagation 안하게 해야 함.
        return;
    }

    // ESC가 아닌 경우에만 포커스 이동
    items[nextIndex]?.focus();
  }
</script>

<DsDropdown
  align="end"
  menuClass="w-48 p-2"
  itemSelector='[role="menuitemradio"]'
>
  {#snippet trigger(props)}
    <DsIconButton
      {...props}
      label={m.font_size_change()}
      data-testid="header-font-size-picker"
    >
      <span class="i-lucide-type h-4 w-4"></span>
    </DsIconButton>
  {/snippet}

  {#snippet children({ close })}
    <div class="mb-2 px-2 text-menu-sm font-medium text-muted-foreground">
      {m.font_size_current({ value: fontSize.current })}
    </div>
    <div
      class="grid grid-cols-3 gap-1"
      role="group"
      onkeydown={handleMenuKeyDown}
    >
      {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as const as level (level)}
        <button
          type="button"
          onclick={() => {
            selectFontSize(level);
            close();
          }}
          class="inline-flex h-8 w-full items-center justify-center rounded-md text-menu-sm outline-none transition-colors {fontSize.current ===
          level
            ? 'bg-selected text-selected-foreground'
            : 'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'}"
          aria-checked={fontSize.current === level}
          role="menuitemradio"
        >
          {level}
        </button>
      {/each}
    </div>
  {/snippet}
</DsDropdown>
