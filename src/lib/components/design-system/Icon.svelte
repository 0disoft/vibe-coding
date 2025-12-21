<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import type { IntentWithNeutral } from "./types";
	import { toIntentCss } from "./types";

	type Size = "xs" | "sm" | "md" | "lg" | "xl" | "inherit";

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		name: string;
		size?: Size;
		/** 아이콘이 의미를 가질 때만 제공 (장식용이면 비워두기) */
		label?: string;
		title?: string;
		intent?: IntentWithNeutral;
		strokeWidth?: number | string;
		flipInRtl?: boolean;
	}

	let {
		name,
		size = "md",
		label,
		title,
		intent,
		strokeWidth,
		flipInRtl = false,
		class: className = "",
		style: styleValue = "",
		...rest
	}: Props = $props();

	let hasLabel = $derived(!!label?.trim());
	let role = $derived(hasLabel ? "img" : undefined);
	let intentCss = $derived(intent ? toIntentCss(intent) : undefined);
	let titleAttr = $derived(title ?? (hasLabel ? label : undefined));
	let strokeWidthValue = $derived(
		strokeWidth === undefined
			? ""
			: typeof strokeWidth === "number"
				? `${strokeWidth}px`
				: strokeWidth,
	);
	let styleAttr = $derived(
		[styleValue, strokeWidthValue ? `--icon-stroke-width: ${strokeWidthValue}` : ""]
			.filter(Boolean)
			.join("; "),
	);
</script>

<span
	{...rest}
	class={`ds-icon i-lucide-${name} ${className}`.trim()}
	{role}
	aria-label={hasLabel ? label : undefined}
	aria-hidden={hasLabel ? undefined : true}
	title={titleAttr}
	data-ds-size={size}
	data-ds-intent={intentCss}
	data-ds-flip-rtl={flipInRtl ? "true" : undefined}
	style={styleAttr}
></span>
