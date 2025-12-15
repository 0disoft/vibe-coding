<script lang="ts">
	import type { Snippet } from "svelte";
	import { tick } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { DsIconButton } from "$lib/components/design-system";

	interface Props extends Omit<HTMLAttributes<HTMLDialogElement>, "children"> {
		id: string;
		title: string;
		description?: string;
		open: boolean;
		onOpenChange?: (next: boolean) => void;
		size?: "sm" | "md" | "lg" | "xl" | "full";
		scrollable?: boolean;
		closeOnOutsideClick?: boolean;
		closeOnEscape?: boolean;
		returnFocusTo?: HTMLElement | null;
		children?: Snippet;
		footer?: Snippet;
	}

	let {
		id,
		title,
		description,
		open,
		onOpenChange,
		size = "md",
		scrollable = false,
		closeOnOutsideClick = true,
		closeOnEscape = true,
		returnFocusTo = null,
		class: className = "",
		children,
		footer,
		...rest
	}: Props = $props();

	let dialogEl = $state<HTMLDialogElement | null>(null);
	let isClosing = $state(false);
	let previousActiveElement: HTMLElement | null = null;

	let titleId = $derived(`${id}-title`);
	let descId = $derived(`${id}-desc`);

	function requestClose() {
		onOpenChange?.(false);
	}

	$effect(() => {
		const el = dialogEl;
		if (!el) return;

		if (open) {
			if (!el.open) {
				previousActiveElement = (document.activeElement as HTMLElement) ?? null;
				el.showModal();
				isClosing = false;
				document.body.style.overflow = "hidden";
			}
		} else {
			if (el.open && !isClosing) {
				isClosing = true;
				// onAnimationEnd에서 close() 호출
			} else if (!el.open) {
				document.body.style.overflow = "";
			}
		}
	});

	// Cleanup
	$effect(() => {
		return () => {
			document.body.style.overflow = "";
		};
	});

	function onAnimationEnd(e: AnimationEvent) {
		if (isClosing && e.target === dialogEl) {
			dialogEl?.close();
			isClosing = false;
			document.body.style.overflow = "";

			const target = returnFocusTo ?? previousActiveElement;
			if (target && document.body.contains(target)) {
				tick().then(() => target.focus());
			}
		}
	}

	function onCancel(e: Event) {
		e.preventDefault();
		if (closeOnEscape) requestClose();
	}

	function onBackdropClick(e: MouseEvent) {
		if (!closeOnOutsideClick || !dialogEl) return;

		// 내부 요소 클릭 버블링 방지
		if (e.target !== dialogEl) return;

		const rect = dialogEl.getBoundingClientRect();
		const inDialog =
			e.clientX >= rect.left &&
			e.clientX <= rect.right &&
			e.clientY >= rect.top &&
			e.clientY <= rect.bottom;

		if (!inDialog) requestClose();
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
	aria-modal="true"
	data-ds-size={size}
	oncancel={onCancel}
	onclick={onBackdropClick}
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
				label="Close dialog"
				intent="secondary"
				variant="ghost"
				onclick={requestClose}
			/>
		</header>

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
