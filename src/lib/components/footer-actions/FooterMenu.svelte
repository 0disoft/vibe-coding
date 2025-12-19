<script lang="ts">
  import { page } from '$app/state';
  import * as m from '$lib/paraglide/messages.js';
  import { localizeUrl } from '$lib/paraglide/runtime.js';
  import { getLocaleFromUrl, type Locale } from '$lib/shared/utils/locale';

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
  const MENU_LABELS: Record<MenuKey, (locale: Locale) => string> = {
    donate: (locale) => m.footer_donate({}, { locale }),
    terms: (locale) => m.footer_terms({}, { locale }),
    privacy: (locale) => m.footer_privacy({}, { locale }),
    cookie: (locale) => m.footer_cookie_policy({}, { locale }),
    security: (locale) => m.footer_security({}, { locale }),
    gdpr: (locale) => m.footer_gdpr({}, { locale }),
    sitemap: (locale) => m.footer_sitemap({}, { locale }),
    accessibility: (locale) => m.footer_accessibility({}, { locale }),
    'bug-bounty': (locale) => m.footer_bug_bounty({}, { locale }),
  };

  let currentLocale = $derived<Locale>(getLocaleFromUrl(page.url));
  let currentPathname = $derived(page.url.pathname);

  function getMenuLabel(key: MenuKey): string {
    return MENU_LABELS[key](currentLocale);
  }

  function isActive(item: (typeof menuItems)[number]): boolean {
    const target = localizeUrl(item.href, { locale: currentLocale }).pathname;
    return currentPathname === target || currentPathname.startsWith(`${target}/`);
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
      label={m.footer_more_menu({}, { locale: currentLocale })}
      data-testid="footer-more-menu"
    >
      <span class="i-lucide-ellipsis h-4 w-4"></span>
    </DsIconButton>
  {/snippet}

  {#snippet children({ close })}
    {#each menuItems as item (item.key)}
      <DsDropdownItem
        href={localizeUrl(item.href, { locale: currentLocale }).href}
        aria-checked={isActive(item)}
        role="menuitemradio"
        class={["text-menu-sm", item.mobileOnly ? "sm:!hidden" : ""]
          .filter(Boolean)
          .join(" ")}
        onclick={() => close()}
      >
        <span class="{item.icon} h-3 w-3 shrink-0"></span>
        <span>{getMenuLabel(item.key)}</span>
      </DsDropdownItem>
    {/each}
  {/snippet}
</DsDropdown>
