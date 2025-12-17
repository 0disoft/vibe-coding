<script lang="ts">
	import { DsDatePicker } from "$lib/components/design-system";

	interface Props {
		initial?: string | null;
	}

	let { initial = "2025-01-15" }: Props = $props();
	let value = $state<string | null>(initial);
</script>

<div>
	<DsDatePicker bind:value label="Pick a date" locale="en-US" />
	<output data-testid="date-picker-value">{value ?? ""}</output>
</div>
