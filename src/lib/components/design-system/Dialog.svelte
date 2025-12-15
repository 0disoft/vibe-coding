<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  import { DsIconButton } from '$lib/components/design-system';

  interface Props extends Omit<HTMLAttributes<HTMLDialogElement>, 'children'> {
    id: string;
    title: string;
    description?: string;
    open: boolean;
    onOpenChange?: (next: boolean) => void;
    children?: Snippet;
    footer?: Snippet;
  }

  let {
    id,
    title,
    description,
    open,
    onOpenChange,
    class: className = '',
    children,
    footer,
    ...rest
  }: Props = $props();

  let dialogEl = $state<HTMLDialogElement | null>(null);

  let titleId = $derived(`${id}-title`);
  let descId = $derived(`${id}-desc`);

  function close(): void {
    onOpenChange?.(false);
  }

  $effect(() => {
    const el = dialogEl;
    if (!el) return;

    if (open) {
      if (!el.open) el.showModal();
      return;
    }

    if (el.open) el.close();
  });

  function onCancel(e: Event): void {
    e.preventDefault();
    close();
  }

  function onClose(): void {
    if (open) close();
  }

  function onBackdropClick(e: MouseEvent): void {
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
  oncancel={onCancel}
  onclose={onClose}
  onclick={onBackdropClick}
>
  <div class="ds-dialog-surface">
    <header class="ds-dialog-header">
      <div class="min-w-0">
        <h2 class="text-h3 font-semibold" id={titleId}>{title}</h2>
        {#if description}
          <p class="text-body-secondary text-muted-foreground" id={descId}>{description}</p>
        {/if}
      </div>
      <DsIconButton icon="x" label="Close dialog" intent="secondary" variant="ghost" onclick={close} />
    </header>

    <div class="ds-dialog-body">
      {#if children}
        {@render children()}
      {/if}
    </div>

    {#if footer}
      <footer class="ds-dialog-footer">
        {@render footer()}
      </footer>
    {/if}
  </div>
</dialog>
