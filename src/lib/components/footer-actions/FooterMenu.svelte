<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import { localizeUrl } from '$lib/paraglide/runtime.js';

  import { DsDropdown, DsDropdownItem, DsIconButton } from '$lib/components/design-system';

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
</script>

<DsDropdown
  align="end"
  menuClass="w-48"
>
  {#snippet trigger(props)}
    <DsIconButton
      {...props}
      size="sm"
      label={m.footer_more_menu()}
      data-testid="footer-more-menu"
    >
      <span class="i-lucide-ellipsis h-4 w-4"></span>
    </DsIconButton>
  {/snippet}

  {#snippet children({ close })}
    {#each menuItems as item (item.key)}
      <DsDropdownItem
        href={localizeUrl(item.href).href}
        class="text-menu-sm {item.mobileOnly ? 'sm:hidden' : ''}"
        onclick={() => close()}
      >
        <span class="{item.icon} h-3 w-3 shrink-0"></span>
        <span>{getMenuLabel(item.key)}</span>
      </DsDropdownItem>
    {/each}
  {/snippet}
</DsDropdown>
