<script lang="ts">
	import { useId } from "$lib/shared/utils/use-id";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	type ControlProps = {
		id: string;
		"aria-describedby"?: string;
		"aria-invalid"?: "true" | undefined;
		required: boolean;
		"aria-required"?: "true" | undefined;
	};

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		id?: string;
		label: string;
		hideLabel?: boolean;
		helpText?: string;
		errorText?: string;
		invalid?: boolean;
		required?: boolean;
		/**
		 * 에러를 즉시 읽을지 여부:
		 * - false(기본): 입력 중 과도한 낭독 방지
		 * - true: 제출/blur 이후에만 true로 설정 권장
		 */
		announceError?: boolean;
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
		announceError = false,
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
		// 정책: help 먼저, error 뒤
		if (helpText) ids.push(helpId);
		if (invalid && errorText) ids.push(errorId);
		return ids.length ? ids.join(" ") : undefined;
	});

	let controlProps = $derived<ControlProps>({
		id,
		"aria-describedby": describedBy,
		"aria-invalid": invalid ? "true" : undefined,
		required,
		"aria-required": required ? "true" : undefined,
	});
</script>

<div {...rest} class={`ds-field ${className}`.trim()}>
	<label class={`ds-field-label ${hideLabel ? "sr-only" : ""}`.trim()} for={id}>
		{label}{#if required && !hideLabel}<span
				aria-hidden="true"
				class="text-destructive"
			>
				*</span
			>{/if}
	</label>

	{#if children}
		{@render children(controlProps)}
	{/if}

	{#if invalid && errorText}
		<div
			class="ds-field-error"
			id={errorId}
			role={announceError ? "alert" : undefined}
		>
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
