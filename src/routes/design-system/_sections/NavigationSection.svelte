<script lang="ts">
	import {
		DsAccordion,
		DsAccordionContent,
		DsAccordionItem,
		DsAccordionTrigger,
		DsAnchorNav,
		DsAppShell,
		DsBreadcrumb,
		DsButton,
		DsCard,
		DsLinkButton,
		DsNavigationMenu,
		DsPagination,
		DsSideNav,
		DsSidebar,
		DsTabs,
		DsTabsContent,
		DsTabsList,
		DsTabsTrigger,
		DsTreeView,
	} from "$lib/components/design-system";

	let pageNum = $state(5);
	let treeSelectedId = $state<string | null>("docs");
	let treeExpandedIds = $state<string[]>(["docs", "getting-started"]);
	let anchorActive = $state("anchor-intro");

	const navMenuItems = [
		{
			label: "Products",
			sections: [
				{
					title: "Get started",
					links: [
						{
							label: "Overview",
							href: "/products",
							description: "제품 개요 페이지",
							icon: "layout-grid",
						},
						{
							label: "Pricing",
							href: "/pricing",
							description: "요금제/플랜 안내",
							icon: "badge-dollar-sign",
						},
					],
				},
				{
					title: "Use cases",
					links: [
						{
							label: "Compare",
							href: "/compare",
							description: "비교 페이지",
							icon: "columns-2",
						},
						{
							label: "ROI calculator",
							href: "/roi-calculator",
							description: "ROI 계산기",
							icon: "calculator",
						},
					],
				},
			],
		},
		{
			label: "Resources",
			sections: [
				{
					title: "Learn",
					links: [
						{
							label: "Docs",
							href: "/docs",
							description: "문서 허브",
							icon: "book-open",
						},
						{
							label: "Resources",
							href: "/resources",
							description: "리소스 목록",
							icon: "layers",
						},
					],
				},
				{
					title: "Community",
					links: [
						{
							label: "Changelog",
							href: "/changelog",
							description: "변경 로그",
							icon: "list-checks",
						},
						{
							label: "Community",
							href: "/community",
							description: "커뮤니티 페이지",
							icon: "users",
						},
					],
				},
			],
		},
		{ label: "Gallery", href: "/gallery" },
	] as const;

	const treeNodes = [
		{
			id: "docs",
			label: "Docs",
			description: "/docs",
			icon: "book-open",
			children: [
				{
					id: "overview",
					label: "Overview",
					description: "/docs",
					icon: "layout-dashboard",
				},
				{
					id: "getting-started",
					label: "Getting started",
					description: "/docs/getting-started",
					icon: "star",
					children: [
						{
							id: "install",
							label: "Install",
							description: "/docs/getting-started#install",
						},
						{
							id: "first-run",
							label: "First run",
							description: "/docs/getting-started#run",
						},
					],
				},
				{ id: "api", label: "API", description: "/docs/api", icon: "brackets" },
			],
		},
		{
			id: "community",
			label: "Community",
			description: "/community",
			icon: "users",
			children: [
				{ id: "posts", label: "Posts", description: "/community" },
				{ id: "showcase", label: "Showcase", description: "/showcase" },
			],
		},
	];

	const sideNavItems = [
		{ id: "overview", label: "Overview", href: "/docs", icon: "layout-dashboard" },
		{ id: "guides", label: "Guides", href: "/docs/guides", icon: "book-open" },
		{ id: "api", label: "API", href: "/docs/api", icon: "brackets" },
		{
			id: "billing",
			label: "Billing",
			href: "/billing",
			icon: "badge-dollar-sign",
		},
		{
			id: "pin",
			label: "Pin sidebar",
			icon: "pin",
			isAction: true,
		},
	] as const;

	const anchorItems = [
		{ id: "anchor-intro", label: "Intro", level: 2 },
		{ id: "anchor-details", label: "Details", level: 2 },
		{ id: "anchor-usage", label: "Usage", level: 2 },
	] as const;
</script>

