<script lang="ts">
	import { goto } from "$app/navigation";

	import {
		DsButton,
		DsCard,
		DsDropdown,
		DsField,
		DsInput,
		DsLinkButton,
		DsSelect,
		DsTextarea,
		DsTooltip,
	} from "$lib/components/design-system";

	import CodeBlock from "$lib/components/CodeBlock.svelte";

	import { site } from "$lib/constants";
	import * as m from "$lib/paraglide/messages.js";
	import { localizeUrl } from "$lib/paraglide/runtime.js";
	import { toast } from "$lib/stores/toast.svelte";

	let exampleEmail = $state("");
	let exampleEmailInvalid = $derived(
		exampleEmail.length > 0 && !exampleEmail.includes("@"),
	);
	let lastDropdown = $state<string | null>(null);
</script>

<div class="container py-12 space-y-16">
	<!-- Hero Section -->
	<section class="space-y-6 text-center">
		<p class="text-label text-muted-foreground">Design System Showcase</p>
		<h1 class="text-h1 font-semibold">
			{m.meta_site_title({ siteName: site.name })}
		</h1>
		<p class="text-body-secondary text-muted-foreground max-w-2xl mx-auto">
			{m.meta_site_description({ siteDescription: site.description })}
		</p>
		<div class="flex flex-wrap justify-center gap-2">
			<DsButton
				intent="primary"
				onclick={() => goto(localizeUrl("/terms").pathname)}
				>문서/약관 보기</DsButton
			>
			<DsButton
				intent="secondary"
				variant="outline"
				onclick={() =>
					toast.info("Toast 테스트", "디자인 시스템 Toast 컴포넌트입니다!")}
				>Toast 테스트</DsButton
			>
		</div>
	</section>

	<!-- Typography Showcase -->
	<section class="space-y-6">
		<h2 class="text-h2 font-semibold">Typography</h2>
		<p class="text-body-secondary text-muted-foreground">
			폰트 크기 토큰을 용도별로 구분하여 보여줍니다. 우측 상단 <code
				class="text-code">Aa</code
			> 버튼으로 전체 스케일을 조정해보세요.
		</p>

		<DsCard class="space-y-6">
			<!-- 제목 (Headings) -->
			<div class="space-y-3">
				<div class="text-label font-medium text-muted-foreground">
					제목 (Headings)
				</div>
				<div class="space-y-2">
					<div class="flex items-baseline gap-4 flex-wrap">
						<span class="text-h1 font-semibold">H1 제목</span>
						<code class="text-code text-muted-foreground">text-h1 (1.8rem)</code
						>
					</div>
					<div class="flex items-baseline gap-4 flex-wrap">
						<span class="text-h2 font-semibold">H2 제목</span>
						<code class="text-code text-muted-foreground">text-h2 (1.6rem)</code
						>
					</div>
					<div class="flex items-baseline gap-4 flex-wrap">
						<span class="text-h3 font-semibold">H3 제목</span>
						<code class="text-code text-muted-foreground">text-h3 (1.4rem)</code
						>
					</div>
				</div>
			</div>

			<hr class="border-border my-6" />

			<!-- 본문 (Body) -->
			<div class="space-y-3">
				<div class="text-label font-medium text-muted-foreground">
					본문 (Body)
				</div>
				<div class="space-y-2">
					<div class="flex items-baseline gap-4 flex-wrap">
						<span class="text-body">본문 텍스트 Body</span>
						<code class="text-code text-muted-foreground"
							>text-body (1.1rem)</code
						>
					</div>
					<div class="flex items-baseline gap-4 flex-wrap">
						<span class="text-body-secondary text-muted-foreground"
							>보조 본문 Body Secondary</span
						>
						<code class="text-code text-muted-foreground"
							>text-body-secondary (0.95rem)</code
						>
					</div>
				</div>
			</div>

			<hr class="border-border my-6" />

			<!-- UI 텍스트 -->
			<div class="space-y-3">
				<div class="text-label font-medium text-muted-foreground">
					UI 텍스트
				</div>
				<div class="space-y-2">
					<div class="flex items-baseline gap-4 flex-wrap">
						<span class="text-label">라벨 Label</span>
						<code class="text-code text-muted-foreground"
							>text-label (0.85rem)</code
						>
					</div>
					<div class="flex items-baseline gap-4 flex-wrap">
						<span class="text-helper text-muted-foreground">도움말 Helper</span>
						<code class="text-code text-muted-foreground"
							>text-helper (0.75rem)</code
						>
					</div>
					<div class="flex items-baseline gap-4 flex-wrap">
						<span class="text-caption">캡션 Caption</span>
						<code class="text-code text-muted-foreground"
							>text-caption (0.85rem)</code
						>
					</div>
					<div class="flex items-baseline gap-4 flex-wrap">
						<span class="text-menu">메뉴 Menu</span>
						<code class="text-code text-muted-foreground"
							>text-menu (0.85rem)</code
						>
					</div>
				</div>
			</div>

			<hr class="border-border my-6" />

			<!-- 코드 -->
			<div class="space-y-3">
				<div class="text-label font-medium text-muted-foreground">
					코드 (Code)
				</div>
				<div class="space-y-2">
					<div class="flex items-baseline gap-4 flex-wrap">
						<code class="text-code font-mono">const example = "code";</code>
						<span class="text-helper text-muted-foreground"
							>text-code (0.8rem)</span
						>
					</div>
					<div class="flex items-baseline gap-4 flex-wrap">
						<code class="text-inline-code font-mono bg-surface px-1 rounded"
							>inline code</code
						>
						<span class="text-helper text-muted-foreground"
							>text-inline-code (0.85rem)</span
						>
					</div>
				</div>
			</div>
		</DsCard>
	</section>

	<!-- Button Showcase -->
	<section class="space-y-6">
		<h2 class="text-h2 font-semibold">Buttons</h2>
		<p class="text-body-secondary text-muted-foreground">
			Intent(primary, secondary, danger)와 Variant(solid, outline, ghost)를
			조합합니다.
		</p>

		<DsCard class="space-y-6">
			<!-- Primary -->
			<div class="space-y-3">
				<div class="text-label font-medium text-muted-foreground">Primary</div>
				<div class="flex flex-wrap gap-2">
					<DsButton intent="primary">Solid</DsButton>
					<DsButton intent="primary" variant="outline">Outline</DsButton>
					<DsButton intent="primary" variant="ghost">Ghost</DsButton>
					<DsButton intent="primary" disabled>Disabled</DsButton>
					<DsButton intent="primary" loading>Loading</DsButton>
				</div>
			</div>

			<hr class="border-border my-6" />

			<!-- Secondary -->
			<div class="space-y-3">
				<div class="text-label font-medium text-muted-foreground">
					Secondary
				</div>
				<div class="flex flex-wrap gap-2">
					<DsButton intent="secondary">Solid</DsButton>
					<DsButton intent="secondary" variant="outline">Outline</DsButton>
					<DsButton intent="secondary" variant="ghost">Ghost</DsButton>
					<DsButton intent="secondary" disabled>Disabled</DsButton>
				</div>
			</div>

			<hr class="border-border my-6" />

			<!-- Danger -->
			<div class="space-y-3">
				<div class="text-label font-medium text-muted-foreground">Danger</div>
				<div class="flex flex-wrap gap-2">
					<DsButton intent="danger">Solid</DsButton>
					<DsButton intent="danger" variant="outline">Outline</DsButton>
					<DsButton intent="danger" variant="ghost">Ghost</DsButton>
					<DsButton intent="danger" disabled>Disabled</DsButton>
				</div>
			</div>

			<hr class="border-border my-6" />

			<!-- Link Buttons -->
			<div class="space-y-3">
				<div class="text-label font-medium text-muted-foreground">
					Link Buttons
				</div>
				<div class="flex flex-wrap gap-2">
					<DsLinkButton href={localizeUrl("/").href} intent="primary"
						>Internal Link</DsLinkButton
					>
					<DsLinkButton
						href="https://example.com"
						intent="secondary"
						variant="outline">External Link</DsLinkButton
					>
				</div>
			</div>
		</DsCard>
	</section>

	<!-- Form Components -->
	<section class="space-y-6">
		<h2 class="text-h2 font-semibold">Form Components</h2>
		<p class="text-body-secondary text-muted-foreground">
			Input, Select, Textarea 등 폼 컴포넌트와 Field 패턴을 보여줍니다.
		</p>

		<div class="grid gap-6 md:grid-cols-2">
			<DsCard>
				<div class="space-y-4">
					<h3 class="text-h3 font-medium">Input & Field</h3>
					<form class="space-y-4" onsubmit={(e) => e.preventDefault()}>
						<DsField
							id="showcase-email"
							label="이메일"
							helpText="유효성 검사가 적용됩니다."
							required
							invalid={exampleEmailInvalid}
							errorText="이메일 형식이 아닙니다."
						>
							{#snippet children(p)}
								<DsInput
									id={p.id}
									type="email"
									placeholder="you@example.com"
									required={p.required}
									aria-describedby={p["aria-describedby"]}
									invalid={p.invalid}
									bind:value={exampleEmail}
								/>
							{/snippet}
						</DsField>

						<DsField id="showcase-password" label="비밀번호">
							{#snippet children(p)}
								<DsInput id={p.id} type="password" placeholder="••••••••" />
							{/snippet}
						</DsField>

						<div class="flex gap-2">
							<DsButton intent="primary" type="submit">제출</DsButton>
							<DsButton
								intent="secondary"
								variant="outline"
								type="button"
								onclick={() => (exampleEmail = "")}>초기화</DsButton
							>
						</div>
					</form>
				</div>
			</DsCard>

			<DsCard>
				<div class="space-y-4">
					<h3 class="text-h3 font-medium">Select & Textarea</h3>
					<div class="space-y-4">
						<DsField id="showcase-select" label="카테고리 선택">
							{#snippet children(p)}
								<DsSelect
									id={p.id}
									placeholder="선택하세요"
									options={[
										{ value: "design", label: "디자인" },
										{ value: "development", label: "개발" },
										{ value: "marketing", label: "마케팅" },
									]}
								/>
							{/snippet}
						</DsField>

						<DsField
							id="showcase-textarea"
							label="메시지"
							helpText="최대 500자까지 입력 가능합니다."
						>
							{#snippet children(p)}
								<DsTextarea
									id={p.id}
									placeholder="메시지를 입력하세요..."
									rows={3}
								/>
							{/snippet}
						</DsField>
					</div>
				</div>
			</DsCard>
		</div>
	</section>

	<!-- Interactive Components -->
	<section class="space-y-6">
		<h2 class="text-h2 font-semibold">Interactive Components</h2>
		<p class="text-body-secondary text-muted-foreground">
			Dropdown, Tooltip 등 상호작용 컴포넌트를 보여줍니다.
		</p>

		<DsCard class="space-y-4">
			<div class="flex flex-wrap items-center gap-4">
				<DsDropdown
					label="메뉴 열기"
					items={[
						{ id: "profile", label: "프로필" },
						{ id: "settings", label: "설정" },
						{ id: "logout", label: "로그아웃" },
					]}
					onSelect={(id) => (lastDropdown = id)}
				/>

				<DsTooltip
					content="Tooltip 내용입니다. Hover 또는 포커스로 표시됩니다."
				>
					{#snippet children(p)}
						<DsButton
							intent="secondary"
							variant="outline"
							aria-describedby={p["aria-describedby"]}>Tooltip 버튼</DsButton
						>
					{/snippet}
				</DsTooltip>

				{#if lastDropdown}
					<span class="text-helper text-muted-foreground">
						선택: <code class="text-code">{lastDropdown}</code>
					</span>
				{/if}
			</div>
		</DsCard>
	</section>

	<!-- Card Variants -->
	<section class="space-y-6">
		<h2 class="text-h2 font-semibold">Cards</h2>
		<p class="text-body-secondary text-muted-foreground">
			다양한 패딩과 모션 옵션을 가진 카드 컴포넌트입니다.
		</p>

		<div class="grid gap-4 md:grid-cols-3">
			<DsCard class="space-y-2">
				<div class="text-label font-medium">기본 카드</div>
				<p class="text-body-secondary text-muted-foreground">
					기본 패딩(md)이 적용된 카드입니다.
				</p>
			</DsCard>
			<DsCard padding="lg" class="space-y-2">
				<div class="text-label font-medium">Large 패딩</div>
				<p class="text-body-secondary text-muted-foreground">
					더 넓은 여백의 카드입니다.
				</p>
			</DsCard>
			<DsCard padding="sm" motion class="space-y-2">
				<div class="text-label font-medium">Motion 카드</div>
				<p class="text-body-secondary text-muted-foreground">
					hover 시 살짝 올라오는 효과가 있습니다.
				</p>
			</DsCard>
		</div>
	</section>

	<!-- Blog Post Preview -->
	<section
		class="space-y-8 max-w-3xl mx-auto py-12 border-t border-border mt-12"
	>
		<div class="space-y-4 text-center">
			<div class="text-label text-primary">Technical Blog</div>
			<h1 class="text-h1 font-bold">Svelte 5 Runes: 상태 관리의 진화</h1>
			<div
				class="flex items-center justify-center gap-2 text-body-secondary text-muted-foreground"
			>
				<span>ZeroCho</span>
				<span>•</span>
				<time datetime="2025-12-16">2025년 12월 16일</time>
				<span>•</span>
				<span>5 min read</span>
			</div>
		</div>

		<article class="prose prose-neutral dark:prose-invert max-w-none space-y-6">
			<p class="text-body leading-relaxed">
				Svelte 5가 정식 출시되었습니다. 이번 업데이트의 핵심은 단연 <strong
					>Runes</strong
				>입니다. 기존의 <code>let</code> 선언과 스토어 기반 방식을 넘어, 더욱 명시적이고
				세련된 반응형 시스템을 제공합니다. 이제 컴파일러 마법 대신 런타임 신호(Signals)를
				사용하여 예측 가능한 상태 관리가 가능해졌습니다.
			</p>

			<h2 class="text-h2 font-semibold mt-8 mb-4">왜 Runes인가?</h2>
			<p class="text-body leading-relaxed">
				기존 Svelte 3/4의 반응성 시스템은 파일 최상위 레벨에서만 동작하는 한계가
				있었습니다. 함수 내부나 중첩된 객체에서의 반응성을 처리하려면 스토어를
				사용하거나 복잡한 우회로를 선택해야 했죠. <code
					class="text-inline-code bg-muted px-1 rounded">$state()</code
				> 룬은 이 모든 제약을 해결합니다.
			</p>

			<div class="my-6 not-prose">
				<CodeBlock
					language="svelte"
					code={`<script>
  let count = $state(0);
  let double = $derived(count * 2);

  function increment() {
    count += 1;
  }
</` +
						`script>

<button onclick={increment}>
  Clicks: {count} (Double: {double})
</button>`}
				/>
			</div>

			<p class="text-body leading-relaxed">
				위 코드에서 볼 수 있듯이, <code>$state</code>와 <code>$derived</code>를
				사용하면 의존성 추적이 자동으로 이루어집니다. <code>$:</code> 구문보다 훨씬
				직관적이죠. 특히 클래스나 외부 파일에서도 상태를 정의하고 공유하기가 매우
				쉬워졌습니다.
			</p>

			<blockquote
				class="border-l-4 border-primary pl-4 italic text-body-secondary my-6"
			>
				"Svelte 5는 단순한 버전 업그레이드가 아닙니다. 프레임워크의 패러다임
				전환입니다."
			</blockquote>
		</article>

		<!-- Comments Section Example -->
		<div class="space-y-6 pt-12 border-t border-border">
			<h3 class="text-h3 font-semibold">
				댓글 <span class="text-muted-foreground font-normal">(3)</span>
			</h3>

			<div class="space-y-6">
				<!-- Comment 1 -->
				<div class="flex gap-4">
					<div
						class="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0"
					>
						<span class="font-bold text-muted-foreground">HS</span>
					</div>
					<div class="space-y-2 flex-1">
						<div class="flex items-baseline justify-between">
							<span class="font-semibold text-body-secondary">Hoseok Lee</span>
							<span class="text-caption text-muted-foreground">2시간 전</span>
						</div>
						<p class="text-body-secondary">
							확실히 $effect 룬을 쓰니까 라이프사이클 관리가 훨씬 편해졌네요.
							이전 onMount랑 비교해도 직관적이고요.
						</p>
						<div class="flex gap-4 text-caption text-muted-foreground">
							<button class="hover:text-foreground">좋아요</button>
							<button class="hover:text-foreground">답글 달기</button>
						</div>
					</div>
				</div>

				<!-- Comment 2 (Reply) -->
				<div class="flex gap-4 pl-14">
					<div
						class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0"
					>
						<span class="text-xs font-bold text-primary">ZC</span>
					</div>
					<div class="space-y-2 flex-1">
						<div class="flex items-baseline justify-between">
							<span class="font-semibold text-body-secondary">ZeroCho</span>
							<span class="text-caption text-muted-foreground">1시간 전</span>
						</div>
						<p class="text-body-secondary">
							맞습니다! 특히 클린업 함수를 바로 리턴할 수 있어서 useEffect랑
							비슷하면서도 더 깔끔하죠.
						</p>
						<div class="flex gap-4 text-caption text-muted-foreground">
							<button class="hover:text-foreground">좋아요 1</button>
							<button class="hover:text-foreground">답글 달기</button>
						</div>
					</div>
				</div>

				<!-- Comment 3 -->
				<div class="flex gap-4">
					<div
						class="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0"
					>
						<span class="font-bold text-muted-foreground">MN</span>
					</div>
					<div class="space-y-2 flex-1">
						<div class="flex items-baseline justify-between">
							<span class="font-semibold text-body-secondary">Mina Kim</span>
							<span class="text-caption text-muted-foreground">방금 전</span>
						</div>
						<p class="text-body-secondary">
							마이그레이션 가이드도 잘 되어 있어서 기존 프로젝트 전환하는데 큰
							무리는 없더라고요. 좋은 글 감사합니다!
						</p>
						<div class="flex gap-4 text-caption text-muted-foreground">
							<button class="hover:text-foreground">좋아요</button>
							<button class="hover:text-foreground">답글 달기</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</div>
