<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { DsIcon } from "$lib/components/design-system";
	import type { IntentWithNeutral } from "./types";
	import { toIntentCss } from "./types";

	type Role = "status" | "alert";

	interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		intent?: IntentWithNeutral;
		title?: string;
		description?: string;
		role?: Role;
		icon?: string | null;
		children?: Snippet;
		actions?: Snippet;
	}

	let {
		intent = "neutral",
		title,
		description,
		role,
		icon,
		class: className = "",
		children,
		actions,
		...rest
	}: Props = $props();

	let intentCss = $derived(toIntentCss(intent));

	const defaultIconByIntent: Record<string, string> = {
		neutral: "info",
		primary: "sparkles",
		secondary: "info",
		success: "circle-check",
		warning: "triangle-alert",
		error: "circle-alert",
	};

	let computedRole = $derived<Role>(
		role ??
			(intentCss === "error" || intentCss === "warning" ? "alert" : "status"),
	);

	let iconName = $derived(
		icon === null ? null : (icon ?? defaultIconByIntent[intentCss] ?? "info"),
	);

	let rootClass = $derived(["ds-alert", className].filter(Boolean).join(" "));
</script>

<section
	{...rest}
	class={`${rootClass} flex items-start gap-4 p-4`}
	data-ds-intent={intentCss}
	role={computedRole}
>
	{#if iconName}
		<div class="ds-alert-icon mt-0.5 shrink-0" aria-hidden="true">
			<DsIcon name={iconName} size="md" />
		</div>
	{/if}

	<div class="ds-alert-body">
		{#if title}
			<div class="ds-alert-title">{title}</div>
		{/if}

		{#if description}
			<div class="ds-alert-description">{description}</div>
		{/if}

		{#if children}
			<div class="ds-alert-content">
				{@render children()}
			</div>
		{/if}
	</div>

	{#if actions}
		<div class="ds-alert-actions">
			{@render actions()}
		</div>
	{/if}
</section>
