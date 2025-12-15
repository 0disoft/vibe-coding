<script lang="ts">
  import { page } from '$app/state';
  import * as m from '$lib/paraglide/messages.js';
  import { getLocale, locales, localizeUrl } from '$lib/paraglide/runtime';
  import { tick } from 'svelte';

  import { DsIconButton } from '$lib/components/design-system';

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

  let showLanguageModal = $state(false);
  let modalRef = $state<HTMLDivElement | null>(null);
  let buttonRef = $state<HTMLButtonElement | null>(null);

  // 닫기 로직 통합 헬퍼
  function closeLanguageModal(options?: { focusButton?: boolean }) {
    if (!showLanguageModal) return;
    showLanguageModal = false;
    if (options?.focusButton) {
      buttonRef?.focus();
    }
  }

  async function toggleLanguageModal() {
    if (showLanguageModal) {
      closeLanguageModal({ focusButton: true });
    } else {
      showLanguageModal = true;
      await tick();
      // 현재 선택된 언어 항목에 포커스, 없으면 첫 번째 항목
      const selectedItem = modalRef?.querySelector('[aria-current="page"]') as HTMLElement;
      const firstItem = modalRef?.querySelector('[role="menuitem"]') as HTMLElement;
      (selectedItem ?? firstItem)?.focus();
    }
  }

  function handleOutsideClick(event: MouseEvent) {
    const target = event.target;
    if (!(target instanceof Node)) return; // 타입 가드

    if (showLanguageModal && modalRef && !modalRef.contains(target) && buttonRef && !buttonRef.contains(target)) {
      closeLanguageModal();
    }
  }

  // ESC 키로 모달 닫기 (접근성 필수)
  function handleKeyDown(event: KeyboardEvent) {
    if (showLanguageModal && event.key === 'Escape') {
      event.stopPropagation();
      closeLanguageModal({ focusButton: true });
    }
  }

  // 메뉴 내부 키보드 탐색 (접근성)
  function handleMenuKeyDown(event: KeyboardEvent) {
    if (!modalRef) return;

    const items = Array.from(modalRef.querySelectorAll<HTMLElement>('[role="menuitem"]'));
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
</script>

<svelte:window onclick={handleOutsideClick} onkeydown={handleKeyDown} />

<div class="relative">
  <DsIconButton
    id="language-menu-button"
    bind:ref={buttonRef}
    onclick={toggleLanguageModal}
    label={m.language_picker_label()}
    aria-haspopup="dialog"
    aria-expanded={showLanguageModal}
    aria-controls="language-menu"
    data-testid="header-language-picker"
  >
    <span class="i-lucide-languages h-4 w-4"></span>
  </DsIconButton>

  <!-- 언어 선택 모달 -->
  {#if showLanguageModal}
    <div
      id="language-menu"
      bind:this={modalRef}
      class="absolute end-0 top-full z-50 mt-2 w-40 rounded-lg border border-border bg-popover p-1.5 shadow-lg"
      role="menu"
      aria-labelledby="language-menu-button"
      tabindex="-1"
      onkeydown={handleMenuKeyDown}
    >
      <div class="grid gap-1 max-h-[300px] overflow-y-auto thin-scrollbar">
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
              closeLanguageModal();
            }}
            aria-current={lang === currentLang ? 'page' : undefined}
            hreflang={lang}
            role="menuitem"
          >
            {getLanguageName(lang)}
          </a>
        {/each}
      </div>
    </div>
  {/if}
</div>
