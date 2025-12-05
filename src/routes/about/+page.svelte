<script lang="ts">
	import { theme } from '$lib/theme.svelte';
</script>

<div class="px-6 py-10 md:px-10 md:py-16">
	<section class="mx-auto max-w-3xl space-y-8">
		<header class="space-y-4">
			<h1 class="text-3xl font-bold tracking-tight">About Page</h1>
			<p class="text-lg text-muted-foreground">
				페이지 이동 시 테마가 끊김 없이 유지되는지 확인하는 테스트 페이지입니다.
			</p>
		</header>

		<div class="rounded-xl border border-border bg-card p-6 shadow-sm">
			<h2 class="text-lg font-semibold">현재 상태 모니터링</h2>
			<div class="mt-4 space-y-2">
				<div class="flex items-center justify-between rounded-lg bg-muted/50 p-3">
					<span class="text-sm font-medium text-muted-foreground">현재 테마</span>
					<span class="font-mono text-sm font-bold text-primary">{theme.current}</span>
				</div>
				<p class="text-sm text-muted-foreground">
					이 페이지에서 새로고침을 해도 위 테마 값이 유지되며 배경색이 깜빡이지 않아야 합니다.
				</p>
			</div>
		</div>

		<div class="flex gap-4">
			<a
				href="/"
				class="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90"
			>
				메인으로 돌아가기
			</a>

			<button
				type="button"
				class="inline-flex items-center justify-center rounded-lg border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground"
				onclick={() => theme.toggle()}
			>
				여기서 테마 변경해보기
			</button>
		</div>
	</section>
</div>
