<script lang="ts">
	import CodeBlock from "$lib/components/CodeBlock.svelte";
	import {
		DsAccordion,
		DsAccordionContent,
		DsAccordionItem,
		DsAccordionTrigger,
		DsAlert,
		DsAvatar,
		DsAppShell,
		DsBadge,
		DsBreadcrumb,
		DsButton,
		DsCard,
		DsKpi,
		DsStatCard,
		DsCheckbox,
		DsCommandPalette,
		DsCombobox,
		DsDataTable,
		DsDateRangePicker,
		DsCalendar,
		DsDatePicker,
		DsTimePicker,
		DsFileUpload,
		DsDialog,
		DsDrawer,
		DsDropdown,
		DsDropdownItem,
		DsEmptyState,
		DsField,
		DsIcon,
		DsIconButton,
		DsInlineIcon,
		DsInput,
		DsLinkButton,
		DsOtpInput,
		DsPagination,
		DsPasswordInput,
		DsPopover,
		DsProgress,
		DsRadioGroup,
		DsRadioItem,
		DsSelect,
		DsSeparator,
		DsSidebar,
		DsSheet,
		DsSkeleton,
		DsSpinner,
		DsSwitch,
		DsTag,
		DsTabs,
		DsTabsContent,
		DsTabsList,
		DsTabsTrigger,
		DsTextarea,
		DsToastRegion,
		DsSearchPanel,
		DsTableToolbar,
		DsTooltip,
		DsTimeline,
		DsRating,
		DsPricingTable,
	} from "$lib/components/design-system";

	import ApiEndpointCard from "$lib/components/docs/ApiEndpointCard.svelte";
	import DocsAnchoredHeading from "$lib/components/docs/DocsAnchoredHeading.svelte";
	import DocsCallout from "$lib/components/docs/DocsCallout.svelte";
	import DocsCodeTabs from "$lib/components/docs/DocsCodeTabs.svelte";
	import DocsKbd from "$lib/components/docs/DocsKbd.svelte";
	import DocsLayout from "$lib/components/docs/DocsLayout.svelte";
	import DocsPrevNext from "$lib/components/docs/DocsPrevNext.svelte";
	import DocsProse from "$lib/components/docs/DocsProse.svelte";
	import DocsSearchResults from "$lib/components/docs/DocsSearchResults.svelte";
	import DocsSidebarNav from "$lib/components/docs/DocsSidebarNav.svelte";
	import DocsSteps from "$lib/components/docs/DocsSteps.svelte";
	import DocsToc from "$lib/components/docs/DocsToc.svelte";

	import { pages as pageRegistry } from "$lib/constants";
	import { localizeUrl } from "$lib/paraglide/runtime.js";

	import { toast } from "$lib/stores/toast.svelte";
	import type { ToastIntent, ToastItem } from "$lib/stores/toast.svelte";
	import { onMount } from "svelte";

	let dialogOpen = $state(false);
	let dropdownSelected = $state<string | null>(null);
	let popoverCount = $state(0);

	let inputValue = $state("");
	let textareaValue = $state("");
	let newsletter = $state(false);
	let plan = $state("pro");
	let otp = $state("");
	let pageNum = $state(5);
	let range = $state({ start: "", end: "" });
	let singleDate = $state<string | null>("2025-01-15");
	let timeValue = $state<string | null>("09:30");
	let assignee = $state("u2");
	let sheetOpen = $state(false);
	let drawerOpen = $state(false);
	let commandOpen = $state(false);
	let rating = $state(4);
	let searchQuery = $state("");
	let searchSelected = $state<string | null>(null);

	let coverageQuery = $state("");

	const dsCoverage = [
		{
			id: "ds-buttons",
			title: "Buttons & Icons",
			items: ["DsButton", "DsIconButton", "DsLinkButton", "DsBadge", "DsIcon", "DsInlineIcon"],
		},
		{ id: "ds-separator", title: "Separator", items: ["DsSeparator"] },
		{
			id: "ds-forms",
			title: "Forms",
			items: [
				"DsField",
				"DsInput",
				"DsTextarea",
				"DsPasswordInput",
				"DsOtpInput",
				"DsCheckbox",
				"DsSwitch",
				"DsRadioGroup",
				"DsRadioItem",
				"DsSelect",
				"DsCombobox",
				"DsDateRangePicker",
				"DsCalendar",
				"DsDatePicker",
				"DsTimePicker",
				"DsFileUpload",
				"DsTag",
			],
		},
		{
			id: "ds-overlays",
			title: "Overlays",
			items: [
				"DsDropdown",
				"DsDropdownItem",
				"DsPopover",
				"DsDialog",
				"DsSheet",
				"DsDrawer",
				"DsCommandPalette",
				"DsTooltip",
				"DsSkeleton",
				"DsEmptyState",
			],
		},
		{
			id: "ds-navigation",
			title: "Navigation",
			items: [
				"DsBreadcrumb",
				"DsTabs",
				"DsTabsList",
				"DsTabsTrigger",
				"DsTabsContent",
				"DsPagination",
				"DsSidebar",
				"DsAppShell",
			],
		},
		{
			id: "ds-data",
			title: "Data",
			items: ["DsDataTable", "DsTableToolbar", "DsSearchPanel", "DsKpi", "DsStatCard", "DsProgress"],
		},
		{
			id: "ds-feedback",
			title: "Feedback",
			items: ["DsAlert", "DsSpinner", "DsAvatar", "DsToastRegion"],
		},
		{
			id: "ds-advanced",
			title: "Advanced",
			items: [
				"DsAccordion",
				"DsAccordionItem",
				"DsAccordionTrigger",
				"DsAccordionContent",
				"DsTimeline",
				"DsRating",
				"DsPricingTable",
			],
		},
	] as const;

	const searchItems = pageRegistry
		.filter((p) => p.path !== "/")
		.map((p) => ({
			id: p.id,
			title: p.title,
			description: p.description ?? `Group: ${p.group}`,
			meta: p.path,
			keywords: [p.group, p.path],
			disabled: p.path.includes("["),
		}));

	const docsCoverage = [
		"DocsCallout",
		"DocsSteps",
		"DocsToc",
		"DocsCodeTabs",
		"ApiEndpointCard",
		"DocsKbd",
		"DocsSearchResults",
		"DocsLayout",
		"DocsProse",
		"DocsAnchoredHeading",
		"DocsSidebarNav",
		"DocsPrevNext",
	] as const;

	type ToastDemoPosition =
		| "top-left"
		| "top-right"
		| "top-center"
		| "bottom-left"
		| "bottom-right"
		| "bottom-center";

	const toastDemoPositions = [
		"top-left",
		"top-right",
		"top-center",
		"bottom-left",
		"bottom-right",
		"bottom-center",
	] as const satisfies ReadonlyArray<ToastDemoPosition>;

	let toastDemoPosition = $state<ToastDemoPosition>("top-center");
	let toastDemoToasts = $state<ToastItem[]>([]);

	let activeSectionId = $state<string>("pages");

	function addToastDemo(intent: ToastIntent) {
		const id = crypto.randomUUID();
		toastDemoToasts = [
			...toastDemoToasts.slice(-4),
			{
				id,
				intent,
				title: `Demo: ${intent}`,
				message: "이 토스트는 /design-system 데모용(로컬)입니다.",
				duration: Infinity,
			},
		];
	}

	function dismissToastDemo(id: string) {
		toastDemoToasts = toastDemoToasts.filter((t) => t.id !== id);
	}

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

	onMount(() => {
		const ids: string[] = tocItems.map((i) => i.id);

		function updateFromHash() {
			const hash = window.location.hash.replace(/^#/, "");
			if (hash && ids.includes(hash)) activeSectionId = hash;
		}

		updateFromHash();
		window.addEventListener("hashchange", updateFromHash);

		const targets = ids
			.map((id) => document.getElementById(id))
			.filter((el): el is HTMLElement => !!el);

		const io = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

				const top = visible[0]?.target as HTMLElement | undefined;
				if (top?.id) activeSectionId = top.id;
			},
			{
				root: null,
				rootMargin: "-20% 0px -70% 0px",
				threshold: [0, 0.1],
			},
		);

		for (const t of targets) io.observe(t);

		return () => {
			io.disconnect();
			window.removeEventListener("hashchange", updateFromHash);
		};
	});

	const tocItems = [
		{ id: "pages", label: "Pages", level: 2 },
		{ id: "tokens", label: "Tokens", level: 2 },
		{ id: "coverage", label: "Coverage", level: 2 },
		{ id: "ds-buttons", label: "Buttons", level: 2 },
		{ id: "ds-separator", label: "Separator", level: 2 },
		{ id: "ds-forms", label: "Forms", level: 2 },
		{ id: "ds-overlays", label: "Overlays", level: 2 },
		{ id: "ds-navigation", label: "Navigation", level: 2 },
		{ id: "ds-data", label: "Data", level: 2 },
		{ id: "ds-feedback", label: "Feedback", level: 2 },
		{ id: "ds-advanced", label: "Advanced", level: 2 },
		{ id: "docs", label: "Docs Components", level: 2 },
	] as const;

	const docsDemoToc = [
		{ id: "docs-intro", label: "Intro", level: 2 },
		{ id: "docs-install", label: "Install", level: 2 },
		{ id: "docs-next", label: "Next", level: 2 },
	] as const;

	const docsNavItems = [
		{ href: "/docs", label: "Overview" },
		{
			href: "/docs/getting-started",
			label: "Getting started",
			items: [
				{ href: "/docs/onboarding-checklist", label: "Onboarding checklist" },
				{ href: "/docs/api", label: "API" },
			],
		},
		{ href: "/docs/guides", label: "Guides" },
	] as const;

	function applyRef(node: HTMLElement, refFn: (node: HTMLElement) => void) {
		refFn(node);
		return {
			update(next: (node: HTMLElement) => void) {
				next(node);
			},
		};
	}
