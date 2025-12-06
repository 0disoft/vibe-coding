<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { fontSize, type FontSize } from '$lib/font-size.svelte';

	let value = $state<FontSize>(5);

	onMount(() => {
		if (!browser) return;
		fontSize.init();
		value = fontSize.current;
	});

	function onInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const num = Number(target.value) as FontSize;
		if (num >= 1 && num <= 9) {
			value = num;
			fontSize.set(num);
		}
	}
</script>

<label class="flex items-center gap-3 rounded-lg border border-border bg-card/60 px-4 py-3 text-body">
	<span class="text-caption text-muted-foreground">글자 크기</span>

	<input
		type="range"
		min="1"
		max="9"
		step="1"
		value={value}
		class="h-2 w-full accent-primary"
		oninput={onInput}
	/>

	<span class="w-6 text-center text-caption font-semibold text-muted-foreground">{value}</span>
</label>
