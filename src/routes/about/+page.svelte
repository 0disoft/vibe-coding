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

		<div class="rounded-xl border border-border bg-card p-6 shadow-sm">
			<h2 class="text-lg font-semibold">링크 색상 프리뷰</h2>
			<p class="mt-3 text-sm text-muted-foreground">
				텍스트 본문 안에서 링크가 어떻게 보이는지 확인해보세요.
			</p>
			<ul class="mt-4 space-y-2 text-sm">
				<li>
					<a
						href="https://gleam.run"
						target="_blank"
						rel="noreferrer"
						class="font-semibold text-link underline decoration-link/70 underline-offset-4 transition hover:text-link/80 hover:decoration-link"
					>
						gleam.run 공식 사이트 열기
					</a>
				</li>
				<li>
					<a
						href="/"
						class="font-semibold text-link underline decoration-link/70 underline-offset-4 transition hover:text-link/80 hover:decoration-link"
					>
						홈으로 돌아가기 링크
					</a>
				</li>
			</ul>
		</div>

		<div class="rounded-xl border border-border bg-card p-6 shadow-sm">
			<h2 class="text-lg font-semibold">코드 폰트 스케일 프리뷰</h2>
			<p class="mt-3 text-sm text-muted-foreground">
				폰트 슬라이더(상단)로 크기를 조절하면 코드도 함께 스케일되는지 확인하세요.
			</p>
			<div class="mt-4 space-y-3 rounded-lg bg-muted/40 p-4">
				<p class="text-sm text-muted-foreground">인라인 코드: <code>const answer = 42;</code></p>
				<pre><code class="language-js">{"function greet(name) {\n  return `Hello, ${name}!`;\n}"}</code></pre>
			</div>
		</div>

		<div class="rounded-xl border border-border bg-card p-6 shadow-sm">
			<h2 class="text-lg font-semibold">그라디언트 & 섀도 유틸 프리뷰</h2>
				<p class="mt-3 text-sm text-muted-foreground">
					`from-` / `via-` / `to-` 색상과 `shadow-&#123;color&#125;` 유틸이 UnoCSS safelist에 추가되어 있습니다.
				</p>
			<div class="mt-4 grid gap-4 md:grid-cols-2">
				<div class="rounded-xl p-6 text-card-foreground shadow shadow-primary bg-gradient-to-r from-primary/80 via-accent/80 to-link/80">
					<h3 class="text-h3 font-semibold">Gradient Button</h3>
					<p class="mt-2 text-body text-card-foreground/90">from-primary → via-accent → to-link</p>
				</div>
				<div class="rounded-xl bg-card/80 p-6 text-card-foreground shadow shadow-success">
					<h3 class="text-h3 font-semibold">Shadow Success</h3>
					<p class="mt-2 text-body text-card-foreground/90">shadow-success 적용된 카드</p>
				</div>
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
