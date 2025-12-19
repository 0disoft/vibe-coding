<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { createControllableState } from "$lib/shared/utils/controllable-state.svelte";

	import DsIconButton from "./IconButton.svelte";

	export type CarouselItem = {
		id: string;
		title?: string;
		description?: string;
		imageSrc?: string;
		href?: string;
	};

	type SlideCtx = {
		item: CarouselItem;
		index: number;
		isActive: boolean;
	};

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		items: CarouselItem[];
		/** 현재 슬라이드 index (controlled) */
		index?: number;
		onIndexChange?: (next: number) => void;
		defaultIndex?: number;
		/** 컨트롤 표시 */
		showArrows?: boolean;
		showDots?: boolean;
		/** 키보드 이동 활성화 */
		keyboard?: boolean;
		/** 접근성 라벨 */
		label?: string;
		/** 슬라이드 렌더 커스터마이즈 */
		slide?: Snippet<[SlideCtx]>;
	}

	let {
		items,
		index,
		onIndexChange,
		defaultIndex = 0,
		showArrows = true,
		showDots = true,
		keyboard = true,
		label = "Carousel",
		slide,
		class: className = "",
		...rest
	}: Props = $props();

	let indexState = createControllableState<number>({
		value: () => index ?? undefined,
		onChange: (next) => onIndexChange?.(next),
		defaultValue: () => defaultIndex,
	});

	let viewportEl = $state<HTMLDivElement | null>(null);
	let slideEls = $state<(HTMLElement | null)[]>([]);
	let scrollRaf = 0;
	let isRtl = $state(false);
	let isProgrammaticScroll = false;
	let scrollAnimationId: number | null = null;

	function slideRef(node: HTMLElement, params: { i: number }) {
		slideEls[params.i] = node;
		return {
			destroy() {
				if (slideEls[params.i] === node) slideEls[params.i] = null;
			},
		};
	}

	function clampIndex(i: number) {
		if (items.length <= 0) return 0;
		return Math.min(items.length - 1, Math.max(0, i));
	}

	function scrollToIndex(
		i: number,
		behavior: ScrollBehavior,
		onComplete?: () => void,
	) {
		if (!viewportEl) return;
		const el = slideEls[i];
		if (!el) {
			console.warn(`Carousel: Slide element at index ${i} not found`);
			return;
		}

		const rect = el.getBoundingClientRect();
		const viewportRect = viewportEl.getBoundingClientRect();
		const currentScroll = viewportEl.scrollLeft;
		const targetLeft = rect.left - viewportRect.left + currentScroll;

		isProgrammaticScroll = true;

		// Use native smooth scroll.
		// The browser handles the interaction between scrollTo and scroll-snap (usually correctly).
		viewportEl.scrollTo({
			left: targetLeft,
			behavior: behavior,
		});

		// Native smooth scroll completion detection is tricky.
		// We use a safe timeout as a fallback.
		// NOTE: 'auto' is nearly instant, 'smooth' takes time.
		if (scrollAnimationId) clearTimeout(scrollAnimationId);

		const timeout = behavior === "smooth" ? 600 : 50;
		scrollAnimationId = window.setTimeout(() => {
			isProgrammaticScroll = false;
			scrollAnimationId = null;
			onComplete?.();
		}, timeout);
	}

	function goTo(
		i: number,
		opts?: { focus?: boolean; behavior?: ScrollBehavior },
	) {
		const next = clampIndex(i);

		// Even if index is same, ensure we are visually there (sync)
		if (next === indexState.value) {
			scrollToIndex(next, opts?.behavior ?? "smooth");
			// if (opts?.focus) viewportEl?.focus();
			return;
		}

		// Update state ONLY after animation to prevent reactive loop conflicts
		scrollToIndex(next, opts?.behavior ?? "smooth", () => {
			indexState.value = next;
		});
		// if (opts?.focus) viewportEl?.focus();
	}

	function prev() {
		goTo(indexState.value - 1, { focus: true });
	}

	function next() {
		goTo(indexState.value + 1, { focus: true });
	}

	function onScroll() {
		if (!viewportEl) return;

		// If programmatic, ignore updates
		if (isProgrammaticScroll) return;

		if (scrollRaf) cancelAnimationFrame(scrollRaf);

		scrollRaf = requestAnimationFrame(() => {
			scrollRaf = 0;
			if (!viewportEl) return;
			// check again
			if (isProgrammaticScroll) return;

			const viewportRect = viewportEl.getBoundingClientRect();
			let bestIndex = indexState.value;
			let bestDist = Number.POSITIVE_INFINITY;

			for (let i = 0; i < slideEls.length; i++) {
				const el = slideEls[i];
				if (!el) continue;
				const r = el.getBoundingClientRect();
				const dist = Math.abs(r.left - viewportRect.left);
				if (dist < bestDist) {
					bestDist = dist;
					bestIndex = i;
				}
			}

			if (bestIndex !== indexState.value) {
				indexState.value = bestIndex;
			}
		});
	}

	function onKeyDown(e: KeyboardEvent) {
		if (!keyboard) return;
		const leftKey = isRtl ? "ArrowRight" : "ArrowLeft";
		const rightKey = isRtl ? "ArrowLeft" : "ArrowRight";
		if (e.key === leftKey) {
			e.preventDefault();
			prev();
		} else if (e.key === rightKey) {
			e.preventDefault();
			next();
		} else if (e.key === "Home") {
			e.preventDefault();
			goTo(0, { focus: true });
		} else if (e.key === "End") {
			e.preventDefault();
			goTo(items.length - 1, { focus: true });
		}
	}

	function onInteract() {
		// If user interacts, cancel the programmatic flag/timeout immediately
		// so the carousel becomes responsive to the user's new position.
		if (scrollAnimationId) {
			clearTimeout(scrollAnimationId);
			scrollAnimationId = null;
		}
		isProgrammaticScroll = false;
	}

	function attachViewportEvents(node: HTMLDivElement) {
		node.addEventListener("scroll", onScroll);
		node.addEventListener("keydown", onKeyDown);
		// Interrupt programmatic scroll on user interaction
		node.addEventListener("pointerdown", onInteract, { passive: true });
		node.addEventListener("wheel", onInteract, { passive: true });
		node.addEventListener("touchstart", onInteract, { passive: true });

		return {
			destroy() {
				node.removeEventListener("scroll", onScroll);
				node.removeEventListener("keydown", onKeyDown);
				node.removeEventListener("pointerdown", onInteract);
				node.removeEventListener("wheel", onInteract);
				node.removeEventListener("touchstart", onInteract);
			},
		};
	}

	$effect(() => {
		if (!viewportEl) return;
		isRtl = getComputedStyle(viewportEl).direction === "rtl";
	});

	$effect(() => {
		// items 길이가 바뀌면 index를 안전 범위로 보정
		const safe = clampIndex(indexState.value);
		if (safe !== indexState.value) {
			indexState.value = safe;
		}
	});

	$effect(() => {
		// 외부에서 index가 바뀌는 경우에도 뷰포트를 동기화
		if (!viewportEl) return;
		const safe = clampIndex(indexState.value);

		// If currently performing a smooth scroll, don't force auto scroll
		if (isProgrammaticScroll) return;

		queueMicrotask(() => scrollToIndex(safe, "auto"));
	});
