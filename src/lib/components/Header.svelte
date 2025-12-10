<script lang="ts">
  import { page } from '$app/state';
  import FontSizePicker from '$lib/components/header-actions/FontSizePicker.svelte';
  import LanguagePicker from '$lib/components/header-actions/LanguagePicker.svelte';
  import ThemeToggle from '$lib/components/header-actions/ThemeToggle.svelte';
  import UserMenu from '$lib/components/header-actions/UserMenu.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { localizeUrl } from '$lib/paraglide/runtime.js';
  import type { Snippet } from 'svelte';
  import { tick } from 'svelte';

  interface Props {
    siteName?: string;
    nav?: Snippet;
    actions?: Snippet;
  }

  let { siteName = 'Site', nav, actions }: Props = $props();

  // 모바일 메뉴 상태
  let mobileMenuOpen = $state(false);
  let mobileMenuRef = $state<HTMLElement | null>(null);
  let mobileMenuButtonRef = $state<HTMLButtonElement | null>(null);

  // 네비게이션 항목 배열화 (유지보수 용이)
  // 필요한 항목만 주석 해제하여 사용. 새 프로젝트 시작 시 필요한 것만 활성화.
  const navItems = [
    // ─── 소개 (About) ────────────────────────────────────────
    // { href: '/about', label: () => m.nav_about() },
    // { href: '/team', label: () => m.nav_team() },
    // { href: '/careers', label: () => m.nav_careers() },
    // ─── 제품/서비스 (Products & Services) ───────────────────
    { href: '/products', label: () => m.nav_products() },
    // { href: '/services', label: () => m.nav_services() },
    // { href: '/enterprise', label: () => m.nav_enterprise() },
    // { href: '/compare', label: () => m.nav_compare() },
    // { href: '/demo', label: () => m.nav_demo() },
    // { href: '/download', label: () => m.nav_download() },
    // ─── 비즈니스 (Business) ─────────────────────────────────
    // { href: '/pricing', label: () => m.nav_pricing() },
    // { href: '/booking', label: () => m.nav_booking() },
    // { href: '/seller', label: () => m.nav_seller() },
    // { href: '/membership', label: () => m.nav_membership() },
    // ─── 콘텐츠 (Content) ────────────────────────────────────
    // { href: '/docs', label: () => m.nav_docs() },
    // { href: '/blog', label: () => m.nav_blog() },
    // { href: '/portfolio', label: () => m.nav_portfolio() },
    { href: '/gallery', label: () => m.nav_gallery() },
    // { href: '/resources', label: () => m.nav_resources() },
    // { href: '/research', label: () => m.nav_research() },
    // ─── 뉴스/이벤트 (News & Events) ─────────────────────────
    { href: '/news', label: () => m.nav_news() },
    // { href: '/events', label: () => m.nav_events() },
    { href: '/changelog', label: () => m.nav_changelog() },
    // ─── 커뮤니티 (Community) ────────────────────────────────
    { href: '/community', label: () => m.nav_community() },
    // ─── 사용자 영역 (User) ──────────────────────────────────
    // { href: '/dashboard', label: () => m.nav_dashboard() },
  ];

  // 현재 경로와 일치하는지 확인
  function isActive(path: string): boolean {
    const localizedPath = localizeUrl(path).pathname;
    return page.url.pathname === localizedPath || page.url.pathname.startsWith(`${localizedPath}/`);
  }

  // 모바일 메뉴 토글
  async function toggleMobileMenu() {
    if (mobileMenuOpen) {
      closeMobileMenu({ focusButton: true });
    } else {
      mobileMenuOpen = true;
      await tick();
      const firstItem = mobileMenuRef?.querySelector('a') as HTMLElement;
      firstItem?.focus();
    }
  }

  // 모바일 메뉴 닫기
  function closeMobileMenu(options?: { focusButton?: boolean }) {
    if (!mobileMenuOpen) return;
    mobileMenuOpen = false;
    if (options?.focusButton) {
      mobileMenuButtonRef?.focus();
    }
  }

  // 모바일 메뉴 화살표 키 탐색
  function handleMobileMenuKeyDown(event: KeyboardEvent) {
    if (!mobileMenuRef) return;
    const items = Array.from(mobileMenuRef.querySelectorAll('a')) as HTMLElement[];
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % items.length;
      items[nextIndex]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = (currentIndex - 1 + items.length) % items.length;
      items[prevIndex]?.focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeMobileMenu({ focusButton: true });
    }
  }
