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

				<div class="grid grid-cols-2 gap-6">
					<!-- Mode Column -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<section
						class="grid gap-2 content-start"
						onkeydown={handleModeKeyDown}
						role="group"
						aria-label="Mode Selection"
					>
						<div class="text-menu-sm font-semibold text-foreground px-1">
							Mode
						</div>
						<DsRadioGroup
							value={mode}
							onValueChange={setMode}
							name="theme-mode"
							data-group="mode"
						>
							<DsRadioItem
								value="system"
								label="System"
								description="OS 설정을 따릅니다"
							/>
							<DsRadioItem
								value="light"
								label="Light"
								description="항상 라이트로 고정"
							/>
							<DsRadioItem
								value="dark"
								label="Dark"
								description="항상 다크로 고정"
							/>
						</DsRadioGroup>
					</section>

					<!-- Palette Column -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<section
						class="grid gap-2 content-start"
						onkeydown={handlePaletteKeyDown}
						role="group"
						aria-label="Palette Selection"
					>
						<div class="text-menu-sm font-semibold text-foreground px-1">
							Palette
						</div>
						<DsRadioGroup
							value={palette}
							onValueChange={setPalette}
							name="theme-palette"
							data-group="palette"
						>
							<DsRadioItem value="airy-blue" label="Airy Blue" />
							<DsRadioItem value="misty-lavender" label="Misty Lavender" />
							<DsRadioItem value="sage-breeze" label="Sage Breeze" />
							<DsRadioItem value="cozy-coral" label="Cozy Coral" />
						</DsRadioGroup>
					</section>
				</div>
			</div>
		{/snippet}
	</DsPopover>
</div>

<style>
	/* ... styles removed as they are no longer needed for the simplified layout ... */
</style>
