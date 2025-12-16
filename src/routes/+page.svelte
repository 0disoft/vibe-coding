<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";

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

	const typographyTokenKeys = [
		"h1",
		"h2",
		"h3",
		"h4",
		"body",
		"body-secondary",
		"comment",
		"prose",
		"menu-lg",
		"menu",
		"menu-sm",
		"btn-lg",
		"btn",
		"btn-sm",
		"label",
		"placeholder",
		"helper",
		"caption",
		"xs-resp",
		"badge",
		"tag",
		"tooltip",
		"toast",
		"breadcrumb",
		"logo",
		"brand",
		"stat",
		"price",
		"timestamp",
		"code",
		"inline-code",
	] as const;

	type TypographyTokenKey = (typeof typographyTokenKeys)[number];

	let typographyTokenValues = $state<Record<TypographyTokenKey, string>>(
		Object.fromEntries(typographyTokenKeys.map((k) => [k, "—"])) as Record<
			TypographyTokenKey,
			string
		>,
	);

	function readTypographyTokens() {
		const style = getComputedStyle(document.documentElement);
		const next = {} as Record<TypographyTokenKey, string>;

		for (const key of typographyTokenKeys) {
			const cssVar = `--font-size-${key}`;
			next[key] = style.getPropertyValue(cssVar).trim() || "—";
		}

		typographyTokenValues = next;
	}

	function t(key: TypographyTokenKey) {
		return typographyTokenValues[key] ?? "—";
	}

	onMount(() => {
		readTypographyTokens();

		const observer = new MutationObserver(() => {
			readTypographyTokens();
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["data-theme", "data-font-size"],
		});

		return () => observer.disconnect();
	});
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
		<h2 class="text-h2 font-semibold">Typography System</h2>
		<p class="text-body-secondary text-muted-foreground">
			디자인 시스템에 정의된 모든 타이포그래피 토큰입니다. 우측 상단 <code
				class="text-code">Aa</code
			> 버튼으로 전체 스케일을 조정하며 검증하세요. (Values from SSOT)
		</p>

		<DsCard class="space-y-8">
			<!-- 1. Headings -->
			<div class="space-y-3">
				<div
					class="text-label font-medium text-muted-foreground border-b border-border pb-1 mb-2"
				>
					Headings (제목)
				</div>
				<div class="space-y-2">
					<div class="flex items-baseline gap-4 flex-wrap">
							<span class="text-h1 font-semibold">H1 Heading</span>
							<code class="text-code text-muted-foreground"
								>text-h1 ({t("h1")})</code
							>
						</div>
						<div class="flex items-baseline gap-4 flex-wrap">
							<span class="text-h2 font-semibold">H2 Heading</span>
							<code class="text-code text-muted-foreground"
								>text-h2 ({t("h2")})</code
							>
						</div>
						<div class="flex items-baseline gap-4 flex-wrap">
							<span class="text-h3 font-semibold">H3 Heading</span>
							<code class="text-code text-muted-foreground"
								>text-h3 ({t("h3")})</code
							>
						</div>
						<div class="flex items-baseline gap-4 flex-wrap">
							<span class="text-h4 font-semibold">H4 Heading</span>
							<code class="text-code text-muted-foreground"
								>text-h4 ({t("h4")})</code
							>
						</div>
				</div>
			</div>

			<!-- 2. Body -->
			<div class="space-y-3">
				<div
					class="text-label font-medium text-muted-foreground border-b border-border pb-1 mb-2"
				>
					Body (본문)
				</div>
				<div class="space-y-2">
					<div class="flex items-baseline gap-4 flex-wrap">
							<span class="text-body">Body Text (Default)</span>
							<code class="text-code text-muted-foreground"
								>text-body ({t("body")})</code
							>
						</div>
					<div class="flex items-baseline gap-4 flex-wrap">
						<span class="text-body-secondary text-muted-foreground"
							>Body Secondary</span
						>
							<code class="text-code text-muted-foreground"
								>text-body-secondary ({t("body-secondary")})</code
							>
						</div>
					<div class="flex items-baseline gap-4 flex-wrap">
							<span class="text-comment">Comment Text</span>
							<code class="text-code text-muted-foreground"
								>text-comment ({t("comment")})</code
							>
						</div>
					<div class="flex items-baseline gap-4 flex-wrap">
						<div class="prose max-w-none">
							<p>Prose Paragraph (Markdown content)</p>
							</div>
							<code class="text-code text-muted-foreground"
								>.prose p ({t("prose")})</code
							>
						</div>
				</div>
			</div>

			<!-- 3. UI & Actions -->
			<div class="space-y-3">
				<div
					class="text-label font-medium text-muted-foreground border-b border-border pb-1 mb-2"
				>
					UI Elements & Actions
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
					<!-- Menu -->
					<div class="space-y-2">
						<div class="flex items-baseline justify-between">
								<span class="text-menu-lg">Menu Large</span>
								<code class="text-code text-muted-foreground"
									>text-menu-lg ({t("menu-lg")})</code
								>
							</div>
						<div class="flex items-baseline justify-between">
								<span class="text-menu">Menu Default</span>
								<code class="text-code text-muted-foreground"
									>text-menu ({t("menu")})</code
								>
							</div>
						<div class="flex items-baseline justify-between">
								<span class="text-menu-sm">Menu Small</span>
								<code class="text-code text-muted-foreground"
									>text-menu-sm ({t("menu-sm")})</code
								>
							</div>
					</div>

					<!-- Buttons -->
					<div class="space-y-2">
						<div class="flex items-baseline justify-between">
								<span class="text-btn-lg font-medium">Button Large</span>
								<code class="text-code text-muted-foreground"
									>text-btn-lg ({t("btn-lg")})</code
								>
							</div>
						<div class="flex items-baseline justify-between">
								<span class="text-btn font-medium">Button Default</span>
								<code class="text-code text-muted-foreground"
									>text-btn ({t("btn")})</code
								>
							</div>
						<div class="flex items-baseline justify-between">
								<span class="text-btn-sm font-medium">Button Small</span>
								<code class="text-code text-muted-foreground"
									>text-btn-sm ({t("btn-sm")})</code
								>
							</div>
					</div>

					<!-- Form -->
					<div class="space-y-2">
						<div class="flex items-baseline justify-between">
								<span class="text-label">Input Label</span>
								<code class="text-code text-muted-foreground"
									>text-label ({t("label")})</code
								>
							</div>
						<div class="flex items-baseline justify-between">
							<span class="text-placeholder text-muted-foreground"
								>Placeholder</span
							>
								<code class="text-code text-muted-foreground"
									>text-placeholder ({t("placeholder")})</code
								>
							</div>
						<div class="flex items-baseline justify-between">
								<span class="text-helper text-muted-foreground">Helper Text</span>
								<code class="text-code text-muted-foreground"
									>text-helper ({t("helper")})</code
								>
							</div>
						<div class="flex items-baseline justify-between">
								<span class="text-caption text-muted-foreground">Caption</span>
								<code class="text-code text-muted-foreground"
									>text-caption ({t("caption")})</code
								>
							</div>
					</div>

					<!-- Small & Responsive -->
					<div class="space-y-2">
						<div class="flex items-baseline justify-between">
								<span class="text-xs-resp">XS Responsive (Footer)</span>
								<code class="text-code text-muted-foreground"
									>text-xs-resp ({t("xs-resp")})</code
								>
							</div>
					</div>
				</div>
			</div>

			<!-- 4. Components -->
			<div class="space-y-3">
				<div
					class="text-label font-medium text-muted-foreground border-b border-border pb-1 mb-2"
				>
					Components
				</div>
				<div class="flex flex-wrap gap-4 items-center">
					<div class="flex flex-col gap-1">
						<span
							class="bg-primary text-primary-foreground px-2 py-0.5 rounded text-badge"
							>Badge</span
						>
							<code class="text-code text-muted-foreground text-xs"
								>text-badge ({t("badge")})</code
							>
						</div>
					<div class="flex flex-col gap-1">
						<span
							class="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-tag"
							>Tag</span
						>
							<code class="text-code text-muted-foreground text-xs"
								>text-tag ({t("tag")})</code
							>
						</div>
					<div class="flex flex-col gap-1">
						<span
							class="bg-overlay text-neutral-50 px-2 py-1 rounded text-tooltip"
							>Tooltip Text</span
						>
							<code class="text-code text-muted-foreground text-xs"
								>text-tooltip ({t("tooltip")})</code
							>
						</div>
					<div class="flex flex-col gap-1">
						<span
							class="bg-surface border border-border px-3 py-1 rounded shadow-sm text-toast"
							>Toast Message</span
						>
							<code class="text-code text-muted-foreground text-xs"
								>text-toast ({t("toast")})</code
							>
						</div>
					<div class="flex flex-col gap-1">
						<span class="text-breadcrumb text-muted-foreground"
							>Home / Library / Data</span
						>
							<code class="text-code text-muted-foreground text-xs"
								>text-breadcrumb ({t("breadcrumb")})</code
							>
						</div>
				</div>
			</div>

			<!-- 5. Data & Brand -->
			<div class="space-y-3">
				<div
					class="text-label font-medium text-muted-foreground border-b border-border pb-1 mb-2"
				>
					Data & Brand
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div class="space-y-2">
						<div class="flex items-baseline justify-between">
								<span class="text-logo font-bold">LogoType</span>
								<code class="text-code text-muted-foreground"
									>text-logo ({t("logo")})</code
								>
							</div>
						<div class="flex items-baseline justify-between">
							<span class="text-brand font-semibold text-primary"
								>Brand Text</span
							>
								<code class="text-code text-muted-foreground"
									>text-brand ({t("brand")})</code
								>
							</div>
					</div>
					<div class="space-y-2">
						<div class="flex items-baseline justify-between">
								<span class="text-stat font-bold">12,345</span>
								<code class="text-code text-muted-foreground"
									>text-stat ({t("stat")})</code
								>
							</div>
						<div class="flex items-baseline justify-between">
								<span class="text-price font-medium">$99.00</span>
								<code class="text-code text-muted-foreground"
									>text-price ({t("price")})</code
								>
							</div>
						<div class="flex items-baseline justify-between">
							<span class="text-timestamp text-muted-foreground"
								>2025-12-16 14:00</span
							>
								<code class="text-code text-muted-foreground"
									>text-timestamp ({t("timestamp")})</code
								>
							</div>
					</div>
				</div>
			</div>

			<!-- 6. Code -->
			<div class="space-y-3">
				<div
					class="text-label font-medium text-muted-foreground border-b border-border pb-1 mb-2"
				>
					Code
				</div>
				<div class="space-y-2">
					<div class="flex items-baseline gap-4 flex-wrap">
						<code class="text-code font-mono">const x = 1; // Block Code</code>
							<span class="text-helper text-muted-foreground"
								>text-code ({t("code")})</span
							>
						</div>
					<div class="flex items-baseline gap-4 flex-wrap">
						<span class="text-body"
							>Press <code
								class="text-inline-code font-mono bg-surface px-1 rounded"
								>Ctrl+C</code
							> to copy</span
						>
							<span class="text-helper text-muted-foreground"
								>text-inline-code ({t("inline-code")})</span
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

			<h3 class="text-h3 font-semibold mt-8 mb-4">
				주요 변경 사항 (Typography Test)
			</h3>
			<ul class="list-disc pl-6 space-y-2 text-body">
				<li>
					<strong>일관된 폰트 크기:</strong> 본문과 마크다운 영역의 폰트 크기가
					<code>1.05rem</code>으로 통일되었습니다.
				</li>
				<li>
					<strong>리스트 스타일 복구:</strong> UnoCSS Reset으로 사라졌던 리스트
					불릿과 여백이 <code>.prose</code> 영역에 다시 적용됩니다.
				</li>
				<li>
					<strong>H4 태그 지원:</strong> 디자인 시스템에 <code>H4</code> 계층이 추가되었습니다.
				</li>
			</ul>

			<h3 class="text-h3 font-semibold mt-8 mb-4">마이그레이션 단계</h3>
			<ol class="list-decimal pl-6 space-y-2 text-body">
				<li>기존 Svelte 4 프로젝트를 최신 버전으로 업데이트</li>
				<li><code>svelte-migrate</code> 도구를 사용하여 문법 자동 변환</li>
				<li>컴포넌트별로 점진적인 Runes 문법 적용</li>
			</ol>

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

				<blockquote>
					<p>
						"Svelte 5는 단순한 버전 업그레이드가 아닙니다. 프레임워크의 패러다임 전환입니다."
					</p>
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
