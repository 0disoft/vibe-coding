<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import { localizeUrl } from '$lib/paraglide/runtime.js';
  import { tick } from 'svelte';

  // 메뉴 항목 정의 (mobileOnly: 모바일에서만 표시)
  const menuItems = [
    // 후원하기 (맨 위) - 항상 표시
    { key: 'donate', icon: 'i-lucide-heart', href: '/donate', mobileOnly: false },
    // 모바일에서만 표시 (데스크톱에서는 Footer에 직접 표시됨)
    { key: 'terms', icon: 'i-lucide-file-text', href: '/terms', mobileOnly: true },
    { key: 'privacy', icon: 'i-lucide-lock', href: '/privacy', mobileOnly: true },
    { key: 'cookie', icon: 'i-lucide-cookie', href: '/cookie', mobileOnly: true },
    // 추가 메뉴 - 항상 표시
    { key: 'security', icon: 'i-lucide-shield', href: '/security', mobileOnly: false },
    { key: 'gdpr', icon: 'i-lucide-globe', href: '/gdpr', mobileOnly: false },
    { key: 'sitemap', icon: 'i-lucide-map', href: '/sitemap', mobileOnly: false },
    { key: 'accessibility', icon: 'i-lucide-accessibility', href: '/accessibility', mobileOnly: false },
    { key: 'bug-bounty', icon: 'i-lucide-bug', href: '/bug-bounty', mobileOnly: false },
  ] as const;

  // 메뉴 키 타입 (컴파일 타임에 누락 방지)
  type MenuKey = (typeof menuItems)[number]['key'];

  // 메뉴 키 → i18n 메시지 매핑 (타입 안전)
  const MENU_LABELS: Record<MenuKey, () => string> = {
    donate: m.footer_donate,
    terms: m.footer_terms,
    privacy: m.footer_privacy,
    cookie: m.footer_cookie_policy,
    security: m.footer_security,
    gdpr: m.footer_gdpr,
    sitemap: m.footer_sitemap,
    accessibility: m.footer_accessibility,
    'bug-bounty': m.footer_bug_bounty,
  };

  function getMenuLabel(key: MenuKey): string {
    return MENU_LABELS[key]();
  }

  let showMenu = $state(false);
  let menuRef = $state<HTMLDivElement | null>(null);
  let buttonRef = $state<HTMLButtonElement | null>(null);

  function closeMenu(options?: { focusButton?: boolean }) {
    if (!showMenu) return;
    showMenu = false;
    if (options?.focusButton) {
      buttonRef?.focus();
    }
  }

  async function toggleMenu() {
    if (showMenu) {
      closeMenu({ focusButton: true });
    } else {
      showMenu = true;
      // DOM 업데이트 후 첫 번째 메뉴 항목에 포커스
      await tick();
      const firstItem = menuRef?.querySelector('[role="menuitem"]') as HTMLElement;
      firstItem?.focus();
    }
  }

  function handleOutsideClick(event: MouseEvent) {
    if (
      showMenu &&
      menuRef &&
      !menuRef.contains(event.target as Node) &&
      buttonRef &&
      !buttonRef.contains(event.target as Node)
    ) {
      closeMenu();
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (showMenu && event.key === 'Escape') {
      event.stopPropagation();
      closeMenu({ focusButton: true });
    }
  }

  // 포커스가 메뉴 밖으로 나가면 닫기
  function handleFocusOut(event: FocusEvent) {
    const newFocusTarget = event.relatedTarget as Node | null;
    if (menuRef?.contains(newFocusTarget) || buttonRef?.contains(newFocusTarget)) {
      return;
    }
    closeMenu();
  }

  // 메뉴 내부 키보드 탐색 (접근성)
  function handleMenuKeyDown(event: KeyboardEvent) {
    if (!menuRef) return;

    const items = Array.from(menuRef.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
    if (!items.length) return;

    const currentIndex = items.indexOf(document.activeElement as HTMLElement);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        items[(currentIndex + 1) % items.length]?.focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        items[(currentIndex - 1 + items.length) % items.length]?.focus();
        break;
      case 'Home':
        event.preventDefault();
        items[0]?.focus();
        break;
      case 'End':
        event.preventDefault();
        items[items.length - 1]?.focus();
        break;
    }
  }
</script>

<svelte:window onclick={handleOutsideClick} onkeydown={handleKeyDown} />

<div class="relative">
  <button
    type="button"
    id="footer-menu-button"
    bind:this={buttonRef}
    onclick={toggleMenu}
    class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    aria-label={m.footer_more_menu()}
    aria-haspopup="menu"
    aria-expanded={showMenu}
    aria-controls="footer-menu"
    data-testid="footer-more-menu"
  >
    <span class="i-lucide-ellipsis h-4 w-4"></span>
  </button>

  <!-- 더보기 메뉴 (위쪽으로 열림) -->
  {#if showMenu}
    <div
      id="footer-menu"
      bind:this={menuRef}
      class="absolute end-0 bottom-full z-50 mb-2 w-48 rounded-lg border border-border bg-popover p-1.5 shadow-lg"
      role="menu"
      aria-labelledby="footer-menu-button"
      tabindex="-1"
      onfocusout={handleFocusOut}
      onkeydown={handleMenuKeyDown}
    >
      <div class="grid gap-1">
        {#each menuItems as item (item.key)}
          <a
            href={localizeUrl(item.href).href}
            class="inline-flex h-9 w-full items-center gap-2 px-2 rounded-md text-menu-sm text-popover-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground {item.mobileOnly
              ? 'sm:hidden'
              : ''}"
            onclick={() => closeMenu()}
            role="menuitem"
          >
            <span class="{item.icon} h-3 w-3 shrink-0"></span>
            <span>{getMenuLabel(item.key)}</span>
          </a>
        {/each}
      </div>
    </div>
  {/if}
</div>
