<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import { DsButton, DsIcon, DsPopover } from "$lib/components/design-system";

  import { parseIsoDate } from "./date-utils";

  export type DateRange = {
    start: string;
    end: string;
  };

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    value?: DateRange;
    onValueChange?: (next: DateRange) => void;
    disabled?: boolean;
    label?: string;
    placeholder?: string;
    locale?: string;
  }

  let {
    value = $bindable({ start: "", end: "" }),
    onValueChange,
    disabled = false,
    label = "Date range",
    placeholder = "Select range…",
    locale,
    class: className = "",
    ...rest
  }: Props = $props();

  let open = $state(false);

  function set(next: DateRange) {
    value = next;
    onValueChange?.(next);
  }

  function formatDate(value: string) {
    const d = parseIsoDate(value);
    if (!d) return value;
    try {
      const fmt = new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
      return fmt.format(d);
    } catch {
      return value;
    }
  }

  let displayValue = $derived.by(() => {
    if (!value.start && !value.end) return placeholder;
    const startLabel = value.start ? formatDate(value.start) : "…";
    const endLabel = value.end ? formatDate(value.end) : "…";
    return `${startLabel} – ${endLabel}`;
  });

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
          {displayValue}
        </span>
        <DsIcon name="calendar" size="sm" class="opacity-60" />
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
            max={value.end || undefined}
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
            min={value.start || undefined}
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