</script>

<header
  class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
  <div class="mx-auto flex h-12 max-w-5xl items-center justify-between px-4 md:px-6">
    <!-- 로고/사이트명 -->
    <a
      href={localizeUrl('/').href}
      aria-label="Go to {siteName} homepage"
      class="flex items-center gap-2 font-semibold text-foreground"
    >
      {siteName}
    </a>

    <!-- 데스크톱 네비게이션 -->
    <nav aria-label="Main navigation" class="hidden items-center gap-8 text-sm md:flex">
      {#if nav}
        {@render nav()}
      {:else}
        {#each navItems as item (item.href)}
          {@const active = isActive(item.href)}
          <a
            href={localizeUrl(item.href).href}
            aria-current={active ? 'page' : undefined}
            class="transition-colors hover:text-foreground {active
              ? 'text-foreground font-medium'
              : 'text-muted-foreground'}">{item.label()}</a
          >
        {/each}
      {/if}
    </nav>

    <!-- 우측 액션 영역 -->
    <div class="flex items-center gap-1">
      {#if actions}
        {@render actions()}
      {/if}

      <!-- 모바일: 햄버거 버튼 (가장 왼쪽) -->
      <button
        type="button"
        bind:this={mobileMenuButtonRef}
        onclick={toggleMobileMenu}
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileMenuOpen}
        class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
      >
        {#if mobileMenuOpen}
          <span class="i-lucide-x h-4 w-4"></span>
        {:else}
          <span class="i-lucide-menu h-4 w-4"></span>
        {/if}
      </button>

      <!-- 공통 액션 버튼들 (모바일/데스크톱 모두 표시) -->
      <ThemeToggle />
      <LanguagePicker />
      <FontSizePicker />
      <UserMenu />
    </div>
  </div>
</header>

<!-- 모바일 메뉴 오버레이 -->
{#if mobileMenuOpen}
  <div
    role="button"
    tabindex="-1"
    class="fixed inset-0 z-40 bg-overlay/50 backdrop-blur-sm md:hidden"
    onclick={() => closeMobileMenu()}
    onkeydown={(e) => e.key === 'Escape' && closeMobileMenu({ focusButton: true })}
  ></div>
{/if}

<!-- 모바일 메뉴 패널 (nav 링크만) -->
<div
  class="fixed end-0 top-0 z-50 h-full w-64 transform bg-background border-s border-border shadow-xl transition-transform duration-300 ease-in-out md:hidden {mobileMenuOpen
    ? 'translate-x-0'
    : 'translate-x-full'}"
>
  <div class="flex h-12 items-center justify-between border-b border-border px-4">
    <span class="font-semibold">Menu</span>
    <button
      type="button"
      onclick={() => closeMobileMenu({ focusButton: true })}
      aria-label="Close menu"
      class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <span class="i-lucide-x h-4 w-4"></span>
    </button>
  </div>

  <!-- 모바일 네비게이션 링크 -->
  <nav aria-label="Mobile navigation" class="flex flex-col p-4">
    <div
      role="menu"
      tabindex="-1"
      bind:this={mobileMenuRef}
      onkeydown={handleMobileMenuKeyDown}
      class="flex flex-col gap-1"
    >
      {#each navItems as item (item.href)}
        {@const active = isActive(item.href)}
        <a
          href={localizeUrl(item.href).href}
          onclick={() => closeMobileMenu()}
          aria-current={active ? 'page' : undefined}
          role="menuitem"
          class="rounded-md px-3 py-2 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent {active
            ? 'bg-accent text-foreground font-medium'
            : 'text-muted-foreground'}"
        >
          {item.label()}
        </a>
      {/each}
    </div>
  </nav>
</div>
