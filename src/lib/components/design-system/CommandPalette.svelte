<script lang="ts">
  import type { Snippet } from "svelte";
  import { tick } from "svelte";

  import { DsDialog, DsIcon, DsInput } from "$lib/components/design-system";

  export type CommandItem = {
    id: string;
    label: string;
    description?: string;
    keywords?: string[];
    disabled?: boolean;
    shortcut?: string;
  };

  interface Props {
    open?: boolean;
    onOpenChange?: (next: boolean) => void;
    title?: string;
    description?: string;
    placeholder?: string;
    items: CommandItem[];
    onSelect?: (id: string) => void;
    emptyText?: string;
    children?: Snippet;
  }

  let {
    open = $bindable(false),
    onOpenChange,
    title = "Command Palette",
    description,
    placeholder = "Search commands…",
    items,
    onSelect,
    emptyText = "No results",
  }: Props = $props();

  const inputId = $props.id();
  const listboxId = `${inputId}-listbox`;

  let query = $state("");
  let activeIndex = $state(0);

  let filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const hay = [it.label, it.description ?? "", ...(it.keywords ?? [])]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  });

  function findNextEnabled(startIndex: number, dir: 1 | -1): number {
    if (filtered.length === 0) return -1;

    // 최소 1회는 검사해야 하므로 length만큼 순회
    for (let i = 0; i < filtered.length; i++) {
      const idx = (startIndex + dir * i + filtered.length) % filtered.length;
      if (!filtered[idx]?.disabled) return idx;
    }

    return -1;
  }

  function optionDomId(itemId: string): string {
    const safe = itemId.replaceAll(/[^a-zA-Z0-9_-]/g, "-");
    return `${listboxId}-opt-${safe}`;
  }

  let activeDescendant = $derived.by(() => {
    const it = filtered[activeIndex];
    return it ? optionDomId(it.id) : undefined;
  });

  $effect(() => {
    if (open) {
      query = "";
      // 첫 번째 enabled 항목으로 초기화
      activeIndex = 0;
      tick().then(() => {
        const el = document.getElementById(inputId) as HTMLInputElement | null;
        el?.focus();
      });
    }
  });

  $effect(() => {
    // 검색 결과/목록 변경 시 activeIndex 보정 (disabled 스킵)
    if (!open) return;
    if (filtered.length === 0) {
      activeIndex = 0;
      return;
    }

    if (activeIndex < 0 || activeIndex >= filtered.length) activeIndex = 0;
    if (filtered[activeIndex]?.disabled) {
      const next = findNextEnabled(activeIndex, 1);
      if (next >= 0) activeIndex = next;
    }

    tick().then(() => {
      const id = activeDescendant;
      if (!id) return;
      const el = document.getElementById(id);
      el?.scrollIntoView({ block: "nearest" });
    });
  });

  function choose(item: CommandItem) {
    if (item.disabled) return;
    onSelect?.(item.id);
    if (open !== false) {
      open = false;
      onOpenChange?.(false);
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = findNextEnabled(Math.min(activeIndex + 1, filtered.length - 1), 1);
      if (next >= 0) activeIndex = next;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = findNextEnabled(Math.max(activeIndex - 1, 0), -1);
      if (next >= 0) activeIndex = next;
    } else if (e.key === "Enter") {
      const it = filtered[activeIndex];
      if (it) {
        e.preventDefault();
        choose(it);
      }
    }
  }
</script>

<DsDialog
  id="ds-command-palette"
  title={title}
  {description}
  bind:open
  onOpenChange={onOpenChange}
  size="lg"
  closeOnOutsideClick
  closeOnEscape
>
  <div class="ds-command">
    <DsInput
      id={inputId}
      placeholder={placeholder}
      bind:value={query}
      onkeydown={onKeyDown}
      aria-label={placeholder}
      role="combobox"
      aria-autocomplete="list"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listboxId}
      aria-activedescendant={activeDescendant}
      clearable
    >
      {#snippet start()}
        <span class="i-lucide-search h-4 w-4 text-muted-foreground"></span>
      {/snippet}
    </DsInput>

    <div
      id={listboxId}
      class="ds-command-list"
      role="listbox"
      aria-label={title}
    >
      {#if filtered.length === 0}
        <div class="ds-command-empty">{emptyText}</div>
      {:else}
        {#each filtered as it, idx (it.id)}
          <button
            type="button"
            class="ds-command-item ds-focus-ring"
            id={optionDomId(it.id)}
            role="option"
            data-active={idx === activeIndex ? "true" : undefined}
            aria-selected={idx === activeIndex}
            disabled={it.disabled}
            onclick={() => choose(it)}
            onmousemove={() => {
              if (!it.disabled) activeIndex = idx;
            }}
          >
            <div class="min-w-0">
              <div class="ds-command-title">{it.label}</div>
              {#if it.description}
                <div class="ds-command-desc">{it.description}</div>
              {/if}
            </div>
            {#if it.shortcut}
              <span class="ds-command-shortcut" aria-hidden="true">{it.shortcut}</span>
            {/if}
          </button>
        {/each}
      {/if}
    </div>
  </div>
</DsDialog>