<section id="ds-navigation" class="space-y-4">
	<h2 class="text-h2 font-semibold">Navigation</h2>
	<DsCard class="space-y-6">
		<div class="space-y-2">
			<div class="text-label text-muted-foreground">NavigationMenu</div>
			<div class="rounded-lg border border-border bg-background p-3">
				<DsNavigationMenu items={navMenuItems} />
			</div>
		</div>

		<div class="space-y-2">
			<div class="text-label text-muted-foreground">Breadcrumb</div>
			<DsBreadcrumb
				items={[
					{ label: "Home", href: "/" },
					{ label: "Docs", href: "/docs" },
					{ label: "API" },
				]}
			/>
		</div>

		<div class="space-y-2">
			<div class="text-label text-muted-foreground">SideNav</div>
			<div class="text-helper text-muted-foreground">
				왼쪽은 기본, 오른쪽은 collapsed 상태(툴팁 노출)입니다.
			</div>
			<div class="grid gap-3 md:grid-cols-2">
				<div class="rounded-lg border border-border bg-surface p-3">
					<DsSideNav items={sideNavItems} />
				</div>
				<div class="rounded-lg border border-border bg-surface p-3">
					<DsSideNav items={sideNavItems} collapsed />
				</div>
			</div>
		</div>

		<div class="space-y-2">
			<div class="text-label text-muted-foreground">AnchorNav</div>
			<div class="text-helper text-muted-foreground">
				labelTag로 제목 태그를 조정할 수 있습니다.
			</div>
			<div class="grid gap-4 md:grid-cols-[240px_1fr]">
				<DsAnchorNav
					items={anchorItems}
					activeId={anchorActive}
					onActiveChange={(id) => (anchorActive = id)}
					sticky={false}
					labelTag="h3"
				/>
				<div class="rounded-lg border border-border bg-surface p-4 space-y-6">
					<section id="anchor-intro" class="space-y-2">
						<h3 class="text-h4 font-semibold">Intro</h3>
						<p class="text-body-secondary text-muted-foreground">
							앵커 네비게이션은 긴 문서를 빠르게 이동할 때 사용합니다.
						</p>
					</section>
					<section id="anchor-details" class="space-y-2">
						<h3 class="text-h4 font-semibold">Details</h3>
						<p class="text-body-secondary text-muted-foreground">
							스크롤 위치에 따라 현재 섹션이 자동으로 강조됩니다.
						</p>
					</section>
					<section id="anchor-usage" class="space-y-2">
						<h3 class="text-h4 font-semibold">Usage</h3>
						<p class="text-body-secondary text-muted-foreground">
							`items` 배열에 섹션 id와 레이블을 전달하세요.
						</p>
					</section>
				</div>
			</div>
		</div>

		<DsTabs>
			<DsTabsList class="w-full justify-start flex-wrap">
				<DsTabsTrigger value="overview">Overview</DsTabsTrigger>
				<DsTabsTrigger value="features">Features</DsTabsTrigger>
				<DsTabsTrigger value="billing">Billing</DsTabsTrigger>
			</DsTabsList>

			<DsTabsContent value="overview">
				<p class="text-body-secondary text-muted-foreground">
					탭 컨텐츠 예시입니다.
				</p>
			</DsTabsContent>
			<DsTabsContent value="features">
				<p class="text-body-secondary text-muted-foreground">
					기능 목록을 탭으로 구성할 수 있습니다.
				</p>
			</DsTabsContent>
			<DsTabsContent value="billing">
				<p class="text-body-secondary text-muted-foreground">
					결제/청구 섹션 예시입니다.
				</p>
			</DsTabsContent>
		</DsTabs>

		<DsAccordion type="single">
			<DsAccordionItem value="q1">
				<DsAccordionTrigger>FAQ 예시 1</DsAccordionTrigger>
				<DsAccordionContent>
					지원/헬프 센터에서 자주 묻는 질문을 구성할 때 사용합니다.
				</DsAccordionContent>
			</DsAccordionItem>
			<DsAccordionItem value="q2">
				<DsAccordionTrigger>FAQ 예시 2</DsAccordionTrigger>
				<DsAccordionContent>
					접근성(키보드 이동, aria-expanded) 기본을 포함합니다.
				</DsAccordionContent>
			</DsAccordionItem>
			<DsAccordionItem value="q3">
				<DsAccordionTrigger>FAQ 예시 3 (모션)</DsAccordionTrigger>
				<DsAccordionContent
					keepMounted={false}
					transitionParams={{ duration: 220 }}
				>
					keepMounted=false일 때 slide 모션이 적용됩니다.
				</DsAccordionContent>
			</DsAccordionItem>
		</DsAccordion>

		<div class="space-y-2">
			<div class="text-label text-muted-foreground">Accordion (disabled)</div>
			<DsAccordion type="single" disabled>
				<DsAccordionItem value="d1">
					<DsAccordionTrigger>Disabled 예시 1</DsAccordionTrigger>
					<DsAccordionContent
						>비활성화 상태에서는 열리지 않습니다.</DsAccordionContent
					>
				</DsAccordionItem>
				<DsAccordionItem value="d2">
					<DsAccordionTrigger>Disabled 예시 2</DsAccordionTrigger>
					<DsAccordionContent>키보드 이동도 비활성화됩니다.</DsAccordionContent>
				</DsAccordionItem>
			</DsAccordion>
		</div>

		<div class="space-y-2">
			<div class="text-label text-muted-foreground">Pagination</div>
			<DsPagination
				page={pageNum}
				pageCount={24}
				onPageChange={(p) => (pageNum = p)}
			/>
		</div>

		<div class="space-y-2">
			<div class="text-label text-muted-foreground">TreeView</div>
			<div class="rounded-lg border border-border bg-background p-3">
				<DsTreeView
					label="Docs tree"
					nodes={treeNodes}
					selectedId={treeSelectedId}
					onSelectedIdChange={(next) => (treeSelectedId = next)}
					expandedIds={treeExpandedIds}
					onExpandedIdsChange={(next) => (treeExpandedIds = next)}
				/>
			</div>
			<div class="text-helper text-muted-foreground">
				selected: {treeSelectedId ?? "(none)"}
			</div>
		</div>

		<div class="space-y-2">
			<div class="text-label text-muted-foreground">AppShell / Sidebar</div>
			<DsAppShell
				title="Dashboard"
				description="좌측 사이드바 + 메인 콘텐츠 패턴"
			>
				{#snippet sidebar()}
					<DsSidebar title="Navigation">
						{#snippet children()}
							<nav aria-label="Dashboard nav" class="grid gap-1">
								<DsLinkButton
									href="/app"
									variant="link"
									intent="secondary"
									class="justify-start"
								>
									Home
								</DsLinkButton>
								<DsLinkButton
									href="/settings/profile"
									variant="link"
									intent="secondary"
									class="justify-start"
								>
									Settings
								</DsLinkButton>
							</nav>
						{/snippet}
					</DsSidebar>
				{/snippet}

				{#snippet actions()}
					<div class="flex items-center gap-2">
						<DsButton size="sm" variant="outline" intent="secondary"
							>Invite</DsButton
						>
						<DsButton size="sm" intent="primary">New</DsButton>
					</div>
				{/snippet}

				{#snippet children()}
					<DsCard>
						<div class="text-body-secondary text-muted-foreground">
							이 영역에 DataTable/Charts/Forms 등을 조합합니다.
						</div>
					</DsCard>
				{/snippet}
			</DsAppShell>
		</div>
	</DsCard>
</section>
