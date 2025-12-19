<script lang="ts">
	import { PolicyLayout } from "$lib/components/policy";
	import { site } from "$lib/constants";
	import * as m from "$lib/paraglide/messages.js";
	import type { PageData } from "./$types";

	// 서버에서 로드된 HTML 컨텐츠
	let { data }: { data: PageData } = $props();
</script>

<PolicyLayout
	title={`${m.footer_terms({}, { locale: data.lang })} | ${site.name}`}
	description={`${site.name} ${m.footer_terms({}, { locale: data.lang })}`}
	lang={data.lang}
	content={data.content}
/>
