<script lang="ts">
	import ThemeToggle from '$lib/components/header-actions/ThemeToggle.svelte';
	import LanguagePicker from '$lib/components/header-actions/LanguagePicker.svelte';
	import FontSizePicker from '$lib/components/header-actions/FontSizePicker.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		siteName?: string;
		nav?: Snippet;
		actions?: Snippet;
	}

	let { siteName = 'Site', nav, actions }: Props = $props();
</script>

<header class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
	<div class="mx-auto flex h-12 max-w-5xl items-center justify-between px-4 md:px-6">
		<!-- 로고/사이트명 -->
		<a href="/" class="flex items-center gap-2 font-semibold text-foreground">
			{siteName}
		</a>

		<!-- 네비게이션 -->
		<nav class="hidden items-center gap-8 text-sm md:flex">
			{#if nav}
				{@render nav()}
			{:else}
				<!-- 기본 네비게이션 메뉴 -->
				<a href="/menu1" class="text-muted-foreground transition-colors hover:text-foreground">메뉴1</a>
				<a href="/menu2" class="text-muted-foreground transition-colors hover:text-foreground">메뉴2</a>
				<a href="/menu3" class="text-muted-foreground transition-colors hover:text-foreground">메뉴3</a>
				<a href="/menu4" class="text-muted-foreground transition-colors hover:text-foreground">메뉴4</a>
			{/if}
		</nav>

		<!-- 우측 액션 영역 -->
		<div class="flex items-center gap-1">
			{#if actions}
				{@render actions()}
			{/if}

			<ThemeToggle />
			<LanguagePicker />
			<FontSizePicker />
		</div>
	</div>
</header>
