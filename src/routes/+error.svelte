<script lang="ts">
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeUrl } from '$lib/paraglide/runtime.js';
</script>

<svelte:head>
	<title>{page.status} | Error</title>
</svelte:head>

<!-- 이미 layout에서 min-h-screen, bg-background, text-foreground가 적용되어 있음 -->
<div class="flex flex-col items-center justify-center flex-1 gap-6 text-center">
	<h1 class="text-5xl font-bold tracking-tight">{page.status}</h1>
	<p class="text-xl text-muted-foreground">
		{#if page.status === 404}
			{m.error_not_found()}
		{:else}
			{page.error?.message ?? m.error_unexpected()}
		{/if}
	</p>
	<a
		href={localizeUrl('/').href}
		class="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold transition-all rounded-md shadow-lg bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
	>
		{m.error_go_home()}
	</a>
</div>
