<script lang="ts">
	import { page } from '$app/state';
	import * as runtime from '$lib/paraglide/runtime';
	import { localizeUrl } from '$lib/paraglide/runtime';

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

	// Paraglide API 호환성 및 안전장치
	// 1. 런타임에서 언어 목록 가져오기 시도, 실패 시 기본 목록 사용
	const defaultLocales = Object.keys(languageNames);
	const availableLanguageTags: string[] =
		(runtime as any).availableLocales ??
		(runtime as any).locales ??
		(runtime as any).availableLanguageTags ??
		defaultLocales;

	// 2. 현재 언어 판별: URL이 가장 정확하므로 URL 우선 파싱
	// Paraglide 내부 상태가 늦게 갱신될 수 있으므로 page.url을 직접 신뢰
	let currentLang = $derived.by(() => {
		const path = page.url.pathname;
		const segment = path.split('/')[1]; // "/ko/..." -> "ko"
		if (availableLanguageTags.includes(segment)) {
			return segment;
		}
		// URL에 언어 코드가 없거나(루트), 유효하지 않으면 기본값(en) 또는 runtime 상태 확인
		const runtimeLang = (runtime as any).getLocale?.() ?? (runtime as any).languageTag?.();
		return runtimeLang ?? 'en';
	});

	// 언어 코드를 읽기 쉬운 이름으로 변환
	function getLanguageName(code: string): string {
		return languageNames[code] ?? code.toUpperCase();
	}

	let showLanguageModal = $state(false);
	let modalRef: HTMLDivElement | undefined = $state();
	let buttonRef: HTMLButtonElement | undefined = $state();

	function toggleLanguageModal() {
		showLanguageModal = !showLanguageModal;
	}

	function handleOutsideClick(event: MouseEvent) {
		if (
			showLanguageModal &&
			modalRef &&
			!modalRef.contains(event.target as Node) &&
			buttonRef &&
			!buttonRef.contains(event.target as Node)
		) {
			showLanguageModal = false;
		}
	}
</script>

<svelte:window onclick={handleOutsideClick} />

<div class="relative">
	<button
		type="button"
		bind:this={buttonRef}
		onclick={toggleLanguageModal}
		class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
		aria-label="언어 변경"
	>
		<span class="i-lucide-languages h-4 w-4"></span>
	</button>

	<!-- 언어 선택 모달 -->
	{#if showLanguageModal}
		<div
			bind:this={modalRef}
			class="absolute right-0 top-full z-50 mt-2 w-36 rounded-lg bg-popover p-2 shadow-lg"
		>
			<div class="grid gap-1 max-h-[300px] overflow-y-auto">
				{#each availableLanguageTags as lang}
					<a
						href={localizeUrl(page.url.pathname + page.url.search, { locale: lang }).href}
						class="inline-flex h-8 w-full items-center justify-start px-2 rounded-md text-sm transition-colors {lang ===
						currentLang
							? 'bg-primary text-primary-foreground'
							: 'hover:bg-accent hover:text-accent-foreground'}"
						data-sveltekit-reload
						onclick={() => (showLanguageModal = false)}
					>
						{getLanguageName(lang)}
					</a>
				{/each}
			</div>
		</div>
	{/if}
</div>
