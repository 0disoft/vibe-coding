<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { DsSeparator } from "$lib/components/design-system";

	interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		title?: string;
		children?: Snippet;
		footer?: Snippet;
	}

	let { title, children, footer, class: className = "", ...rest }: Props =
		$props();
</script>

<aside
	{...rest}
	class={["ds-sidebar", className].filter(Boolean).join(" ")}
>
	{#if title}
		<div class="ds-sidebar-header">
			<div class="text-menu-sm font-semibold text-foreground">{title}</div>
		</div>
		<DsSeparator class="my-3" />
	{/if}

	<div class="ds-sidebar-body">
		{#if children}
			{@render children()}
		{/if}
	</div>

	{#if footer}
		<DsSeparator class="my-3" />
		<div class="ds-sidebar-footer">
			{@render footer()}
		</div>
	{/if}
</aside>

