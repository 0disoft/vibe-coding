<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { createControllableState } from "$lib/shared/utils/controllable-state.svelte";
	import { useId } from "$lib/shared/utils/use-id";

	type TriggerProps = {
		describedBy?: string;
		onpointerover: (e: PointerEvent) => void;
		onpointerout: (e: PointerEvent) => void;
		onfocus: () => void;
		onblur: () => void;
		onfocusin: () => void;
		onfocusout: () => void;
		onkeydown: (e: KeyboardEvent) => void;
	};

	export type TooltipPlacement =
		| "top"
		| "top-start"
		| "top-end"
		| "bottom"
		| "bottom-start"
		| "bottom-end"
		| "left"
		| "left-start"
		| "left-end"
		| "right"
		| "right-start"
		| "right-end";

	interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
		content?: string;
		disabled?: boolean;
		open?: boolean;
		onOpenChange?: (next: boolean) => void;
		delayMs?: number;
		closeDelayMs?: number;
		placement?: TooltipPlacement;
		arrow?: boolean;
		children?: Snippet<[TriggerProps]>;
		tooltip?: Snippet;
	}

	let {
		content,
		disabled = false,
		open,
		onOpenChange,
		delayMs = 500,
		closeDelayMs = 100,
		placement = "top",
		arrow = false,
		class: className = "",
		children,
		tooltip,
		...rest
	}: Props = $props();

	// SSR-safe ID 생성 (컴포넌트 초기화 시 한 번만)
	const tooltipId = useId("ds-tooltip");

	// Controlled/Uncontrolled 상태 통합 관리
	let openState = createControllableState({
		value: () => open,
		onChange: onOpenChange,
		defaultValue: false,
	});

	// isOpen getter로 간소화
	let isOpen = $derived(openState.value);

	let openTimer = $state<number | null>(null);
	let closeTimer = $state<number | null>(null);

	// 뷰포트 경계 감지용
	let tooltipEl = $state<HTMLSpanElement | null>(null);
	let offsetX = $state(0);
	let offsetY = $state(0);

	function clearTimers(): void {
		if (openTimer !== null) window.clearTimeout(openTimer);
		if (closeTimer !== null) window.clearTimeout(closeTimer);
		openTimer = null;
		closeTimer = null;
	}

	function setOpen(next: boolean): void {
		openState.value = next;
		// 닫힐 때 오프셋 리셋
		if (!next) {
			offsetX = 0;
			offsetY = 0;
		}
	}

	function scheduleOpen(ms: number): void {
		clearTimers();
		openTimer = window.setTimeout(() => setOpen(true), Math.max(0, ms));
	}

	function scheduleClose(ms: number): void {
		clearTimers();
		closeTimer = window.setTimeout(() => setOpen(false), Math.max(0, ms));
	}

	function onPointerOver(e: PointerEvent): void {
		if (disabled) return;
		if (e.pointerType === "touch") return;
		if (
			e.relatedTarget instanceof Node &&
			e.currentTarget instanceof Node &&
			e.currentTarget.contains(e.relatedTarget)
		)
			return;
		scheduleOpen(delayMs);
	}

	function onPointerOut(e: PointerEvent): void {
		if (disabled) return;
		if (
			e.relatedTarget instanceof Node &&
			e.currentTarget instanceof Node &&
			e.currentTarget.contains(e.relatedTarget)
		)
			return;
		scheduleClose(closeDelayMs);
	}

	function onMouseOver(e: MouseEvent): void {
		if (disabled) return;
		if (
			e.relatedTarget instanceof Node &&
			e.currentTarget instanceof Node &&
			e.currentTarget.contains(e.relatedTarget)
		)
			return;
		scheduleOpen(delayMs);
	}

	function onMouseOut(e: MouseEvent): void {
		if (disabled) return;
		if (
			e.relatedTarget instanceof Node &&
			e.currentTarget instanceof Node &&
			e.currentTarget.contains(e.relatedTarget)
		)
			return;
		scheduleClose(closeDelayMs);
	}

	function onFocusIn(): void {
		if (disabled) return;
		scheduleOpen(0);
	}

	function onFocusOut(): void {
		if (disabled) return;
		scheduleClose(0);
	}

	function onKeyDown(e: KeyboardEvent): void {
		if (e.key === "Escape") {
			e.preventDefault();
			clearTimers();
			setOpen(false);
		}
	}

	let triggerProps = $derived<TriggerProps>({
		describedBy: isOpen ? tooltipId : undefined,
		onpointerover: onPointerOver,
		onpointerout: onPointerOut,
		onfocus: onFocusIn,
		onblur: onFocusOut,
		onfocusin: onFocusIn,
		onfocusout: onFocusOut,
		onkeydown: onKeyDown,
	});

	// 스타일 계산: transform을 사용하여 위치 미세 조정 및 중앙 정렬 처리
	let transformStyle = $derived.by(() => {
		// 중앙 정렬이 필요한 경우 (기본값)
		if (placement === "top" || placement === "bottom") {
			return `translateX(calc(-50% + ${offsetX}px))`;
		}
		if (placement === "left" || placement === "right") {
			return `translateY(calc(-50% + ${offsetY}px))`;
		}
		// start/end 변형은 CSS에서 기본 위치를 잡으므로, 뷰포트 보정값(offsetX/Y)만 적용
		// 단, 현재 start/end에 대한 뷰포트 보정 로직은 복잡하여 0으로 가정 (추후 고도화 가능)
		return `translate(${offsetX}px, ${offsetY}px)`;
	});

	// 뷰포트 경계 감지 및 위치 조정
	$effect(() => {
		if (!isOpen || !tooltipEl) return;

		requestAnimationFrame(() => {
			if (!tooltipEl) return;
			const rect = tooltipEl.getBoundingClientRect();
			const padding = 8; // 화면 가장자리 여백

			// Top/Bottom 배치일 때 좌우 충돌 감지
			if (placement.startsWith("top") || placement.startsWith("bottom")) {
				let newOffset = 0;
				if (rect.left < padding) {
					newOffset = padding - rect.left;
				} else if (rect.right > window.innerWidth - padding) {
					newOffset = window.innerWidth - padding - rect.right;
				}
				if (newOffset !== offsetX) offsetX = newOffset;
			}
			// Left/Right 배치일 때 상하 충돌 감지
			else if (placement.startsWith("left") || placement.startsWith("right")) {
				let newOffset = 0;
				if (rect.top < padding) {
					newOffset = padding - rect.top;
				} else if (rect.bottom > window.innerHeight - padding) {
					newOffset = window.innerHeight - padding - rect.bottom;
				}
				if (newOffset !== offsetY) offsetY = newOffset;
			}
		});
	});
</script>

<svelte:window
	onkeydown={(e) => {
		if (isOpen && e.key === "Escape") {
			e.preventDefault();
			clearTimers();
			setOpen(false);
		}
	}}
/>

<span
	{...rest}
	class={`ds-tooltip-root ${className}`.trim()}
	onfocusin={onFocusIn}
	onfocusout={onFocusOut}
	onkeydown={onKeyDown}
	onmouseover={onMouseOver}
	onmouseout={onMouseOut}
	onpointerover={onPointerOver}
	onpointerout={onPointerOut}
>
	{#if children}
		{@render children(triggerProps)}
	{/if}

	{#if isOpen && !disabled && (tooltip || content)}
		<span
			bind:this={tooltipEl}
			class="ds-tooltip ds-elevation-2"
			role="tooltip"
			id={tooltipId}
			data-placement={placement}
			data-arrow={arrow ? "true" : undefined}
			style:transform={transformStyle}
		>
			{#if tooltip}
				{@render tooltip()}
			{:else}
				{content}
			{/if}
		</span>
	{/if}
</span>