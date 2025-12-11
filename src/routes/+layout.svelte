<script lang="ts">
  // 전역 CSS 및 UnoCSS 유틸리티

  import { onNavigate } from '$app/navigation';
  import { onMount } from 'svelte';
  // Decorative Logo Fonts
  import '@fontsource/pacifico';
  import '@fontsource/righteous';
  // app.css 보다 먼저 불러와야 함
  import 'virtual:uno.css';
  import '../app.css';
  // 공통 레이아웃 컴포넌트
  import { page } from '$app/state';
  import Footer from '$lib/components/Footer.svelte';
  import Header from '$lib/components/Header.svelte';
  // 사이트 설정
  import { site } from '$lib/constants';
  // 전역 테마 스토어
  import { fontSize, theme } from '$lib/stores';

  let { children } = $props();

  // 컴포넌트 마운트 시 클라이언트에서 테마 상태를 초기화하고 서버 상태와 동기화합니다.
  onMount(() => {
    theme.init();
    fontSize.init();
  });

  // View Transitions API 활성화 (부드러운 페이지 전환)
  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });

  let isOfflinePage = $derived(page.url.pathname === '/offline' || page.url.pathname.endsWith('/offline'));
</script>

<svelte:head>
  <link rel="icon" href="/favicon.svg" />
  <title>{site.name}</title>
  <meta name="description" content={site.description} />
</svelte:head>

<!-- 
	레이아웃 레벨에서 전역 배경색과 텍스트 색상을 설정합니다.
	data-theme 속성은 hooks.server.ts에서 SSR 시점에 이미 적용됩니다.
-->
<div class="flex min-h-screen flex-col bg-background font-sans antialiased text-foreground">
  {#if !isOfflinePage}
    <Header siteName={site.name} />
    <main class="flex-1 w-full max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
      {@render children()}
    </main>
    <Footer siteName={site.name} />
  {:else}
    {@render children()}
  {/if}
</div>
