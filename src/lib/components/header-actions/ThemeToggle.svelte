<script lang="ts">
	import * as m from "$lib/paraglide/messages.js";

	import { DsLiveRegion, DsThemeControlCenter } from "$lib/components/design-system";
	import type { ThemeMode, ThemePalette } from "$lib/shared/utils/theme";
	import { theme, themePalette } from "$lib/stores";

	let liveRegion: { announce: (message: string) => void } | null = null;

	function getModeLabel(mode: ThemeMode) {
		switch (mode) {
			case "system":
				return m.theme_mode_system();
			case "light":
				return m.theme_mode_light();
			case "dark":
				return m.theme_mode_dark();
		}
	}

	function getPaletteLabel(palette: ThemePalette) {
		switch (palette) {
			case "airy-blue":
				return m.theme_palette_airy_blue();
			case "misty-lavender":
				return m.theme_palette_misty_lavender();
			case "sage-breeze":
				return m.theme_palette_sage_breeze();
			case "cozy-coral":
				return m.theme_palette_cozy_coral();
		}
	}

	function handleModeChange(next: ThemeMode) {
		if (next === theme.current) return;
		theme.set(next);
		liveRegion?.announce(
			m.theme_mode_changed({ mode: getModeLabel(next) })
		);
	}

	function handlePaletteChange(next: ThemePalette) {
		if (next === themePalette.current) return;
		themePalette.set(next);
		liveRegion?.announce(
			m.theme_palette_changed({ palette: getPaletteLabel(next) })
		);
	}
</script>

<DsLiveRegion bind:this={liveRegion} politeness="polite" />

<DsThemeControlCenter
	mode={theme.current}
	onModeChange={handleModeChange}
	palette={themePalette.current}
	onPaletteChange={handlePaletteChange}
	label={m.theme_toggle_label()}
	triggerTestId="header-theme-toggle"
/>
