<script lang="ts">
  import { onMount } from 'svelte';

  import {
    DsButton,
    DsCard,
    DsDialog,
    DsDropdown,
    DsField,
    DsIcon,
    DsIconButton,
    DsInlineIcon,
    DsInput,
    DsTooltip,
    DsToastRegion
  } from '$lib/components/lab/design-system';

  type TokenRow = {
    name: string;
    cssVar: string;
    sampleBgClass?: string;
    sampleTextClass?: string;
    swatchMode?: 'oklch' | 'direct';
  };

  const tokens: TokenRow[] = [
    { name: 'Background', cssVar: '--color-background', sampleBgClass: 'bg-background', sampleTextClass: 'text-foreground' },
    { name: 'Text', cssVar: '--color-text', sampleBgClass: 'bg-foreground', sampleTextClass: 'text-background' },
    { name: 'Surface', cssVar: '--color-surface', sampleBgClass: 'bg-card', sampleTextClass: 'text-card-foreground' },
    { name: 'Primary', cssVar: '--color-primary', sampleBgClass: 'bg-primary', sampleTextClass: 'text-primary-foreground' },
    { name: 'Primary Hover', cssVar: '--color-primary-hover', swatchMode: 'oklch' },
    { name: 'Secondary', cssVar: '--color-secondary', sampleBgClass: 'bg-secondary', sampleTextClass: 'text-secondary-foreground' },
    { name: 'Muted Text', cssVar: '--color-text-muted', sampleBgClass: 'bg-muted', sampleTextClass: 'text-muted-foreground' },
    { name: 'Accent', cssVar: '--color-accent', sampleBgClass: 'bg-accent', sampleTextClass: 'text-accent-foreground' },
    { name: 'Link', cssVar: '--color-link', sampleBgClass: 'bg-link', sampleTextClass: 'text-link-foreground' },
    { name: 'Border', cssVar: '--color-border', sampleBgClass: 'bg-border', sampleTextClass: 'text-background' },
    { name: 'Input', cssVar: '--color-input', sampleBgClass: 'bg-input', sampleTextClass: 'text-background' },
    { name: 'Error', cssVar: '--color-error', sampleBgClass: 'bg-destructive', sampleTextClass: 'text-destructive-foreground' },
    { name: 'Success', cssVar: '--color-success', sampleBgClass: 'bg-success', sampleTextClass: 'text-success-foreground' },
    { name: 'Warning', cssVar: '--color-warning', sampleBgClass: 'bg-warning', sampleTextClass: 'text-warning-foreground' },
    { name: 'Selected', cssVar: '--color-selected', sampleBgClass: 'bg-selected', sampleTextClass: 'text-selected-foreground' },
    { name: 'Sidebar', cssVar: '--color-sidebar', sampleBgClass: 'bg-sidebar', sampleTextClass: 'text-sidebar-foreground' },
    { name: 'Overlay', cssVar: '--color-overlay', sampleBgClass: 'bg-overlay', sampleTextClass: 'text-foreground' },
    { name: 'Surface Hover', cssVar: '--color-surface-hover', swatchMode: 'oklch' },
    { name: 'Scrim', cssVar: '--color-scrim', swatchMode: 'direct' },
    { name: 'Neutral 50', cssVar: '--color-neutral-50', swatchMode: 'oklch' },
    { name: 'Neutral 900', cssVar: '--color-neutral-900', swatchMode: 'oklch' },
  ];

  const a11yVars = [
    '--touch-target-min',
    '--focus-ring-width',
    '--focus-ring-offset',
    '--focus-ring-color',
    '--focus-ring-offset-color',
  ] as const;

  const spacingVars = [
    '--spacing-1',
    '--spacing-2',
    '--spacing-3',
    '--spacing-4',
    '--spacing-6',
    '--spacing-8',
    '--spacing-12',
    '--spacing-16',
  ] as const;

  const radiusVars = [
    '--radius-sm',
    '--radius-md',
    '--radius-lg',
  ] as const;

  const borderVars = [
    '--border-width',
  ] as const;

  const opacityVars = [
    '--opacity-disabled',
    '--opacity-hover',
  ] as const;

  const elevationVars = [
    '--shadow-sm',
    '--shadow-md',
    '--shadow-lg',
    '--elevation-1',
    '--elevation-2',
    '--elevation-3',
  ] as const;

  const zIndexVars = [
    '--z-dropdown',
    '--z-tooltip',
    '--z-modal',
    '--z-toast',
  ] as const;

  let lightEl = $state<HTMLElement | null>(null);
  let darkEl = $state<HTMLElement | null>(null);

  let lightVars = $state<Record<string, string>>({});
  let darkVars = $state<Record<string, string>>({});

  let dialogOpenLight = $state(false);
  // Dark 패널은 기본적으로 light와 동일한 패턴을 공유합니다(토큰만 다름).

  let lastDropdownLight = $state<string | null>(null);
  // Dark 패널은 기본적으로 light와 동일한 패턴을 공유합니다(토큰만 다름).

  type ToastItem = {
    id: string;
    title: string;
    message?: string;
    intent?: 'neutral' | 'success' | 'warning' | 'error';
  };

  let toasts = $state<ToastItem[]>([]);

  function addToast(next: Omit<ToastItem, 'id'>): void {
    const id = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).toString();
    toasts = [{ id, ...next }, ...toasts].slice(0, 4);
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
    }, 3500);
  }

  function readVars(el: HTMLElement, rows: TokenRow[]): Record<string, string> {
    const styles = getComputedStyle(el);
    const result: Record<string, string> = {};

    for (const row of rows) {
      result[row.cssVar] = styles.getPropertyValue(row.cssVar).trim() || '?';
    }

    for (const name of a11yVars) {
      result[name] = styles.getPropertyValue(name).trim() || '?';
    }

    for (const name of spacingVars) {
      result[name] = styles.getPropertyValue(name).trim() || '?';
    }

    for (const name of radiusVars) {
      result[name] = styles.getPropertyValue(name).trim() || '?';
    }

    for (const name of borderVars) {
      result[name] = styles.getPropertyValue(name).trim() || '?';
    }

    for (const name of opacityVars) {
      result[name] = styles.getPropertyValue(name).trim() || '?';
    }

    for (const name of elevationVars) {
      result[name] = styles.getPropertyValue(name).trim() || '?';
    }

    for (const name of zIndexVars) {
      result[name] = styles.getPropertyValue(name).trim() || '?';
    }

    return result;
  }

  onMount(() => {
    document.documentElement.dataset.dsLabReady = '1';
    if (lightEl) lightVars = readVars(lightEl, tokens);
    if (darkEl) darkVars = readVars(darkEl, tokens);
  });
