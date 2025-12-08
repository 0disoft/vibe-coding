<script lang="ts">
	import { theme } from '$lib/stores';
</script>

<button
	type="button"
	onclick={() => theme.toggle()}
	class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
	aria-label="테마 변경"
	aria-pressed={theme.current === 'dark'}
>
	{#if theme.current === 'light'}
		<span class="i-lucide-sun h-4 w-4"></span>
	{:else}
		<span class="i-lucide-moon h-4 w-4"></span>
	{/if}
</button>
