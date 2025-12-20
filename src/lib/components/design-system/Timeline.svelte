<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	export type TimelineItem = {
		title: string;
		date?: string;
		isoDate?: string;
		description?: string;
		status?: "planned" | "in-progress" | "done";
	};

	interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		items: TimelineItem[];
		label?: string;
	}

	let {
		items,
		label = "Timeline",
		class: className = "",
		...rest
	}: Props = $props();

	function statusText(status?: TimelineItem["status"]) {
		if (!status) return "";
		if (status === "planned") return "Planned";
		if (status === "in-progress") return "In progress";
		return "Done";
	}
</script>

<section
	{...rest}
	class={["ds-timeline", className].filter(Boolean).join(" ")}
	aria-label={label}
>
	<ol class="ds-timeline-list">
		{#each items as it (it.title)}
			{@const statusLabel = statusText(it.status)}
			<li class="ds-timeline-item" data-status={it.status}>
				<div class="ds-timeline-dot" aria-hidden="true"></div>
				<div class="ds-timeline-body">
					<div class="ds-timeline-header">
						<div class="ds-timeline-title">{it.title}</div>
						{#if it.date}
							{#if it.isoDate}
								<time class="ds-timeline-date" datetime={it.isoDate}
									>{it.date}</time
								>
							{:else}
								<div class="ds-timeline-date">{it.date}</div>
							{/if}
						{/if}
						{#if statusLabel}
							<span class="sr-only">{statusLabel}</span>
						{/if}
					</div>
					{#if it.description}
						<div class="ds-timeline-desc">{it.description}</div>
					{/if}
				</div>
			</li>
		{/each}
	</ol>
</section>
