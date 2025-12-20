<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import {
		isThemeMode,
		isThemePalette,
		type ThemeMode,
		type ThemePalette,
	} from "$lib/shared/utils/theme";

	import DsIconButton from "./IconButton.svelte";
	import DsPopover from "./Popover.svelte";
	import DsRadioGroup from "./RadioGroup.svelte";
	import DsRadioItem from "./RadioItem.svelte";

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		mode: ThemeMode;
		onModeChange?: (next: ThemeMode) => void;

		palette: ThemePalette;
		onPaletteChange?: (next: ThemePalette) => void;

		label?: string;
		triggerTestId?: string;
		title?: string;
	}

	let {
		mode,
		onModeChange,
		palette,
		onPaletteChange,
		label = "Theme settings",
		triggerTestId,
		title = "Theme",
		class: className = "",
		...rest
	}: Props = $props();

	function setMode(next: string) {
		if (!isThemeMode(next)) return;
		onModeChange?.(next);
	}

	function setPalette(next: string) {
		if (!isThemePalette(next)) return;
		onPaletteChange?.(next);
	}

	function handleModeKeyDown(e: KeyboardEvent) {
		if (e.key === "ArrowRight") {
			e.preventDefault();
			const paletteGroup = document.querySelector(
				'[role="radiogroup"][data-group="palette"]',
			);
			const checked = paletteGroup?.querySelector("input:checked");
			const target = checked || paletteGroup?.querySelector("input");
			(target as HTMLElement)?.focus();
		}
	}

	function handlePaletteKeyDown(e: KeyboardEvent) {
		if (e.key === "ArrowLeft") {
			e.preventDefault();
			const modeGroup = document.querySelector(
				'[role="radiogroup"][data-group="mode"]',
			);
			const checked = modeGroup?.querySelector("input:checked");
			const target = checked || modeGroup?.querySelector("input");
			(target as HTMLElement)?.focus();
		}
	}
</script>

<div {...rest} class={["inline-flex", className].filter(Boolean).join(" ")}>
	<DsPopover
		side="bottom"
		align="end"
		{label}
		panelClass="w-[min(480px,92vw)] p-4"
	>
		{#snippet trigger(props)}
			<DsIconButton
				{...props}
				{label}
				data-testid={triggerTestId ?? "header-theme-control"}
			>
				<span class="i-lucide-palette h-4 w-4"></span>
			</DsIconButton>
		{/snippet}

		{#snippet children()}
			<div class="grid gap-4">
				<div class="text-label font-semibold text-foreground px-1">{title}</div>

				<div class="grid grid-cols-1 sm:grid-cols-[minmax(0,10.5rem)_minmax(0,1fr)] gap-4">
					<!-- Mode Column -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<section
						class="border border-border rounded-lg p-4 flex flex-col gap-3"
						onkeydown={handleModeKeyDown}
						role="group"
						aria-label="Mode Selection"
					>
						<div class="text-menu-sm font-semibold text-foreground">Mode</div>
					<DsRadioGroup
						value={mode}
						onValueChange={setMode}
						name="theme-mode"
						data-group="mode"
						class="theme-control-radio"
					>
						<DsRadioItem value="system" label="System" class="items-center" />
						<DsRadioItem value="light" label="Light" class="items-center" />
						<DsRadioItem value="dark" label="Dark" class="items-center" />
					</DsRadioGroup>
					</section>

					<!-- Palette Column -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<section
						class="border border-border rounded-lg p-4 flex flex-col gap-3"
						onkeydown={handlePaletteKeyDown}
						role="group"
						aria-label="Palette Selection"
					>
						<div class="text-menu-sm font-semibold text-foreground">Palette</div>
					<DsRadioGroup
						value={palette}
						onValueChange={setPalette}
						name="theme-palette"
						data-group="palette"
						class="theme-control-radio"
					>
						<DsRadioItem value="airy-blue" class="items-center">
							<div class="flex items-center gap-2">
								<span
									class="w-3 h-3 rounded-full shadow-sm"
										style="background-color: oklch(60% 0.16 240)"
									></span>
									<span>Airy Blue</span>
								</div>
							</DsRadioItem>
							<DsRadioItem value="misty-lavender" class="items-center">
								<div class="flex items-center gap-2">
									<span
										class="w-3 h-3 rounded-full shadow-sm"
										style="background-color: oklch(60% 0.16 290)"
									></span>
									<span>Misty Lavender</span>
								</div>
							</DsRadioItem>
							<DsRadioItem value="sage-breeze" class="items-center">
								<div class="flex items-center gap-2">
									<span
										class="w-3 h-3 rounded-full shadow-sm"
										style="background-color: oklch(60% 0.16 150)"
									></span>
									<span>Sage Breeze</span>
								</div>
							</DsRadioItem>
							<DsRadioItem value="cozy-coral" class="items-center">
								<div class="flex items-center gap-2">
									<span
										class="w-3 h-3 rounded-full shadow-sm"
										style="background-color: oklch(60% 0.16 35)"
									></span>
									<span>Cozy Coral</span>
								</div>
							</DsRadioItem>
						</DsRadioGroup>
					</section>
				</div>
			</div>
		{/snippet}
	</DsPopover>
</div>

<style>
	:global(.theme-control-radio .ds-radio-item) {
		align-items: center;
	}

	:global(.theme-control-radio .ds-radio-text) {
		font-size: var(--font-size-sm);
		line-height: 1.3;
	}

	:global(.theme-control-radio .ds-radio-text > *) {
		font-size: inherit;
		line-height: inherit;
	}
</style>
