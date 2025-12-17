<script lang="ts">
	import { DsCalendar } from "$lib/components/design-system";

	interface Props {
		initial?: string | null;
		min?: string;
		max?: string;
	}

	let { initial = "2025-01-15", min, max }: Props = $props();

	let value = $state<string | null>(initial);
</script>

<div>
	<DsCalendar bind:value locale="en-US" {min} {max} />
	<output data-testid="calendar-value">{value ?? ""}</output>
</div>

