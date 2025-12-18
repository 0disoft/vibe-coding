<script module lang="ts">
	export const trailingSlash = 'never';
</script>

<script lang="ts">
	// 전역 CSS 및 UnoCSS 유틸리티

	import { afterNavigate, onNavigate } from "$app/navigation";
	import { onMount } from "svelte";
	// Decorative Logo Fonts
	import "@fontsource/pacifico";
	import "@fontsource/righteous";
	// app.css 보다 먼저 불러와야 함
	import "../app.css";
	import "virtual:uno.css";
	// 공통 레이아웃 컴포넌트
	import { page } from "$app/state";
	import Footer from "$lib/components/Footer.svelte";
	import Header from "$lib/components/Header.svelte";
	import { DsToastRegion } from "$lib/components/design-system";
	import { DsDirectionProvider } from "$lib/components/design-system";
	// 사이트 설정
	import { site } from "$lib/constants";
	// 전역 테마 스토어
	import * as m from "$lib/paraglide/messages.js";
	import { fontSize, theme, themePalette } from "$lib/stores";
	import { toast } from "$lib/stores/toast.svelte";

	let { children } = $props();

	// 컴포넌트 마운트 시 클라이언트에서 테마 상태를 초기화하고 서버 상태와 동기화합니다.
	onMount(() => {
		theme.init();
		themePalette.init();
		fontSize.init();
	});

	// View Transitions API 활성화 (부드러운 페이지 전환)
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	let isOfflinePage = $derived(
		page.url.pathname === "/offline" || page.url.pathname.endsWith("/offline"),
	);

	let isDocsPage = $derived(/(^|\/)docs(\/|$)/.test(page.url.pathname));

	let mainClass = $derived(
		[
			"flex-1",
			"w-full",
			isDocsPage ? "max-w-7xl" : "max-w-5xl",
			"mx-auto",
			"px-4",
			"md:px-6",
			"py-6",
			"md:py-10",
		].join(" "),
	);

	// SPA 페이지 이동 시 스크린 리더/키보드 사용자가 변경을 인지할 수 있도록 main에 포커스 이동
	afterNavigate(() => {
		document.getElementById("main-content")?.focus();
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
	<title>{m.meta_site_title({ siteName: site.name })}</title>
	<meta
		name="description"
		content={m.meta_site_description({ siteDescription: site.description })}
	/>
</svelte:head>

<!-- 
	레이아웃 레벨에서 전역 배경색과 텍스트 색상을 설정합니다.
	data-theme 속성은 hooks.server.ts에서 SSR 시점에 이미 적용됩니다.
	-->
<DsDirectionProvider>
	{#snippet children()}
		<div
			class="flex min-h-screen flex-col bg-background text-foreground"
		>
	{#if !isOfflinePage}
		<a
			href="#main-content"
			class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-foreground focus:shadow-lg focus:ring-2 focus:ring-ring"
		>
			본문으로 바로가기
		</a>
		<Header siteName={site.name} />
		<main
			id="main-content"
			tabindex="-1"
			class={mainClass}
		>
			{#if children}
				{@render children()}
			{/if}
		</main>
		<Footer siteName={site.name} />
		<DsToastRegion
			toasts={toast.toasts}
			onDismiss={(id) => toast.remove(id)}
			onPause={() => toast.pause()}
			onResume={() => toast.resume()}
			position="bottom-right"
		/>
	{:else}
		{#if children}
			{@render children()}
		{/if}
	{/if}
</div>
	{/snippet}
</DsDirectionProvider>
