<script lang="ts">
	import { DsButton, DsDialog } from "$lib/components/design-system";

	let open = $state(false);
	let triggerEl = $state<HTMLButtonElement | null>(null);

	function openDialog() {
		open = true;
	}
</script>

<DsButton bind:ref={triggerEl} onclick={openDialog}>
	Open Dialog
</DsButton>

<DsDialog
	id="test-dialog"
	title="Test Dialog"
	description="Dialog description"
	{open}
	onOpenChange={(next) => (open = next)}
	returnFocusTo={triggerEl}
	initialFocus='[data-testid="first-focus"]'
	closeLabel="Close dialog"
>
	<div class="space-y-2">
		<button type="button" data-testid="first-focus">
			First focus
		</button>
		<button type="button">Second</button>
	</div>
</DsDialog>

