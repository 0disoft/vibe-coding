<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { DsIcon, DsIconButton } from "$lib/components/design-system";
  import type { IntentWithNeutral } from "./types";
  import { toIntentCss } from "./types";

  type Role = "status" | "alert";

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    intent?: IntentWithNeutral;
    title?: string;
    description?: string;
    role?: Role;
    icon?: string | null;
    children?: Snippet;
    actions?: Snippet;
    /** 닫기 버튼 표시 */
    dismissible?: boolean;
    /** 닫기 버튼 라벨 (SR용) */
    dismissLabel?: string;
    /** 닫힘 상태 쿠키 키(지정하면 쿠키로 기억) */
    dismissKey?: string;
    /** 쿠키 만료일(일) */
    dismissDays?: number;
    /** 이미 닫혔는지(제어) */
    dismissed?: boolean;
    /** 닫힘 상태 변경 콜백(제어) */
    onDismissedChange?: (next: boolean) => void;
  }

  let {
    intent = "neutral",
    title,
    description,
    role,
    icon,
    class: className = "",
    children,
    actions,
    dismissible = false,
    dismissLabel = "Dismiss banner",
    dismissKey,
    dismissDays = 365,
    dismissed,
    onDismissedChange,
    ...rest
  }: Props = $props();

  let intentCss = $derived(toIntentCss(intent));

  const defaultIconByIntent: Record<string, string> = {
    neutral: "info",
    primary: "sparkles",
    secondary: "info",
    success: "circle-check",
    warning: "triangle-alert",
    error: "circle-alert",
  };

  let computedRole = $derived<Role>(
    role ?? (intentCss === "error" || intentCss === "warning" ? "alert" : "status"),
  );

  let iconName = $derived(
    icon === null ? null : icon ?? defaultIconByIntent[intentCss] ?? "info",
  );

  function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${escapeRegex(name)}=([^;]*)`),
    );
    if (!match) return null;
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return null;
    }
  }

  function setCookie(name: string, value: string, days = 365): void {
    if (typeof document === "undefined") return;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `; expires=${date.toUTCString()}`;
    const secure = location.protocol === "https:" ? "; Secure" : "";
    // biome-ignore lint/suspicious/noDocumentCookie: 배너 dismiss 상태 저장
    document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax${secure}`;
  }

  // uncontrolled 상태(기본): 쿠키 → false
  let internalDismissed = $state(false);

  $effect(() => {
    if (!dismissKey) return;
    const raw = getCookie(dismissKey);
    internalDismissed = raw === "1";
  });

  let isDismissed = $derived(dismissed ?? internalDismissed);

  function setDismissed(next: boolean) {
    if (dismissed === undefined) internalDismissed = next;
    onDismissedChange?.(next);
    if (dismissKey) setCookie(dismissKey, next ? "1" : "0", dismissDays);
  }

  function handleDismiss() {
    setDismissed(true);
  }

  let rootClass = $derived(["ds-banner", className].filter(Boolean).join(" "));

  let showDismiss = $derived(dismissible || !!dismissKey);
</script>

{#if !isDismissed}
  <section
    {...rest}
    class={rootClass}
    data-ds-intent={intentCss}
    role={computedRole}
  >
    {#if iconName}
      <div class="ds-banner-icon" aria-hidden="true">
        <DsIcon name={iconName} size="md" />
      </div>
    {/if}

    <div class="ds-banner-body">
      {#if title}
        <div class="ds-banner-title">{title}</div>
      {/if}

      {#if description}
        <div class="ds-banner-description">{description}</div>
      {/if}

      {#if children}
        <div class="ds-banner-content">
          {@render children()}
        </div>
      {/if}
    </div>

    <div class="ds-banner-actions">
      {#if actions}
        {@render actions()}
      {/if}

      {#if showDismiss}
        <DsIconButton
          size="sm"
          variant="ghost"
          intent="neutral"
          icon="x"
          label={dismissLabel}
          onclick={handleDismiss}
        />
      {/if}
    </div>
  </section>
{/if}

