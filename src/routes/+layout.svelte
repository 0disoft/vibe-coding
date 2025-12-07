<script lang="ts">
	// 전역 CSS 및 UnoCSS 유틸리티
	import { onMount } from 'svelte';
	// app.css 보다 먼저 불러와야 함
	import 'virtual:uno.css';
	import '../app.css';
	// 전역 테마 스토어
	import { fontSize } from '$lib/font-size.svelte';
	import { theme } from '$lib/theme.svelte';
	// 공통 레이아웃 컴포넌트
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { siteConfig } from '$lib/config';
	import { page } from '$app/state';

	let { children } = $props();

	// 컴포넌트 마운트 시 클라이언트에서 테마 상태를 초기화하고 서버 상태와 동기화합니다.
	onMount(() => {
		theme.init();
		fontSize.init();
	});

	let isOfflinePage = $derived(page.url.pathname === '/offline' || page.url.pathname.endsWith('/offline'));
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
	<title>{siteConfig.name}</title>
	<meta name="description" content={siteConfig.description} />
</svelte:head>

<!-- 
	레이아웃 레벨에서 전역 배경색과 텍스트 색상을 설정합니다.
	data-theme 속성은 hooks.server.ts에서 SSR 시점에 이미 적용됩니다.
-->
<div class="flex min-h-screen flex-col bg-background font-sans antialiased text-foreground">
	{#if !isOfflinePage}
		<Header siteName={siteConfig.name} />
		<main class="flex-1 w-full max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
			{@render children()}
		</main>
		<Footer siteName={siteConfig.name} />
	{:else}
		{@render children()}
	{/if}
</div>
