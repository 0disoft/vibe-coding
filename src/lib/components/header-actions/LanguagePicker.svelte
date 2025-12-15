<script lang="ts">
  import { page } from '$app/state';
  import * as m from '$lib/paraglide/messages.js';
  import { getLocale, locales, localizeUrl } from '$lib/paraglide/runtime';

  import { DsDropdown, DsIconButton } from '$lib/components/design-system';

  // 언어 코드 → 사람이 읽기 쉬운 이름 맵
  const languageNames: Record<string, string> = {
    en: 'English', // 영어
    ko: '한국어', // 한국어
    ja: '日本語', // 일본어
    zh: '中文', // 중국어
    es: 'Español', // 스페인어
    fr: 'Français', // 프랑스어
    de: 'Deutsch', // 독일어
    pt: 'Português', // 포르투갈어
    it: 'Italiano', // 이탈리아어
    nl: 'Nederlands', // 네덜란드어
    sv: 'Svenska', // 스웨덴어
    pl: 'Polski', // 폴란드어
    ru: 'Русский', // 러시아어
    ar: 'العربية', // 아랍어
    hi: 'हिन्दी', // 힌디어
    id: 'Bahasa', // 인도네시아어
    vi: 'Tiếng Việt', // 베트남어
    th: 'ไทย', // 태국어
    tl: 'Tagalog', // 타갈로그어
    tr: 'Türkçe', // 튀르키예어
  };

  // Paraglide 2.x에서는 locales 배열 직접 사용
  const availableLanguageTags = locales;

  // 현재 언어 판별: URL이 가장 정확하므로 URL 우선 파싱
  let currentLang = $derived.by(() => {
    const path = page.url.pathname;
    const segment = path.split('/')[1]; // "/ko/..." -> "ko"
    if (availableLanguageTags.includes(segment as (typeof locales)[number])) {
      return segment;
    }
    // URL에 언어 코드가 없거나(루트), 유효하지 않으면 getLocale() 사용
    return getLocale();
  });

  // 언어 코드를 읽기 쉬운 이름으로 변환
  function getLanguageName(code: string): string {
    return languageNames[code] ?? code.toUpperCase();
  }
</script>

<DsDropdown
  align="end"
  menuClass="w-40 max-h-[300px] overflow-y-auto thin-scrollbar p-1.5"
  itemSelector='[role="menuitem"]'
>
  {#snippet trigger(props)}
    <DsIconButton
      {...props}
      label={m.language_picker_label()}
      data-testid="header-language-picker"
    >
      <span class="i-lucide-languages h-4 w-4"></span>
    </DsIconButton>
  {/snippet}

  {#snippet children({ close })}
    <div class="grid gap-1">
      {#each availableLanguageTags as lang (lang)}
        <a
          href={localizeUrl(page.url.pathname + page.url.search, { locale: lang }).href}
          class="inline-flex h-8 w-full items-center justify-start px-3 rounded-md text-menu-sm outline-none transition-colors {lang ===
          currentLang
            ? 'bg-selected text-selected-foreground'
            : 'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'}"
          data-sveltekit-reload
          onclick={() => {
            document.cookie = `PARAGLIDE_LOCALE=${lang}; path=/; max-age=31536000; SameSite=Lax`;
            close();
          }}
          aria-current={lang === currentLang ? 'page' : undefined}
          hreflang={lang}
          role="menuitem"
        >
          {getLanguageName(lang)}
        </a>
      {/each}
    </div>
  {/snippet}
</DsDropdown>
