<script lang="ts">
	// 전역 테마 스토어 사용
	import { theme } from '$lib/theme.svelte';

	// Svelte 5에서는 전역 theme 스토어를 직접 참조하여 반응성을 얻습니다.
</script>

<div class="px-6 py-10 md:px-10 md:py-16">
	<section class="mx-auto max-w-5xl space-y-8">
		<header class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div>
				<h1 class="text-2xl font-semibold tracking-tight md:text-3xl">Theme Playground</h1>
				<p class="mt-2 text-sm text-muted-foreground md:text-base">
					OKLCH 기반 색 토큰들이 실제로 어떻게 보이는지 한 페이지에서 전부 확인하는 테스트용
					뷰입니다.
				</p>
			</div>

			<div class="flex flex-wrap items-center gap-3">
				<span class="text-xs uppercase tracking-wide text-muted-foreground">
					현재 테마: {theme.current}
				</span>

				<!-- About 페이지로 이동하는 버튼 (클라이언트 라우팅 테스트) -->
				<a
					href="/about"
					class="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
				>
					About 페이지로 이동 →
				</a>

				<!-- Svelte 5: onclick 이벤트 핸들러 사용 -->
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
					onclick={() => theme.toggle()}
				>
					{theme.current === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
				</button>
			</div>
		</header>

		<!-- 베이스 영역 -->
		<section class="space-y-4">
			<h2 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Base</h2>

			<div class="grid gap-4 md:grid-cols-3">
				<div class="rounded-xl border border-border bg-card/70 p-4">
					<div class="text-xs font-medium text-muted-foreground">Background / Foreground</div>
					<div class="mt-3 rounded-lg border border-border bg-background px-4 py-6">
						<p class="text-sm">bg-background · text-foreground</p>
						<p class="mt-2 text-xs text-muted-foreground">페이지 기본 배경, 본문 텍스트에 사용.</p>
					</div>
				</div>

				<div class="rounded-xl border border-border bg-card/70 p-4">
					<div class="text-xs font-medium text-muted-foreground">Card</div>
					<div class="mt-3 rounded-lg border border-border bg-card px-4 py-6">
						<p class="text-sm text-card-foreground">bg-card · text-card-foreground</p>
						<p class="mt-2 text-xs text-muted-foreground">
							카드 컴포넌트, 대시보드 위젯 등 컨테이너에 사용.
						</p>
					</div>
				</div>

				<div class="rounded-xl border border-border bg-card/70 p-4">
					<div class="text-xs font-medium text-muted-foreground">Popover</div>
					<div class="mt-3 rounded-lg border border-border bg-popover px-4 py-6 shadow">
						<p class="text-sm text-popover-foreground">bg-popover · text-popover-foreground</p>
						<p class="mt-2 text-xs text-muted-foreground">
							드롭다운, 팝오버, 컨텍스트 메뉴 같은 떠 있는 레이어에 사용.
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- 액션 색상 -->
		<section class="space-y-4">
			<h2 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Actions</h2>

			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<div class="rounded-xl border border-border bg-card/70 p-4">
					<div class="text-xs font-medium text-muted-foreground">Primary</div>
					<button
						type="button"
						class="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
					>
						Primary Button
					</button>
					<p class="mt-2 text-xs text-muted-foreground">
						가장 중요한 액션에 사용하는 메인 버튼 색.
					</p>
				</div>

				<div class="rounded-xl border border-border bg-card/70 p-4">
					<div class="text-xs font-medium text-muted-foreground">Secondary</div>
					<button
						type="button"
						class="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-border bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground transition hover:bg-accent hover:text-accent-foreground"
					>
						Secondary Button
					</button>
					<p class="mt-2 text-xs text-muted-foreground">
						보조 액션, Cancel 버튼 등 상대적으로 덜 중요한 액션에 사용.
					</p>
				</div>

				<div class="rounded-xl border border-border bg-card/70 p-4">
					<div class="text-xs font-medium text-muted-foreground">Accent</div>
					<div
						class="mt-3 inline-flex rounded-full bg-accent px-4 py-2 text-xs font-medium text-accent-foreground"
					>
						Accent pill · 배지, 토글 등에 사용
					</div>
					<p class="mt-2 text-xs text-muted-foreground">
						강조가 필요하지만 Primary까지는 아닌 요소에 쓸 색.
					</p>
				</div>
			</div>
		</section>

		<!-- 상태 색상 -->
		<section class="space-y-4">
			<h2 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">State</h2>

			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div class="rounded-xl border border-border bg-card/70 p-4">
					<div class="text-xs font-medium text-muted-foreground">Muted</div>
					<div class="mt-3 rounded-lg bg-muted px-4 py-3">
						<p class="text-xs text-muted-foreground">
							보더, 약한 텍스트, 서브 카드 배경 등에 사용.
						</p>
					</div>
				</div>

				<div class="rounded-xl border border-border bg-card/70 p-4">
					<div class="text-xs font-medium text-muted-foreground">Success</div>
					<div
						class="mt-3 rounded-lg bg-success px-4 py-3 text-xs font-medium text-success-foreground"
					>
						성공적으로 처리되었습니다.
					</div>
				</div>

				<div class="rounded-xl border border-border bg-card/70 p-4">
					<div class="text-xs font-medium text-muted-foreground">Warning</div>
					<div
						class="mt-3 rounded-lg bg-warning px-4 py-3 text-xs font-medium text-warning-foreground"
					>
						주의가 필요한 상태입니다.
					</div>
				</div>

				<div class="rounded-xl border border-border bg-card/70 p-4">
					<div class="text-xs font-medium text-muted-foreground">Destructive</div>
					<button
						type="button"
						class="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-destructive px-4 py-3 text-xs font-semibold text-destructive-foreground transition hover:bg-destructive/90"
					>
						삭제하기
					</button>
					<p class="mt-2 text-xs text-muted-foreground">
						삭제, 취소 불가 액션에 사용하는 강한 색상.
					</p>
				</div>
			</div>
		</section>

		<!-- 폼 / 보더 / 링 -->
		<section class="space-y-4">
			<h2 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
				Form · Border · Ring
			</h2>

			<div class="grid gap-4 md:grid-cols-[2fr,1.2fr]">
				<div class="rounded-xl border border-border bg-card/70 p-4">
					<div class="text-xs font-medium text-muted-foreground">Input / Ring</div>

					<label class="mt-3 block space-y-2 text-xs">
						<span class="text-muted-foreground">라벨 텍스트</span>
						<input
							class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:(border-primary ring-2 ring-ring/30)"
							placeholder="border-input · ring-ring"
						/>
					</label>

					<p class="mt-3 text-xs text-muted-foreground">
						포커스 시 ring 색이 실제로 어떤 느낌인지 확인할 수 있습니다.
					</p>
				</div>

				<div class="space-y-3 rounded-xl border border-border bg-card/70 p-4">
					<div class="text-xs font-medium text-muted-foreground">Border 샘플</div>

					<div class="rounded-lg border border-border px-3 py-2 text-xs">border-border</div>

					<div class="rounded-lg border border-input bg-background px-3 py-2 text-xs">
						border-input
					</div>

					<div
						class="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground"
					>
						다양한 보더 스타일 테스트용 컨테이너
					</div>
				</div>
			</div>
		</section>
	</section>
</div>
