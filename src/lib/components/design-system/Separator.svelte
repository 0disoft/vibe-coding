<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	type Orientation = "horizontal" | "vertical";

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		orientation?: Orientation;
		/** 시각적 구분선만 필요하면 true (SR에서 숨김) */
		decorative?: boolean;
		/** decorative=false일 때 SR용 레이블 */
		label?: string;
		children?: Snippet;
	}

	let {
		orientation = "horizontal",
		decorative = true,
		label,
		children,
		class: className = "",
		...rest
	}: Props = $props();

	let separatorClass = $derived(
		["ds-separator", className].filter(Boolean).join(" "),
	);
</script>

{#if children && orientation === "horizontal"}
	<div
		{...rest}
		class={["ds-separator", "ds-separator--labeled", className]
			.filter(Boolean)
			.join(" ")}
		role={decorative ? "presentation" : "separator"}
		aria-hidden={decorative ? "true" : undefined}
		aria-label={!decorative && label ? label : undefined}
		data-ds-orientation="horizontal"
	>
		<span class="ds-separator-line" aria-hidden="true"></span>
		<span class="ds-separator-text">
			{@render children()}
		</span>
		<span class="ds-separator-line" aria-hidden="true"></span>
	</div>
{:else}
	<div
		{...rest}
		class={separatorClass}
		role={decorative ? "presentation" : "separator"}
		aria-hidden={decorative ? "true" : undefined}
		aria-label={!decorative && label ? label : undefined}
		aria-orientation={
			!decorative && orientation === "vertical" ? "vertical" : undefined
		}
		data-ds-orientation={orientation}
	></div>
{/if}
