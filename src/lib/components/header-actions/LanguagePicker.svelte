<script lang="ts">
	import { page } from '$app/state';
	import { getLocale, locales, localizeUrl } from '$lib/paraglide/runtime';

	// 언어 코드 → 사람이 읽기 쉬운 이름 맵
	const languageNames: Record<string, string> = {
		en: 'English',
		ko: '한국어',
		ja: '日本語',
		zh: '中文',
		es: 'Español',
		fr: 'Français',
		de: 'Deutsch',
		pt: 'Português',
		it: 'Italiano',
		nl: 'Nederlands',
		sv: 'Svenska',
		pl: 'Polski',
		ru: 'Русский',
		ar: 'العربية',
		hi: 'हिन्दी',
		id: 'Bahasa',
		vi: 'Tiếng Việt',
		th: 'ไทย',
		tl: 'Tagalog',
		tr: 'Türkçe'
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

	function toggleLanguageModal() {
		showLanguageModal ? closeLanguageModal({ focusButton: true }) : (showLanguageModal = true);
	}

	function handleOutsideClick(event: MouseEvent) {
		if (
			showLanguageModal &&
			modalRef &&
			!modalRef.contains(event.target as Node) &&
			buttonRef &&
			!buttonRef.contains(event.target as Node)
		) {
			closeLanguageModal();
		}
	}

	// ESC 키로 모달 닫기 (접근성 필수)
	function handleKeyDown(event: KeyboardEvent) {
		if (showLanguageModal && event.key === 'Escape') {
			event.stopPropagation(); // 다른 ESC 핸들러로 전파 방지
			closeLanguageModal();
		}
	}
</script>

<svelte:window onclick={handleOutsideClick} onkeydown={handleKeyDown} />

<div class="relative">
	<button
		type="button"
		id="language-menu-button"
		bind:this={buttonRef}
		onclick={toggleLanguageModal}
		class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
		aria-label="언어 변경"
		aria-haspopup="dialog"
		aria-expanded={showLanguageModal}
		aria-controls="language-menu"
		data-testid="header-language-picker"
	>
		<span class="i-lucide-languages h-4 w-4"></span>
	</button>

	<!-- 언어 선택 모달 -->
	{#if showLanguageModal}
		<div
			id="language-menu"
			bind:this={modalRef}
			class="absolute right-0 top-full z-50 mt-2 w-36 rounded-lg bg-popover p-2 shadow-lg"
			role="menu"
			aria-labelledby="language-menu-button"
		>
			<div class="grid gap-1 max-h-[300px] overflow-y-auto thin-scrollbar">
				{#each availableLanguageTags as lang}
					<a
						href={localizeUrl(page.url.pathname + page.url.search, { locale: lang }).href}
						class="inline-flex h-8 w-full items-center justify-start px-2 rounded-md text-sm transition-colors {lang ===
						currentLang
							? 'bg-primary text-primary-foreground'
							: 'hover:bg-accent hover:text-accent-foreground'}"
						data-sveltekit-reload
						onclick={() => closeLanguageModal()}
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

<style>
	.thin-scrollbar {
		scrollbar-width: thin;
		scrollbar-color: oklch(var(--muted-foreground) / 0.3) transparent;
	}

	.thin-scrollbar::-webkit-scrollbar {
		width: 4px;
	}

	.thin-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}

	.thin-scrollbar::-webkit-scrollbar-thumb {
		background: oklch(var(--muted-foreground) / 0.3);
		border-radius: 2px;
	}

	.thin-scrollbar::-webkit-scrollbar-thumb:hover {
		background: oklch(var(--muted-foreground) / 0.5);
	}
</style>
