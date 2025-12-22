<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import { DsSeparator } from "$lib/components/design-system";

	type Orientation = "horizontal" | "vertical";

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		orientation?: Orientation;
		decorative?: boolean;
		label?: string;
	}

	let {
		orientation = "horizontal",
		decorative = true,
		label,
		class: className = "",
		...rest
	}: Props = $props();
</script>

<DsSeparator
	{...rest}
	class={["ds-remote-separator", className].filter(Boolean).join(" ")}
	{orientation}
	{decorative}
	{label}
/>
