<script lang="ts">
	import { site } from '$lib/constants';
	import type { PageData } from './$types';

	// 서버에서 로드된 HTML 컨텐츠
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>
		{data.lang === 'ko' ? '쿠키 정책' : 'Cookie Policy'} | {site.name}
	</title>
	<meta
		name="description"
		content={data.lang === 'ko' ? `${site.name} 쿠키 정책` : `${site.name} Cookie Policy`}
	/>
</svelte:head>

<!-- 마크다운에서 변환된 HTML 렌더링 -->
<article class="prose prose-neutral dark:prose-invert mx-auto max-w-3xl px-4 py-12 md:px-6">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- 서버에서 변환된 신뢰할 수 있는 마크다운 HTML -->
	{@html data.content}
</article>

<style>
	/* Typography 상세 튜닝: 제목과 본문의 크기 균형 맞추기 */
	:global(.prose h1) {
		font-size: 1.875rem; /* 30px */
		line-height: 2.25rem;
		margin-bottom: 2rem;
		font-weight: 800;
	}
	:global(.prose h2) {
		font-size: 1.5rem; /* 24px */
		line-height: 2rem;
		margin-top: 2.5rem;
		margin-bottom: 1rem;
		font-weight: 700;
	}
	:global(.prose h3) {
		font-size: 1.25rem; /* 20px */
		line-height: 1.75rem;
		margin-top: 2rem;
		margin-bottom: 0.75rem;
		font-weight: 600;
	}
	:global(.prose p) {
		font-size: 1rem; /* 16px */
		line-height: 1.75;
		margin-bottom: 1.25rem;
	}
	:global(.prose ul > li),
	:global(.prose ol > li) {
		font-size: 1rem; /* 16px */
		line-height: 1.75;
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
	}
	/* 강제 적용된 li 내부 p 태그 등의 마진 제거 */
	:global(.prose li p) {
		margin-top: 0;
		margin-bottom: 0;
	}
</style>
