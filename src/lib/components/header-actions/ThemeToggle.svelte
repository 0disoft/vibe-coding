<script lang="ts">
	import * as m from "$lib/paraglide/messages.js";

	import { DsIconButton } from "$lib/components/design-system";
	import { theme } from "$lib/stores";
</script>

<DsIconButton
	onclick={() => theme.toggle()}
	label={m.theme_toggle_label()}
	data-testid="header-theme-toggle"
>
	{#if theme.current === "light"}
		<span class="i-lucide-sun h-4 w-4"></span>
	{:else}
		<span class="i-lucide-moon h-4 w-4"></span>
	{/if}
</DsIconButton>
