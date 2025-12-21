<script lang="ts">
	import type { Snippet } from "svelte";
	import { flip } from "svelte/animate";
	import { cubicOut } from "svelte/easing";
	import type { HTMLAttributes } from "svelte/elements";
	import { fly } from "svelte/transition";

	import { DsToast } from "$lib/components/design-system";
	import * as m from "$lib/paraglide/messages.js";
	import type { ToastItem } from "$lib/stores/toast.svelte";

	export type ToastPosition =
		| "top-left"
		| "top-right"
		| "bottom-left"
		| "bottom-right"
		| "top-center"
		| "bottom-center";

	interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		toasts: ToastItem[];
		onDismiss: (id: string) => void;
		onPause?: () => void;
		onResume?: () => void;
		position?: ToastPosition;
		class?: string;
		action?: Snippet<[ToastItem]>;
		/** i18n */
		regionLabel?: string;
		dismissLabel?: string;
		/** error/warning을 assertive로 읽을 intent 목록 */
		assertiveIntents?: Array<"error" | "warning">;
	}

	let {
		toasts,
		onDismiss,
		onPause,
		onResume,
		position = "bottom-right",
		class: className = "",
		action,
		regionLabel = m.ds_toast_region(),
		dismissLabel = m.ds_toast_dismiss(),
		assertiveIntents = ["error"],
		...rest
	}: Props = $props();

	let flyY = $derived(position.startsWith("top") ? -20 : 20);
	let isTop = $derived(position.startsWith("top"));

	function toastRole(t: ToastItem) {
		const intent = (t.intent ?? "neutral") as
			| "neutral"
			| "success"
			| "warning"
			| "error";
		if (intent === "error" || intent === "warning") {
			return assertiveIntents.includes(intent) ? "alert" : "status";
		}
		return "status";
	}

	function onRegionFocusOut(e: FocusEvent) {
		const next = e.relatedTarget as Node | null;
		const current = e.currentTarget as HTMLElement;
		// 리전 내부 포커스 이동이면 resume 금지
		if (next && current.contains(next)) return;
		onResume?.();
	}

	let reduceMotion = $state(false);

	$effect(() => {
		if (typeof window === "undefined" || !window.matchMedia) return;
		const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
		const update = () => {
			reduceMotion = mql.matches;
		};
		update();
		if (mql.addEventListener) {
			mql.addEventListener("change", update);
		} else {
			mql.addListener(update);
		}
		return () => {
			if (mql.removeEventListener) {
				mql.removeEventListener("change", update);
			} else {
				mql.removeListener(update);
			}
		};
	});

	let flyParams = $derived(
		reduceMotion
			? { duration: 0 }
			: { y: flyY, duration: 300, easing: cubicOut },
	);
	let flipParams = $derived(
		reduceMotion ? { duration: 0 } : { duration: 300, easing: cubicOut },
	);
</script>

<section
	{...rest}
	class={`ds-toast-region ${className}`.trim()}
	aria-label={regionLabel}
	data-ds-position={position}
	onmouseenter={onPause}
	onmouseleave={onResume}
	onfocusin={onPause}
	onfocusout={onRegionFocusOut}
>
	<ol class={`flex w-full ${isTop ? "flex-col" : "flex-col-reverse"}`}>
		{#each toasts as t (t.id)}
			<li
				class="ds-toast-wrapper pointer-events-auto py-1"
				animate:flip={flipParams}
				transition:fly={flyParams}
			>
				<DsToast
					title={t.title}
					message={t.message}
					intent={(t.intent ?? "neutral") as "neutral" | "success" | "warning" | "error"}
					role={toastRole(t)}
					dismissLabel={dismissLabel}
					onDismiss={() => onDismiss(t.id)}
					actions={action ? () => action(t) : undefined}
				/>
			</li>
		{/each}
	</ol>
</section>
