<script lang="ts">
	import * as m from "$lib/paraglide/messages.js";

	import { DsThemeControlCenter } from "$lib/components/design-system";
	import { theme, themePalette } from "$lib/stores";
</script>

<DsThemeControlCenter
	mode={theme.current}
	onModeChange={(next) => theme.set(next)}
	palette={themePalette.current}
	onPaletteChange={(next) => themePalette.set(next)}
	label={m.theme_toggle_label()}
	triggerTestId="header-theme-toggle"
/>
