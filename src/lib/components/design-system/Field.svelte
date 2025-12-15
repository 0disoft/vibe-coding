<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";
	import { useId } from "$lib/shared/utils/use-id";

	type ControlProps = {
		id: string;
		describedBy?: string;
		invalid: boolean;
		required: boolean;
	};

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		id?: string;
		label: string;
		hideLabel?: boolean;
		helpText?: string;
		errorText?: string;
		invalid?: boolean;
		required?: boolean;
		children?: Snippet<[ControlProps]>;
	}

	let {
		id: idProp,
		label,
		hideLabel = false,
		helpText,
		errorText,
		invalid = false,
		required = false,
		class: className = "",
		children,
		...rest
	}: Props = $props();

	const generatedId = useId("ds-field");
	let id = $derived(idProp || generatedId);

	let helpId = $derived(`${id}-help`);
	let errorId = $derived(`${id}-error`);

	let describedBy = $derived.by(() => {
		const ids: string[] = [];
		if (invalid && errorText) ids.push(errorId);
		if (helpText) ids.push(helpId);
		return ids.length ? ids.join(" ") : undefined;
	});

	let controlProps = $derived<ControlProps>({
		id,
		describedBy,
		invalid,
		required,
	});
</script>

<div {...rest} class={`ds-field ${className}`.trim()}>
	<label class={`ds-field-label ${hideLabel ? "sr-only" : ""}`.trim()} for={id}>
		{label}{#if required && !hideLabel}<span
				aria-hidden="true"
				class="text-destructive"> *</span
			>{/if}
	</label>

	{#if children}
		{@render children(controlProps)}
	{/if}

	{#if invalid && errorText}
		<div class="ds-field-error" id={errorId} role="alert" aria-live="polite">
			<span class="ds-icon i-lucide-circle-alert" aria-hidden="true"></span>
			{errorText}
		</div>
	{/if}

	{#if helpText}
		<div class="ds-field-help" id={helpId}>
			{helpText}
		</div>
	{/if}
</div>