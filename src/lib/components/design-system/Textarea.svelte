<script lang="ts">
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

	function adjustHeight() {
		if (!autoResize || !ref) return;
		ref.style.height = "auto";
		ref.style.height = `${ref.scrollHeight}px`;
	}

	$effect(() => {
		if (value !== undefined) {
			adjustHeight();
		}
	});

	$effect(() => {
		if (ref) adjustHeight();
	});
</script>

<textarea
	{...rest}
	bind:this={ref}
	bind:value
	{rows}
	class={[
		"ds-textarea ds-focus-ring",
		autoResize ? "resize-none overflow-hidden" : "",
		className,
	]
		.filter(Boolean)
		.join(" ")}
	style={[maxHeight ? `max-height: ${maxHeight}` : "", style]
		.filter(Boolean)
		.join("; ")}
	aria-invalid={invalid ? "true" : undefined}
	oninput={(e) => {
		if (autoResize) adjustHeight();
		// @ts-ignore
		rest.oninput?.(e);
	}}
	data-ds-variant={variant}
	data-invalid={invalid ? "true" : undefined}
	data-disabled={rest.disabled ? "true" : undefined}
></textarea>