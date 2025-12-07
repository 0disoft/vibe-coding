<script lang="ts">
	import { siteConfig } from '$lib/config';
	import type { PageData } from './$types';

	// 서버에서 로드된 HTML 컨텐츠
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>
		{data.lang === 'ko' ? '이용약관' : 'Terms of Service'} | {siteConfig.name}
	</title>
	<meta
		name="description"
		content={data.lang === 'ko'
			? `${siteConfig.name} 서비스 이용약관 및 운영 정책`
			: `${siteConfig.name} Terms of Service and Operating Policies`}
	/>
</svelte:head>

<!-- 마크다운에서 변환된 HTML 렌더링 -->
<article class="prose mx-auto max-w-3xl px-4 py-12 md:px-6 text-sm">
	{@html data.content}
</article>
