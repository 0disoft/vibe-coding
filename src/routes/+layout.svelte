<script lang="ts">
	// 전역 CSS 및 UnoCSS 유틸리티

	import { afterNavigate, onNavigate } from "$app/navigation";
	import { onMount } from "svelte";
	// Decorative Logo Fonts
	import "@fontsource/pacifico";
	import "@fontsource/righteous";
	// app.css 보다 먼저 불러와야 함
	import "virtual:uno.css";
	import "../app.css";
	// 공통 레이아웃 컴포넌트
	import { page } from "$app/state";
	import Footer from "$lib/components/Footer.svelte";
	import Header from "$lib/components/Header.svelte";
	import {
		DsDirectionProvider,
		DsSkipLink,
		DsToastRegion,
	} from "$lib/components/design-system";
	import SmoothScroll from "$lib/interaction/SmoothScroll.svelte";
	// 사이트 설정
	import { site } from "$lib/constants";
	// 전역 테마 스토어
	import * as m from "$lib/paraglide/messages.js";
	import { fontSize, theme, themePalette } from "$lib/stores";
	import { toast } from "$lib/stores/toast.svelte";

	let { children: routeChildren } = $props();

	// 컴포넌트 마운트 시 클라이언트에서 테마 상태를 초기화하고 서버 상태와 동기화합니다.
	onMount(() => {
		document.documentElement.dataset.hydrated = "true";
		theme.init();
		themePalette.init();
		fontSize.init();
	});

	// View Transitions API 활성화 (부드러운 페이지 전환)
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches)
			return;

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
	let didInitialAfterNavigate = false;
	afterNavigate(() => {
		// 초기 진입 시에는 SkipLink가 첫 포커스가 되도록 유지하고,
		// 이후 클라이언트 내비게이션에서만 main으로 포커스를 이동합니다.
		if (!didInitialAfterNavigate) {
			didInitialAfterNavigate = true;
			return;
		}
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
		<SmoothScroll duration={0.6} />
		<div class="flex min-h-screen flex-col bg-background text-foreground">
			{#if !isOfflinePage}
				<DsSkipLink label={m.a11y_skip_to_main_content()} />
				<Header siteName={site.name} />
				<main id="main-content" tabindex="-1" class={mainClass}>
					{#if routeChildren}
						{@render routeChildren()}
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
			{:else if routeChildren}
				{@render routeChildren()}
			{/if}
		</div>
	{/snippet}
</DsDirectionProvider>
