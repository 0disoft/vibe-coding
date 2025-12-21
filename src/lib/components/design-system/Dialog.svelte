<script lang="ts">
	import type { Snippet } from "svelte";
	import { tick } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { DsIconButton } from "$lib/components/design-system";

	interface Props extends Omit<HTMLAttributes<HTMLDialogElement>, "children"> {
		id: string;
		title: string;
		description?: string;
		open?: boolean;
		onOpenChange?: (next: boolean) => void;
		size?: "sm" | "md" | "lg" | "xl" | "full";
		scrollable?: boolean;
		closeOnOutsideClick?: boolean;
		closeOnEscape?: boolean;
		returnFocusTo?: HTMLElement | null;
		/** 열릴 때 포커스 대상 (selector 또는 엘리먼트, 기본: dialog 자체) */
		initialFocus?: string | HTMLElement | null;
		/** 로딩 상태 표시 */
		busy?: boolean;
		/** 로딩 상태 안내 문구 (SR 전용) */
		busyLabel?: string;
		/** 로딩/상태 영역 커스터마이즈 */
		status?: Snippet;
		/** 닫기 버튼 레이블 (i18n) */
		closeLabel?: string;
		children?: Snippet;
		footer?: Snippet;
	}

	let {
		id,
		title,
		description,
		open = $bindable(false),
		onOpenChange,
		size = "md",
		scrollable = false,
		closeOnOutsideClick = true,
		closeOnEscape = true,
		returnFocusTo = null,
		initialFocus = null,
		busy = false,
		busyLabel = "Loading",
		status,
		closeLabel = "Close dialog",
		class: className = "",
		children,
		footer,
		...rest
	}: Props = $props();

	let dialogEl = $state<HTMLDialogElement | null>(null);
	let isClosing = $state(false);
	let previousActiveElement: HTMLElement | null = null;
	let mouseDownTarget: EventTarget | null = null;

	let titleId = $derived(`${id}-title`);
	let descId = $derived(`${id}-desc`);

	// 스크롤 락 복원용
	let prevBodyOverflow = "";
	let prevBodyPaddingRight = "";
	let prevRootScrollbarWidth = "";

	function setOpen(next: boolean) {
		if (open === next) return;
		open = next;
		onOpenChange?.(next);
	}

	function requestClose() {
		setOpen(false);
	}

	function prefersReducedMotion() {
		return (
			window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
		);
	}

	function lockScroll() {
		prevBodyOverflow = document.body.style.overflow;
		prevBodyPaddingRight = document.body.style.paddingRight;
		prevRootScrollbarWidth = document.documentElement.style.getPropertyValue(
			"--scrollbar-width",
		);

		const scrollBarWidth =
			window.innerWidth - document.documentElement.clientWidth;
		document.documentElement.style.setProperty(
			"--scrollbar-width",
			`${Math.max(scrollBarWidth, 0)}px`,
		);
		document.body.style.overflow = "hidden";
		document.body.style.paddingRight = `calc(${prevBodyPaddingRight || "0px"} + var(--scrollbar-width, 0px))`;
	}

	function unlockScroll() {
		document.body.style.overflow = prevBodyOverflow;
		document.body.style.paddingRight = prevBodyPaddingRight;
		if (prevRootScrollbarWidth) {
			document.documentElement.style.setProperty(
				"--scrollbar-width",
				prevRootScrollbarWidth,
			);
		} else {
			document.documentElement.style.removeProperty("--scrollbar-width");
		}
	}

	function focusOnOpen() {
		const el = dialogEl;
		if (!el) return;

		if (!initialFocus) {
			el.focus();
			return;
		}

		if (typeof initialFocus === "string") {
			const target = el.querySelector<HTMLElement>(initialFocus);
			(target ?? el).focus();
			return;
		}

		if (document.body.contains(initialFocus)) initialFocus.focus();
		else el.focus();
	}

	function closeNow() {
		const el = dialogEl;
		if (!el || !el.open) return;

		el.close();
		isClosing = false;
		unlockScroll();

		tick().then(() => {
			const primary = returnFocusTo ?? previousActiveElement;
			if (focusElement(primary)) return;

			const fallback = resolveFocusFallback();
			focusElement(fallback);
		});
	}

	function resolveFocusFallback() {
		return (
			document.querySelector<HTMLElement>("[data-dialog-focus-fallback]") ??
			document.getElementById("main-content")
		);
	}

	function focusElement(target: HTMLElement | null | undefined) {
		if (!target || !document.body.contains(target)) return false;

		const hasTabIndex = target.hasAttribute("tabindex");
		const prevTabIndex = target.getAttribute("tabindex");
		if (target.tabIndex < 0) {
			target.setAttribute("tabindex", "-1");
		}
		target.focus({ preventScroll: true });

		if (!hasTabIndex && target.tabIndex < 0) {
			window.setTimeout(() => {
				if (document.body.contains(target)) {
					if (prevTabIndex === null) target.removeAttribute("tabindex");
					else target.setAttribute("tabindex", prevTabIndex);
				}
			}, 0);
		}

		return true;
	}

	function maxAnimationMs(el: HTMLElement) {
		const style = getComputedStyle(el);
		const durations = style.animationDuration.split(",").map((s) => s.trim());
		const delays = style.animationDelay.split(",").map((s) => s.trim());

		const toMs = (v: string) => {
			if (v.endsWith("ms")) return Number.parseFloat(v);
			if (v.endsWith("s")) return Number.parseFloat(v) * 1000;
			return Number.parseFloat(v) || 0;
		};

		let max = 0;
		for (let i = 0; i < Math.max(durations.length, delays.length); i++) {
			const d = toMs(durations[i] ?? durations[0] ?? "0s");
			const dl = toMs(delays[i] ?? delays[0] ?? "0s");
			max = Math.max(max, d + dl);
		}
		return max;
	}

	$effect(() => {
		const el = dialogEl;
		if (!el) return;

		if (open) {
			if (!el.open) {
				previousActiveElement = (document.activeElement as HTMLElement) ?? null;
				el.showModal();
				isClosing = false;
				lockScroll();
				tick().then(() => focusOnOpen());
			}
		} else {
			if (el.open && !isClosing) {
				isClosing = true;

				// 애니메이션이 없거나 reduced-motion이면 즉시 close
				const ms = prefersReducedMotion() ? 0 : maxAnimationMs(el);
				if (ms <= 0) {
					tick().then(closeNow);
				} else {
					// animationend 누락 대비 폴백
					window.setTimeout(() => {
						if (isClosing) closeNow();
					}, ms + 50);
				}
			} else if (!el.open) {
				unlockScroll();
			}
		}
	});

	// Cleanup
	$effect(() => {
		return () => {
			unlockScroll();
		};
	});

	function onAnimationEnd(e: AnimationEvent) {
		if (isClosing && e.target === dialogEl) {
			closeNow();
		}
	}

	function onCancel(e: Event) {
		e.preventDefault();
		if (closeOnEscape) setOpen(false);
	}

	/** 외부 close/form method="dialog" 등으로 닫혀도 상태 동기화 */
	function onClose() {
		if (open) setOpen(false);
	}

	function onMouseDown(e: MouseEvent) {
		mouseDownTarget = e.target;
	}

	function onMouseUp(e: MouseEvent) {
		if (!closeOnOutsideClick || !dialogEl) return;
		if (mouseDownTarget !== dialogEl || e.target !== dialogEl) {
			mouseDownTarget = null;
			return;
		}

		const rect = dialogEl.getBoundingClientRect();
		const inDialog =
			e.clientX >= rect.left &&
			e.clientX <= rect.right &&
			e.clientY >= rect.top &&
			e.clientY <= rect.bottom;

		if (!inDialog) setOpen(false);
		mouseDownTarget = null;
	}
