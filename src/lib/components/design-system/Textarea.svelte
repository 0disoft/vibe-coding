<script lang="ts">
	import { tick } from "svelte";
	import type { HTMLTextareaAttributes } from "svelte/elements";

	interface Props extends HTMLTextareaAttributes {
		variant?: "outline" | "filled" | "ghost";
		invalid?: boolean;
		autoResize?: boolean;
		maxHeight?: string;
		ref?: HTMLTextAreaElement | null;
	}

	let {
		variant = "outline",
		invalid = false,
		autoResize = false,
		maxHeight,
		value = $bindable(""),
		ref = $bindable(null),
		class: className = "",
		style = "",
		rows = 3,
		...rest
	}: Props = $props();

	let rafId: number | null = null;

	function parsePx(v?: string): number | null {
		if (!v) return null;
		const m = v.trim().match(/^(\d+(\.\d+)?)px$/);
		return m ? Number(m[1]) : null;
	}

	function adjustHeightNow() {
		if (!autoResize || !ref) return;

		const maxPx = parsePx(maxHeight);

		ref.style.height = "auto";
		const next = ref.scrollHeight;

		if (maxPx !== null && next > maxPx) {
			ref.style.height = `${maxPx}px`;
			ref.style.overflowY = "auto";
		} else {
			ref.style.height = `${next}px`;
			ref.style.overflowY = "hidden";
		}
	}

	function scheduleAdjust() {
		if (!autoResize) return;
		if (rafId) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			rafId = null;
			adjustHeightNow();
		});
	}

	$effect(() => {
		if (value !== undefined) scheduleAdjust();
	});

	$effect(() => {
		if (ref) {
			tick().then(() => scheduleAdjust());
		}
	});

	let mergedStyle = $derived(
		[maxHeight ? `max-height: ${maxHeight}` : "", style]
			.map((s) => (s || "").trim())
			.filter(Boolean)
			.join("; "),
	);
</script>

<textarea
	{...rest}
	bind:this={ref}
	bind:value
	{rows}
	class={[
		"ds-textarea ds-focus-ring",
		autoResize ? "resize-none" : "",
		className,
	]
		.filter(Boolean)
		.join(" ")}
	style={mergedStyle}
	aria-invalid={invalid ? "true" : undefined}
	oninput={(e) => {
		if (autoResize) scheduleAdjust();
		// @ts-ignore
		rest.oninput?.(e);
	}}
	data-ds-variant={variant}
	data-invalid={invalid ? "true" : undefined}
	data-disabled={rest.disabled ? "true" : undefined}
></textarea>
