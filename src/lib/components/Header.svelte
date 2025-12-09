<script lang="ts">
import type { Snippet } from 'svelte';
import { page } from '$app/state';
import FontSizePicker from '$lib/components/header-actions/FontSizePicker.svelte';
import LanguagePicker from '$lib/components/header-actions/LanguagePicker.svelte';
import ThemeToggle from '$lib/components/header-actions/ThemeToggle.svelte';
import UserMenu from '$lib/components/header-actions/UserMenu.svelte';
import * as m from '$lib/paraglide/messages.js';
import { localizeUrl } from '$lib/paraglide/runtime.js';

interface Props {
	siteName?: string;
	nav?: Snippet;
	actions?: Snippet;
}

let { siteName = 'Site', nav, actions }: Props = $props();

// 모바일 메뉴 상태
let mobileMenuOpen = $state(false);

// 네비게이션 항목 배열화 (유지보수 용이)
const navItems = [
	{ href: '/docs', label: () => m.nav_docs() },
	{ href: '/pricing', label: () => m.nav_pricing() },
	{ href: '/portfolio', label: () => m.nav_portfolio() },
	{ href: '/dashboard', label: () => m.nav_dashboard() }
];

// 현재 경로와 일치하는지 확인
function isActive(path: string): boolean {
	const localizedPath = localizeUrl(path).pathname;
	return page.url.pathname === localizedPath || page.url.pathname.startsWith(`${localizedPath}/`);
}

// 모바일 메뉴 토글
function toggleMobileMenu() {
	mobileMenuOpen = !mobileMenuOpen;
}

// 모바일 메뉴 닫기
function closeMobileMenu() {
	mobileMenuOpen = false;
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
    onclick={closeMobileMenu}
    onkeydown={(e) => e.key === 'Escape' && closeMobileMenu()}
  ></div>
{/if}

<!-- 모바일 메뉴 패널 (nav 링크만) -->
<div
  class="fixed right-0 top-0 z-50 h-full w-64 transform bg-background border-l border-border shadow-xl transition-transform duration-300 ease-in-out md:hidden {mobileMenuOpen
    ? 'translate-x-0'
    : 'translate-x-full'}"
>
  <div class="flex h-12 items-center justify-between border-b border-border px-4">
    <span class="font-semibold">Menu</span>
    <button
      type="button"
      onclick={closeMobileMenu}
      aria-label="Close menu"
      class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <span class="i-lucide-x h-4 w-4"></span>
    </button>
  </div>

  <!-- 모바일 네비게이션 링크 -->
  <nav aria-label="Mobile navigation" class="flex flex-col p-4">
    {#each navItems as item (item.href)}
      {@const active = isActive(item.href)}
      <a
        href={localizeUrl(item.href).href}
        onclick={closeMobileMenu}
        aria-current={active ? 'page' : undefined}
        class="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent {active
          ? 'bg-accent text-foreground font-medium'
          : 'text-muted-foreground'}"
      >
        {item.label()}
      </a>
    {/each}
  </nav>
</div>
