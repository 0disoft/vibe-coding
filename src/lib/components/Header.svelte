<script lang="ts">
	import { page } from "$app/state";
	import FontSizePicker from "$lib/components/header-actions/FontSizePicker.svelte";
	import LanguagePicker from "$lib/components/header-actions/LanguagePicker.svelte";
	import ThemeToggle from "$lib/components/header-actions/ThemeToggle.svelte";
	import UserMenu from "$lib/components/header-actions/UserMenu.svelte";
	import { onMount } from "svelte";

	import { DsIconButton, DsSheet } from "$lib/components/design-system";
	import * as m from "$lib/paraglide/messages.js";
	import { localizeUrl } from "$lib/paraglide/runtime.js";
	import { getLocaleFromUrl, type Locale } from "$lib/shared/utils/locale";
	import type { Snippet } from "svelte";

	interface Props {
		siteName?: string;
		nav?: Snippet;
		actions?: Snippet;
	}

	let { siteName = "Site", nav, actions }: Props = $props();

	// 모바일 메뉴 상태
	let mobileMenuOpen = $state(false);
	let mobileMenuButtonRef = $state<HTMLButtonElement | null>(null);

	// locale/page 변경에 반응하도록 신호로 끌어올림
	let currentLocale = $derived<Locale>(getLocaleFromUrl(page.url));
	let currentPathname = $derived(page.url.pathname);

	// 네비게이션 항목 배열화 (유지보수 용이)
	// 필요한 항목만 주석 해제하여 사용. 새 프로젝트 시작 시 필요한 것만 활성화.
	const navItems = [
		// ─── 소개 (About) ────────────────────────────────────────
		// { href: '/about', label: (locale: Locale) => m.nav_about({}, { locale }) },
		// { href: '/team', label: (locale: Locale) => m.nav_team({}, { locale }) },
		// { href: '/careers', label: (locale: Locale) => m.nav_careers({}, { locale }) },
		// ─── 제품/서비스 (Products & Services) ───────────────────
		{ href: "/products", label: (locale: Locale) => m.nav_products({}, { locale }) },
		// { href: '/services', label: (locale: Locale) => m.nav_services({}, { locale }) },
		// { href: '/enterprise', label: (locale: Locale) => m.nav_enterprise({}, { locale }) },
		// { href: '/compare', label: (locale: Locale) => m.nav_compare({}, { locale }) },
		// { href: '/demo', label: (locale: Locale) => m.nav_demo({}, { locale }) },
		// { href: '/download', label: (locale: Locale) => m.nav_download({}, { locale }) },
		// ─── 비즈니스 (Business) ─────────────────────────────────
		// { href: '/pricing', label: (locale: Locale) => m.nav_pricing({}, { locale }) },
		// { href: '/booking', label: (locale: Locale) => m.nav_booking({}, { locale }) },
		// { href: '/seller', label: (locale: Locale) => m.nav_seller({}, { locale }) },
		// { href: '/membership', label: (locale: Locale) => m.nav_membership({}, { locale }) },
		// ─── 콘텐츠 (Content) ────────────────────────────────────
		// { href: '/docs', label: (locale: Locale) => m.nav_docs({}, { locale }) },
		// { href: '/blog', label: (locale: Locale) => m.nav_blog({}, { locale }) },
		// { href: '/portfolio', label: (locale: Locale) => m.nav_portfolio({}, { locale }) },
		{ href: "/gallery", label: (locale: Locale) => m.nav_gallery({}, { locale }) },
		// { href: '/resources', label: (locale: Locale) => m.nav_resources({}, { locale }) },
		// { href: '/research', label: (locale: Locale) => m.nav_research({}, { locale }) },
		// ─── 뉴스/이벤트 (News & Events) ─────────────────────────
		{ href: "/news", label: (locale: Locale) => m.nav_news({}, { locale }) },
		// { href: '/events', label: (locale: Locale) => m.nav_events({}, { locale }) },
		{ href: "/changelog", label: (locale: Locale) => m.nav_changelog({}, { locale }) },
		// ─── 커뮤니티 (Community) ────────────────────────────────
		{ href: "/community", label: (locale: Locale) => m.nav_community({}, { locale }) },
		// ─── 사용자 영역 (User) ──────────────────────────────────
		// { href: '/dashboard', label: (locale: Locale) => m.nav_dashboard({}, { locale }) },
	];

	// 현재 경로와 일치하는지 확인
	function isActive(path: string): boolean {
		const localizedPath = localizeUrl(path, { locale: currentLocale }).pathname;
		return (
			currentPathname === localizedPath ||
			currentPathname.startsWith(`${localizedPath}/`)
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
			href={localizeUrl("/", { locale: currentLocale }).href}
			aria-label={m.header_home_label({ siteName }, { locale: currentLocale })}
			class="ds-no-select flex items-center gap-2 text-logo font-pacifico text-foreground"
		>
			{siteName}
		</a>

		<!-- 데스크톱 네비게이션 -->
		<nav
			aria-label={m.header_main_nav_label({}, { locale: currentLocale })}
			class="hidden items-center gap-0 text-menu md:flex"
		>
			{#if nav}
				{@render nav()}
			{:else}
				{#each navItems as item, index (item.href)}
					{@const active = isActive(item.href)}
					<a
						href={localizeUrl(item.href, { locale: currentLocale }).href}
						aria-current={active ? "page" : undefined}
						class="ds-no-select ds-focus-ring rounded-md px-1 py-1 transition-colors hover:text-foreground focus-visible:text-foreground {active
							? 'text-foreground font-medium'
							: 'text-muted-foreground'}"
					>
						{item.label(currentLocale)}
					</a>
					{#if index < navItems.length - 1}
						<span
							aria-hidden="true"
							class="ds-no-select mx-2 text-[0.65rem] text-muted-foreground/60 leading-none"
						>
							•
						</span>
					{/if}
				{/each}
			{/if}
		</nav>

		<!-- 우측 액션 영역 -->
		<div class="flex items-center gap-1">
			{#if actions}
				{@render actions()}
			{/if}

			<!-- 모바일: 햄버거 버튼 (가장 왼쪽) -->
			<DsIconButton
				bind:ref={mobileMenuButtonRef}
				onclick={toggleMobileMenu}
				label={
					mobileMenuOpen
						? m.header_menu_close({}, { locale: currentLocale })
						: m.header_menu_open({}, { locale: currentLocale })
				}
				aria-expanded={mobileMenuOpen}
				class="md:!hidden"
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
		</div>
	</div>
</header>

<DsSheet
	id="ds-mobile-nav"
	title={m.header_menu_title({}, { locale: currentLocale })}
	open={mobileMenuOpen}
	onOpenChange={(next) => (mobileMenuOpen = next)}
	returnFocusTo={mobileMenuButtonRef}
	initialFocus="a"
	side="right"
	size="sm"
	closeOnOutsideClick
	closeOnEscape
	class="md:!hidden"
>
	<nav
		aria-label={m.header_mobile_nav_label({}, { locale: currentLocale })}
		class="flex flex-col gap-1"
	>
		<ul class="flex flex-col gap-1">
			{#each navItems as item (item.href)}
				{@const active = isActive(item.href)}
				<li>
					<a
						href={localizeUrl(item.href, { locale: currentLocale }).href}
						onclick={() => closeMobileMenu()}
						aria-current={active ? "page" : undefined}
						class="ds-no-select ds-focus-ring ds-touch-target block rounded-md px-3 py-2 text-menu transition-colors hover:bg-accent focus-visible:bg-accent {active
							? 'bg-accent text-foreground font-medium'
							: 'text-muted-foreground'}"
					>
						{item.label(currentLocale)}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</DsSheet>
