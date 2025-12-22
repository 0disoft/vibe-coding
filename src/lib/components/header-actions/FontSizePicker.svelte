<script lang="ts">
import { page } from "$app/state";

import * as m from "$lib/paraglide/messages.js";
import { type FontSize, fontSize } from "$lib/stores";

import {
	DsDropdown,
	DsDropdownItem,
	DsIconButton,
	DsLiveRegion,
} from "$lib/components/design-system";
import { getLocaleFromUrl, type Locale } from "$lib/shared/utils/locale";

const groupLabelId = $props.id();
const currentLocale = $derived<Locale>(getLocaleFromUrl(page.url));

let liveRegion: { announce: (message: string) => void } | null = null;

function selectFontSize(level: FontSize) {
	if (fontSize.current === level) return;
	fontSize.set(level);
	liveRegion?.announce(m.font_size_changed({ value: level }, { locale: currentLocale }));
}

	// 메뉴 내부 키보드 탐색 (3x3 그리드용)
	function handleMenuKeyDown(event: KeyboardEvent) {
		const container = event.currentTarget as HTMLElement;
		const items = Array.from(
			container.querySelectorAll<HTMLElement>('[role="menuitemradio"]'),
		);
		if (items.length === 0) return; // 빈 배열 가드

		const active = document.activeElement;
		const currentIndex = active ? items.indexOf(active as HTMLElement) : -1;
		const cols = 3; // 3열 그리드

		let nextIndex = currentIndex;
		let handled = false;

		switch (event.key) {
			case "ArrowDown":
				nextIndex = (currentIndex + cols) % items.length;
				handled = true;
				break;
			case "ArrowUp":
				nextIndex = (currentIndex - cols + items.length) % items.length;
				handled = true;
				break;
			case "ArrowRight":
				nextIndex = (currentIndex + 1) % items.length;
				handled = true;
				break;
			case "ArrowLeft":
				nextIndex = (currentIndex - 1 + items.length) % items.length;
				handled = true;
				break;
			case "Home":
				nextIndex = 0;
				handled = true;
				break;
			case "End":
				nextIndex = items.length - 1;
				handled = true;
				break;
			// ESC, Tab, Enter, Space 등은 DsDropdown에게 위임
		}

		if (handled) {
			event.preventDefault();
			event.stopPropagation();
			items[nextIndex]?.focus();
		}
	}
</script>

<DsLiveRegion bind:this={liveRegion} politeness="polite" />

<DsDropdown
	align="end"
	menuClass="w-56"
>
	{#snippet trigger(props)}
		<DsIconButton
			{...props}
			label={m.font_size_change({}, { locale: currentLocale })}
			data-testid="header-font-size-picker"
		>
			<span class="i-lucide-type h-4 w-4"></span>
		</DsIconButton>
	{/snippet}

	{#snippet children({ close })}
		<div class="mb-2 px-2 text-menu-sm font-medium text-muted-foreground">
			{m.font_size_current({ value: fontSize.current }, { locale: currentLocale })}
		</div>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="grid grid-cols-3 gap-1"
			role="group"
			aria-labelledby={groupLabelId}
			onkeydown={handleMenuKeyDown}
		>
			<span id={groupLabelId} class="sr-only">
				{m.font_size_group_label({}, { locale: currentLocale })}
			</span>
			{#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as const as level (level)}
				<DsDropdownItem
					onclick={() => {
						selectFontSize(level);
						close();
					}}
					class="justify-center"
					aria-checked={fontSize.current === level}
					aria-label={m.font_size_level_label({ value: level }, { locale: currentLocale })}
					role="menuitemradio"
				>
					{level}
				</DsDropdownItem>
			{/each}
		</div>
	{/snippet}
</DsDropdown>
