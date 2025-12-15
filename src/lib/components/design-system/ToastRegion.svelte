<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  import { DsIcon, DsIconButton } from '$lib/components/design-system';

  export type ToastIntent = 'neutral' | 'success' | 'warning' | 'error';

  export type ToastItem = {
    id: string;
    title: string;
    message?: string;
    intent?: ToastIntent;
  };

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    toasts: ToastItem[];
    onDismiss: (id: string) => void;
    children?: Snippet;
  }

  let { toasts, onDismiss, class: className = '', children, ...rest }: Props = $props();

  const intentIcon: Record<ToastIntent, string> = {
    neutral: 'bell',
    success: 'check',
    warning: 'triangle-alert',
    error: 'circle-x'
  };
</script>

<div
  {...rest}
  class={`ds-toast-region ${className}`.trim()}
  aria-live="polite"
  aria-relevant="additions text"
  role="region"
  aria-label="Notifications"
>
  {#if children}
    {@render children()}
  {/if}

  {#each toasts as t (t.id)}
    <div class="ds-toast ds-elevation-2" data-intent={t.intent ?? 'neutral'}>
      <div class="ds-toast-icon" aria-hidden="true">
        <DsIcon name={intentIcon[t.intent ?? 'neutral']} size="md" />
      </div>
      <div class="min-w-0">
        <div class="text-label font-semibold">{t.title}</div>
        {#if t.message}
          <div class="text-helper text-muted-foreground">{t.message}</div>
        {/if}
      </div>
      <DsIconButton icon="x" label="Dismiss" variant="ghost" intent="secondary" onclick={() => onDismiss(t.id)} />
    </div>
  {/each}
</div>

