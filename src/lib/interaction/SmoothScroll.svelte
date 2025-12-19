<script lang="ts">
	import { pushState } from "$app/navigation";
	import { page } from "$app/state";
	import Lenis from "lenis";
	import "lenis/dist/lenis.css";
	import { onMount } from "svelte";

	interface Props {
		/** Scroll duration (seconds). Default: 0.6 */
		duration?: number;
	}

	let { duration = 0.6 }: Props = $props();

	onMount(() => {
		if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches)
			return;

		const lenis = new Lenis({
			duration: duration,
			easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Default easing
			// preventing slight scroll blocking on some elements
			prevent: (node) => node.nodeName === "VERCEL-LIVE-FEEDBACK",
		});

		let rafId = 0;

		function raf(time: number) {
			lenis.raf(time);
			rafId = requestAnimationFrame(raf);
		}

		rafId = requestAnimationFrame(raf);

		function onKeyDown(event: KeyboardEvent) {
			if (event.defaultPrevented) return;
			if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
				return;

			const target = event.target as HTMLElement | null;
			if (target) {
				const tag = target.tagName;
				if (
					target.isContentEditable ||
					tag === "INPUT" ||
					tag === "TEXTAREA" ||
					tag === "SELECT"
				)
					return;
			}

			const pageStep = window.innerHeight * 0.9;
			const current = lenis.scroll;

			if (event.key === "Home") {
				event.preventDefault();
				lenis.scrollTo("top", { duration });
				return;
			}
			if (event.key === "End") {
				event.preventDefault();
				lenis.scrollTo("bottom", { duration });
				return;
			}
			if (event.key === "PageUp") {
				event.preventDefault();
				lenis.scrollTo(current - pageStep, { duration });
				return;
			}
			if (event.key === "PageDown") {
				event.preventDefault();
				lenis.scrollTo(current + pageStep, { duration });
			}
		}

		window.addEventListener("keydown", onKeyDown);

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
				pushState(url.toString(), page.state);
				window.dispatchEvent(new HashChangeEvent("hashchange"));
			}
			lenis.scrollTo(el, { duration });
		}

		document.addEventListener("click", onAnchorClick);

		return () => {
			window.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("click", onAnchorClick);
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
