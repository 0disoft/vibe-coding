<script lang="ts">
  import type { HTMLAttributes, HTMLInputAttributes } from "svelte/elements";

  import DsLiveRegion from "./LiveRegion.svelte";

  type TagValue = string;

  interface Props
    extends Omit<
      HTMLAttributes<HTMLDivElement>,
      "children" | "oninput" | "onkeydown" | "onpaste"
    > {
    values?: TagValue[];
    name?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    invalid?: boolean;
    required?: boolean;
    /** Field와 연결용 */
    id?: string;
    describedBy?: string;
    /** 태그 입력 placeholder (값이 있을 때도 표시 여부) */
    showPlaceholderWhenFilled?: boolean;
    /** blur 시 입력 중인 값을 태그로 추가 */
    addOnBlur?: boolean;
    /** 중복 허용 여부 */
    allowDuplicates?: boolean;
    /** 최대 태그 개수 */
    maxTags?: number;
    /** 입력 허용 패턴(미지정이면 전체 허용) */
    allowedPattern?: RegExp;
    /** aria-label / labelledby */
    "aria-label"?: string;
    "aria-labelledby"?: string;
    inputClass?: string;
  }

  let {
    values = $bindable<TagValue[]>([]),
    name,
    placeholder = "Add a tag",
    disabled = false,
    readonly = false,
    invalid = false,
    required = false,
    id: idProp,
    describedBy,
    showPlaceholderWhenFilled = false,
    addOnBlur = true,
    allowDuplicates = false,
    maxTags,
    allowedPattern,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    inputClass = "",
    class: className = "",
    ...rest
  }: Props = $props();

  const generatedId = $props.id();
  let id = $derived(idProp ?? generatedId);

  let inputEl = $state<HTMLInputElement | null>(null);
  let draft = $state("");
  let liveRegion: { announce: (message: string) => void } | null = null;

  let isDisabled = $derived(disabled || rest["aria-disabled"] === "true");
  let canEdit = $derived(!isDisabled && !readonly);
  let atMax = $derived(maxTags !== undefined && values.length >= maxTags);

  function normalize(raw: string): string {
    return raw.trim().replace(/^[,]+|[,]+$/g, "");
  }

  function canAdd(tag: string): boolean {
    if (!tag) return false;
    if (allowedPattern && !allowedPattern.test(tag)) return false;
    if (!allowDuplicates && values.includes(tag)) return false;
    if (maxTags !== undefined && values.length >= maxTags) return false;
    return true;
  }

  function addTag(raw: string): boolean {
    const tag = normalize(raw);
    if (!canEdit) return false;
    if (!canAdd(tag)) return false;
    values = [...values, tag];
    liveRegion?.announce(`태그 추가됨: ${tag}`);
    return true;
  }

  function removeTag(tag: string) {
    if (!canEdit) return;
    values = values.filter((t) => t !== tag);
    liveRegion?.announce(`태그 삭제됨: ${tag}`);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!canEdit) return;

    if (e.key === "Enter" || e.key === "Tab" || e.key === ",") {
      if (draft.trim().length === 0) return;
      e.preventDefault();
      const ok = addTag(draft);
      if (ok) draft = "";
      return;
    }

    if (e.key === "Backspace" && draft.length === 0 && values.length > 0) {
      e.preventDefault();
      const last = values[values.length - 1];
      if (last) removeTag(last);
    }
  }

  function handlePaste(e: ClipboardEvent) {
    if (!canEdit) return;
    const text = e.clipboardData?.getData("text");
    if (!text) return;
    if (!/[,\n]/.test(text)) return;

    e.preventDefault();
    const parts = text
      .split(/[,|\n]/g)
      .map((p) => normalize(p))
      .filter(Boolean);
    let changed = false;
    for (const p of parts) {
      if (addTag(p)) changed = true;
    }
    if (changed) draft = "";
  }

  function handleBlur() {
    if (!addOnBlur) return;
    if (draft.trim().length === 0) return;
    const ok = addTag(draft);
    if (ok) draft = "";
  }

  function focusInput(node: HTMLElement) {
    function handler(e: MouseEvent) {
      if (!inputEl) return;
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const interactive = t.closest("button, a, input, select, textarea, [role='button']");
      if (interactive) return;
      inputEl.focus();
    }
    node.addEventListener("click", handler);
    return {
      destroy() {
        node.removeEventListener("click", handler);
      },
    };
  }

  let showPlaceholder = $derived(values.length === 0 || showPlaceholderWhenFilled);
</script>

{#if name}
  {#each values as v (v)}
    <input type="hidden" {name} value={v} disabled={disabled} />
  {/each}
{/if}

<div
  {...rest}
  class={["ds-tag-input", className].filter(Boolean).join(" ")}
  data-invalid={invalid ? "true" : undefined}
  data-disabled={isDisabled ? "true" : undefined}
  use:focusInput
>
  <DsLiveRegion bind:this={liveRegion} politeness="polite" />

  <div class="ds-tag-input-chips" role="list">
    {#each values as tag (tag)}
      <span class="ds-tag-input-chip" role="listitem">
        <span class="ds-tag-input-chip-label truncate">{tag}</span>
        <button
          type="button"
          class="ds-tag-input-remove"
          aria-label={`Remove tag: ${tag}`}
          disabled={!canEdit}
          onclick={() => removeTag(tag)}
        >
          <span class="i-lucide-x h-3 w-3" aria-hidden="true"></span>
        </button>
      </span>
    {/each}
  </div>

  <input
    bind:this={inputEl}
    id={id}
    class={["ds-tag-input-native", inputClass].filter(Boolean).join(" ")}
    value={draft}
    placeholder={showPlaceholder ? placeholder : ""}
    aria-label={ariaLabel}
    aria-labelledby={ariaLabelledby}
    aria-describedby={describedBy}
    aria-invalid={invalid ? "true" : undefined}
    required={required}
    disabled={disabled}
    readonly={readonly || atMax}
    oninput={(e) => (draft = (e.currentTarget as HTMLInputElement).value)}
    onkeydown={handleKeyDown}
    onpaste={handlePaste}
    onblur={handleBlur}
  />
</div>
