<script lang="ts">
	import { DsTimePicker } from "$lib/components/design-system";

	interface Props {
		initial?: string | null;
	}

	let { initial = "09:30" }: Props = $props();
	let value = $state<string | null>(initial);
</script>

<div>
	<DsTimePicker bind:value placeholder="Select time" />
	<output data-testid="time-picker-value">{value ?? ""}</output>
</div>

