<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import { DsIcon } from "$lib/components/design-system";
  import type { IntentWithNeutral } from "./types";
  import { toIntentCss } from "./types";

  type Role = "status" | "alert";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    intent?: IntentWithNeutral;
    /** 기본: warning/error면 alert, 그 외 status */
    role?: Role;
    /** 아이콘 커스터마이즈 (null이면 숨김) */
    icon?: string | null;
    /** 텍스트 */
    message: string;
  }

  let {
    intent = "neutral",
    role,
    icon,
    message,
    class: className = "",
    ...rest
  }: Props = $props();

  let intentCss = $derived(toIntentCss(intent));

  const defaultIconByIntent: Record<string, string> = {
    neutral: "info",
    primary: "info",
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

  let rootClass = $derived(["ds-inline-alert", className].filter(Boolean).join(" "));
</script>

<div {...rest} class={rootClass} data-ds-intent={intentCss} role={computedRole}>
  {#if iconName}
    <span class="ds-inline-alert-icon" aria-hidden="true">
      <DsIcon name={iconName} size="sm" />
    </span>
  {/if}

  <span class="min-w-0">{message}</span>
</div>

