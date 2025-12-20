<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { createControllableState } from "$lib/shared/utils/controllable-state.svelte";
	import { untrack } from "svelte";

	import DsButton from "./Button.svelte";
	import DsSteps, { type StepsItem } from "./Steps.svelte";

	export type WizardStep = StepsItem;

	type WizardCtx = {
		step: WizardStep | null;
		index: number;
		total: number;
		isFirst: boolean;
		isLast: boolean;
		canBack: boolean;
		canNext: boolean;
		goTo: (id: string) => void;
		back: () => void;
		next: () => void;
	};

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    steps: ReadonlyArray<WizardStep>;
    currentId?: string | null;
    onCurrentIdChange?: (next: string | null) => void;
    defaultCurrentId?: string | null;
    /** steps에서 클릭 이동 허용 */
    allowNavigation?: boolean;
    /** 마지막 step에서 next 누를 때 호출 */
    onFinish?: () => void;
    /** 이전/다음/완료 버튼 레이블 (i18n) */
    previousLabel?: string;
    nextLabel?: string;
    finishLabel?: string;
    /** 본문 렌더링 */
    children?: Snippet<[WizardCtx]>;
    /** footer 렌더링(선택, 없으면 기본 Prev/Next) */
    footer?: Snippet<[WizardCtx]>;
  }

	let {
		steps,
		currentId = $bindable<string | null | undefined>(undefined),
		onCurrentIdChange,
		defaultCurrentId = null,
    allowNavigation = false,
    onFinish,
    previousLabel = "Previous",
    nextLabel = "Next",
    finishLabel = "Finish",
    children,
    footer,
    class: className = "",
    ...rest
  }: Props = $props();

	function findFirstEnabledId(list: ReadonlyArray<WizardStep>): string | null {
		for (const step of list) {
			if (!step.disabled) return step.id;
		}
		return list[0]?.id ?? null;
	}

	let currentState = createControllableState<string | null>({
		value: () => (currentId === undefined ? undefined : currentId),
		onChange: (next) => onCurrentIdChange?.(next),
		defaultValue: untrack(() => defaultCurrentId ?? findFirstEnabledId(steps)),
	});

	let isFinished = $state(false);

	function setCurrent(next: string | null) {
		currentState.value = next;
	}

	$effect(() => {
		const _ = currentState.value;
		untrack(() => {
			isFinished = false;
		});
	});

	let currentIndex = $derived.by(() => {
		const id = currentState.value;
		if (!id) return -1;
		return steps.findIndex((s) => s.id === id);
	});

	let currentStep = $derived.by(() => {
		if (currentIndex < 0) return null;
		return steps[currentIndex] ?? null;
	});

	function findNextEnabled(from: number, dir: -1 | 1) {
		for (let i = from + dir; i >= 0 && i < steps.length; i += dir) {
			if (!steps[i]?.disabled) return i;
		}
		return -1;
	}

	function goTo(id: string) {
		const idx = steps.findIndex((s) => s.id === id);
		if (idx < 0) return;
		if (steps[idx]?.disabled) return;
		setCurrent(id);
	}

	function back() {
		if (currentIndex < 0) return;
		const prevIndex = findNextEnabled(currentIndex, -1);
		if (prevIndex < 0) return;
		setCurrent(steps[prevIndex]?.id ?? null);
	}

	function next() {
		if (currentIndex < 0) return;
		const nextIndex = findNextEnabled(currentIndex, 1);
		if (nextIndex < 0) {
			isFinished = true;
			onFinish?.();
			return;
		}
		setCurrent(steps[nextIndex]?.id ?? null);
	}

	let completedIds = $derived.by(() => {
		if (isFinished) return steps.map((s) => s.id);
		if (currentIndex < 0) return [];
		return steps.slice(0, currentIndex).map((s) => s.id);
	});

	let ctx = $derived<WizardCtx>({
		step: currentStep,
		index: currentIndex,
		total: steps.length,
		isFirst: currentIndex <= 0,
		isLast: currentIndex >= steps.length - 1,
		canBack: findNextEnabled(currentIndex, -1) >= 0,
		canNext: findNextEnabled(currentIndex, 1) >= 0,
		goTo,
		back,
		next,
	});
</script>

<div {...rest} class={["ds-wizard", className].filter(Boolean).join(" ")}>
	<DsSteps
		{steps}
		currentId={currentState.value}
		onCurrentIdChange={(nextId) => setCurrent(nextId)}
		{completedIds}
		{allowNavigation}
	/>

	{#if children}
		<div class="ds-wizard-body">
			{@render children(ctx)}
		</div>
	{/if}

	<div class="ds-wizard-footer">
		{#if footer}
			{@render footer(ctx)}
		{:else}
			<DsButton
				variant="outline"
				intent="secondary"
				type="button"
				disabled={!ctx.canBack}
				onclick={ctx.back}
			>
				{previousLabel}
			</DsButton>

			<DsButton type="button" onclick={ctx.next}>
				{ctx.canNext ? nextLabel : finishLabel}
			</DsButton>
		{/if}
	</div>
</div>
