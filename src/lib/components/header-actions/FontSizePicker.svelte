<script lang="ts">
	import * as m from "$lib/paraglide/messages.js";
	import { type FontSize, fontSize } from "$lib/stores";

	import { DsDropdown, DsIconButton } from "$lib/components/design-system";

	function selectFontSize(level: FontSize) {
		fontSize.set(level);
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

<DsDropdown
	align="end"
	menuClass="w-48 p-2"
	itemSelector={'[role="menuitemradio"]'}
>
	{#snippet trigger(props)}
		<DsIconButton
			{...props}
			label={m.font_size_change()}
			data-testid="header-font-size-picker"
		>
			<span class="i-lucide-type h-4 w-4"></span>
		</DsIconButton>
	{/snippet}

	{#snippet children({ close })}
		<div class="mb-2 px-2 text-menu-sm font-medium text-muted-foreground">
			{m.font_size_current({ value: fontSize.current })}
		</div>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="grid grid-cols-3 gap-1"
			role="group"
			onkeydown={handleMenuKeyDown}
		>
			{#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as const as level (level)}
				<button
					type="button"
					onclick={() => {
						selectFontSize(level);
						close();
					}}
					class="inline-flex h-8 w-full items-center justify-center rounded-md text-menu-sm outline-none transition-colors {fontSize.current ===
					level
						? 'bg-selected text-selected-foreground'
						: 'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'}"
					aria-checked={fontSize.current === level}
					role="menuitemradio"
				>
					{level}
				</button>
			{/each}
		</div>
	{/snippet}
</DsDropdown>
