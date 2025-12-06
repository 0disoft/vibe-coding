<script lang="ts">
	interface Props {
		siteName?: string;
	}

	let { siteName = 'Site' }: Props = $props();
	const currentYear = new Date().getFullYear();
</script>

<footer class="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
	<div class="mx-auto flex h-12 max-w-5xl items-center justify-between px-4 md:px-6">
		<p class="text-xs text-muted-foreground">
			&copy; {currentYear} {siteName}. All rights reserved.
		</p>
		<nav class="flex gap-4 text-xs text-muted-foreground">
			<a href="/terms" class="hover:text-foreground hover:underline underline-offset-4">이용약관</a>
			<a href="/privacy" class="hover:text-foreground hover:underline underline-offset-4">개인정보처리방침</a>
		</nav>
	</div>
</footer>
