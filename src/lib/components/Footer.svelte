<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { localizeUrl } from '$lib/paraglide/runtime.js';

	interface Props {
		siteName?: string;
	}

	let { siteName = 'Site' }: Props = $props();
	const currentYear = new Date().getFullYear();
</script>

<footer
	class="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div class="mx-auto flex h-12 max-w-5xl items-center justify-between px-4 md:px-6">
		<p class="text-xs text-muted-foreground">
			&copy; {currentYear}
			{siteName}. {m.footer_rights()}
		</p>
		<nav class="flex gap-4 text-xs text-muted-foreground">
			<a
				href={localizeUrl('/terms').href}
				class="hover:text-foreground hover:underline underline-offset-4">{m.footer_terms()}</a
			>
			<a
				href={localizeUrl('/privacy').href}
				class="hover:text-foreground hover:underline underline-offset-4">{m.footer_privacy()}</a
			>
		</nav>
	</div>
</footer>
