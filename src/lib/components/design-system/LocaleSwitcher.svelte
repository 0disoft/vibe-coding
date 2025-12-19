<script lang="ts">
	import { tick } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { page } from "$app/state";

	import { setLocale } from "$lib/paraglide/runtime.js";
	import {
		buildLocalizedUrl,
		getLocaleFromUrl,
		getLocaleInfo,
		locales,
		writeLocaleCookie,
		type Locale,
	} from "$lib/shared/utils/locale";
	import { useId } from "$lib/shared/utils/use-id";

	import DsDropdown from "./Dropdown.svelte";
	import DsDropdownItem from "./DropdownItem.svelte";
	import DsIconButton from "./IconButton.svelte";
	import DsInput from "./Input.svelte";

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		/** 트리거 aria-label */
		label?: string;
		/** 트리거 테스트 id */
		triggerTestId?: string;
		/** 현재 locale을 외부에서 강제(대부분 자동) */
		value?: Locale;
		/** locale 변경 콜백(선택) */
		onValueChange?: (next: Locale) => void;
		/** 검색 UI 표시 여부(기본: locale이 많으면 자동) */
		showSearch?: boolean;
		searchPlaceholder?: string;
		/** 현재 언어 항목 클릭 방지 */
		disableCurrent?: boolean;
		/** 변경 안내(스크린리더) */
		announce?: boolean;
	}

	let {
		label = "Language",
		triggerTestId,
		value,
		onValueChange,
		showSearch,
		searchPlaceholder = "Search languages…",
		disableCurrent = true,
		announce = true,
		class: className = "",
		...rest
	}: Props = $props();

	const searchId = useId("ds-locale-search");

	let open = $state(false);
	let query = $state("");
	let liveText = $state("");
	let liveClearTimer = $state<number | null>(null);

	let currentLocale = $derived<Locale>(value ?? getLocaleFromUrl(page.url));

	let shouldShowSearch = $derived(showSearch ?? locales.length >= 8);

	let items = $derived.by(() => {
		return locales.map((locale) => {
			const info = getLocaleInfo(locale);
			const keywords = [info.selfName, info.englishName, locale]
				.join(" ")
				.toLowerCase();
			return { locale, info, keywords };
		});
	});

	let filtered = $derived.by(() => {
		if (!shouldShowSearch) return items;
		const q = query.trim().toLowerCase();
		if (!q) return items;
		return items.filter((i) => i.keywords.includes(q));
	});

	function hrefFor(locale: Locale) {
		const url = buildLocalizedUrl(page.url, locale);
		return url.pathname + url.search + url.hash;
	}

	async function announceLive(message: string) {
		if (liveClearTimer) window.clearTimeout(liveClearTimer);
		liveText = "";
		await tick();
		liveText = message;
		liveClearTimer = window.setTimeout(() => {
			liveText = "";
			liveClearTimer = null;
		}, 1500);
	}

	function changeLocale(next: Locale) {
		if (next === currentLocale) return;
		setLocale(next, { reload: false });
		// Paraglide가 쿠키를 굽더라도 옵션(Path/SameSite/Secure/Max-Age)을 SSOT로 한 번 더 고정
		writeLocaleCookie(next);
		onValueChange?.(next);
		if (announce) {
			const info = getLocaleInfo(next);
			void announceLive(`Language switched to ${info.englishName}.`);
		}
	}

	function handleOpenChange(next: boolean) {
		open = next;
		if (!next) {
			query = "";
			return;
		}

		if (!shouldShowSearch) return;
		tick().then(() => {
			const el = document.getElementById(searchId) as HTMLInputElement | null;
			el?.focus();
		});
	}
</script>

<div {...rest} class={["inline-flex", className].filter(Boolean).join(" ")}>
	{#if announce}
		<span class="sr-only" aria-live="polite">{liveText}</span>
	{/if}

	<DsDropdown
		align="end"
		{open}
		onOpenChange={handleOpenChange}
		menuClass="!min-w-fit w-max max-h-[360px] overflow-y-auto thin-scrollbar p-1"
		itemSelector={'[role="menuitemradio"]'}
	>
		{#snippet trigger(props)}
			<DsIconButton
				{...props}
				{label}
				data-testid={triggerTestId ?? "ds-locale-switcher"}
			>
				<span class="i-lucide-languages h-4 w-4"></span>
			</DsIconButton>
		{/snippet}

		{#snippet header()}
			{#if shouldShowSearch}
				<div class="p-2">
					<DsInput
						id={searchId}
						placeholder={searchPlaceholder}
						bind:value={query}
						clearable
						aria-label={searchPlaceholder}
					>
						{#snippet start()}
							<span
								class="i-lucide-search h-4 w-4 text-muted-foreground"
								aria-hidden="true"
							></span>
						{/snippet}
					</DsInput>
				</div>
			{/if}
		{/snippet}

		{#snippet children({ close })}
			{#each filtered as item (item.locale)}
				{@const isCurrent = item.locale === currentLocale}
				{@const isDisabled = disableCurrent && isCurrent}

				<DsDropdownItem
					href={isDisabled ? undefined : hrefFor(item.locale)}
					type="button"
					role="menuitemradio"
					aria-checked={isCurrent}
					aria-current={isCurrent ? "page" : undefined}
					hreflang={item.locale}
					disabled={isDisabled}
					class="whitespace-nowrap"
					onclick={(e) => {
						if (isDisabled) return;
						// SvelteKit가 a 클릭을 가로채기 전에 쿠키(선호 언어)를 먼저 갱신
						changeLocale(item.locale);
						close();
					}}
				>
					{#snippet children()}
						<span class="flex min-w-0 items-center justify-between gap-3">
							<span class="min-w-0 truncate">{item.info.selfName}</span>
							<span class="text-xs text-muted-foreground"
								>{item.locale.toUpperCase()}</span
							>
						</span>
					{/snippet}
				</DsDropdownItem>
			{/each}
		{/snippet}
	</DsDropdown>
</div>