</script>

<div class="grid gap-6 lg:grid-cols-[1fr_280px]">
	<div class="min-w-0 space-y-10">
		<section id="pages" class="space-y-4">
			<h2 class="text-h2 font-semibold">Pages</h2>
			<DsCard class="space-y-4">
				<p class="text-body-secondary text-muted-foreground">
					요청된 페이지 스캐폴딩을 한 번에 확인할 수 있는 링크 목록입니다.
				</p>
				<DsDataTable
					columns={[
						{ id: "title", header: "Page", sortable: true },
						{ id: "group", header: "Group", sortable: true },
						{ id: "path", header: "Path", sortable: true },
					]}
					rows={pageRegistry.filter((p) => p.path !== "/")}
					getValue={(row, id) => row?.[id]}
				>
					{#snippet cell({ row, columnId, value })}
						{#if columnId === "title"}
							<DsLinkButton
								size="sm"
								variant="link"
								intent="secondary"
								href={localizeUrl(row.path).href}
							>
								{value as any}
							</DsLinkButton>
						{:else if columnId === "path"}
							<code class="text-code">{value as any}</code>
						{:else}
							{value as any}
						{/if}
					{/snippet}
				</DsDataTable>
			</DsCard>
		</section>

		<section id="tokens" class="space-y-4">
			<h2 class="text-h2 font-semibold">Tokens</h2>
			<DsCard class="space-y-4">
				<p class="text-body-secondary text-muted-foreground">
					타이포그래피 토큰(`--font-size-*`)과 DS 클래스(`text-*`)를 한 번에 확인합니다.
				</p>
				<DsDataTable
					columns={[
						{ id: "token", header: "Token", sortable: true },
						{ id: "value", header: "Value", sortable: true },
						{ id: "sample", header: "Sample", sortable: false },
					]}
					rows={typographyTokenKeys.map((k) => ({ token: k, value: t(k) }))}
					getValue={(row, id) => row?.[id]}
				>
					{#snippet cell({ row, columnId, value })}
						{#if columnId === "token"}
							<code class="text-code">text-{value as any}</code>
						{:else if columnId === "value"}
							<code class="text-code">{value as any}</code>
						{:else}
							<span class={"text-" + (row.token as any)}>Aa Typography</span>
						{/if}
					{/snippet}
				</DsDataTable>
			</DsCard>
		</section>

		<section id="coverage" class="space-y-4">
			<h2 class="text-h2 font-semibold">Coverage</h2>
			<DsCard class="space-y-4">
				<p class="text-body-secondary text-muted-foreground">
					이 페이지(`/design-system`)에 노출된 DS/Docs 컴포넌트 체크리스트입니다.
				</p>
				<div class="max-w-sm">
					<DsField label="Filter" helpText="컴포넌트 이름으로 필터링">
						{#snippet children(control)}
							<DsInput
								id={control.id}
								aria-describedby={control["aria-describedby"]}
								placeholder="예: DsDatePicker, DocsToc"
								clearable
								bind:value={coverageQuery}
							/>
						{/snippet}
					</DsField>
				</div>

				<div class="grid gap-6 lg:grid-cols-2">
					<div class="space-y-4">
						<div class="text-label font-semibold text-foreground">Design System</div>
						{#each dsCoverage as group (group.id)}
							<div class="rounded-lg border border-border bg-surface p-4">
								<div class="flex items-center justify-between gap-2">
									<div class="text-menu-sm font-semibold text-foreground">{group.title}</div>
									<a class="text-helper text-muted-foreground hover:text-foreground" href={"#" + group.id}>
										#{group.id}
									</a>
								</div>
								<div class="mt-3 flex flex-wrap gap-2">
									{#each group.items.filter((n) => n.toLowerCase().includes(coverageQuery.trim().toLowerCase())) as name (name)}
										<span class="rounded-md border border-border bg-background px-2 py-1 text-menu-sm text-foreground">
											{name}
										</span>
									{/each}
								</div>
							</div>
						{/each}
					</div>

					<div class="space-y-4">
						<div class="text-label font-semibold text-foreground">Docs</div>
						<div class="rounded-lg border border-border bg-surface p-4">
							<div class="flex items-center justify-between gap-2">
								<div class="text-menu-sm font-semibold text-foreground">Docs Components</div>
								<a class="text-helper text-muted-foreground hover:text-foreground" href="#docs">#docs</a>
							</div>
							<div class="mt-3 flex flex-wrap gap-2">
								{#each docsCoverage.filter((n) => n.toLowerCase().includes(coverageQuery.trim().toLowerCase())) as name (name)}
									<span class="rounded-md border border-border bg-background px-2 py-1 text-menu-sm text-foreground">
										{name}
									</span>
								{/each}
							</div>
						</div>
					</div>
				</div>
			</DsCard>
		</section>

		<header class="space-y-2">
			<p class="text-label text-muted-foreground">Design System</p>
			<h1 class="text-h1 font-semibold">쇼케이스 (임시)</h1>
			<p class="text-body-secondary text-muted-foreground">
				템플릿 확장 중인 DS/Docs 컴포넌트를 한 페이지에서 검증합니다.
			</p>
			<div class="flex flex-wrap gap-2">
				<DsButton onclick={() => toast.success("성공", "토스트가 표시되어야 합니다.")}>
					Toast
				</DsButton>
				<DsButton variant="outline" intent="secondary" onclick={() => (dialogOpen = true)}>
					Dialog
				</DsButton>
				<DsButton variant="outline" intent="secondary" onclick={() => (commandOpen = true)}>
					Command
				</DsButton>
				<DsButton variant="outline" intent="secondary" onclick={() => (sheetOpen = true)}>
					Sheet
				</DsButton>
				<DsButton variant="outline" intent="secondary" onclick={() => (drawerOpen = true)}>
					Drawer
				</DsButton>
			</div>
		</header>

		<section id="ds-buttons" class="space-y-4">
			<h2 class="text-h2 font-semibold">Buttons</h2>
			<DsCard class="space-y-6">
				<div class="flex flex-wrap gap-2">
					<DsButton intent="primary">Primary</DsButton>
					<DsButton intent="secondary" variant="outline">Secondary</DsButton>
					<DsButton intent="success" variant="solid">Success</DsButton>
					<DsButton intent="warning" variant="solid">Warning</DsButton>
					<DsButton intent="danger" variant="solid">Danger</DsButton>
				</div>
				<div class="flex flex-wrap items-center gap-2">
					<DsIconButton icon="settings" label="Settings" />
					<DsIconButton icon="user" label="User" intent="success" />
					<DsIconButton icon="triangle-alert" label="Warning" intent="warning" />
					<DsBadge intent="primary" variant="soft">Badge</DsBadge>
					<DsBadge intent="success" variant="outline">Verified</DsBadge>
				</div>

				<div class="space-y-2">
					<div class="text-label text-muted-foreground">Icon / InlineIcon</div>
					<div class="flex flex-wrap items-center gap-3">
						<DsIcon name="sparkles" size="sm" />
						<DsIcon name="sparkles" size="md" />
						<DsIcon name="sparkles" size="lg" />
						<DsIcon name="sparkles" size="xl" />
						<DsIcon name="shield-check" size="md" label="Security" />
					</div>
					<div class="flex flex-wrap items-center gap-3">
						<DsInlineIcon name="sparkles">
							{#snippet children()}Inline start{/snippet}
						</DsInlineIcon>
						<DsInlineIcon name="arrow-right" side="end">
							{#snippet children()}Inline end{/snippet}
						</DsInlineIcon>
						<DsInlineIcon name="info" label="Info" />
					</div>
				</div>
			</DsCard>
		</section>

		<section id="ds-separator" class="space-y-4">
			<h2 class="text-h2 font-semibold">Separator</h2>
			<DsCard class="space-y-4">
				<div class="space-y-2">
					<p class="text-label text-muted-foreground">Horizontal</p>
					<DsSeparator class="my-3" />
				</div>
				<div class="space-y-2">
					<p class="text-label text-muted-foreground">Vertical</p>
					<div class="flex items-center gap-4">
						<span class="text-body-secondary text-muted-foreground">Left</span>
						<div class="h-10">
							<DsSeparator orientation="vertical" class="h-full" />
						</div>
						<span class="text-body-secondary text-muted-foreground">Right</span>
					</div>
				</div>
			</DsCard>
		</section>

		<section id="ds-forms" class="space-y-4">
			<h2 class="text-h2 font-semibold">Forms</h2>
			<DsCard class="space-y-6">
				<div class="grid gap-4 md:grid-cols-2">
					<DsField
						label="Email"
						helpText="clearable + adornment 예시"
						invalid={inputValue.length > 0 && !inputValue.includes("@")}
						errorText="이메일 형식이 아닙니다."
					>
						{#snippet children(control)}
							<DsInput
								{...control}
								placeholder="name@example.com"
								clearable
								bind:value={inputValue}
							>
								{#snippet start()}
									<span class="i-lucide-mail h-4 w-4 text-muted-foreground"></span>
								{/snippet}
							</DsInput>
						{/snippet}
					</DsField>

					<DsField label="Plan" helpText="Select (Dropdown 기반)">
						{#snippet children(control)}
							<DsSelect
								id={control.id}
								describedBy={control["aria-describedby"]}
								options={[
									{ value: "free", label: "Free" },
									{ value: "pro", label: "Pro" },
									{ value: "team", label: "Team" },
								]}
								bind:value={plan}
							/>
						{/snippet}
					</DsField>
				</div>

					<DsField label="Message" helpText="Textarea">
						{#snippet children(control)}
							<DsTextarea
								id={control.id}
								aria-describedby={control["aria-describedby"]}
								placeholder="내용을 입력하세요"
								rows={4}
								bind:value={textareaValue}
							/>
						{/snippet}
					</DsField>

					<DsField label="Time" helpText="TimePicker (native input type=time)">
						{#snippet children(control)}
							<DsTimePicker
								id={control.id}
								aria-describedby={control["aria-describedby"]}
								bind:value={timeValue}
							/>
						{/snippet}
					</DsField>

					<div class="space-y-2">
						<div class="text-label text-muted-foreground">FileUpload</div>
						<DsFileUpload
							accept="image/*,.pdf"
							maxFiles={5}
							maxSizeBytes={5 * 1024 * 1024}
						/>
					</div>

				<div class="flex flex-wrap items-center gap-6">
					<DsCheckbox bind:checked={newsletter}>뉴스레터 구독</DsCheckbox>
					<DsSwitch bind:checked={newsletter} label="알림 설정" />
					<DsTag intent="secondary" variant="soft">tag: {newsletter ? "on" : "off"}</DsTag>
				</div>

				<div class="space-y-2">
					<div class="text-label text-muted-foreground">RadioGroup</div>
					<DsRadioGroup bind:value={plan} name="plan">
						<DsRadioItem value="free" label="Free" description="개인용" />
						<DsRadioItem value="pro" label="Pro" description="전문가" />
						<DsRadioItem value="team" label="Team" description="협업" />
					</DsRadioGroup>
				</div>

				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<div class="text-label text-muted-foreground">PasswordInput</div>
						<DsPasswordInput
							placeholder="비밀번호"
							showStrength
							autocomplete="new-password"
						/>
					</div>
					<div class="space-y-2">
						<div class="text-label text-muted-foreground">OtpInput</div>
						<DsOtpInput
							length={6}
							bind:value={otp}
							onComplete={(code) => toast.success("OTP", code)}
						/>
					</div>
				</div>

				<div class="space-y-2">
					<div class="text-label text-muted-foreground">Progress</div>
					<div class="flex items-center gap-3">
						<DsProgress value={popoverCount * 10} max={100} />
						<DsProgress indeterminate size="sm" />
					</div>
				</div>
			</DsCard>
		</section>

		<section id="ds-overlays" class="space-y-4">
			<h2 class="text-h2 font-semibold">Overlays</h2>
			<DsCard class="space-y-6">
				<div class="flex flex-wrap items-center gap-2">
					<DsDropdown
						align="start"
						items={[
							{ id: "copy", label: "Copy link" },
							{ id: "share", label: "Share" },
							{ id: "delete", label: "Delete", disabled: true },
						]}
						onSelect={(id) => {
							dropdownSelected = id;
							toast.info("Dropdown", `선택: ${id}`);
						}}
					/>
					{#if dropdownSelected}
						<DsBadge intent="secondary" variant="soft">Selected: {dropdownSelected}</DsBadge>
					{/if}

					<DsDropdown align="start" menuClass="w-64" itemSelector='[role="menuitem"]'>
						{#snippet trigger(props)}
							<DsButton {...props} variant="outline" intent="secondary">Header/Footer</DsButton>
						{/snippet}

						{#snippet header()}
							<div class="text-helper text-muted-foreground">드롭다운 상단 슬롯</div>
						{/snippet}

						{#snippet children({ close })}
							<DsDropdownItem onclick={() => close()}>Action</DsDropdownItem>
							<DsDropdownItem onclick={() => close()}>Duplicate</DsDropdownItem>
							<DsDropdownItem intent="destructive" onclick={() => close()}>Delete</DsDropdownItem>
						{/snippet}

						{#snippet footer()}
							<div class="text-helper text-muted-foreground">드롭다운 하단 슬롯</div>
						{/snippet}
					</DsDropdown>

					<DsDropdown
						align="start"
						haspopup="listbox"
						items={[
							{ id: "alpha", label: "Alpha" },
							{ id: "beta", label: "Beta" },
							{ id: "gamma", label: "Gamma" },
						]}
						onSelect={(id) => toast.info("Listbox", `선택: ${id}`)}
					/>

					<DsTooltip content="툴팁 예시">
						{#snippet children(trigger)}
							<button
								type="button"
								class="ds-button ds-focus-ring ds-touch-target"
								data-ds-variant="outline"
								data-ds-intent="secondary"
								aria-describedby={trigger["aria-describedby"]}
							>
								Tooltip
							</button>
						{/snippet}
					</DsTooltip>

					<DsPopover side="bottom" align="start" label="Popover">
						{#snippet trigger(props)}
							<button
								type="button"
								use:applyRef={props.ref}
								class="ds-button ds-focus-ring ds-touch-target"
								data-ds-variant="outline"
								data-ds-intent="secondary"
								onclick={props.onclick}
								onkeydown={props.onkeydown}
							>
								Popover
							</button>
						{/snippet}

						{#snippet children({ close })}
							<div class="space-y-3">
								<div class="font-semibold">간단한 Popover</div>
								<p class="text-helper text-muted-foreground">
									상호작용 가능한 컨텐츠를 넣습니다.
								</p>
								<div class="flex items-center gap-2">
									<DsButton size="sm" onclick={() => (popoverCount += 1)}>
										Count: {popoverCount}
									</DsButton>
									<DsButton size="sm" variant="outline" intent="secondary" onclick={() => close({ focusButton: true })}>
										Close
									</DsButton>
								</div>
							</div>
						{/snippet}
					</DsPopover>
				</div>

				<div class="grid gap-3 md:grid-cols-2">
					<DsSkeleton class="h-24 w-full rounded-md" />
					<DsEmptyState title="No results" description="검색 결과가 없습니다." />
				</div>
			</DsCard>
		</section>

		<section id="ds-navigation" class="space-y-4">
			<h2 class="text-h2 font-semibold">Navigation</h2>
			<DsCard class="space-y-6">
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
						<DsAccordionTrigger value="q1">FAQ 예시 1</DsAccordionTrigger>
						<DsAccordionContent value="q1">
							지원/헬프 센터에서 자주 묻는 질문을 구성할 때 사용합니다.
						</DsAccordionContent>
					</DsAccordionItem>
					<DsAccordionItem value="q2">
						<DsAccordionTrigger value="q2">FAQ 예시 2</DsAccordionTrigger>
						<DsAccordionContent value="q2">
							접근성(키보드 이동, aria-expanded) 기본을 포함합니다.
						</DsAccordionContent>
					</DsAccordionItem>
				</DsAccordion>

				<div class="space-y-2">
					<div class="text-label text-muted-foreground">Pagination</div>
					<DsPagination
						page={pageNum}
						pageCount={24}
						onPageChange={(p) => (pageNum = p)}
					/>
				</div>

				<div class="space-y-2">
					<div class="text-label text-muted-foreground">AppShell / Sidebar</div>
					<DsAppShell title="Dashboard" description="좌측 사이드바 + 메인 콘텐츠 패턴">
						{#snippet sidebar()}
							<DsSidebar title="Navigation">
								{#snippet children()}
									<nav aria-label="Dashboard nav" class="grid gap-1">
										<DsLinkButton href="/app" variant="link" intent="secondary" class="justify-start">
											Home
										</DsLinkButton>
										<DsLinkButton href="/settings/profile" variant="link" intent="secondary" class="justify-start">
											Settings
										</DsLinkButton>
									</nav>
								{/snippet}
							</DsSidebar>
						{/snippet}

						{#snippet actions()}
							<div class="flex items-center gap-2">
								<DsButton size="sm" variant="outline" intent="secondary">Invite</DsButton>
								<DsButton size="sm" intent="primary">New</DsButton>
							</div>
						{/snippet}

						{#snippet children()}
							<DsCard class="p-4">
								<div class="text-body-secondary text-muted-foreground">
									이 영역에 DataTable/Charts/Forms 등을 조합합니다.
								</div>
							</DsCard>
						{/snippet}
					</DsAppShell>
				</div>
			</DsCard>
		</section>

		<section id="ds-data" class="space-y-4">
			<h2 class="text-h2 font-semibold">Data</h2>
			<DsCard class="space-y-6">
					<div class="grid gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<div class="text-label text-muted-foreground">Combobox</div>
						<DsCombobox
							options={[
								{ value: "u1", label: "Alex", keywords: ["admin"] },
								{ value: "u2", label: "Blake", keywords: ["owner"] },
								{ value: "u3", label: "Casey", keywords: ["viewer"], disabled: true },
							]}
							bind:value={assignee}
							label="Assignee"
						/>
					</div>

						<div class="space-y-2">
							<div class="text-label text-muted-foreground">DateRangePicker</div>
							<DsDateRangePicker bind:value={range} />
						</div>
					</div>

					<div class="space-y-2">
						<div class="text-label text-muted-foreground">Calendar</div>
						<div class="inline-flex rounded-md border border-border bg-surface">
							<DsCalendar bind:value={singleDate} />
						</div>
						<div class="text-helper text-muted-foreground">value: {singleDate ?? ""}</div>
					</div>

					<div class="space-y-2">
						<div class="text-label text-muted-foreground">DatePicker</div>
						<DsDatePicker bind:value={singleDate} label="Due date" locale="en-US" />
					</div>

					<div class="space-y-2">
						<div class="text-label text-muted-foreground">SearchPanel</div>
						<DsSearchPanel
							label="Search pages"
							placeholder="Type to filter pages…"
							items={searchItems}
							bind:query={searchQuery}
							onSelect={(id) => {
								searchSelected = id;
								toast.info("Search", id);
							}}
						/>
						<div class="text-helper text-muted-foreground">
							selected: {searchSelected ?? ""}
						</div>
					</div>

				<div class="space-y-2">
					<div class="text-label text-muted-foreground">StatCard / KPI</div>
					<div class="grid gap-3 md:grid-cols-3">
						<DsStatCard
							label="Monthly revenue"
							value="$12,420"
							delta="+12%"
							trend="up"
							helper="vs last month"
							icon="dollar-sign"
						>
							{#snippet action()}
								<DsIconButton icon="ellipsis" label="More" size="sm" />
							{/snippet}
							{#snippet bottom()}
								<div class="flex items-center justify-between">
									<span class="text-helper text-muted-foreground">Updated 2m ago</span>
									<DsButton size="sm" variant="ghost" intent="secondary">View</DsButton>
								</div>
							{/snippet}
						</DsStatCard>
						<DsStatCard
							label="New users"
							value="1,284"
							delta="+4.3%"
							trend="up"
							helper="지난 7일"
							icon="users"
						/>
						<DsStatCard
							label="Churn"
							value="2.1%"
							delta="-0.4%"
							trend="down"
							helper="지난 30일"
							icon="trending-down"
						/>
					</div>

					<div class="grid gap-3 md:grid-cols-2">
						<DsKpi
							label="Activation"
							value="68%"
							helper="가입 후 24시간 내"
							delta="+2%"
							trend="up"
							icon="sparkles"
						/>
						<DsKpi
							label="Support SLA"
							value="99.9%"
							helper="최근 90일"
							delta="stable"
							trend="neutral"
							icon="shield-check"
						/>
					</div>
				</div>

				<div class="space-y-2">
					<div class="text-label text-muted-foreground">DataTable</div>
					<div class="pb-3">
						<DsTableToolbar
							title="Projects"
							description="검색/필터/액션을 한 곳에 모읍니다."
							count={3}
							placeholder="Search projects"
						>
							{#snippet end()}
								<DsButton size="sm" variant="outline" intent="secondary">
									Filter
								</DsButton>
								<DsButton size="sm" intent="primary">New</DsButton>
							{/snippet}
						</DsTableToolbar>
					</div>
					<DsDataTable
						columns={[
							{ id: "id", header: "ID", sortable: true },
							{ id: "name", header: "Name", sortable: true },
							{ id: "status", header: "Status", sortable: true },
							{ id: "score", header: "Score", align: "end", sortable: true },
						]}
						rows={[
							{ id: "p_001", name: "Alpha", status: "active", score: 92 },
							{ id: "p_002", name: "Beta", status: "paused", score: 75 },
							{ id: "p_003", name: "Gamma", status: "active", score: 88 },
						]}
					/>
				</div>
			</DsCard>
		</section>

		<section id="ds-feedback" class="space-y-4">
			<h2 class="text-h2 font-semibold">Feedback</h2>
			<DsCard class="space-y-6">
				<div class="grid gap-3 md:grid-cols-2">
					<DsAlert intent="neutral" title="Notice" description="정보성 안내" />
					<DsAlert intent="warning" title="Warning" description="주의가 필요합니다" />
					<DsAlert intent="success" title="Success" description="성공했습니다" />
					<DsAlert intent="danger" title="Error" description="문제가 발생했습니다" />
				</div>
				<div class="flex items-center gap-3">
					<DsSpinner label="Loading" />
					<DsAvatar name="Test User" />
					<DsAvatar name="Jane Doe" src="https://invalid.example/avatar.png" />
					<DsDropdown align="end" menuClass="w-56" itemSelector='[role="menuitem"]'>
						{#snippet trigger(props)}
							<DsIconButton {...props} icon="ellipsis" label="More" />
						{/snippet}
						{#snippet children({ close })}
							<DsDropdownItem onclick={() => close()}>Action</DsDropdownItem>
							<DsDropdownItem intent="destructive" onclick={() => close()}>Delete</DsDropdownItem>
						{/snippet}
					</DsDropdown>
				</div>

				<div class="space-y-3">
					<div class="flex flex-wrap items-end justify-between gap-3">
						<div class="space-y-1">
							<div class="text-label text-muted-foreground">ToastRegion (local demo)</div>
							<div class="text-helper text-muted-foreground">
								기본 Toast 버튼은 레이아웃의 전역 리전을 사용합니다. 아래는 이 페이지 전용 리전입니다.
							</div>
						</div>
						<div class="w-56">
							<DsField label="Position" helpText="리전 위치">
								{#snippet children(control)}
									<DsSelect
										id={control.id}
										describedBy={control["aria-describedby"]}
										options={toastDemoPositions.map((p) => ({ value: p, label: p }))}
										bind:value={toastDemoPosition}
									/>
								{/snippet}
							</DsField>
						</div>
					</div>

					<div class="flex flex-wrap gap-2">
						<DsButton size="sm" variant="outline" intent="secondary" onclick={() => addToastDemo("neutral")}>
							Add neutral
						</DsButton>
						<DsButton size="sm" intent="success" onclick={() => addToastDemo("success")}>
							Add success
						</DsButton>
						<DsButton size="sm" intent="warning" onclick={() => addToastDemo("warning")}>
							Add warning
						</DsButton>
						<DsButton size="sm" intent="danger" onclick={() => addToastDemo("error")}>
							Add error
						</DsButton>
						<DsButton
							size="sm"
							variant="outline"
							intent="secondary"
							disabled={toastDemoToasts.length === 0}
							onclick={() => (toastDemoToasts = [])}
						>
							Clear
						</DsButton>
					</div>

					<DsToastRegion
						toasts={toastDemoToasts}
						onDismiss={dismissToastDemo}
						position={toastDemoPosition}
					/>
				</div>
			</DsCard>
		</section>

		<section id="ds-advanced" class="space-y-4">
			<h2 class="text-h2 font-semibold">Advanced</h2>
			<DsCard class="space-y-6">
				<div class="space-y-2">
					<div class="text-label text-muted-foreground">Timeline</div>
					<DsTimeline
						items={[
							{ title: "v0.1", date: "2025-01-01", description: "초기 릴리즈", status: "done" },
							{ title: "v0.2", date: "2025-02-01", description: "대시보드 고도화", status: "in-progress" },
							{ title: "v0.3", date: "2025-03-01", description: "문서/검색", status: "planned" },
						]}
					/>
				</div>

				<div class="space-y-2">
					<div class="text-label text-muted-foreground">Rating</div>
					<DsRating bind:value={rating} />
				</div>

				<div class="space-y-2">
					<div class="text-label text-muted-foreground">PricingTable</div>
					<DsPricingTable
						plans={[
							{
								id: "free",
								name: "Free",
								price: "$0",
								period: "/mo",
								description: "개인 테스트용",
								features: ["1 project", "Community support", "Basic analytics"],
								ctaLabel: "Start free",
							},
							{
								id: "pro",
								name: "Pro",
								price: "$29",
								period: "/mo",
								description: "개인/프로덕트 팀",
								highlighted: true,
								badge: "Most popular",
								features: ["Unlimited projects", "Email support", "Advanced analytics"],
								ctaLabel: "Go Pro",
							},
							{
								id: "team",
								name: "Team",
								price: "$99",
								period: "/mo",
								description: "조직/기업",
								features: ["SSO", "SLA", "Audit logs"],
								ctaLabel: "Contact sales",
							},
						]}
						onSelect={(id) => toast.info("Pricing", `선택: ${id}`)}
					/>
				</div>
			</DsCard>
		</section>

		<section id="docs" class="space-y-4">
			<h2 class="text-h2 font-semibold">Docs Components</h2>
			<DsCard class="space-y-6">
				<DocsCallout intent="primary" title="DocsCallout">
					문서 페이지에서 Note/Tip/Warning 같은 블록을 빠르게 표현합니다.
				</DocsCallout>

				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<div class="text-label text-muted-foreground">DocsSteps</div>
						<DocsSteps
							steps={[
								{ title: "Install", description: "bun install" },
								{ title: "Run", description: "bun dev" },
								{ title: "Deploy", description: "CI에서 build/publish" },
							]}
						/>
					</div>

					<div class="space-y-2">
						<div class="text-label text-muted-foreground">DocsToc</div>
						<DocsToc items={tocItems} activeId="docs" />
					</div>
				</div>

				<div class="space-y-2">
					<div class="text-label text-muted-foreground">DocsCodeTabs</div>
					<DocsCodeTabs
						tabs={[
							{ label: "bun", language: "bash", code: "bun install\\nbun dev" },
							{ label: "curl", language: "bash", code: "curl -X GET https://api.example.com" },
							{ label: "ts", language: "typescript", code: "const ok: boolean = true;" },
						]}
					/>
				</div>

				<div class="space-y-2">
					<div class="text-label text-muted-foreground">ApiEndpointCard</div>
					<ApiEndpointCard
						method="GET"
						path="/v1/users"
						description="사용자 목록을 조회합니다."
						examples={[
							{ label: "cURL", language: "bash", code: "curl -X GET https://api.example.com/v1/users" },
							{ label: "TS", language: "typescript", code: "await fetch('/v1/users');" },
						]}
					>
						<CodeBlock
							language="json"
							code={`{\\n  \"data\": [{ \"id\": \"u_123\" }]\\n}`}
						/>
					</ApiEndpointCard>
				</div>

				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<div class="text-label text-muted-foreground">DocsKbd</div>
						<div class="flex flex-wrap items-center gap-2">
							<DocsKbd keys="Ctrl + K" />
							<DocsKbd keys="Shift + Enter" />
						</div>
					</div>
					<div class="space-y-2">
						<div class="text-label text-muted-foreground">DocsSearchResults</div>
						<DocsSearchResults
							query="auth"
							items={[
								{ title: "Authentication", href: "/docs/auth", excerpt: "로그인/토큰/세션", meta: "docs · 2m" },
								{ title: "Reset password", href: "/docs/reset", excerpt: "OTP와 재설정 플로우", meta: "docs · 1m" },
							]}
						/>
					</div>
				</div>

				<div class="space-y-2">
					<div class="text-label text-muted-foreground">DocsLayout / DocsProse / DocsAnchoredHeading / DocsPrevNext</div>
					<DocsLayout
						title="DocsLayout"
						description="문서 페이지 레이아웃(사이드바 + 본문 + ToC)"
						tocItems={docsDemoToc}
						class="rounded-lg border border-border bg-background p-4"
					>
						{#snippet sidebar()}
							<DocsSidebarNav
								title="Docs"
								items={docsNavItems}
								activePath="/docs/getting-started"
								class="border-0 bg-transparent p-0"
							/>
						{/snippet}

						{#snippet children()}
							<DocsProse>
								{#snippet children()}
									<DocsAnchoredHeading id="docs-intro" level={2}>
										{#snippet children()}Intro{/snippet}
									</DocsAnchoredHeading>
									<p>이 영역은 마크다운/가이드 본문 스타일을 표준화합니다.</p>

									<DocsAnchoredHeading id="docs-install" level={2}>
										{#snippet children()}Install{/snippet}
									</DocsAnchoredHeading>
									<p><code>bun install</code> 후 <code>bun dev</code> 로 실행합니다.</p>

									<DocsAnchoredHeading id="docs-next" level={2}>
										{#snippet children()}Next{/snippet}
									</DocsAnchoredHeading>
									<p>사이드바/ToC는 모바일에서 Sheet로 열립니다.</p>
								{/snippet}
							</DocsProse>

							<div class="pt-6">
								<DocsPrevNext
									prev={{ href: "/docs", label: "Overview", description: "문서 홈" }}
									next={{ href: "/docs/api", label: "API", description: "엔드포인트/SDK" }}
								/>
							</div>
						{/snippet}
					</DocsLayout>
				</div>
			</DsCard>
		</section>
	</div>

	<aside class="hidden lg:block">
		<div class="sticky top-6 space-y-3">
			<DocsToc items={tocItems} activeId={activeSectionId} title="Sections" />
			<div class="rounded-lg border border-border bg-surface p-4">
				<div class="text-label font-semibold text-foreground">상태</div>
				<div class="mt-2 flex items-center gap-2 text-helper text-muted-foreground">
					<span class="i-lucide-flask-conical h-4 w-4"></span>
					임시 페이지(추후 삭제 예정)
				</div>
			</div>
		</div>
	</aside>
</div>

<DsDialog
	id="ds-dialog"
	title="Dialog"
	description="DsDialog 동작 확인"
	open={dialogOpen}
	onOpenChange={(next) => (dialogOpen = next)}
>
	<p class="text-body-secondary text-muted-foreground">
		ESC/외부 클릭/포커스 복귀 등을 확인합니다.
	</p>
</DsDialog>

<DsSheet
	id="ds-sheet"
	title="Sheet"
	description="오른쪽에서 슬라이드되는 패널"
	open={sheetOpen}
	onOpenChange={(next) => (sheetOpen = next)}
	side="right"
	size="md"
>
	<p class="text-body-secondary text-muted-foreground">
		모바일/대시보드 설정 패널에 사용합니다.
	</p>
</DsSheet>

<DsDrawer
	id="ds-drawer"
	title="Drawer"
	description="아래에서 올라오는 패널"
	open={drawerOpen}
	onOpenChange={(next) => (drawerOpen = next)}
	size="md"
>
	<p class="text-body-secondary text-muted-foreground">
		모바일 네비/필터 패널에 사용합니다.
	</p>
</DsDrawer>

<DsCommandPalette
	open={commandOpen}
	onOpenChange={(next) => (commandOpen = next)}
	title="Command"
	items={[
		{ id: "docs", label: "Go to Docs", description: "문서로 이동", shortcut: "Ctrl+K" },
		{ id: "settings", label: "Open Settings", description: "설정 열기", shortcut: "Ctrl+," },
		{ id: "logout", label: "Logout", description: "로그아웃", disabled: true },
	]}
	onSelect={(id) => toast.info("Command", id)}
/>
