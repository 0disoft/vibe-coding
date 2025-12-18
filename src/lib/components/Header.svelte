<script lang="ts">
	import { onMount } from "svelte";
	import { page } from "$app/state";
	import FontSizePicker from "$lib/components/header-actions/FontSizePicker.svelte";
	import LanguagePicker from "$lib/components/header-actions/LanguagePicker.svelte";
	import ThemeToggle from "$lib/components/header-actions/ThemeToggle.svelte";
	import UserMenu from "$lib/components/header-actions/UserMenu.svelte";

	import { DsIconButton, DsSheet } from "$lib/components/design-system";
	import * as m from "$lib/paraglide/messages.js";
	import { localizeUrl } from "$lib/paraglide/runtime.js";
	import type { Snippet } from "svelte";

	interface Props {
		siteName?: string;
		nav?: Snippet;
		actions?: Snippet;
	}

	let { siteName = "Site", nav, actions }: Props = $props();

	// SSR/프리렌더 단계에서 일부 오버레이/드롭다운 컴포넌트가 불안정할 수 있어
	// 헤더의 “설정/메뉴”류는 마운트 이후에만 렌더합니다(SSR과 초기 hydration 일치).
	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});

	// 모바일 메뉴 상태
	let mobileMenuOpen = $state(false);
	let mobileMenuButtonRef = $state<HTMLButtonElement | null>(null);

	// 네비게이션 항목 배열화 (유지보수 용이)
	// 필요한 항목만 주석 해제하여 사용. 새 프로젝트 시작 시 필요한 것만 활성화.
	const navItems = [
		// ─── 소개 (About) ────────────────────────────────────────
		// { href: '/about', label: () => m.nav_about() },
		// { href: '/team', label: () => m.nav_team() },
		// { href: '/careers', label: () => m.nav_careers() },
		// ─── 제품/서비스 (Products & Services) ───────────────────
		{ href: "/products", label: () => m.nav_products() },
		// { href: '/services', label: () => m.nav_services() },
		// { href: '/enterprise', label: () => m.nav_enterprise() },
		// { href: '/compare', label: () => m.nav_compare() },
		// { href: '/demo', label: () => m.nav_demo() },
		// { href: '/download', label: () => m.nav_download() },
		// ─── 비즈니스 (Business) ─────────────────────────────────
		// { href: '/pricing', label: () => m.nav_pricing() },
		// { href: '/booking', label: () => m.nav_booking() },
		// { href: '/seller', label: () => m.nav_seller() },
		// { href: '/membership', label: () => m.nav_membership() },
		// ─── 콘텐츠 (Content) ────────────────────────────────────
		// { href: '/docs', label: () => m.nav_docs() },
		// { href: '/blog', label: () => m.nav_blog() },
		// { href: '/portfolio', label: () => m.nav_portfolio() },
		{ href: "/gallery", label: () => m.nav_gallery() },
		// { href: '/resources', label: () => m.nav_resources() },
		// { href: '/research', label: () => m.nav_research() },
		// ─── 뉴스/이벤트 (News & Events) ─────────────────────────
		{ href: "/news", label: () => m.nav_news() },
		// { href: '/events', label: () => m.nav_events() },
		{ href: "/changelog", label: () => m.nav_changelog() },
		// ─── 커뮤니티 (Community) ────────────────────────────────
		{ href: "/community", label: () => m.nav_community() },
		// ─── 사용자 영역 (User) ──────────────────────────────────
		// { href: '/dashboard', label: () => m.nav_dashboard() },
	];

	// 현재 경로와 일치하는지 확인
	function isActive(path: string): boolean {
		const localizedPath = localizeUrl(path).pathname;
		return (
			page.url.pathname === localizedPath ||
			page.url.pathname.startsWith(`${localizedPath}/`)
		);
	}

	// 모바일 메뉴 토글
	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	// 모바일 메뉴 닫기
	function closeMobileMenu(options?: { focusButton?: boolean }) {
		if (!mobileMenuOpen) return;
		mobileMenuOpen = false;
		if (options?.focusButton) {
			mobileMenuButtonRef?.focus();
		}
	}
</script>

<header
	class="ds-safe-area-top sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div
		class="mx-auto flex h-12 max-w-5xl items-center justify-between px-4 md:px-6"
	>
		<!-- 로고/사이트명 -->
		<a
			href={localizeUrl("/").href}
			aria-label={m.header_home_label({ siteName })}
			class="flex items-center gap-2 text-logo font-pacifico text-foreground"
		>
			{siteName}
		</a>

		<!-- 데스크톱 네비게이션 -->
		<nav
			aria-label={m.header_main_nav_label()}
			class="hidden items-center gap-8 text-menu-lg md:flex"
		>
			{#if nav}
				{@render nav()}
			{:else}
				{#each navItems as item (item.href)}
					{@const active = isActive(item.href)}
					<a
						href={localizeUrl(item.href).href}
						aria-current={active ? "page" : undefined}
						class="ds-focus-ring rounded-md px-1 py-1 transition-colors hover:text-foreground focus-visible:text-foreground {active
							? 'text-foreground font-medium'
							: 'text-muted-foreground'}">{item.label()}</a
					>
				{/each}
			{/if}
		</nav>

		<!-- 우측 액션 영역 -->
		<div class="flex items-center gap-1">
			{#if actions}
				{@render actions()}
			{/if}

			<!-- 모바일: 햄버거 버튼 (가장 왼쪽) -->
			{#if mounted}
				<DsIconButton
					bind:ref={mobileMenuButtonRef}
					onclick={toggleMobileMenu}
					label={mobileMenuOpen ? m.header_menu_close() : m.header_menu_open()}
					aria-expanded={mobileMenuOpen}
					class="md:hidden"
				>
					{#if mobileMenuOpen}
						<span class="i-lucide-x h-4 w-4"></span>
					{:else}
						<span class="i-lucide-menu h-4 w-4"></span>
					{/if}
				</DsIconButton>

				<!-- 공통 액션 버튼들 (모바일/데스크톱 모두 표시) -->
				<ThemeToggle />
				<LanguagePicker />
				<FontSizePicker />
				<UserMenu />
			{/if}
		</div>
	</div>
</header>

{#if mounted}
	<DsSheet
		id="ds-mobile-nav"
		title={m.header_menu_title()}
		open={mobileMenuOpen}
		onOpenChange={(next) => (mobileMenuOpen = next)}
		returnFocusTo={mobileMenuButtonRef}
		initialFocus="a"
		side="right"
		size="sm"
		closeOnOutsideClick
		closeOnEscape
		class="md:hidden"
	>
		<nav aria-label={m.header_mobile_nav_label()} class="flex flex-col gap-1">
			<ul class="flex flex-col gap-1">
				{#each navItems as item (item.href)}
					{@const active = isActive(item.href)}
					<li>
						<a
							href={localizeUrl(item.href).href}
							onclick={() => closeMobileMenu()}
							aria-current={active ? "page" : undefined}
							class="ds-focus-ring ds-touch-target block rounded-md px-3 py-2 text-menu transition-colors hover:bg-accent focus-visible:bg-accent {active
								? 'bg-accent text-foreground font-medium'
								: 'text-muted-foreground'}"
						>
							{item.label()}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</DsSheet>
{/if}
