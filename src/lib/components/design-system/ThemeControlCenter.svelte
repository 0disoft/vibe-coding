<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import { isThemeMode, isThemePalette, type ThemeMode, type ThemePalette } from "$lib/shared/utils/theme";

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
</script>

<div {...rest} class={["inline-flex", className].filter(Boolean).join(" ")}>
  <DsPopover side="bottom" align="end" label={label} panelClass="w-[min(420px,92vw)] p-3">
    {#snippet trigger(props)}
      <DsIconButton
        {...props}
        icon="palette"
        label={label}
        data-testid={triggerTestId ?? "header-theme-control"}
      />
    {/snippet}

    {#snippet children()}
      <div class="grid gap-4">
        <div class="text-label font-semibold text-foreground">{title}</div>

        <section class="grid gap-2">
          <div class="text-menu-sm font-semibold text-foreground">Mode</div>
          <DsRadioGroup value={mode} onValueChange={setMode}>
            <DsRadioItem value="system" label="System" description="OS 설정을 따릅니다" />
            <DsRadioItem value="light" label="Light" description="항상 라이트로 고정" />
            <DsRadioItem value="dark" label="Dark" description="항상 다크로 고정" />
          </DsRadioGroup>
        </section>

        <section class="grid gap-2">
          <div class="text-menu-sm font-semibold text-foreground">Palette</div>
          <DsRadioGroup value={palette} onValueChange={setPalette}>
            <DsRadioItem value="classic">
              {#snippet children()}
                <div class="ds-theme-palette-row">
                  <div class="ds-theme-palette-name">Classic</div>
                  <div class="ds-theme-palette-preview">
                    <div class="ds-theme-swatches" data-theme="light" data-theme-palette="classic" aria-label="Classic light preview">
                      <span class="ds-theme-swatch is-primary"></span>
                      <span class="ds-theme-swatch is-secondary"></span>
                      <span class="ds-theme-swatch is-link"></span>
                    </div>
                    <div class="ds-theme-swatches" data-theme="dark" data-theme-palette="classic" aria-label="Classic dark preview">
                      <span class="ds-theme-swatch is-primary"></span>
                      <span class="ds-theme-swatch is-secondary"></span>
                      <span class="ds-theme-swatch is-link"></span>
                    </div>
                  </div>
                </div>
              {/snippet}
            </DsRadioItem>

            <DsRadioItem value="paper">
              {#snippet children()}
                <div class="ds-theme-palette-row">
                  <div class="ds-theme-palette-name">Paper</div>
                  <div class="ds-theme-palette-preview">
                    <div class="ds-theme-swatches" data-theme="light" data-theme-palette="paper" aria-label="Paper light preview">
                      <span class="ds-theme-swatch is-primary"></span>
                      <span class="ds-theme-swatch is-secondary"></span>
                      <span class="ds-theme-swatch is-link"></span>
                    </div>
                    <div class="ds-theme-swatches" data-theme="dark" data-theme-palette="paper" aria-label="Paper dark preview">
                      <span class="ds-theme-swatch is-primary"></span>
                      <span class="ds-theme-swatch is-secondary"></span>
                      <span class="ds-theme-swatch is-link"></span>
                    </div>
                  </div>
                </div>
              {/snippet}
            </DsRadioItem>

            <DsRadioItem value="forest">
              {#snippet children()}
                <div class="ds-theme-palette-row">
                  <div class="ds-theme-palette-name">Forest</div>
                  <div class="ds-theme-palette-preview">
                    <div class="ds-theme-swatches" data-theme="light" data-theme-palette="forest" aria-label="Forest light preview">
                      <span class="ds-theme-swatch is-primary"></span>
                      <span class="ds-theme-swatch is-secondary"></span>
                      <span class="ds-theme-swatch is-link"></span>
                    </div>
                    <div class="ds-theme-swatches" data-theme="dark" data-theme-palette="forest" aria-label="Forest dark preview">
                      <span class="ds-theme-swatch is-primary"></span>
                      <span class="ds-theme-swatch is-secondary"></span>
                      <span class="ds-theme-swatch is-link"></span>
                    </div>
                  </div>
                </div>
              {/snippet}
            </DsRadioItem>

            <DsRadioItem value="nordic">
              {#snippet children()}
                <div class="ds-theme-palette-row">
                  <div class="ds-theme-palette-name">Nordic</div>
                  <div class="ds-theme-palette-preview">
                    <div class="ds-theme-swatches" data-theme="light" data-theme-palette="nordic" aria-label="Nordic light preview">
                      <span class="ds-theme-swatch is-primary"></span>
                      <span class="ds-theme-swatch is-secondary"></span>
                      <span class="ds-theme-swatch is-link"></span>
                    </div>
                    <div class="ds-theme-swatches" data-theme="dark" data-theme-palette="nordic" aria-label="Nordic dark preview">
                      <span class="ds-theme-swatch is-primary"></span>
                      <span class="ds-theme-swatch is-secondary"></span>
                      <span class="ds-theme-swatch is-link"></span>
                    </div>
                  </div>
                </div>
              {/snippet}
            </DsRadioItem>
          </DsRadioGroup>
        </section>
      </div>
    {/snippet}
  </DsPopover>
</div>

<style>
  .ds-theme-palette-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-3);
    width: 100%;
  }

  .ds-theme-palette-name {
    font-weight: 700;
    color: oklch(var(--color-text));
    font-size: var(--font-size-sm);
  }

  .ds-theme-palette-preview {
    display: grid;
    gap: 6px;
  }

  .ds-theme-swatches {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    justify-content: flex-end;
  }

  .ds-theme-swatch {
    width: 14px;
    height: 10px;
    border-radius: 999px;
    border: 1px solid oklch(var(--color-border));
    background: oklch(var(--color-surface));
  }

  .ds-theme-swatch.is-primary {
    background: oklch(var(--color-primary));
    border-color: oklch(var(--color-primary) / 0.4);
  }

  .ds-theme-swatch.is-secondary {
    background: oklch(var(--color-secondary));
    border-color: oklch(var(--color-secondary) / 0.4);
  }

  .ds-theme-swatch.is-link {
    background: oklch(var(--color-link));
    border-color: oklch(var(--color-link) / 0.4);
  }
</style>