</script>

<dialog
	bind:this={dialogEl}
	{id}
	class={["ds-dialog ds-focus-ring", isClosing ? "is-closing" : "", className]
		.filter(Boolean)
		.join(" ")}
	aria-labelledby={titleId}
	aria-describedby={description ? descId : undefined}
	aria-busy={busy || undefined}
	aria-modal="true"
	data-ds-size={size}
	oncancel={onCancel}
	onclose={onClose}
	onmousedown={onMouseDown}
	onmouseup={onMouseUp}
	onanimationend={onAnimationEnd}
	{...rest}
>
	<div
		class={`ds-dialog-surface ${scrollable ? "flex flex-col max-h-[85vh]" : ""}`}
	>
		<header class="ds-dialog-header shrink-0">
			<div class="min-w-0">
				<h2 class="text-h3 font-semibold" id={titleId}>{title}</h2>
				{#if description}
					<p class="text-body-secondary text-muted-foreground" id={descId}>
						{description}
					</p>
				{/if}
			</div>
			<DsIconButton
				icon="x"
				label={closeLabel}
				intent="secondary"
				variant="ghost"
				size="sm"
				onclick={requestClose}
			/>
		</header>

		{#if status}
			{@render status()}
		{:else if busy}
			<span class="sr-only" role="status" aria-live="polite">
				{busyLabel}
			</span>
		{/if}

		<div
			class={`ds-dialog-body ${scrollable ? "flex-1 overflow-y-auto min-h-0" : ""}`}
		>
			{#if children}
				{@render children()}
			{/if}
		</div>

		{#if footer}
			<footer class="ds-dialog-footer shrink-0">
				{@render footer()}
			</footer>
		{/if}
	</div>
</dialog>
