<script lang="ts">
	import { siteConfig } from '$lib/config';
	import type { PageData } from './$types';

	// 서버에서 로드된 HTML 컨텐츠
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>
		{data.lang === 'ko' ? '개인정보처리방침' : 'Privacy Policy'} | {siteConfig.name}
	</title>
	<meta
		name="description"
		content={data.lang === 'ko'
			? `${siteConfig.name} 서비스 개인정보처리방침`
			: `${siteConfig.name} Privacy Policy`}
	/>
</svelte:head>

<!-- 마크다운에서 변환된 HTML 렌더링 -->
<article class="prose mx-auto max-w-3xl px-4 py-12 md:px-6 text-sm">
	{@html data.content}
</article>
