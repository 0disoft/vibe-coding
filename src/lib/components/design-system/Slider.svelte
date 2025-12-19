<script lang="ts">
	import type { HTMLInputAttributes } from "svelte/elements";

	import { useId } from "$lib/shared/utils/use-id";

	interface Props extends Omit<
		HTMLInputAttributes,
		"type" | "value" | "min" | "max" | "step" | "id"
	> {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		/** aria-label 대체 */
		label?: string;
		id?: string;
		describedBy?: string;
	}

	let {
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		label,
		id: idProp,
		describedBy,
		class: className = "",
		...rest
	}: Props = $props();

	const generatedId = useId("ds-slider");
	let id = $derived(idProp ?? generatedId);

	function clamp(n: number) {
		if (max <= min) return min;
		return Math.min(max, Math.max(min, n));
	}

	let clampedValue = $derived(clamp(value));
	let percent = $derived.by(() => {
		if (max <= min) return 0;
		return ((clampedValue - min) / (max - min)) * 100;
	});

	function handleInput(e: Event) {
		const el = e.currentTarget as HTMLInputElement;
		const next = Number(el.value);
		if (!Number.isFinite(next)) return;
		value = next;
	}

	let ariaLabel = $derived(rest["aria-label"] ?? label);
</script>

<div class={["ds-slider", className].filter(Boolean).join(" ")}>
	<div class="ds-slider-track" aria-hidden="true">
		<div
			class="ds-slider-fill"
			style={`inset-inline-start: 0; width: ${percent}%;`}
		></div>
	</div>

	<input
		{...rest}
		{id}
		type="range"
		class="ds-slider-input"
		{min}
		{max}
		{step}
		value={clampedValue}
		aria-label={ariaLabel}
		aria-describedby={describedBy}
		oninput={handleInput}
	/>
</div>
