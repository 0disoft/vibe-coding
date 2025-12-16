<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import { localizeUrl } from '$lib/paraglide/runtime.js';

  import { DsDropdown, DsDropdownItem, DsIconButton } from '$lib/components/design-system';

  // TODO: Better-Auth 연동 시 실제 인증 상태로 교체
  // 현재는 UI 확인용 mock 상태
  let isLoggedIn = $state(false);
  let user = $state<{ name: string; email: string } | null>(null);

  let showEmail = $state(false);

  // 로그아웃 처리 (TODO: Better-Auth 연동)
  function handleLogout() {
    isLoggedIn = false;
    user = null;
    showEmail = false;
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

<DsDropdown
  align="end"
  menuClass="w-56 max-h-80 overflow-y-auto thin-scrollbar"
  itemSelector='[role="menuitem"]'
>
  {#snippet trigger(props)}
    <DsIconButton
      {...props}
      intent={isLoggedIn ? 'success' : 'warning'}
      label={m.user_menu()}
      data-testid="header-user-menu"
    >
      <span class="i-lucide-user h-4 w-4"></span>
    </DsIconButton>
  {/snippet}

  {#snippet children({ close })}
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
        <DsDropdownItem
          href={localizeUrl('/profile').href}
          onclick={() => close()}
        >
          <span class="i-lucide-user h-4 w-4"></span>
          {m.menu_profile()}
        </DsDropdownItem>
        <DsDropdownItem
          href={localizeUrl('/settings').href}
          onclick={() => close()}
        >
          <span class="i-lucide-settings h-4 w-4"></span>
          {m.menu_settings()}
        </DsDropdownItem>

        <div class="my-1 border-t border-border"></div>

        <DsDropdownItem
          onclick={() => {
            handleLogout();
            close();
          }}
          intent="destructive"
        >
          <span class="i-lucide-log-out h-4 w-4"></span>
          {m.menu_logout()}
        </DsDropdownItem>
      </div>
    {:else}
      <!-- 비로그인 상태 메뉴 -->
      <div class="grid gap-1">
        <DsDropdownItem
          href={localizeUrl('/login').href}
          onclick={() => close()}
        >
          <span class="i-lucide-log-in h-4 w-4"></span>
          {m.menu_login()}
        </DsDropdownItem>
        <DsDropdownItem
          href={localizeUrl('/signup').href}
          onclick={() => close()}
        >
          <span class="i-lucide-user-plus h-4 w-4"></span>
          {m.menu_signup()}
        </DsDropdownItem>
      </div>
    {/if}

    <!-- 개발용: 로그인 상태 토글 버튼 (프로덕션에서는 표시되지 않음) -->
    {#if import.meta.env.DEV}
      <div class="mt-2 pt-2 border-t border-border">
        <DsDropdownItem
          onclick={toggleLoginState}
          class="text-menu-sm text-muted-foreground"
        >
          <span class="i-lucide-bug h-3 w-3"></span>
          DEV: Toggle Login State
        </DsDropdownItem>
      </div>
    {/if}
  {/snippet}
</DsDropdown>
