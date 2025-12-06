<script lang="ts">
	// import { availableLanguageTags, languageTag } from '$lib/paraglide/runtime';
	import { page } from '$app/state';

	// Paraglide 런타임 모듈 인식 오류로 인해 임시 하드코딩
	const availableLanguageTags = [
		'ar', 'de', 'en', 'es', 'fr', 'hi', 'id', 'it', 'ja', 'ko', 
		'nl', 'pl', 'pt', 'ru', 'sv', 'th', 'tl', 'tr', 'vi', 'zh'
	];

	function languageTag() {
		// URL 경로에서 첫 번째 세그먼트 추출하여 언어 코드로 추정
		const path = page.url.pathname;
		const potentialLang = path.split('/')[1];
		if (availableLanguageTags.includes(potentialLang)) {
			return potentialLang;
		}
		return 'ko'; // 기본값 (또는 en)
	}

	let showLanguageModal = $state(false);

	function toggleLanguageModal() {
		showLanguageModal = !showLanguageModal;
	}
</script>

<div class="relative">
	<button
		type="button"
		onclick={toggleLanguageModal}
		class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
		aria-label="언어 변경"
	>
		<span class="i-lucide-languages h-4 w-4"></span>
	</button>

	<!-- 언어 선택 모달 -->
	{#if showLanguageModal}
		<!-- 배경 클릭 시 닫기 -->
		<button
			type="button"
			class="fixed inset-0 z-40"
			onclick={() => (showLanguageModal = false)}
			aria-label="닫기"
		></button>

		<div class="absolute right-0 top-full z-50 mt-2 w-32 rounded-lg bg-popover p-2 shadow-lg">
			<div class="mb-2 px-2 text-xs font-medium text-muted-foreground">
				언어 (현재: {languageTag()})
			</div>
			<div class="grid gap-1 max-h-[300px] overflow-y-auto">
				{#each availableLanguageTags as lang}
					<a
						href="/{lang}"
						class="inline-flex h-8 w-full items-center justify-start px-2 rounded-md text-sm transition-colors {lang === languageTag()
							? 'bg-primary text-primary-foreground'
							: 'hover:bg-accent hover:text-accent-foreground'}"
						data-sveltekit-reload
						onclick={() => (showLanguageModal = false)}
					>
						{lang.toUpperCase()}
					</a>
				{/each}
			</div>
		</div>
	{/if}
</div>