</script>

<div {...rest} class={["ds-carousel", className].filter(Boolean).join(" ")}>
	<div class="ds-carousel-header">
		{#if showArrows}
			<div class="ds-carousel-controls">
				<DsIconButton
					icon="chevron-left"
					label="Previous slide"
					size="sm"
					variant="ghost"
					intent="neutral"
					disabled={indexState.value <= 0}
					onclick={prev}
				/>
				<DsIconButton
					icon="chevron-right"
					label="Next slide"
					size="sm"
					variant="ghost"
					intent="neutral"
					disabled={indexState.value >= items.length - 1}
					onclick={next}
				/>
			</div>
		{/if}

		{#if showDots}
			<div class="ds-carousel-dots" role="group" aria-label={`${label} slides`}>
				{#each items as item, i (item.id)}
					<button
						type="button"
						class="ds-carousel-dot"
						aria-label={`Go to slide ${i + 1}`}
						aria-current={i === indexState.value ? "true" : undefined}
						onclick={() => goTo(i, { focus: true })}
					></button>
				{/each}
			</div>
		{/if}
	</div>

	<div
		class="ds-carousel-viewport thin-scrollbar"
		bind:this={viewportEl}
		use:attachViewportEvents
		role="region"
		tabindex="-1"
		aria-label={label}
		aria-roledescription="carousel"
	>
		<div class="ds-carousel-track">
			{#each items as item, i (item.id)}
				<div
					class="ds-carousel-slide"
					use:slideRef={{ i }}
					role="group"
					aria-roledescription="slide"
					aria-label={`Slide ${i + 1} of ${items.length}`}
					aria-current={i === indexState.value ? "true" : undefined}
					aria-hidden={i === indexState.value ? undefined : "true"}
					inert={i === indexState.value ? undefined : true}
					data-active={i === indexState.value ? "true" : undefined}
				>
					{#if slide}
						{@render slide({
							item,
							index: i,
							isActive: i === indexState.value,
						})}
					{:else}
						<div class="ds-carousel-fallback">
							{#if item.imageSrc}
								<img
									class="ds-carousel-image"
									src={item.imageSrc}
									alt={item.title ?? ""}
									loading="lazy"
								/>
							{/if}
							<div class="ds-carousel-meta">
								<div class="ds-carousel-title">
									{item.title ?? `Slide ${i + 1}`}
								</div>
								{#if item.description}
									<div class="ds-carousel-desc">{item.description}</div>
								{/if}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
