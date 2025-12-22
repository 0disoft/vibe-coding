<script lang="ts">
	import { page } from "$app/state";

	import type { Snippet } from "svelte";

	import CodeBlock from "$lib/components/CodeBlock.svelte";

	import * as m from "$lib/paraglide/messages.js";

	import {
		DsBadge,
		DsButton,
		DsCard,
		DsCopyButton,
		DsDropdown,
		DsDropdownItem,
		DsLiveRegion,
	} from "$lib/components/design-system";

	import { getApiMethodIntent, type HttpMethod } from "./api";

	export type ApiExample = {
		label: string;
		language: string;
		code: string;
	};

	interface Props {
		method: HttpMethod;
		path: string;
		description?: string;
		examples?: ApiExample[];
		activeExampleIndex?: number;
		onExampleSelect?: (index: number) => void;
		children?: Snippet;
	}

	let {
		method,
		path,
		description,
		examples = [],
		activeExampleIndex = $bindable(0),
		onExampleSelect,
		children,
	}: Props = $props();

	let liveRegion: { announce: (message: string) => void } | null = null;

	function selectExample(index: number) {
		activeExampleIndex = index;
		onExampleSelect?.(index);
		const selected = examples[index];
		if (selected) {
			const position = index + 1;
			const total = examples.length;
			const label = selected.label?.trim();
			const announcement = label
				? `${label} (${position}/${total})`
				: `${position}/${total}`;
			liveRegion?.announce(announcement);
		}
	}

	let resolvedExampleIndex = $derived(
		examples.length === 0
			? -1
			: Math.min(activeExampleIndex, examples.length - 1),
	);
	let activeExample = $derived(
		resolvedExampleIndex >= 0 ? (examples[resolvedExampleIndex] ?? null) : null,
	);

	// Make labels reactive
	let exampleLabel = $derived.by(() => {
		void page.url;
		return activeExample?.label ?? m.docs_api_example_select();
	});

	let copyLabel = $derived.by(() => {
		void page.url;
		return m.docs_api_copy_path();
	});

	let copiedLabel = $derived.by(() => {
		void page.url;
		return m.docs_api_copied();
	});
</script>

<DsLiveRegion bind:this={liveRegion} politeness="polite" duration={1200} />

<DsCard class="space-y-4">
	<div class="flex flex-wrap items-center gap-2">
		<DsBadge intent={getApiMethodIntent(method)} variant="solid" size="sm"
			>{method}</DsBadge
		>
		<code class="text-code">{path}</code>
		<DsCopyButton
			size="sm"
			variant="ghost"
			intent="neutral"
			icon="copy"
			copiedIcon="check"
			label={copyLabel}
			{copiedLabel}
			text={path}
		/>
	</div>

	{#if description}
		<p class="text-body-secondary text-muted-foreground">{description}</p>
	{/if}

	{#if examples.length}
		<DsDropdown
			align="start"
			menuClass="w-[min(16rem,100%)]"
			itemSelector={'[role="menuitemradio"]'}
		>
			{#snippet trigger(props)}
				<DsButton {...props} variant="outline" intent="secondary">
					{exampleLabel}
				</DsButton>
			{/snippet}

			{#snippet children({ close })}
				{#each examples as ex, index (ex.label)}
					<DsDropdownItem
						role="menuitemradio"
						aria-checked={index === resolvedExampleIndex}
						onclick={() => {
							selectExample(index);
							close();
						}}
					>
						{ex.label}
					</DsDropdownItem>
				{/each}
			{/snippet}
		</DsDropdown>
	{/if}

	{#if activeExample}
		<CodeBlock code={activeExample.code} language={activeExample.language} />
	{/if}

	{#if children}
		<div style="padding-block-start: var(--spacing-2);">
			{@render children()}
		</div>
	{/if}
</DsCard>
