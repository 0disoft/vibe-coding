<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    width?: string;
    height?: string;
    circle?: boolean;
  }

  let {
    width,
    height,
    circle = false,
    class: className = '',
    style = '',
    ...rest
  }: Props = $props();

  let sizeStyle = $derived([width && `width: ${width}`, height && `height: ${height}`].filter(Boolean).join('; '));
  let shapeClass = $derived(circle ? 'rounded-full' : 'rounded-md');
</script>

<div
  {...rest}
  class={`animate-pulse bg-muted ${shapeClass} ${className}`.trim()}
  style={`${sizeStyle}; ${style}`}
  aria-hidden="true"
></div>
