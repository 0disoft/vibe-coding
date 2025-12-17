<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { tick } from "svelte";

  import { DsIcon, DsInput, DsPopover } from "$lib/components/design-system";
  import { useId } from "$lib/shared/utils/use-id";

  export type ComboboxOption = {
    value: string;
    label: string;
    keywords?: string[];
    disabled?: boolean;
  };

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    options: ComboboxOption[];
    value?: string;
    onValueChange?: (next: string) => void;
    placeholder?: string;
    disabled?: boolean;
    label?: string;
  }

  let {
    options,
    value = $bindable(""),
    onValueChange,
    placeholder = "Select…",
    disabled = false,
    label = "Combobox",
    class: className = "",
    ...rest
  }: Props = $props();

  const baseId = useId("ds-combobox");
  const listboxId = `${baseId}-listbox`;
  const inputId = `${baseId}-search`;

  let open = $state(false);
  let query = $state("");
  let activeIndex = $state(-1);

  let selected = $derived(options.find((o) => o.value === value));
  let displayLabel = $derived(selected?.label ?? placeholder);

  let filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      const hay = [o.label, o.value, ...(o.keywords ?? [])].join(" ").toLowerCase();
      return hay.includes(q);
    });
  });

  $effect(() => {
    if (!open) {
      query = "";
      activeIndex = -1;
    }
  });

  function setValue(next: string) {
    value = next;
    onValueChange?.(next);
  }

  function openAndFocus() {
    if (disabled) return;
    open = true;
    tick().then(() => {
      const el = document.getElementById(inputId) as HTMLInputElement | null;
      el?.focus();
    });
  }

  function close() {
    open = false;
  }

  function choose(opt: ComboboxOption) {
    if (opt.disabled) return;
    setValue(opt.value);
    close();
  }

  function onSearchKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(filtered.length - 1, activeIndex + 1);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(0, activeIndex - 1);
      return;
    }
    if (e.key === "Enter") {
      const item = filtered[activeIndex];
      if (item) {
        e.preventDefault();
        choose(item);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
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

<div {...rest} class={["ds-combobox", className].filter(Boolean).join(" ")}>
  <DsPopover
    open={open}
    onOpenChange={(next) => (open = next)}
    disabled={disabled}
    label={label}
    side="bottom"
    align="start"
    panelClass="ds-combobox-panel"
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
        onclick={() => {
          if (open) close();
          else openAndFocus();
        }}
        onkeydown={props.onkeydown}
        use:applyRef={props.ref}
      >
        <span class={selected ? "truncate" : "truncate text-muted-foreground"}>
          {displayLabel}
        </span>
        <DsIcon name="chevrons-up-down" size="sm" class="opacity-60" />
      </button>
    {/snippet}

    {#snippet children({ close })}
      <div class="ds-combobox-search">
        <DsInput
          id={inputId}
          placeholder="Search…"
          bind:value={query}
          onkeydown={onSearchKeyDown}
          aria-controls={listboxId}
          aria-expanded={true}
          aria-autocomplete="list"
          aria-label="Search options"
        >
          {#snippet start()}
            <span class="i-lucide-search h-4 w-4 text-muted-foreground"></span>
          {/snippet}
        </DsInput>
      </div>

      <div class="ds-combobox-list" role="listbox" id={listboxId} aria-label={label}>
        {#if filtered.length === 0}
          <div class="ds-combobox-empty">No results</div>
        {:else}
          {#each filtered as opt, idx (opt.value)}
            {@const isSelected = opt.value === value}
            <button
              type="button"
              class="ds-combobox-option ds-focus-ring"
              role="option"
              aria-selected={isSelected}
              data-active={idx === activeIndex ? "true" : undefined}
              disabled={opt.disabled}
              onclick={() => {
                choose(opt);
                close();
              }}
              onmousemove={() => {
                activeIndex = idx;
              }}
            >
              <span class="ds-combobox-check" aria-hidden="true">
                {#if isSelected}
                  <DsIcon name="check" size="sm" />
                {/if}
              </span>
              <span class="truncate">{opt.label}</span>
            </button>
          {/each}
        {/if}
      </div>

      <div class="ds-combobox-footer">
        <button
          type="button"
          class="ds-dropdown-item ds-focus-ring text-menu-sm"
          onclick={() => close()}
        >
          Close
        </button>
      </div>
    {/snippet}
  </DsPopover>
</div>
