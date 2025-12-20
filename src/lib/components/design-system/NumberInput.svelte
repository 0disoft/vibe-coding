<script lang="ts">
	import { tick } from "svelte";
	import type { HTMLInputAttributes } from "svelte/elements";

	import { DsIconButton } from "$lib/components/design-system";

	type Size = "sm" | "md" | "lg";
	type Variant = "outline" | "filled" | "ghost";

	type ParseState =
		| { kind: "empty" }
		| { kind: "partial" }
		| { kind: "invalid" }
		| { kind: "number"; value: number };

	interface Props extends Omit<
		HTMLInputAttributes,
		"size" | "type" | "value" | "min" | "max" | "step" | "name"
	> {
		size?: Size;
		variant?: Variant;
		invalid?: boolean;
		value?: number | null;
		name?: string;
		min?: number;
		max?: number;
		step?: number;
		/** 증감 버튼 표시 */
		showStepper?: boolean;
		/** blur 시 min/max/step 반영 */
		clampOnBlur?: boolean;
		ref?: HTMLInputElement | null;
		/** 증감 버튼 라벨 */
		decrementLabel?: string;
		incrementLabel?: string;
		onkeydown?: HTMLInputAttributes["onkeydown"];
		inputPattern?: string;
		invalidMessage?: string;
	}

	let {
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledby,
		size = "md",
		variant = "outline",
		invalid = false,
		value = $bindable<number | null>(null),
		name,
		min,
		max,
		step = 1,
		showStepper = true,
		clampOnBlur = true,
		ref = $bindable(null),
		decrementLabel = "값 감소",
		incrementLabel = "값 증가",
		invalidMessage = "유효한 숫자를 입력하세요.",
		class: className = "",
		onkeydown,
		inputPattern = "[0-9]*",
		...rest
	}: Props = $props();

	let raw = $state("");
	let isFocused = $state(false);
	let localInvalid = $state(false);
	let liveMessage = $state("");

	function decimals(n: number): number {
		const s = String(n);
		const i = s.indexOf(".");
		return i === -1 ? 0 : s.length - i - 1;
	}

	function roundToPrecision(n: number, precision: number) {
		const p = 10 ** precision;
		return Math.round(n * p) / p;
	}

	function clamp(n: number): number {
		let next = n;
		if (min !== undefined) next = Math.max(min, next);
		if (max !== undefined) next = Math.min(max, next);
		return next;
	}

	function snap(n: number): number {
		if (!Number.isFinite(step) || step <= 0) return n;
		const base = min ?? 0;
		const precision = decimals(step);
		const snapped = base + Math.round((n - base) / step) * step;
		return roundToPrecision(snapped, precision);
	}

	function parseRaw(v: string): ParseState {
		const trimmed = v.trim();
		if (trimmed === "") return { kind: "empty" };
		// 사용자가 -, . 등을 입력하는 중이면 보류
		if (trimmed === "-" || trimmed === "." || trimmed === "-.")
			return { kind: "partial" };
		const n = Number(trimmed);
		if (!Number.isFinite(n)) return { kind: "invalid" };
		return { kind: "number", value: n };
	}

	$effect(() => {
		if (isFocused) return;
		raw = value === null || value === undefined ? "" : String(value);
	});

	function setValue(next: number | null) {
		value = next;
	}

	function handleInput(e: Event) {
		const el = e.currentTarget as HTMLInputElement;
		raw = el.value;
		const parsed = parseRaw(raw);
		if (parsed.kind === "invalid") {
			localInvalid = true;
			liveMessage = invalidMessage;
			return;
		}
		localInvalid = false;
		liveMessage = "";
		if (parsed.kind === "partial") return;
		if (parsed.kind === "empty") {
			setValue(null);
			return;
		}
		setValue(clamp(parsed.value));
	}

	function handleBlur() {
		isFocused = false;
		if (!clampOnBlur) return;
		const parsed = parseRaw(raw);
		if (parsed.kind === "invalid" || parsed.kind === "partial") {
			raw = value === null || value === undefined ? "" : String(value);
			return;
		}
		if (parsed.kind === "empty") {
			setValue(null);
			raw = "";
			return;
		}
		const next = clamp(snap(parsed.value));
		setValue(next);
		raw = String(next);
	}

	function handleFocus() {
		isFocused = true;
	}

	async function stepBy(dir: -1 | 1) {
		const base = value ?? min ?? 0;
		const next = clamp(snap(base + dir * step));
		setValue(next);
		raw = String(next);
		await tick();
		ref?.dispatchEvent(new Event("input", { bubbles: true }));
		ref?.focus();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!rest.disabled && !rest.readonly) {
			if (e.key === "ArrowUp") {
				e.preventDefault();
				stepBy(1);
				return;
			}
			if (e.key === "ArrowDown") {
				e.preventDefault();
				stepBy(-1);
				return;
			}
		}

		// onkeydown prop 전달 지원
		if (!e.defaultPrevented) {
			const handler = onkeydown as unknown;
			if (typeof handler === "function") {
				(handler as (event: KeyboardEvent) => void)(e);
			}
		}
	}

	function triggerFocus(node: HTMLElement) {
		function handler(e: MouseEvent) {
			const t = e.target as HTMLElement | null;
			if (!t || !ref) return;
			if (t === ref) return;
			const interactive = t.closest(
				'button, a, input, select, textarea, [role="button"], [role="link"]',
			);
			if (interactive) return;
			ref.focus();
		}
		node.addEventListener("click", handler);
		return {
			destroy() {
				node.removeEventListener("click", handler);
			},
		};
	}

	let inputMode = $derived<"numeric" | "decimal">(
		decimals(step) === 0 ? "numeric" : "decimal",
	);
	let isInvalid = $derived(invalid || localInvalid);
