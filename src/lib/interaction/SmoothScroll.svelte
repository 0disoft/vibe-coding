<script lang="ts">
	import { pushState } from "$app/navigation";
	import { page } from "$app/state";
	import Lenis from "lenis";
	import "lenis/dist/lenis.css";
	import { onMount } from "svelte";

	type EasingFunction = (t: number) => number;

	const defaultEasing: EasingFunction = (t) =>
		Math.min(1, 1.001 - Math.pow(2, -10 * t));

	interface Props {
		/** Scroll duration (seconds). Default: 0.6 */
		duration?: number;
		/** Lerp factor (0~1). When set, duration is ignored. */
		lerp?: number;
		/** Easing function for smooth scroll. */
		easing?: EasingFunction;
		/** Sync focus to anchor targets after scroll. */
		focusOnAnchor?: boolean;
		/** Enable keyboard-based smooth scroll overrides. */
		keyboardOverrides?: boolean;
		/** PageUp/PageDown step ratio. */
		keyboardStepRatio?: number;
	}

	let {
		duration = 0.6,
		lerp,
		easing = defaultEasing,
		focusOnAnchor = true,
		keyboardOverrides = true,
		keyboardStepRatio = 0.9,
	}: Props = $props();

	onMount(() => {
		if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches)
			return;

		const lenisOptions: {
			duration?: number;
			lerp?: number;
			easing: EasingFunction;
			prevent: (node: HTMLElement) => boolean;
		} = {
			easing,
			// preventing slight scroll blocking on some elements
			prevent: (node) => node.nodeName === "VERCEL-LIVE-FEEDBACK",
		};

		if (lerp === undefined) lenisOptions.duration = duration;
		else lenisOptions.lerp = lerp;

		const lenis = new Lenis(lenisOptions);

		let rafId = 0;
		let ignoreNextHash = false;
		let pendingHash: string | null = null;

		function raf(time: number) {
			lenis.raf(time);
			rafId = requestAnimationFrame(raf);
		}

		rafId = requestAnimationFrame(raf);

		function getScrollToOptions() {
			const options: {
				duration?: number;
				lerp?: number;
				easing: EasingFunction;
			} = { easing };
			if (lerp === undefined) options.duration = duration;
			else options.lerp = lerp;
			return options;
		}

		/** scroll-margin-top을 고려한 목표 스크롤 위치 계산 */
		function getTargetScrollPosition(el: HTMLElement): number {
			const scrollMarginTop = parseFloat(
				window.getComputedStyle(el).scrollMarginTop || "0",
			);
			const rect = el.getBoundingClientRect();
			const currentScroll =
				window.scrollY || document.documentElement.scrollTop;
			return currentScroll + rect.top - scrollMarginTop;
		}

		function isKeyboardOverrideBlocked(target: HTMLElement | null) {
			if (!keyboardOverrides) return true;
			if (!target) return false;
			if (target.isContentEditable) return true;
			const tag = target.tagName;
			if (
				tag === "INPUT" ||
				tag === "TEXTAREA" ||
				tag === "SELECT" ||
				tag === "BUTTON"
			)
				return true;
			if (
				target.closest(
					'[data-lenis-prevent], [data-lenis-prevent-keyboard], [role="dialog"], [role="menu"], [role="listbox"], [role="combobox"]',
				)
			)
				return true;

			let node: HTMLElement | null = target;
			while (node && node !== document.body) {
				const style = window.getComputedStyle(node);
				const overflowY = style.overflowY;
				if (
					(overflowY === "auto" ||
						overflowY === "scroll" ||
						overflowY === "overlay") &&
					node.scrollHeight > node.clientHeight
				)
					return true;
				node = node.parentElement;
			}

			return false;
		}

		function onKeyDown(event: KeyboardEvent) {
			if (event.defaultPrevented) return;
			if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
				return;

			const target = event.target as HTMLElement | null;
			if (isKeyboardOverrideBlocked(target)) return;

			const pageStep = window.innerHeight * keyboardStepRatio;
			const current = lenis.scroll;

			if (event.key === "Home") {
				event.preventDefault();
				lenis.scrollTo("top", getScrollToOptions());
				return;
			}
			if (event.key === "End") {
				event.preventDefault();
				lenis.scrollTo("bottom", getScrollToOptions());
				return;
			}
			if (event.key === "PageUp") {
				event.preventDefault();
				lenis.scrollTo(current - pageStep, getScrollToOptions());
				return;
			}
			if (event.key === "PageDown") {
				event.preventDefault();
				lenis.scrollTo(current + pageStep, getScrollToOptions());
			}
		}

		window.addEventListener("keydown", onKeyDown);

		function focusTarget(element: HTMLElement) {
			if (!focusOnAnchor) return;
			const hadTabIndex = element.hasAttribute("tabindex");
			const previousTabIndex = element.getAttribute("tabindex");
			const isNaturallyFocusable =
				element.matches(
					'a[href], button, input, textarea, select, [tabindex], [contenteditable="true"]',
				) || element.isContentEditable;

			if (!isNaturallyFocusable) element.setAttribute("tabindex", "-1");
			element.focus({ preventScroll: true });

			if (!isNaturallyFocusable) {
				if (hadTabIndex && previousTabIndex !== null) {
					element.setAttribute("tabindex", previousTabIndex);
				} else if (!hadTabIndex) {
					element.removeAttribute("tabindex");
				}
			}
		}

		function scheduleFocusAfterScroll(element: HTMLElement) {
			if (!focusOnAnchor) return;
			const delayMs = Math.max(0, Math.round(duration * 1000));
			if (delayMs === 0) {
				focusTarget(element);
				return;
			}
			window.setTimeout(() => focusTarget(element), delayMs);
		}

		function scrollToHash(hash: string) {
			if (!hash) return;
			const id = decodeURIComponent(hash.slice(1));
			const el = document.getElementById(id);
			if (!el) return;

			const targetY = getTargetScrollPosition(el);
			console.log("[SmoothScroll] scrollToHash", {
				hash,
				targetY,
				currentY: window.scrollY,
			});
			lenis.scrollTo(targetY, getScrollToOptions());
			scheduleFocusAfterScroll(el);
		}

		function onHashChange() {
			if (ignoreNextHash) {
				ignoreNextHash = false;
				return;
			}
			const hash = window.location.hash;
			if (!hash) return;
			if (pendingHash === hash) return;
			pendingHash = hash;
			queueMicrotask(() => {
				pendingHash = null;
			});
			scrollToHash(hash);
		}

		function onPopState() {
			if (!window.location.hash) return;
			onHashChange();
		}

		function onAnchorClick(event: MouseEvent) {
			if (event.defaultPrevented) return;
			if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
				return;
			if (event.button !== 0) return;

			const target = event.target as HTMLElement | null;
			const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
			if (!anchor) return;
			if (anchor.target && anchor.target !== "_self") return;
			if (anchor.hasAttribute("download")) return;

			const href = anchor.getAttribute("href") ?? "";
			if (!href.includes("#")) return;

			const url = new URL(href, window.location.href);
			if (url.origin !== window.location.origin) return;
			if (url.pathname !== window.location.pathname) return;
			if (!url.hash) return;

			const id = decodeURIComponent(url.hash.slice(1));
			const el = document.getElementById(id);
			if (!el) return;

			event.preventDefault();
			if (window.location.hash !== url.hash) {
				ignoreNextHash = true;
				pushState(url.toString(), page.state);
				window.dispatchEvent(new HashChangeEvent("hashchange"));
			}
			const targetY = getTargetScrollPosition(el);
			lenis.scrollTo(targetY, getScrollToOptions());
			scheduleFocusAfterScroll(el);
		}

		document.addEventListener("click", onAnchorClick);
		window.addEventListener("hashchange", onHashChange);
		window.addEventListener("popstate", onPopState);

		return () => {
			window.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("click", onAnchorClick);
			window.removeEventListener("hashchange", onHashChange);
			window.removeEventListener("popstate", onPopState);
			if (rafId) cancelAnimationFrame(rafId);
			lenis.destroy();
		};
	});
</script>

<!-- Lenis recommends global CSS for optimal performance -->
<svelte:head>
	<style>
		html.lenis,
		html.lenis body {
			height: auto;
		}

		.lenis.lenis-smooth {
			scroll-behavior: auto !important;
		}

		.lenis.lenis-smooth [data-lenis-prevent] {
			overscroll-behavior: contain;
		}

		.lenis.lenis-stopped {
			overflow: hidden;
		}

		.lenis.lenis-scrolling iframe {
			pointer-events: none;
		}
	</style>
</svelte:head>
