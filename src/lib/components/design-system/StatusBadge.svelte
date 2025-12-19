<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import DsBadge from "./Badge.svelte";
	import type { IntentWithNeutral } from "./types";

	export type ContentStatus = "draft" | "published" | "archived";
	export type StatusType =
		| "success"
		| "published"
		| "active"
		| "online"
		| "warning"
		| "draft"
		| "pending"
		| "idle"
		| "error"
		| "rejected"
		| "deleted"
		| "offline"
		| "busy"
		| "info"
		| "processing"
		| "running"
		| "neutral"
		| "archived"
		| string;

	interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
		status: StatusType;
		label?: string;
		dot?: boolean;
		pulse?: boolean;
	}

	let {
		status,
		label,
		dot = true,
		pulse,
		class: className = "",
		...rest
	}: Props = $props();

	function normalize(value: string) {
		return value.trim().toLowerCase();
	}

	function formatLabel(value: string) {
		const trimmed = value.trim();
		if (!trimmed) return "";
		return trimmed
			.replace(/[_-]+/g, " ")
			.replace(/\b\w/g, (ch) => ch.toUpperCase());
	}

	function intentFrom(statusValue: string): IntentWithNeutral {
		if (["success", "published", "active", "online"].includes(statusValue))
			return "success";
		if (["warning", "draft", "pending", "idle"].includes(statusValue))
			return "warning";
		if (
			["error", "rejected", "deleted", "offline", "busy"].includes(statusValue)
		)
			return "danger";
		if (["info", "processing", "running"].includes(statusValue))
			return "primary";
		return "neutral";
	}

	let normalizedStatus = $derived(normalize(status));
	let intent = $derived(intentFrom(normalizedStatus));
	let displayLabel = $derived(label ?? formatLabel(status));
	let shouldPulse = $derived(
		pulse ?? ["processing", "running", "pending"].includes(normalizedStatus),
	);
</script>

<DsBadge
	{...rest}
	{intent}
	variant="soft"
	size="sm"
	class={["ds-status-badge", className].filter(Boolean).join(" ")}
>
	{#if dot}
		{#snippet start()}
			<span class="ds-status-badge-dot-wrap" aria-hidden="true">
				{#if shouldPulse}
					<span class="ds-status-badge-dot-pulse"></span>
				{/if}
				<span class="ds-status-badge-dot"></span>
			</span>
		{/snippet}
	{/if}

	{displayLabel}
</DsBadge>