</script>

{#if name}
	<input
		type="hidden"
		{name}
		value={value ?? ""}
		disabled={Boolean(rest.disabled)}
	/>
{/if}

<div
	class={`ds-input-group ${className}`.trim()}
	data-ds-size={size}
	data-ds-variant={variant}
	data-invalid={isInvalid ? "true" : undefined}
	data-disabled={rest.disabled ? "true" : undefined}
	use:triggerFocus
>
	<input
		{...rest}
		bind:this={ref}
		value={raw}
		class="ds-input-native"
		aria-label={ariaLabel}
		aria-labelledby={ariaLabelledby}
		aria-invalid={isInvalid ? "true" : undefined}
		role="spinbutton"
		aria-valuenow={value ?? undefined}
		aria-valuemin={min ?? undefined}
		aria-valuemax={max ?? undefined}
		inputmode={inputMode}
		pattern={inputMode === "numeric" ? inputPattern : undefined}
		oninput={handleInput}
		onfocus={handleFocus}
		onblur={handleBlur}
		onkeydown={handleKeydown}
	/>

	<span class="sr-only" aria-live="polite" aria-atomic="true">
		{liveMessage}
	</span>

	{#if showStepper}
		<div class="ds-input-adornment end">
			<div class="ds-number-stepper">
				<DsIconButton
					type="button"
					icon="minus"
					size="xs"
					variant="ghost"
					intent="secondary"
					label={decrementLabel}
					disabled={Boolean(rest.disabled || rest.readonly)}
					touchTarget={false}
					onclick={() => stepBy(-1)}
				/>
				<span class="ds-number-stepper-divider" aria-hidden="true"></span>
				<DsIconButton
					type="button"
					icon="plus"
					size="xs"
					variant="ghost"
					intent="secondary"
					label={incrementLabel}
					disabled={Boolean(rest.disabled || rest.readonly)}
					touchTarget={false}
					onclick={() => stepBy(1)}
				/>
			</div>
		</div>
	{/if}
</div>
