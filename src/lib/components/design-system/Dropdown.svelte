<script lang="ts">
	import type { Snippet } from "svelte";
	import { tick } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { DsButton } from "$lib/components/design-system";
	import { createControllableState } from "$lib/shared/utils/controllable-state.svelte";
	import { useId } from "$lib/shared/utils/use-id";
	import {
		computeDropdownPlacementStyles,
		createDropdownFocusManager,
		createDropdownKeyHandlers,
		createDropdownTypeahead,
		getDropdownItems,
	} from "./dropdown-helpers";

	type Item = {
		id: string;
		label: string;
		disabled?: boolean;
	};

	type PopupRole = "menu" | "listbox";

	export type TriggerProps = {
		id: string;
		"aria-controls": string;
		"aria-haspopup": PopupRole;
		"aria-expanded": boolean;
		disabled: boolean;
		onclick: () => void;
		onkeydown: (e: KeyboardEvent) => void;
		ref: (node: HTMLElement) => void;
	};

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		label?: string;
		items?: Item[];
		onSelect?: (id: string) => void;
		open?: boolean;
		onOpenChange?: (next: boolean) => void;
		align?: "start" | "end";
		side?: "auto" | "top" | "bottom";
		focusOnOpen?: "always" | "keyboard" | "none";
		haspopup?: PopupRole;
		disabled?: boolean;
		trigger?: Snippet<[TriggerProps]>;
		children?: Snippet<[{ close: () => void }]>;
		header?: Snippet;
		footer?: Snippet;
		menuClass?: string;
		itemSelector?: string;
	}

	let {
		label,
		items = [],
		onSelect,
		open,
		onOpenChange,
		align = "start",
		side = "auto",
		focusOnOpen = "always",
		haspopup = "menu",
		disabled = false,
		class: className = "",
		header,
		footer,
		menuClass = "",
		itemSelector,
		trigger,
		children,
		...rest
	}: Props = $props();

	let rootEl = $state<HTMLDivElement | null>(null);
	let triggerEl = $state<HTMLButtonElement | null>(null);
	let menuEl = $state<HTMLDivElement | null>(null);

	// SSR-safe ID
	const triggerId = useId("ds-dropdown");
	const menuId = `${triggerId}-menu`;

	// State
	let openState = createControllableState({
		value: () => open,
		onChange: (next) => onOpenChange?.(next),
		defaultValue: false,
	});

	let isOpen = $derived(openState.value);

	let menuRole = $derived(haspopup === "listbox" ? "listbox" : "menu");
	let itemRole = $derived(haspopup === "listbox" ? "option" : "menuitem");
	let effectiveItemSelector = $derived(
		itemSelector ||
			(haspopup === "listbox"
				? '[role="option"]'
				: '[data-ds-dropdown-item="true"]'),
	);

	function setOpen(next: boolean): void {
		openState.value = next;
	}

	function toggle(): void {
		if (disabled) return;
		const next = !isOpen;
		setOpen(next);
		if (next && focusOnOpen === "always") {
			tick().then(focus.focusSelectedOrFirstItem);
		}
	}

	function close(options?: { focusButton?: boolean }): void {
		setOpen(false);
		if (options?.focusButton) {
			tick().then(() => triggerEl?.focus());
		}
	}

	const getItems = () => getDropdownItems(rootEl, effectiveItemSelector);

	const focus = createDropdownFocusManager(getItems);
	const typeahead = createDropdownTypeahead(getItems);

	const { onTriggerKeyDown, onMenuKeyDown } = createDropdownKeyHandlers({
		getDisabled: () => disabled,
		getIsOpen: () => isOpen,
		setOpen,
		close,
		afterOpen: (fn) => tick().then(fn),
		getItemSelector: () => effectiveItemSelector,
		focusSelectedOrFirstItem: focus.focusSelectedOrFirstItem,
		focusFirstItem: focus.focusFirstItem,
		focusLastItem: focus.focusLastItem,
		focusNext: focus.focusNext,
		focusOnOpen: () => focusOnOpen,
		typeahead,
	});

	function onDocumentPointerDown(e: PointerEvent): void {
		if (!isOpen || !rootEl) return;
		if (rootEl.contains(e.target as Node)) return;
		close();
	}

	function onRootFocusOut(e: FocusEvent): void {
		if (!isOpen || !rootEl) return;
		const next = e.relatedTarget as Node | null;
		if (next && rootEl.contains(next)) return;
		close();
	}

	// --- Layout Logic ---
	let placementStyles = $state("");

	$effect(() => {
		if (!isOpen || !menuEl || !triggerEl) return;
		if (typeof window === "undefined") return;

		placementStyles = "";
		const frame = window.requestAnimationFrame(() => {
			placementStyles = computeDropdownPlacementStyles({ triggerEl, menuEl, side });
		});

		return () => window.cancelAnimationFrame(frame);
	});

	$effect(() => {
		if (isOpen) return;
		placementStyles = "";
	});

	function triggerRef(node: HTMLElement) {
		triggerEl = node as HTMLButtonElement;
	}

	$effect(() => {
		if (isOpen) {
			document.addEventListener("pointerdown", onDocumentPointerDown, true);
			return () =>
				document.removeEventListener(
					"pointerdown",
					onDocumentPointerDown,
					true,
				);
		}
	});

	// 닫힐 때 타입어헤드 버퍼 정리
	$effect(() => {
		if (!isOpen) typeahead.reset();
	});
</script>

<div
	{...rest}
	bind:this={rootEl}
	class={["ds-dropdown", className].filter(Boolean).join(" ")}
	data-ds-align={align}
	onfocusout={onRootFocusOut}
>
	{#if trigger}
		{@render trigger({
			id: triggerId,
			"aria-controls": menuId,
			"aria-haspopup": haspopup,
			"aria-expanded": isOpen,
			disabled,
			onclick: toggle,
			onkeydown: onTriggerKeyDown,
			ref: triggerRef,
		})}
	{:else}
		<DsButton
			bind:ref={triggerEl}
			type="button"
			intent="secondary"
			variant="outline"
			id={triggerId}
			aria-controls={menuId}
			aria-haspopup={haspopup}
			aria-expanded={isOpen}
			{disabled}
			onclick={toggle}
			onkeydown={onTriggerKeyDown}
		>
			{label}
		</DsButton>
	{/if}

	{#if isOpen}
		<div
			bind:this={menuEl}
			id={menuId}
			class={["ds-dropdown-menu ds-elevation-2", menuClass]
				.filter(Boolean)
				.join(" ")}
			style={placementStyles}
			data-lenis-prevent
			role={menuRole}
			aria-labelledby={triggerId}
			tabindex="-1"
			onkeydown={onMenuKeyDown}
		>
			{#if header}
				<div class="ds-dropdown-header">
					{@render header()}
				</div>
			{/if}

			{#if children}
				{@render children({ close: () => close({ focusButton: true }) })}
			{:else}
				{#each items as item (item.id)}
					<button
						type="button"
						class="ds-dropdown-item ds-focus-ring"
						role={itemRole}
						data-ds-dropdown-item="true"
						data-disabled={item.disabled ? "true" : undefined}
						disabled={item.disabled}
						onclick={() => {
							if (item.disabled) return;
							onSelect?.(item.id);
							close({ focusButton: true });
						}}
					>
						{item.label}
					</button>
				{/each}
			{/if}

			{#if footer}
				<div class="ds-dropdown-footer">
					{@render footer()}
				</div>
			{/if}
		</div>
	{/if}
</div>
