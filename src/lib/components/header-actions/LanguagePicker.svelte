<script lang="ts">
	import * as runtime from '$lib/paraglide/runtime';
	import { page } from '$app/state';

	// Paraglide API 버전 호환성 처리 (1.x ~ 2.x)
	// availableLanguageTags -> locales 또는 availableLocales
	// languageTag() -> getLocale()
	const availableLanguageTags: string[] = (runtime as any).availableLocales ?? (runtime as any).locales ?? (runtime as any).availableLanguageTags ?? [];
	const getLanguageTag = (runtime as any).getLocale ?? (runtime as any).languageTag ?? (() => 'en');

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
				언어 (현재: {getLanguageTag()})
			</div>
			<div class="grid gap-1 max-h-[300px] overflow-y-auto">
				{#each availableLanguageTags as lang}
					<a
						href="/{lang}"
						class="inline-flex h-8 w-full items-center justify-start px-2 rounded-md text-sm transition-colors {lang === getLanguageTag()
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
