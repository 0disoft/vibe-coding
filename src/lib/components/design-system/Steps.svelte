<script lang="ts">
	import { untrack, type Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import DsIcon from "./Icon.svelte";

	export type StepsItem = {
		id: string;
		title: string;
		description?: string;
		disabled?: boolean;
	};

	type RenderStepCtx = {
		step: StepsItem;
		index: number;
		state: "upcoming" | "current" | "completed";
		isDisabled: boolean;
		goTo: () => void;
	};

	interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		steps: ReadonlyArray<StepsItem>;
		/** 현재 step id (controlled) */
		currentId?: string | null;
		/** currentId 변경 콜백 */
		onCurrentIdChange?: (next: string | null) => void;
		/** 초기 step id (uncontrolled) */
		defaultCurrentId?: string | null;
		/** 완료된 step ids (선택, 제공 시 해당 값 우선) */
		completedIds?: ReadonlyArray<string>;
		/** 클릭으로 이동 허용 */
		allowNavigation?: boolean;
		/** step 렌더 커스터마이즈(고급) */
		renderStep?: Snippet<[RenderStepCtx]>;
	}

	let {
		steps,
		currentId = $bindable<string | null | undefined>(undefined),
		onCurrentIdChange,
		defaultCurrentId = null,
		completedIds,
		allowNavigation = false,
		renderStep,
		class: className = "",
		...rest
	}: Props = $props();

	function findFirstEnabledId(list: ReadonlyArray<StepsItem>): string | null {
		for (const step of list) {
			if (!step.disabled) return step.id;
		}
		return list[0]?.id ?? null;
	}

	let internalCurrentId = $state<string | null>(
		untrack(() => defaultCurrentId ?? findFirstEnabledId(steps)),
	);

	function setCurrent(next: string | null) {
		if (currentId === undefined) internalCurrentId = next;
		else currentId = next;
		onCurrentIdChange?.(next);
	}

	let currentIndex = $derived.by(() => {
		const id = currentId === undefined ? internalCurrentId : currentId;
		if (!id) return -1;
		return steps.findIndex((s) => s.id === id);
	});

	function isCompleted(id: string, index: number): boolean {
		if (completedIds) return completedIds.includes(id);
		if (currentIndex < 0) return false;
		return index < currentIndex;
	}

	function stateFor(step: StepsItem, index: number): RenderStepCtx["state"] {
		const activeId = currentId === undefined ? internalCurrentId : currentId;
		if (isCompleted(step.id, index)) return "completed";
		if (step.id === activeId) return "current";
		return "upcoming";
	}
</script>

<nav {...rest} class={["ds-steps", className].filter(Boolean).join(" ")}>
	<ol class="ds-steps-list">
		{#each steps as step, index (step.id)}
			{@const state = stateFor(step, index)}
			{@const isDisabled = Boolean(step.disabled)}
			{@const canNavigate = allowNavigation && !isDisabled}

			<li class="ds-steps-item" data-state={state}>
				<div class="ds-steps-dot" aria-hidden="true">
					{#if state === "completed"}
						<DsIcon name="check" size="sm" />
					{:else}
						{index + 1}
					{/if}
				</div>

				<div class="ds-steps-body">
					{#if renderStep}
						{@render renderStep({
							step,
							index,
							state,
							isDisabled,
							goTo: () => setCurrent(step.id),
						})}
					{:else if canNavigate}
						<button
							type="button"
							class="ds-steps-action"
							aria-current={state === "current" ? "step" : undefined}
							onclick={() => setCurrent(step.id)}
						>
							<div class="ds-steps-title">{step.title}</div>
							{#if step.description}
								<div class="ds-steps-description">{step.description}</div>
							{/if}
						</button>
					{:else}
						<div aria-current={state === "current" ? "step" : undefined}>
							<div class="ds-steps-title">{step.title}</div>
							{#if step.description}
								<div class="ds-steps-description">{step.description}</div>
							{/if}
						</div>
					{/if}
				</div>
			</li>
		{/each}
	</ol>
</nav>
