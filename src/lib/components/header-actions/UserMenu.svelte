<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import { localizeUrl } from '$lib/paraglide/runtime.js';
  import { tick } from 'svelte';

  import { DsIconButton } from '$lib/components/design-system';

  // TODO: Better-Auth 연동 시 실제 인증 상태로 교체
  // 현재는 UI 확인용 mock 상태
  let isLoggedIn = $state(false);
  let user = $state<{ name: string; email: string } | null>(null);

  let showUserMenu = $state(false);
  let showEmail = $state(false);
  let menuRef = $state<HTMLDivElement | null>(null);
  let buttonRef = $state<HTMLButtonElement | null>(null);

  // 닫기 로직 통합 헬퍼
  // focusButton: 키보드로 닫을 때만 버튼에 포커스 복귀 (마우스 클릭 시는 불필요)
  function closeUserMenu(options?: { focusButton?: boolean }) {
    if (!showUserMenu) return;
    showUserMenu = false;
    showEmail = false; // 메뉴 닫힐 때 이메일 마스킹 상태로 리셋 (방송인 프라이버시 보호)
    if (options?.focusButton) {
      buttonRef?.focus();
    }
  }

  async function toggleUserMenu() {
    if (showUserMenu) {
      closeUserMenu({ focusButton: true });
    } else {
      showUserMenu = true;
      await tick();
      const firstItem = menuRef?.querySelector('[role="menuitem"]') as HTMLElement;
      firstItem?.focus();
    }
  }

  function handleOutsideClick(event: MouseEvent) {
    const target = event.target;
    if (!(target instanceof Node)) return; // 타입 가드

    if (showUserMenu && menuRef && !menuRef.contains(target) && buttonRef && !buttonRef.contains(target)) {
      closeUserMenu(); // 마우스 클릭 닫기: 포커스 이동 없음
    }
  }

  // ESC 키로 메뉴 닫기 (접근성 필수)
  function handleKeyDown(event: KeyboardEvent) {
    if (showUserMenu && event.key === 'Escape') {
      event.stopPropagation();
      closeUserMenu({ focusButton: true });
    }
  }

  // 메뉴 내부 키보드 탐색 (접근성)
  function handleMenuKeyDown(event: KeyboardEvent) {
    if (!menuRef) return;

    const items = Array.from(menuRef.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    if (items.length === 0) return; // 빈 배열 가드

    const active = document.activeElement;
    const currentIndex = active ? items.indexOf(active as HTMLElement) : -1;

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

  // 로그아웃 처리 (TODO: Better-Auth 연동)
  function handleLogout() {
    isLoggedIn = false;
    user = null;
    closeUserMenu();
  }

  // 개발용: 로그인 상태 토글
  function toggleLoginState() {
    isLoggedIn = !isLoggedIn;
    user = isLoggedIn ? { name: 'Test User', email: 'test@example.com' } : null;
    showEmail = false; // 상태 변경 시 이메일 숨김으로 리셋
  }

  // 이메일 마스킹 (예: t***@e***.c**)
  function maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return '***';
    const maskedLocal = local.length > 1 ? `${local[0]}***` : '***';
    // 도메인도 마스킹 (각 부분의 첫 글자 제외)
    const maskedDomain = domain
      .split('.')
      .map((part) => (part.length > 1 ? `${part[0]}${'*'.repeat(part.length - 1)}` : part))
      .join('.');
    return `${maskedLocal}@${maskedDomain}`;
  }
</script>

<svelte:window onclick={handleOutsideClick} onkeydown={handleKeyDown} />

<div class="relative">
  <DsIconButton
    id="user-menu-button"
    bind:ref={buttonRef}
    onclick={toggleUserMenu}
    class={isLoggedIn ? 'text-success' : 'text-warning'}
    label={m.user_menu()}
    aria-haspopup="menu"
    aria-expanded={showUserMenu}
    aria-controls="user-menu"
    data-testid="header-user-menu"
  >
    <span class="i-lucide-user h-4 w-4"></span>
  </DsIconButton>

  <!-- 사용자 메뉴 드롭다운 -->
  {#if showUserMenu}
    <div
      id="user-menu"
      bind:this={menuRef}
      class="absolute end-0 top-full z-50 mt-2 w-56 max-h-80 overflow-y-auto rounded-lg border border-border bg-popover p-2 shadow-lg thin-scrollbar"
      role="menu"
      aria-labelledby="user-menu-button"
      tabindex="-1"
      onkeydown={handleMenuKeyDown}
    >
      {#if isLoggedIn && user}
        <!-- 로그인 상태 메뉴 -->
        <div class="mb-2 px-2 py-1.5 border-b border-border">
          <p class="text-menu font-medium text-foreground">{user.name}</p>
          <div class="flex items-center gap-1">
            <p class="text-helper text-muted-foreground flex-1 truncate">
              {showEmail ? user.email : maskEmail(user.email)}
            </p>
            <button
              type="button"
              onclick={(e) => {
                e.stopPropagation();
                showEmail = !showEmail;
              }}
              class="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showEmail ? '이메일 숨기기' : '이메일 보기'}
            >
              {#if showEmail}
                <span class="i-lucide-eye-off h-3 w-3"></span>
              {:else}
                <span class="i-lucide-eye h-3 w-3"></span>
              {/if}
            </button>
          </div>
        </div>

        <div class="grid gap-1">
          <a
            href={localizeUrl('/profile').href}
            class="inline-flex h-9 w-full items-center gap-2 px-2 rounded-md text-menu outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            role="menuitem"
            onclick={() => closeUserMenu()}
          >
            <span class="i-lucide-user h-4 w-4"></span>
            {m.menu_profile()}
          </a>
          <a
            href={localizeUrl('/settings').href}
            class="inline-flex h-9 w-full items-center gap-2 px-2 rounded-md text-menu outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            role="menuitem"
            onclick={() => closeUserMenu()}
          >
            <span class="i-lucide-settings h-4 w-4"></span>
            {m.menu_settings()}
          </a>

          <div class="my-1 border-t border-border"></div>

          <button
            type="button"
            onclick={handleLogout}
            class="inline-flex h-9 w-full items-center gap-2 px-2 rounded-md text-menu text-destructive outline-none transition-colors hover:bg-destructive/10 focus:bg-destructive/10"
            role="menuitem"
          >
            <span class="i-lucide-log-out h-4 w-4"></span>
            {m.menu_logout()}
          </button>
        </div>
      {:else}
        <!-- 비로그인 상태 메뉴 -->
        <div class="grid gap-1">
          <a
            href={localizeUrl('/login').href}
            class="inline-flex h-9 w-full items-center gap-2 px-2 rounded-md text-menu outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            role="menuitem"
            onclick={() => closeUserMenu()}
          >
            <span class="i-lucide-log-in h-4 w-4"></span>
            {m.menu_login()}
          </a>
          <a
            href={localizeUrl('/signup').href}
            class="inline-flex h-9 w-full items-center gap-2 px-2 rounded-md text-menu font-medium text-link outline-none transition-colors hover:bg-link/10 focus:bg-link/10"
            role="menuitem"
            onclick={() => closeUserMenu()}
          >
            <span class="i-lucide-user-plus h-4 w-4"></span>
            {m.menu_signup()}
          </a>
        </div>
      {/if}

      <!-- 개발용: 로그인 상태 토글 버튼 (프로덕션에서는 표시되지 않음) -->
      {#if import.meta.env.DEV}
        <div class="mt-2 pt-2 border-t border-border">
          <button
            type="button"
            onclick={toggleLoginState}
            class="inline-flex h-8 w-full items-center justify-center gap-2 px-2 rounded-md text-helper text-muted-foreground transition-colors hover:bg-accent"
          >
            <span class="i-lucide-bug h-3 w-3"></span>
            DEV: Toggle Login State
          </button>
        </div>
      {/if}
    </div>
  {/if}
</div>
