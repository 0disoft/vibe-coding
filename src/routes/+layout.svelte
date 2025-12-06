<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	// 전역 CSS 및 UnoCSS 유틸리티
	import { onMount } from 'svelte';
	// app.css 보다 먼저 불러와야 함
	import 'virtual:uno.css';
	import '../app.css';
	// 전역 테마 스토어
	import { fontSize } from '$lib/font-size.svelte';
	import { theme } from '$lib/theme.svelte';

	let { children } = $props();

	// 컴포넌트 마운트 시 클라이언트에서 테마 상태를 초기화하고 서버 상태와 동기화합니다.
	onMount(() => {
		theme.init();
		fontSize.init();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Vibe Coding Starter</title>
	<meta
		name="description"
		content="SvelteKit 2 + Svelte 5 + UnoCSS 테마/폰트 토큰 템플릿. 라이트/다크 테마와 폰트 스케일을 쿠키로 유지하고 FOUC 없이 SSR 적용합니다."
	/>
</svelte:head>

<!-- 
	레이아웃 레벨에서 전역 배경색과 텍스트 색상을 설정합니다.
	data-theme 속성은 hooks.server.ts에서 SSR 시점에 이미 적용됩니다.
-->
<div class="min-h-screen bg-background text-foreground font-sans antialiased">
	{@render children()}
</div>
