<script lang="ts">
	import { site } from '$lib/constants';
	import type { PageData } from './$types';

	// 서버에서 로드된 HTML 컨텐츠
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>
		{data.lang === 'ko' ? '이용약관' : 'Terms of Service'} | {site.name}
	</title>
	<meta
		name="description"
		content={data.lang === 'ko'
			? `${site.name} 서비스 이용약관 및 운영 정책`
			: `${site.name} Terms of Service and Operating Policies`}
	/>
</svelte:head>

<!-- 마크다운에서 변환된 HTML 렌더링 -->
<article class="prose mx-auto max-w-3xl px-4 py-12 md:px-6 text-sm">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- 서버에서 변환된 신뢰할 수 있는 마크다운 HTML -->
	{@html data.content}
</article>
