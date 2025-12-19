<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { useId } from "$lib/shared/utils/use-id";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    length?: number;
    value?: string;
    onComplete?: (code: string) => void;
    disabled?: boolean;
    /** 숫자 전용 */
    numeric?: boolean;
    name?: string;
    label?: string;
    ref?: Array<HTMLInputElement | null>;
    separator?: Snippet<[{ index: number }]>;
  }

  let {
    length = 6,
    value = $bindable(""),
    onComplete,
    disabled = false,
    numeric = true,
    name,
    label = "One-time password",
    ref = $bindable([]),
    separator,
    class: className = "",
    ...rest
  }: Props = $props();

  const rootId = useId("ds-otp");
  let slots = $derived(Array.from({ length: Math.max(1, length) }, (_, i) => i));

  function normalized(v: string) {
    const raw = v ?? "";
    const next = numeric ? raw.replace(/\D/g, "") : raw;
    return next.slice(0, length);
  }

  $effect(() => {
    value = normalized(value);
  });

  function chars() {
    const arr = Array.from({ length }, () => "");
    const v = value ?? "";
    for (let i = 0; i < Math.min(v.length, length); i++) arr[i] = v[i] ?? "";
    return arr;
  }

  function setCharAt(index: number, ch: string) {
    const current = chars();
    current[index] = ch;
    value = normalized(current.join(""));
    if (value.length === length) onComplete?.(value);
  }

  function focusIndex(i: number) {
    const el = ref[i];
    if (el) {
      el.focus();
      el.select();
    }
  }

  function onInput(e: InputEvent, index: number) {
    const target = e.target as HTMLInputElement;
    const text = target.value ?? "";
    const next = numeric ? text.replace(/\D/g, "") : text;

    if (next.length <= 1) {
      setCharAt(index, next);
      if (next && index < length - 1) focusIndex(index + 1);
      return;
    }

    // 붙여넣기/자동완성으로 여러 글자 들어온 경우 분배
    const combined = normalized(
      (value.slice(0, index) + next + value.slice(index + 1)).slice(0, length),
    );
    value = combined;
    if (value.length === length) onComplete?.(value);
    focusIndex(Math.min(length - 1, index + next.length));
  }

  function onKeyDown(e: KeyboardEvent, index: number) {
    if (e.key === "Backspace") {
      const currentChars = chars();
      if (currentChars[index]) {
        setCharAt(index, "");
        return;
      }
      if (index > 0) {
        e.preventDefault();
        focusIndex(index - 1);
        setCharAt(index - 1, "");
      }
      return;
    }

    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusIndex(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      focusIndex(index + 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusIndex(length - 1);
    }
  }

  function onPaste(e: ClipboardEvent, index: number) {
    if (disabled) return;
    const text = e.clipboardData?.getData("text") ?? "";
    const next = numeric ? text.replace(/\D/g, "") : text;
    if (!next) return;
    e.preventDefault();

    const left = value.slice(0, index);
    const right = value.slice(index + 1);
    value = normalized(left + next + right);
    if (value.length === length) onComplete?.(value);
    focusIndex(Math.min(length - 1, index + next.length - 1));
  }

  let rootClass = $derived(["ds-otp", className].filter(Boolean).join(" "));
</script>

<div {...rest} class={rootClass} aria-label={label}>
  {#if name}
    <input type="hidden" {name} {value} />
  {/if}

  <div class="ds-otp-grid" role="group" aria-label={label}>
    {#each slots as i (i)}
      {#if i > 0 && separator}
        {@render separator({ index: i - 1 })}
      {/if}
      {@const current = chars()[i] ?? ""}
      <input
        bind:this={ref[i]}
        id={`${rootId}-${i}`}
        class="ds-otp-slot"
        aria-label={`${label} ${i + 1}/${length}`}
        value={current}
        disabled={disabled}
        inputmode={numeric ? "numeric" : "text"}
        autocomplete="one-time-code"
        maxlength={1}
        oninput={(e) => onInput(e as any, i)}
        onkeydown={(e) => onKeyDown(e, i)}
        onpaste={(e) => onPaste(e, i)}
        onfocus={(e) => (e.target as HTMLInputElement).select()}
      />
    {/each}
  </div>
</div>

