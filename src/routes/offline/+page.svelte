<script lang="ts">
import * as m from '$lib/paraglide/messages.js';
</script>

<svelte:head>
	<title>{m.offline_title()}</title>
</svelte:head>

<!-- 이미 layout에서 min-h-screen, bg-background, text-foreground가 적용되어 있음 -->
<div class="flex flex-col items-center justify-center flex-1 gap-6 text-center">
	<h1 class="text-5xl font-bold tracking-tight">{m.offline_title()}</h1>
	<p class="text-xl text-muted-foreground">{m.offline_message()}</p>
	<button
		class="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold transition-all rounded-md shadow-lg bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
		onclick={() => window.location.reload()}
	>
		{m.offline_retry()}
	</button>
</div>
