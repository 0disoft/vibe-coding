<script lang="ts">
  import { page } from "$app/state";

  import * as m from '$lib/paraglide/messages.js';
  import { localizeUrl } from '$lib/paraglide/runtime.js';

  import {
    DsDropdown,
    DsDropdownItem,
    DsIconButton,
    DsLiveRegion
  } from '$lib/components/design-system';
  import { getLocaleFromUrl, type Locale } from "$lib/shared/utils/locale";
  import { maskEmail } from '$lib/shared/utils/privacy';

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

  function handleMenuOpenChange(next: boolean) {
    // 메뉴가 닫힐 때는 항상 마스킹 상태로 리셋
    if (!next) showEmail = false;
  }

  // 개발용: 로그인 상태 토글
  function toggleLoginState() {
    isLoggedIn = !isLoggedIn;
    user = isLoggedIn ? { name: 'Test User', email: 'test@example.com' } : null;
    showEmail = false; // 상태 변경 시 이메일 숨김으로 리셋
  }

  let liveRegion: { announce: (message: string) => void } | null = null;
  let currentLocale = $derived<Locale>(getLocaleFromUrl(page.url));

  function toggleEmailVisibility() {
    showEmail = !showEmail;
    liveRegion?.announce(
      showEmail
        ? m.user_menu_email_revealed({}, { locale: currentLocale })
        : m.user_menu_email_hidden({}, { locale: currentLocale })
    );
  }
</script>

<DsLiveRegion bind:this={liveRegion} politeness="polite" />

<DsDropdown
  align="end"
  focusOnOpen="keyboard"
  menuClass="w-56 max-h-80 overflow-y-auto thin-scrollbar"
  onOpenChange={handleMenuOpenChange}
>
  {#snippet trigger(props)}
    <DsIconButton
      {...props}
      intent={isLoggedIn ? 'success' : 'warning'}
      label={m.user_menu({}, { locale: currentLocale })}
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
          <DsIconButton
            size="sm"
            variant="ghost"
            label={showEmail
              ? m.user_menu_hide_email({}, { locale: currentLocale })
              : m.user_menu_show_email({}, { locale: currentLocale })}
            icon={showEmail ? 'eye-off' : 'eye'}
            role="menuitemcheckbox"
            aria-checked={showEmail}
            tabindex={-1}
            data-ds-dropdown-item="true"
            onclick={(e) => {
              e.stopPropagation();
              toggleEmailVisibility();
            }}
          />
        </div>
      </div>

      <div class="grid gap-1">
        <DsDropdownItem
          href={localizeUrl('/profile').href}
          onclick={() => close()}
        >
          <span class="i-lucide-user h-4 w-4"></span>
          {m.menu_profile({}, { locale: currentLocale })}
        </DsDropdownItem>
        <DsDropdownItem
          href={localizeUrl('/settings').href}
          onclick={() => close()}
        >
          <span class="i-lucide-settings h-4 w-4"></span>
          {m.menu_settings({}, { locale: currentLocale })}
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
          {m.menu_logout({}, { locale: currentLocale })}
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
          {m.menu_login({}, { locale: currentLocale })}
        </DsDropdownItem>
        <DsDropdownItem
          href={localizeUrl('/signup').href}
          onclick={() => close()}
        >
          <span class="i-lucide-user-plus h-4 w-4"></span>
          {m.menu_signup({}, { locale: currentLocale })}
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