</script>

<div class="space-y-10 py-10">
  <header class="space-y-2">
    <h1 class="text-h1 font-bold">Design System Lab</h1>
    <p class="text-body-secondary text-muted-foreground">
      이 페이지는 DEV 환경에서만 열립니다. 토큰/유틸리티/상태 UI를 한 곳에서 빠르게 검증하는 용도입니다.
    </p>
  </header>

  <section class="space-y-4">
    <h2 class="text-h2 font-semibold">토큰 스냅샷 (Light / Dark)</h2>
    <p class="text-body-secondary text-muted-foreground">
      아래 두 패널은 전역 테마와 무관하게 <code class="text-inline-code">.ds-lab</code> 스코프 토큰으로 렌더링됩니다.
      가이드 네이밍(<code class="text-inline-code">--color-*</code>)을 canonical로 두고, 기존 변수는 alias로 유지합니다.
    </p>

    <div class="grid gap-6 lg:grid-cols-2">
      <div bind:this={lightEl} class="ds-lab rounded-xl border border-border bg-background p-5 text-foreground" data-ds-theme="light">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-h3 font-semibold">Light</h3>
          <span class="text-caption text-muted-foreground">data-ds-theme="light"</span>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          {#each tokens as t (t.cssVar)}
            <div class="rounded-lg border border-border bg-card p-3">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="text-label font-medium">{t.name}</div>
                  <div class="text-helper text-muted-foreground font-mono">
                    {t.cssVar}
                  </div>
                </div>
                {#if t.sampleBgClass && t.sampleTextClass}
                  <div class={`h-9 w-9 rounded-md border border-border ${t.sampleBgClass} flex items-center justify-center`}>
                    <span class={`text-badge font-bold ${t.sampleTextClass}`}>A</span>
                  </div>
                {:else if t.swatchMode}
                  <div
                    class="h-9 w-9 rounded-md border border-border"
                    style={
                      t.swatchMode === 'direct'
                        ? `background-color: var(${t.cssVar});`
                        : `background-color: oklch(var(${t.cssVar}));`
                    }
                    aria-label={`${t.name} swatch`}
                  ></div>
                {/if}
              </div>

              <div class="mt-2 text-helper text-muted-foreground font-mono">
                {lightVars[t.cssVar] ?? '...'}
              </div>
            </div>
          {/each}
        </div>

        <div class="mt-6 space-y-4">
          <h4 class="text-h3 font-semibold">상태 UI</h4>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <div class="text-label font-medium">Buttons</div>
              <div class="space-y-2">
                <div class="flex flex-wrap gap-2">
                  <DsButton size="sm" intent="primary">Primary sm</DsButton>
                  <DsButton intent="primary">Primary md</DsButton>
                  <DsButton size="lg" intent="primary">Primary lg</DsButton>
                </div>
                <div class="flex flex-wrap gap-2">
                  <DsButton variant="outline" intent="primary">Outline</DsButton>
                  <DsButton variant="ghost" intent="secondary">Ghost</DsButton>
                  <DsButton variant="link">Link</DsButton>
                  <DsButton disabled intent="secondary">Disabled</DsButton>
                </div>
                <div class="mt-3 space-y-2">
                  <div class="text-helper text-muted-foreground">States (Primary / Solid)</div>
                  <div class="grid gap-2 sm:grid-cols-5">
                    <div class="rounded-lg border border-border bg-card p-3">
                      <div class="text-helper text-muted-foreground">Default</div>
                      <div class="mt-2">
                        <DsButton intent="primary">Primary</DsButton>
                      </div>
                    </div>
                    <div class="rounded-lg border border-border bg-card p-3">
                      <div class="text-helper text-muted-foreground">Hover</div>
                      <div class="mt-2">
                        <DsButton intent="primary" data-ds-state="hover">Primary</DsButton>
                      </div>
                    </div>
                    <div class="rounded-lg border border-border bg-card p-3">
                      <div class="text-helper text-muted-foreground">Focus</div>
                      <div class="mt-2">
                        <DsButton intent="primary" data-ds-state="focus">Primary</DsButton>
                      </div>
                    </div>
                    <div class="rounded-lg border border-border bg-card p-3">
                      <div class="text-helper text-muted-foreground">Active</div>
                      <div class="mt-2">
                        <DsButton intent="primary" data-ds-state="active">Primary</DsButton>
                      </div>
                    </div>
                    <div class="rounded-lg border border-border bg-card p-3">
                      <div class="text-helper text-muted-foreground">Disabled</div>
                      <div class="mt-2">
                        <DsButton intent="primary" disabled>Primary</DsButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <div class="text-label font-medium">Inputs</div>
              <div class="space-y-2">
                <label class="block space-y-1">
                  <span class="text-label text-muted-foreground">Email</span>
                  <div class="grid gap-2">
                    <DsInput size="sm" type="email" placeholder="you@example.com (sm)" />
                    <DsInput type="email" placeholder="you@example.com (md)" />
                    <DsInput size="lg" type="email" placeholder="you@example.com (lg)" />
                    <DsInput variant="filled" type="email" placeholder="filled variant" />
                  </div>
                </label>

                <label class="block space-y-1">
                  <span class="text-label text-muted-foreground">Email (Error)</span>
                  <DsInput type="email" placeholder="invalid" invalid />
                  <div class="text-helper text-destructive">유효한 이메일 주소를 입력하세요.</div>
                </label>

                <div class="mt-4 space-y-2">
                  <div class="text-label font-medium">Field Pattern</div>
                  <div class="grid gap-3">
                    <DsField id="lab-light-email" label="Email" helpText="이메일로 로그인 링크를 보낼 수 있어요." required>
                      {#snippet children(p)}
                        <DsInput
                          id={p.id}
                          type="email"
                          placeholder="you@example.com"
                          required={p.required}
                          aria-describedby={p.describedBy}
                          invalid={p.invalid}
                        />
                      {/snippet}
                    </DsField>

                    <DsField
                      id="lab-light-email-error"
                      label="Email"
                      helpText="예: you@example.com"
                      errorText="유효한 이메일 주소를 입력하세요."
                      invalid
                    >
                      {#snippet children(p)}
                        <DsInput
                          id={p.id}
                          type="email"
                          placeholder="invalid"
                          aria-describedby={p.describedBy}
                          invalid={p.invalid}
                        />
                      {/snippet}
                    </DsField>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DsCard motion>
            <div class="flex items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="text-label font-medium">Card</div>
                <div class="text-body-secondary text-muted-foreground">
                  카드 배경/경계/텍스트 대비 + 모션 기본값을 빠르게 확인합니다.
                </div>
              </div>
              <span class="text-badge rounded-full bg-selected px-2 py-0.5 text-selected-foreground">Selected</span>
            </div>
            <div class="mt-3 text-body">
              <a class="ds-focus-ring text-link underline underline-offset-2 hover:text-link/90" href="/lab/design-system">링크 토큰 테스트</a>
            </div>
          </DsCard>

          <div class="space-y-2">
            <div class="text-label font-medium">A11y Tokens</div>
            <div class="grid gap-2 sm:grid-cols-2">
              {#each a11yVars as name (name)}
                <div class="rounded-lg border border-border bg-card p-3">
                  <div class="text-helper text-muted-foreground font-mono">{name}</div>
                  <div class="mt-1 text-helper text-muted-foreground font-mono">{lightVars[name] ?? '...'}</div>
                </div>
              {/each}
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="ds-touch-target ds-focus-ring inline-flex items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-muted"
                aria-label="Icon button"
              >
                <span class="i-lucide-heart h-4 w-4"></span>
              </button>
              <span class="text-helper text-muted-foreground">
                아이콘 버튼은 <code class="text-inline-code">--touch-target-min</code> 이상을 목표로 합니다.
              </span>
            </div>
          </div>

          <div class="space-y-2">
            <div class="text-label font-medium">Spacing / Radius / Opacity</div>
            <div class="grid gap-4 lg:grid-cols-3">
              <div class="space-y-2">
                <div class="text-helper text-muted-foreground">Spacing (padding demo)</div>
                <div class="grid gap-2 sm:grid-cols-2">
                  {#each spacingVars as name (name)}
                    <div class="rounded-lg border border-border bg-card p-3">
                      <div class="text-helper text-muted-foreground font-mono">{name}</div>
                      <div class="mt-2 rounded-md border border-border bg-background" style={`padding: var(${name});`}>
                        <div class="h-6 w-6 rounded bg-selected" aria-hidden="true"></div>
                      </div>
                      <div class="mt-2 text-helper text-muted-foreground font-mono">{lightVars[name] ?? '...'}</div>
                    </div>
                  {/each}
                </div>
              </div>

              <div class="space-y-2">
                <div class="text-helper text-muted-foreground">Radius</div>
                <div class="grid gap-2 sm:grid-cols-2">
                  {#each radiusVars as name (name)}
                    <div class="rounded-lg border border-border bg-card p-3">
                      <div class="text-helper text-muted-foreground font-mono">{name}</div>
                      <div
                        class="mt-2 h-10 w-10 border border-border bg-background"
                        style={`border-radius: var(${name}); border-width: var(--border-width);`}
                        aria-label={`${name} demo`}
                      ></div>
                      <div class="mt-2 text-helper text-muted-foreground font-mono">{lightVars[name] ?? '...'}</div>
                    </div>
                  {/each}
                  {#each borderVars as name (name)}
                    <div class="rounded-lg border border-border bg-card p-3">
                      <div class="text-helper text-muted-foreground font-mono">{name}</div>
                      <div class="mt-2 h-10 w-10 border border-border bg-background" style={`border-width: var(${name});`} aria-label={`${name} demo`}></div>
                      <div class="mt-2 text-helper text-muted-foreground font-mono">{lightVars[name] ?? '...'}</div>
                    </div>
                  {/each}
                </div>
              </div>

              <div class="space-y-2">
                <div class="text-helper text-muted-foreground">Opacity</div>
                <div class="grid gap-2 sm:grid-cols-2">
                  {#each opacityVars as name (name)}
                    <div class="rounded-lg border border-border bg-card p-3">
                      <div class="text-helper text-muted-foreground font-mono">{name}</div>
                      <div
                        class="mt-2 rounded-md border border-border bg-background p-3"
                        style={`opacity: var(${name});`}
                        aria-label={`${name} demo`}
                      >
                        <div class="text-helper text-muted-foreground">Opacity sample</div>
                      </div>
                      <div class="mt-2 text-helper text-muted-foreground font-mono">{lightVars[name] ?? '...'}</div>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <div class="text-label font-medium">Elevation / Z-index</div>
            <div class="grid gap-4 lg:grid-cols-2">
              <div class="space-y-2">
                <div class="text-helper text-muted-foreground">Elevation (shadows)</div>
                <div class="grid gap-2 sm:grid-cols-3">
                  <div class="ds-elevation-1 rounded-lg border border-border bg-background p-3">
                    <div class="text-helper text-muted-foreground">Elevation 1</div>
                  </div>
                  <div class="ds-elevation-2 rounded-lg border border-border bg-background p-3">
                    <div class="text-helper text-muted-foreground">Elevation 2</div>
                  </div>
                  <div class="ds-elevation-3 rounded-lg border border-border bg-background p-3">
                    <div class="text-helper text-muted-foreground">Elevation 3</div>
                  </div>
                </div>
                <div class="grid gap-2 sm:grid-cols-2">
                  {#each elevationVars as name (name)}
                    <div class="rounded-lg border border-border bg-card p-3">
                      <div class="text-helper text-muted-foreground font-mono">{name}</div>
                      <div class="mt-2 text-helper text-muted-foreground font-mono">{lightVars[name] ?? '...'}</div>
                    </div>
                  {/each}
                </div>
              </div>

              <div class="space-y-2">
                <div class="text-helper text-muted-foreground">Z-index (stacking)</div>
                <div class="relative h-36 overflow-hidden rounded-lg border border-border bg-card p-3">
                  <div
                    class="ds-elevation-1 absolute left-3 top-10 rounded-md border border-border bg-background px-3 py-2 text-helper text-muted-foreground"
                    style="z-index: var(--z-dropdown);"
                  >
                    Dropdown
                  </div>
                  <div
                    class="ds-elevation-2 absolute left-10 top-14 rounded-md border border-border bg-background px-3 py-2 text-helper text-muted-foreground"
                    style="z-index: var(--z-modal);"
                  >
                    Modal
                  </div>
                  <div
                    class="ds-elevation-3 absolute left-16 top-4 rounded-md border border-border bg-background px-3 py-2 text-helper text-muted-foreground"
                    style="z-index: var(--z-toast);"
                  >
                    Toast
                  </div>
                </div>
                <div class="grid gap-2 sm:grid-cols-3">
                  {#each zIndexVars as name (name)}
                    <div class="rounded-lg border border-border bg-card p-3">
                      <div class="text-helper text-muted-foreground font-mono">{name}</div>
                      <div class="mt-2 text-helper text-muted-foreground font-mono">{lightVars[name] ?? '...'}</div>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <div class="text-label font-medium">Icons</div>
            <div class="grid gap-4 lg:grid-cols-2">
              <div class="space-y-2">
                <div class="text-helper text-muted-foreground">DsIcon</div>
                <div class="flex flex-wrap items-center gap-3">
                  <div class="rounded-lg border border-border bg-card p-3">
                    <div class="text-helper text-muted-foreground">sm</div>
                    <div class="mt-2 flex items-center gap-2">
                      <DsIcon name="heart" size="sm" />
                      <DsIcon name="sparkles" size="sm" />
                      <DsIcon name="check" size="sm" />
                    </div>
                  </div>
                  <div class="rounded-lg border border-border bg-card p-3">
                    <div class="text-helper text-muted-foreground">md</div>
                    <div class="mt-2 flex items-center gap-2">
                      <DsIcon name="heart" />
                      <DsIcon name="sparkles" />
                      <DsIcon name="check" />
                    </div>
                  </div>
                  <div class="rounded-lg border border-border bg-card p-3">
                    <div class="text-helper text-muted-foreground">lg</div>
                    <div class="mt-2 flex items-center gap-2">
                      <DsIcon name="heart" size="lg" />
                      <DsIcon name="sparkles" size="lg" />
                      <DsIcon name="check" size="lg" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <div class="text-helper text-muted-foreground">Patterns</div>
                <div class="grid gap-3 sm:grid-cols-2">
                  <div class="rounded-lg border border-border bg-card p-3">
                    <div class="text-helper text-muted-foreground">IconButton</div>
                    <div class="mt-2 flex flex-wrap gap-2">
                      <DsIconButton icon="heart" label="Like" />
                      <DsIconButton icon="settings" label="Settings" variant="outline" intent="primary" />
                      <DsIconButton icon="trash-2" label="Delete" intent="error" />
                      <DsIconButton icon="loader-circle" label="Loading" loading />
                    </div>
                  </div>
                  <div class="rounded-lg border border-border bg-card p-3">
                    <div class="text-helper text-muted-foreground">InlineIcon</div>
                    <div class="mt-2 space-y-2">
                      <div class="text-body">
                        저장 완료
                        <DsInlineIcon name="check" />
                      </div>
                      <div class="text-body-secondary text-muted-foreground">
                        설정
                        <DsInlineIcon name="settings" />
                      </div>
                      <div class="text-body-secondary text-muted-foreground">
                        경고
                        <DsInlineIcon name="triangle-alert" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <div class="text-label font-medium">Patterns</div>
            <div class="grid gap-4 lg:grid-cols-2">
              <div class="space-y-2">
                <div class="text-helper text-muted-foreground">Dialog</div>
                <div class="flex flex-wrap gap-2">
                  <DsButton intent="primary" onclick={() => (dialogOpenLight = true)}>Open dialog</DsButton>
                </div>

                <DsDialog
                  id="lab-light-dialog"
                  title="Example Dialog"
                  description="포커스/스크림/닫기 동작을 검증합니다."
                  open={dialogOpenLight}
                  onOpenChange={(next) => (dialogOpenLight = next)}
                >
                  <p class="text-body">
                    이 Dialog는 <code class="text-inline-code">&lt;dialog&gt;</code> 기반이며, ESC/바깥 클릭으로 닫힙니다.
                  </p>
                </DsDialog>
              </div>

              <div class="space-y-2">
                <div class="text-helper text-muted-foreground">Dropdown</div>
                <div class="flex items-center gap-3">
                  <DsDropdown
                    label="Open menu"
                    items={[
                      { id: 'profile', label: 'Profile' },
                      { id: 'settings', label: 'Settings' },
                      { id: 'disabled', label: 'Disabled item', disabled: true },
                      { id: 'logout', label: 'Logout' },
                    ]}
                    onSelect={(id) => (lastDropdownLight = id)}
                  />
                  <span class="text-helper text-muted-foreground">
                    Last: <code class="text-inline-code">{lastDropdownLight ?? '-'}</code>
                  </span>
                </div>
              </div>
            </div>

            <div class="grid gap-4 lg:grid-cols-2">
              <div class="space-y-2">
                <div class="text-helper text-muted-foreground">Toast</div>
                <div class="flex flex-wrap gap-2">
                  <DsButton variant="outline" intent="secondary" onclick={() => addToast({ title: 'Saved', message: '변경사항이 저장되었습니다.', intent: 'success' })}>Success</DsButton>
                  <DsButton variant="outline" intent="secondary" onclick={() => addToast({ title: 'Warning', message: '확인이 필요합니다.', intent: 'warning' })}>Warning</DsButton>
                  <DsButton variant="outline" intent="secondary" onclick={() => addToast({ title: 'Error', message: '저장에 실패했습니다.', intent: 'error' })}>Error</DsButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div bind:this={darkEl} class="ds-lab rounded-xl border border-border bg-background p-5 text-foreground" data-ds-theme="dark">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-h3 font-semibold">Dark</h3>
          <span class="text-caption text-muted-foreground">data-ds-theme="dark"</span>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          {#each tokens as t (t.cssVar)}
            <div class="rounded-lg border border-border bg-card p-3">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="text-label font-medium">{t.name}</div>
                  <div class="text-helper text-muted-foreground font-mono">
                    {t.cssVar}
                  </div>
                </div>
                {#if t.sampleBgClass && t.sampleTextClass}
                  <div class={`h-9 w-9 rounded-md border border-border ${t.sampleBgClass} flex items-center justify-center`}>
                    <span class={`text-badge font-bold ${t.sampleTextClass}`}>A</span>
                  </div>
                {:else if t.swatchMode}
                  <div
                    class="h-9 w-9 rounded-md border border-border"
                    style={
                      t.swatchMode === 'direct'
                        ? `background-color: var(${t.cssVar});`
                        : `background-color: oklch(var(${t.cssVar}));`
                    }
                    aria-label={`${t.name} swatch`}
                  ></div>
                {/if}
              </div>

              <div class="mt-2 text-helper text-muted-foreground font-mono">
                {darkVars[t.cssVar] ?? '...'}
              </div>
            </div>
          {/each}
        </div>

        <div class="mt-6 space-y-4">
          <h4 class="text-h3 font-semibold">상태 UI</h4>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <div class="text-label font-medium">Buttons</div>
              <div class="space-y-2">
                <div class="flex flex-wrap gap-2">
                  <DsButton size="sm" intent="primary">Primary sm</DsButton>
                  <DsButton intent="primary">Primary md</DsButton>
                  <DsButton size="lg" intent="primary">Primary lg</DsButton>
                </div>
                <div class="flex flex-wrap gap-2">
                  <DsButton variant="outline" intent="primary">Outline</DsButton>
                  <DsButton variant="ghost" intent="secondary">Ghost</DsButton>
                  <DsButton variant="link">Link</DsButton>
                  <DsButton disabled intent="secondary">Disabled</DsButton>
                </div>
                <div class="mt-3 space-y-2">
                  <div class="text-helper text-muted-foreground">States (Primary / Solid)</div>
                  <div class="grid gap-2 sm:grid-cols-5">
                    <div class="rounded-lg border border-border bg-card p-3">
                      <div class="text-helper text-muted-foreground">Default</div>
                      <div class="mt-2">
                        <DsButton intent="primary">Primary</DsButton>
                      </div>
                    </div>
                    <div class="rounded-lg border border-border bg-card p-3">
                      <div class="text-helper text-muted-foreground">Hover</div>
                      <div class="mt-2">
                        <DsButton intent="primary" data-ds-state="hover">Primary</DsButton>
                      </div>
                    </div>
                    <div class="rounded-lg border border-border bg-card p-3">
                      <div class="text-helper text-muted-foreground">Focus</div>
                      <div class="mt-2">
                        <DsButton intent="primary" data-ds-state="focus">Primary</DsButton>
                      </div>
                    </div>
                    <div class="rounded-lg border border-border bg-card p-3">
                      <div class="text-helper text-muted-foreground">Active</div>
                      <div class="mt-2">
                        <DsButton intent="primary" data-ds-state="active">Primary</DsButton>
                      </div>
                    </div>
                    <div class="rounded-lg border border-border bg-card p-3">
                      <div class="text-helper text-muted-foreground">Disabled</div>
                      <div class="mt-2">
                        <DsButton intent="primary" disabled>Primary</DsButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <div class="text-label font-medium">Inputs</div>
              <div class="space-y-2">
                <label class="block space-y-1">
                  <span class="text-label text-muted-foreground">Email</span>
                  <div class="grid gap-2">
                    <DsInput size="sm" type="email" placeholder="you@example.com (sm)" />
                    <DsInput type="email" placeholder="you@example.com (md)" />
                    <DsInput size="lg" type="email" placeholder="you@example.com (lg)" />
                    <DsInput variant="filled" type="email" placeholder="filled variant" />
                  </div>
                </label>

                <label class="block space-y-1">
                  <span class="text-label text-muted-foreground">Email (Error)</span>
                  <DsInput type="email" placeholder="invalid" invalid />
                  <div class="text-helper text-destructive">유효한 이메일 주소를 입력하세요.</div>
                </label>

                <div class="mt-4 space-y-2">
                  <div class="text-label font-medium">Field Pattern</div>
                  <div class="grid gap-3">
                    <DsField id="lab-dark-email" label="Email" helpText="이메일로 로그인 링크를 보낼 수 있어요." required>
                      {#snippet children(p)}
                        <DsInput
                          id={p.id}
                          type="email"
                          placeholder="you@example.com"
                          required={p.required}
                          aria-describedby={p.describedBy}
                          invalid={p.invalid}
                        />
                      {/snippet}
                    </DsField>

                    <DsField
                      id="lab-dark-email-error"
                      label="Email"
                      helpText="예: you@example.com"
                      errorText="유효한 이메일 주소를 입력하세요."
                      invalid
                    >
                      {#snippet children(p)}
                        <DsInput
                          id={p.id}
                          type="email"
                          placeholder="invalid"
                          aria-describedby={p.describedBy}
                          invalid={p.invalid}
                        />
                      {/snippet}
                    </DsField>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DsCard motion>
            <div class="flex items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="text-label font-medium">Card</div>
                <div class="text-body-secondary text-muted-foreground">
                  카드 배경/경계/텍스트 대비 + 모션 기본값을 빠르게 확인합니다.
                </div>
              </div>
              <span class="text-badge rounded-full bg-selected px-2 py-0.5 text-selected-foreground">Selected</span>
            </div>
            <div class="mt-3 text-body">
              <a class="ds-focus-ring text-link underline underline-offset-2 hover:text-link/90" href="/lab/design-system">링크 토큰 테스트</a>
            </div>
          </DsCard>

          <div class="space-y-2">
            <div class="text-label font-medium">A11y Tokens</div>
            <div class="grid gap-2 sm:grid-cols-2">
              {#each a11yVars as name (name)}
                <div class="rounded-lg border border-border bg-card p-3">
                  <div class="text-helper text-muted-foreground font-mono">{name}</div>
                  <div class="mt-1 text-helper text-muted-foreground font-mono">{darkVars[name] ?? '...'}</div>
                </div>
              {/each}
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="ds-touch-target ds-focus-ring inline-flex items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-muted"
                aria-label="Icon button"
              >
                <span class="i-lucide-heart h-4 w-4"></span>
              </button>
              <span class="text-helper text-muted-foreground">
                아이콘 버튼은 <code class="text-inline-code">--touch-target-min</code> 이상을 목표로 합니다.
              </span>
            </div>
          </div>

          <div class="space-y-2">
            <div class="text-label font-medium">Spacing / Radius / Opacity</div>
            <div class="grid gap-4 lg:grid-cols-3">
              <div class="space-y-2">
                <div class="text-helper text-muted-foreground">Spacing (padding demo)</div>
                <div class="grid gap-2 sm:grid-cols-2">
                  {#each spacingVars as name (name)}
                    <div class="rounded-lg border border-border bg-card p-3">
                      <div class="text-helper text-muted-foreground font-mono">{name}</div>
                      <div class="mt-2 rounded-md border border-border bg-background" style={`padding: var(${name});`}>
                        <div class="h-6 w-6 rounded bg-selected" aria-hidden="true"></div>
                      </div>
                      <div class="mt-2 text-helper text-muted-foreground font-mono">{darkVars[name] ?? '...'}</div>
                    </div>
                  {/each}
                </div>
              </div>

              <div class="space-y-2">
                <div class="text-helper text-muted-foreground">Radius</div>
                <div class="grid gap-2 sm:grid-cols-2">
                  {#each radiusVars as name (name)}
                    <div class="rounded-lg border border-border bg-card p-3">
                      <div class="text-helper text-muted-foreground font-mono">{name}</div>
                      <div
                        class="mt-2 h-10 w-10 border border-border bg-background"
                        style={`border-radius: var(${name}); border-width: var(--border-width);`}
                        aria-label={`${name} demo`}
                      ></div>
                      <div class="mt-2 text-helper text-muted-foreground font-mono">{darkVars[name] ?? '...'}</div>
                    </div>
                  {/each}
                  {#each borderVars as name (name)}
                    <div class="rounded-lg border border-border bg-card p-3">
                      <div class="text-helper text-muted-foreground font-mono">{name}</div>
                      <div class="mt-2 h-10 w-10 border border-border bg-background" style={`border-width: var(${name});`} aria-label={`${name} demo`}></div>
                      <div class="mt-2 text-helper text-muted-foreground font-mono">{darkVars[name] ?? '...'}</div>
                    </div>
                  {/each}
                </div>
              </div>

              <div class="space-y-2">
                <div class="text-helper text-muted-foreground">Opacity</div>
                <div class="grid gap-2 sm:grid-cols-2">
                  {#each opacityVars as name (name)}
                    <div class="rounded-lg border border-border bg-card p-3">
                      <div class="text-helper text-muted-foreground font-mono">{name}</div>
                      <div
                        class="mt-2 rounded-md border border-border bg-background p-3"
                        style={`opacity: var(${name});`}
                        aria-label={`${name} demo`}
                      >
                        <div class="text-helper text-muted-foreground">Opacity sample</div>
                      </div>
                      <div class="mt-2 text-helper text-muted-foreground font-mono">{darkVars[name] ?? '...'}</div>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <div class="text-label font-medium">Elevation / Z-index</div>
            <div class="grid gap-4 lg:grid-cols-2">
              <div class="space-y-2">
                <div class="text-helper text-muted-foreground">Elevation (shadows)</div>
                <div class="grid gap-2 sm:grid-cols-3">
                  <div class="ds-elevation-1 rounded-lg border border-border bg-background p-3">
                    <div class="text-helper text-muted-foreground">Elevation 1</div>
                  </div>
                  <div class="ds-elevation-2 rounded-lg border border-border bg-background p-3">
                    <div class="text-helper text-muted-foreground">Elevation 2</div>
                  </div>
                  <div class="ds-elevation-3 rounded-lg border border-border bg-background p-3">
                    <div class="text-helper text-muted-foreground">Elevation 3</div>
                  </div>
                </div>
                <div class="grid gap-2 sm:grid-cols-2">
                  {#each elevationVars as name (name)}
                    <div class="rounded-lg border border-border bg-card p-3">
                      <div class="text-helper text-muted-foreground font-mono">{name}</div>
                      <div class="mt-2 text-helper text-muted-foreground font-mono">{darkVars[name] ?? '...'}</div>
                    </div>
                  {/each}
                </div>
              </div>

              <div class="space-y-2">
                <div class="text-helper text-muted-foreground">Z-index (stacking)</div>
                <div class="relative h-36 overflow-hidden rounded-lg border border-border bg-card p-3">
                  <div
                    class="ds-elevation-1 absolute left-3 top-10 rounded-md border border-border bg-background px-3 py-2 text-helper text-muted-foreground"
                    style="z-index: var(--z-dropdown);"
                  >
                    Dropdown
                  </div>
                  <div
                    class="ds-elevation-2 absolute left-10 top-14 rounded-md border border-border bg-background px-3 py-2 text-helper text-muted-foreground"
                    style="z-index: var(--z-modal);"
                  >
                    Modal
                  </div>
                  <div
                    class="ds-elevation-3 absolute left-16 top-4 rounded-md border border-border bg-background px-3 py-2 text-helper text-muted-foreground"
                    style="z-index: var(--z-toast);"
                  >
                    Toast
                  </div>
                </div>
                <div class="grid gap-2 sm:grid-cols-3">
                  {#each zIndexVars as name (name)}
                    <div class="rounded-lg border border-border bg-card p-3">
                      <div class="text-helper text-muted-foreground font-mono">{name}</div>
                      <div class="mt-2 text-helper text-muted-foreground font-mono">{darkVars[name] ?? '...'}</div>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <div class="text-label font-medium">Icons</div>
            <div class="grid gap-4 lg:grid-cols-2">
              <div class="space-y-2">
                <div class="text-helper text-muted-foreground">DsIcon</div>
                <div class="flex flex-wrap items-center gap-3">
                  <div class="rounded-lg border border-border bg-card p-3">
                    <div class="text-helper text-muted-foreground">sm</div>
                    <div class="mt-2 flex items-center gap-2">
                      <DsIcon name="heart" size="sm" />
                      <DsIcon name="sparkles" size="sm" />
                      <DsIcon name="check" size="sm" />
                    </div>
                  </div>
                  <div class="rounded-lg border border-border bg-card p-3">
                    <div class="text-helper text-muted-foreground">md</div>
                    <div class="mt-2 flex items-center gap-2">
                      <DsIcon name="heart" />
                      <DsIcon name="sparkles" />
                      <DsIcon name="check" />
                    </div>
                  </div>
                  <div class="rounded-lg border border-border bg-card p-3">
                    <div class="text-helper text-muted-foreground">lg</div>
                    <div class="mt-2 flex items-center gap-2">
                      <DsIcon name="heart" size="lg" />
                      <DsIcon name="sparkles" size="lg" />
                      <DsIcon name="check" size="lg" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <div class="text-helper text-muted-foreground">Patterns</div>
                <div class="grid gap-3 sm:grid-cols-2">
                  <div class="rounded-lg border border-border bg-card p-3">
                    <div class="text-helper text-muted-foreground">IconButton</div>
                    <div class="mt-2 flex flex-wrap gap-2">
                      <DsIconButton icon="heart" label="Like" />
                      <DsIconButton icon="settings" label="Settings" variant="outline" intent="primary" />
                      <DsIconButton icon="trash-2" label="Delete" intent="error" />
                      <DsIconButton icon="loader-circle" label="Loading" loading />
                    </div>
                  </div>
                  <div class="rounded-lg border border-border bg-card p-3">
                    <div class="text-helper text-muted-foreground">InlineIcon</div>
                    <div class="mt-2 space-y-2">
                      <div class="text-body">
                        저장 완료
                        <DsInlineIcon name="check" />
                      </div>
                      <div class="text-body-secondary text-muted-foreground">
                        설정
                        <DsInlineIcon name="settings" />
                      </div>
                      <div class="text-body-secondary text-muted-foreground">
                        경고
                        <DsInlineIcon name="triangle-alert" />
                      </div>
                    </div>
                  </div>
                  <div class="rounded-lg border border-border bg-card p-3">
                    <div class="text-helper text-muted-foreground">Tooltip</div>
                    <div class="mt-2 flex flex-wrap items-center gap-2">
                      <DsTooltip content="키보드 포커스/호버에서 열리는 툴팁입니다." placement="top">
                        {#snippet children(p)}
                          <button
                            id="lab-light-tooltip-trigger"
                            type="button"
                            class="ds-button ds-focus-ring"
                            data-ds-intent="secondary"
                            data-ds-variant="outline"
                            aria-describedby={p.describedBy}
                            onpointerover={p.onpointerover}
                            onpointerout={p.onpointerout}
                            onfocus={p.onfocus}
                            onblur={p.onblur}
                            onkeydown={p.onkeydown}
                          >
                            Tooltip trigger
                          </button>
                        {/snippet}
                      </DsTooltip>
                      <span class="text-helper text-muted-foreground">(hover 또는 tab focus)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

<DsToastRegion toasts={toasts} onDismiss={(id) => (toasts = toasts.filter((t) => t.id !== id))} />
