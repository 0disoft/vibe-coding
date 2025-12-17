<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import { DsButton, DsPopover } from "$lib/components/design-system";

  export type DateRange = {
    start: string;
    end: string;
  };

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    value?: DateRange;
    onValueChange?: (next: DateRange) => void;
    disabled?: boolean;
    label?: string;
  }

  let {
    value = $bindable({ start: "", end: "" }),
    onValueChange,
    disabled = false,
    label = "Date range",
    class: className = "",
    ...rest
  }: Props = $props();

  let open = $state(false);

  function set(next: DateRange) {
    value = next;
    onValueChange?.(next);
  }

  function display(v: DateRange) {
    if (!v.start && !v.end) return "Select range…";
    if (v.start && !v.end) return `${v.start} – …`;
    if (!v.start && v.end) return `… – ${v.end}`;
    return `${v.start} – ${v.end}`;
  }

  function applyRef(node: HTMLElement, refFn: (node: HTMLElement) => void) {
    refFn(node);
    return {
      update(next: (node: HTMLElement) => void) {
        next(node);
      },
    };
  }
</script>

<div {...rest} class={["ds-date-range", className].filter(Boolean).join(" ")}>
  <DsPopover
    open={open}
    onOpenChange={(next) => (open = next)}
    disabled={disabled}
    label={label}
    side="bottom"
    align="start"
    panelClass="ds-date-range-panel"
  >
    {#snippet trigger(props)}
      <button
        type="button"
        class="ds-combobox-trigger ds-focus-ring"
        id={props.id}
        aria-controls={props["aria-controls"]}
        aria-haspopup="dialog"
        aria-expanded={props["aria-expanded"]}
        disabled={props.disabled}
        onclick={props.onclick}
        onkeydown={props.onkeydown}
        use:applyRef={props.ref}
      >
        <span class={value.start || value.end ? "truncate" : "truncate text-muted-foreground"}>
          {display(value)}
        </span>
        <span class="i-lucide-calendar h-4 w-4 opacity-60"></span>
      </button>
    {/snippet}

    {#snippet children({ close })}
      <div class="ds-date-range-grid">
        <label class="ds-date-range-label">
          <span>Start</span>
          <input
            type="date"
            class="ds-date-range-input"
            aria-label="Start"
            value={value.start}
            oninput={(e) => set({ start: (e.target as HTMLInputElement).value, end: value.end })}
          />
        </label>

        <label class="ds-date-range-label">
          <span>End</span>
          <input
            type="date"
            class="ds-date-range-input"
            aria-label="End"
            value={value.end}
            oninput={(e) => set({ start: value.start, end: (e.target as HTMLInputElement).value })}
          />
        </label>
      </div>

      <div class="ds-date-range-actions">
        <DsButton
          size="sm"
          variant="outline"
          intent="secondary"
          onclick={() => set({ start: "", end: "" })}
        >
          Clear
        </DsButton>
        <DsButton size="sm" onclick={() => close({ focusButton: true })}>Done</DsButton>
      </div>
    {/snippet}
  </DsPopover>
</div>
