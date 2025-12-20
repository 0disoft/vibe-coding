<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import { onDestroy } from "svelte";

	import DsVisuallyHidden from "./VisuallyHidden.svelte";

	export type Politeness = "polite" | "assertive";

	interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		politeness?: Politeness;
		duration?: number;
	}

	let {
		politeness = "polite",
		duration = 3000,
		class: className = "",
		...rest
	}: Props = $props();

	type Message = { id: number; text: string };

	let messages = $state<Message[]>([]);
	let nextId = 0;
	const timeoutIds = new Map<number, ReturnType<typeof setTimeout>>();

	export function announce(next: string) {
		const id = nextId;
		nextId += 1;
		messages = [...messages, { id, text: next }];

		const timeoutId = setTimeout(() => {
			messages = messages.filter((msg) => msg.id !== id);
			timeoutIds.delete(id);
		}, duration);
		timeoutIds.set(id, timeoutId);
	}

	onDestroy(() => {
		timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
		timeoutIds.clear();
	});
</script>

<DsVisuallyHidden
	{...rest}
	as="div"
	class={className}
	aria-live={politeness}
	aria-atomic="true"
>
	{#each messages as msg (msg.id)}
		<div>{msg.text}</div>
	{/each}
</DsVisuallyHidden>
