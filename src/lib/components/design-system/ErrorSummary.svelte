<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  export type ErrorItem = {
    message: string;
    /** 지정 시 해당 요소로 스크롤+포커스 이동 (id) */
    fieldId?: string;
    /** fieldId 대신 직접 링크 제공 */
    href?: string;
  };

  type SummaryRole = "region" | "alert";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    id?: string;
    title?: string;
    errors?: ErrorItem[];
    /** 0 -> N으로 바뀌는 순간 summary로 포커스 이동 */
    autoFocus?: boolean;
    /** 기본: region(포커스로 안내). 필요 시 alert로 강제 낭독 */
    role?: SummaryRole;
  }

  let {
    id = "ds-error-summary",
    title = "Please fix the following",
    errors = [],
    autoFocus = true,
    role = "region",
    class: className = "",
    ...rest
  }: Props = $props();

  let titleId = $derived(`${id}-title`);

  let rootEl = $state<HTMLDivElement | null>(null);
  let previousCount = $state(0);

  $effect(() => {
    const nextCount = errors.length;
    if (autoFocus && nextCount > 0 && previousCount === 0) {
      queueMicrotask(() => rootEl?.focus());
    }
    previousCount = nextCount;
  });

  function getHref(item: ErrorItem): string | null {
    if (item.href) return item.href;
    if (item.fieldId) return `#${item.fieldId}`;
    return null;
  }

  function isFocusable(el: HTMLElement): boolean {
    if (el.matches('input, select, textarea, button')) {
      return !(el as unknown as { disabled?: boolean }).disabled;
    }
    if (el.matches('a[href]')) return true;
    if (el.matches('[contenteditable="true"]')) return true;
    if (el.hasAttribute("tabindex")) return true;
    return false;
  }

  function pickFocusTarget(root: HTMLElement): HTMLElement | null {
    if (isFocusable(root)) return root;
    const byHint = root.querySelector<HTMLElement>("[data-focus-target]");
    if (byHint && isFocusable(byHint)) return byHint;
    const fallback = root.querySelector<HTMLElement>(
      'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href], [tabindex], [contenteditable="true"]',
    );
    if (fallback && isFocusable(fallback)) return fallback;
    return null;
  }

  function focusFieldById(fieldId?: string) {
    if (!fieldId) return;
    const root = document.getElementById(fieldId) as HTMLElement | null;
    if (!root) return;

    const target = pickFocusTarget(root);
    if (!target) return;

    target.scrollIntoView({ block: "center" });
    queueMicrotask(() => target.focus());
  }

  function onItemClick(event: MouseEvent, item: ErrorItem) {
    if (!item.fieldId) return;
    event.preventDefault();
    focusFieldById(item.fieldId);
  }

  let rootClass = $derived(["ds-error-summary", "ds-focus-ring", className].filter(Boolean).join(" "));
</script>

{#if errors.length > 0}
  <div
    {...rest}
    bind:this={rootEl}
    id={id}
    class={rootClass}
    role={role}
    aria-labelledby={titleId}
    tabindex="-1"
  >
    <div class="ds-error-summary__header">
      <span class="ds-icon i-lucide-triangle-alert" aria-hidden="true"></span>
      <h2 id={titleId} class="ds-error-summary__title">{title}</h2>
    </div>

    <ul class="ds-error-summary__list">
      {#each errors as item (item.message + (item.fieldId ?? item.href ?? ""))}
        <li class="ds-error-summary__item">
          {#if getHref(item)}
            <a
              class="ds-error-summary__link"
              href={getHref(item) ?? "#"}
              onclick={(e) => onItemClick(e, item)}
            >
              {item.message}
            </a>
          {:else}
            <span>{item.message}</span>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
{/if}
