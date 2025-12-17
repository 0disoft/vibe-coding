<script lang="ts">
  import { DsIconButton } from "$lib/components/design-system";
  import type { Snippet } from "svelte";
  import { tick } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  import type { Size } from "./types";

  type Variant = "outline" | "filled" | "ghost";
  type Strength = "weak" | "medium" | "strong";

  interface Props extends Omit<HTMLInputAttributes, "size" | "type" | "value"> {
    size?: Size;
    variant?: Variant;
    invalid?: boolean;
    clearable?: boolean;
    value?: string;
    ref?: HTMLInputElement | null;
    start?: Snippet;
    /** 강도 표시(옵션) */
    showStrength?: boolean;
    /** 보기/숨기기 토글 표시 */
    revealable?: boolean;
    revealLabel?: string;
    hideLabel?: string;
    clearLabel?: string;
  }

  let {
    size = "md",
    variant = "outline",
    invalid = false,
    clearable = false,
    value = $bindable(""),
    ref = $bindable(null),
    start,
    showStrength = false,
    revealable = true,
    revealLabel = "Show password",
    hideLabel = "Hide password",
    clearLabel = "Clear value",
    class: className = "",
    ...rest
  }: Props = $props();

  let isRevealed = $state(false);
  let capsLockOn = $state(false);

  function strengthOf(v: string): Strength {
    let score = 0;
    if (v.length >= 8) score += 1;
    if (v.length >= 12) score += 1;
    if (/[A-Z]/.test(v)) score += 1;
    if (/[0-9]/.test(v)) score += 1;
    if (/[^A-Za-z0-9]/.test(v)) score += 1;

    if (score <= 2) return "weak";
    if (score <= 4) return "medium";
    return "strong";
  }

  let strength = $derived(strengthOf(value));

  let showClearBtn = $derived(
    clearable &&
      value !== "" &&
      value !== null &&
      !rest.disabled &&
      !rest.readonly,
  );

  async function handleClear() {
    value = "";
    await tick();
    if (ref) {
      ref.dispatchEvent(new Event("input", { bubbles: true }));
      ref.focus();
    }
  }

  function triggerFocus(node: HTMLElement) {
    function handler(e: MouseEvent) {
      const t = e.target as HTMLElement | null;
      if (!t || !ref) return;
      if (t === ref) return;
      const interactive = t.closest(
        'button, a, input, select, textarea, [role="button"], [role="link"]',
      );
      if (interactive) return;
      ref.focus();
    }
    node.addEventListener("click", handler);
    return {
      destroy() {
        node.removeEventListener("click", handler);
      },
    };
  }
</script>

<div
  class={["ds-input-group", className].filter(Boolean).join(" ")}
  data-ds-size={size}
  data-ds-variant={variant}
  data-invalid={invalid ? "true" : undefined}
  data-disabled={rest.disabled ? "true" : undefined}
  use:triggerFocus
>
  {#if start}
    <div class="ds-input-adornment start">
      {@render start()}
    </div>
  {/if}

  <input
    {...rest}
    bind:this={ref}
    bind:value
    class="ds-input-native"
    type={isRevealed ? "text" : "password"}
    aria-invalid={invalid ? "true" : undefined}
    onkeydown={(e) => {
      capsLockOn = !!(e.getModifierState?.("CapsLock") ?? false);
      // @ts-ignore - Svelte HTML attributes typing issue
      if (!e.defaultPrevented) rest.onkeydown?.(e);
    }}
  />

  <div class="ds-input-adornment end">
    <div class="flex items-center gap-1">
      {#if showClearBtn}
        <DsIconButton
          type="button"
          icon="x"
          size="sm"
          variant="ghost"
          intent="secondary"
          label={clearLabel}
          onclick={handleClear}
        />
      {/if}

      {#if revealable}
        <DsIconButton
          type="button"
          size="sm"
          variant="ghost"
          intent="secondary"
          icon={isRevealed ? "eye-off" : "eye"}
          label={isRevealed ? hideLabel : revealLabel}
          onclick={() => (isRevealed = !isRevealed)}
        />
      {/if}
    </div>
  </div>
</div>

{#if capsLockOn}
  <div class="ds-password-hint">
    <span class="i-lucide-alert-triangle h-4 w-4"></span>
    CapsLock이 켜져 있습니다.
  </div>
{/if}

{#if showStrength}
  <div class="ds-password-strength" data-strength={strength}>
    <div class="ds-password-strength-bar"></div>
    <div class="ds-password-strength-label">
      {strength === "weak"
        ? "약함"
        : strength === "medium"
          ? "보통"
          : "강함"}
    </div>
  </div>
{/if}

