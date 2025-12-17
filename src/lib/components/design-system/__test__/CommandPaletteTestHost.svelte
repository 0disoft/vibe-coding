<script lang="ts">
	import { DsButton, DsCommandPalette } from "$lib/components/design-system";

	type Item = {
		id: string;
		label: string;
		description?: string;
		keywords?: string[];
		disabled?: boolean;
		shortcut?: string;
	};

	interface Props {
		items: Item[];
		onSelect: (id: string) => void;
	}

	let { items, onSelect }: Props = $props();

	let open = $state(false);
	let triggerEl = $state<HTMLButtonElement | null>(null);

	function openPalette() {
		open = true;
	}
</script>

<DsButton bind:ref={triggerEl} onclick={openPalette}>
	Open Palette
</DsButton>

<DsCommandPalette
	title="Commands"
	placeholder="Search commands"
	{items}
	open={open}
	onOpenChange={(next) => (open = next)}
	onSelect={onSelect}
/>

