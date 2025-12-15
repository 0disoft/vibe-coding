<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';
  import { tick } from 'svelte';

  import { DsIconButton } from '$lib/components/design-system';

  interface Props extends Omit<HTMLAttributes<HTMLDialogElement>, 'children'> {
    id: string;
    title: string;
    description?: string;
    open: boolean;
    onOpenChange?: (next: boolean) => void;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    scrollable?: boolean;
    closeOnOutsideClick?: boolean;
    closeOnEscape?: boolean;
    returnFocusTo?: HTMLElement | null;
    children?: Snippet;
    footer?: Snippet;
  }

  let {
    id,
    title,
    description,
    open,
    onOpenChange,
    size = 'md',
    scrollable = false,
    closeOnOutsideClick = true,
    closeOnEscape = true,
    returnFocusTo = null,
    class: className = '',
    children,
    footer,
    ...rest
  }: Props = $props();

  let dialogEl = $state<HTMLDialogElement | null>(null);
  let previousActiveElement = $state<HTMLElement | null>(null);

  let titleId = $derived(`${id}-title`);
  let descId = $derived(`${id}-desc`);

  function close(): void {
    onOpenChange?.(false);
  }

  $effect(() => {
    const el = dialogEl;
    if (!el) return;

    if (open) {
      if (!el.open) {
        // 열리기 직전 포커스 저장
        previousActiveElement = (document.activeElement as HTMLElement) ?? null;
        el.showModal();
      }
    } else {
      if (el.open) {
        el.close();
        // 닫힌 후 포커스 복귀
        const target = returnFocusTo ?? previousActiveElement;
        if (target && document.body.contains(target)) {
          tick().then(() => target.focus());
        }
      }
    }
  });

  function onCancel(e: Event): void {
    e.preventDefault(); // 기본 닫힘 방지 후 상태 제어로 처리
    if (closeOnEscape) {
      close();
    }
  }

  function onClose(): void {
    // Native close event (e.g. form method="dialog")
    if (open) close();
  }

  function onBackdropClick(e: MouseEvent): void {
    if (!closeOnOutsideClick) return;

    const el = dialogEl;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const inDialog =
      e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!inDialog) close();
  }
</script>

<dialog
  bind:this={dialogEl}
  id={id}
  {...rest}
  class={`ds-dialog ds-focus-ring ${className}`.trim()}
  aria-modal="true"
  aria-labelledby={titleId}
  aria-describedby={description ? descId : undefined}
  data-ds-size={size}
  oncancel={onCancel}
  onclose={onClose}
  onclick={onBackdropClick}
>
  <div class={`ds-dialog-surface ${scrollable ? 'flex flex-col max-h-[85vh]' : ''}`}>
    <header class="ds-dialog-header shrink-0">
      <div class="min-w-0">
        <h2 class="text-h3 font-semibold" id={titleId}>{title}</h2>
        {#if description}
          <p class="text-body-secondary text-muted-foreground" id={descId}>{description}</p>
        {/if}
      </div>
      <DsIconButton icon="x" label="Close dialog" intent="secondary" variant="ghost" onclick={close} />
    </header>

    <div class={`ds-dialog-body ${scrollable ? 'flex-1 overflow-y-auto min-h-0' : ''}`}>
      {#if children}
        {@render children()}
      {/if}
    </div>

    {#if footer}
      <footer class="ds-dialog-footer shrink-0">
        {@render footer()}
      </footer>
    {/if}
  </div>
</dialog>