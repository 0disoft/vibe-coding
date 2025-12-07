<script lang="ts">
	import { siteConfig } from '$lib/config';
	import * as m from '$lib/paraglide/messages.js';
</script>

<div class="container flex flex-col items-center justify-center gap-4 py-24 text-center md:py-32">
	<div class="space-y-4">
		<h1 class="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
			{siteConfig.name}
		</h1>
		<p class="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
			{siteConfig.description}
		</p>
	</div>

	<div class="flex gap-4">
		<a
			href="/docs"
			class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
		>
			{m.home_get_started()}
		</a>
		<a
			href={siteConfig.links.github}
			target="_blank"
			rel="noreferrer"
			class="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
		>
			GitHub
		</a>
	</div>
</div>
