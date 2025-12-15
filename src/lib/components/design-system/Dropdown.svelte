<script lang="ts">
	import type { Snippet } from "svelte";
	import { tick } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { DsButton } from "$lib/components/design-system";
	import { createControllableState } from "$lib/shared/utils/controllable-state.svelte";
	import { useId } from "$lib/shared/utils/use-id";

	type Item = {
		id: string;
		label: string;
		disabled?: boolean;
	};

	export type TriggerProps = {
		id: string;
		"aria-controls": string;
		"aria-haspopup": "menu";
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
		disabled?: boolean;
		trigger?: Snippet<[TriggerProps]>;
		children?: Snippet<[{ close: () => void }]>;
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
		disabled = false,
		class: className = "",
		menuClass = "",
		itemSelector = '[data-ds-dropdown-item="true"]',
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

	// Typeahead State
	let typeaheadBuffer = "";
	let typeaheadTimer: number | null = null;

	function setOpen(next: boolean): void {
		openState.value = next;
	}

	function toggle(): void {
		if (disabled) return;
		setOpen(!isOpen);
	}

	function close(options?: { focusButton?: boolean }): void {
		setOpen(false);
		if (options?.focusButton) {
			tick().then(() => triggerEl?.focus());
		}
	}

	// --- Focus Management ---

	function getItems(): HTMLElement[] {
		if (!rootEl) return [];
		return Array.from(
			rootEl.querySelectorAll<HTMLElement>(
				'[role="menuitem"]:not([disabled]):not([aria-disabled="true"])',
			),
		);
	}

	function focusFirstItem(): void {
		getItems()[0]?.focus();
	}

	function focusLastItem(): void {
		getItems().at(-1)?.focus();
	}

	function focusNext(current: HTMLElement, dir: 1 | -1): void {
		const items = getItems();
		const idx = items.indexOf(current);
		if (idx === -1) return;
		const next = items[(idx + dir + items.length) % items.length];
		next?.focus();
	}

	// --- Typeahead ---
	function handleTypeahead(key: string) {
		if (key.length !== 1) return;

		if (typeaheadTimer) window.clearTimeout(typeaheadTimer);
		typeaheadBuffer += key.toLowerCase();

		typeaheadTimer = window.setTimeout(() => {
			typeaheadBuffer = "";
		}, 500);

		const items = getItems();
		const match = items.find((item) => {
			const text = item.textContent?.trim().toLowerCase() || "";
			return text.startsWith(typeaheadBuffer);
		});

		if (match) match.focus();
	}

	// --- Event Handlers ---

	function onTriggerKeyDown(e: KeyboardEvent): void {
		if (disabled) return;

		if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			if (!isOpen) {
				setOpen(true);
				tick().then(focusFirstItem);
			}
		}

		if (e.key === "ArrowUp") {
			e.preventDefault();
			if (!isOpen) {
				setOpen(true);
				tick().then(focusLastItem);
			}
		}
	}

	function onMenuKeyDown(e: KeyboardEvent): void {
		const target = e.target as HTMLElement | null;
		if (!target) return;

		if (e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			close({ focusButton: true });
			return;
		}

		if (e.key === "Tab") {
			close();
			return;
		}

		// Typeahead
		if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
			handleTypeahead(e.key);
			return;
		}

		if (!target.closest(itemSelector)) return;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			focusNext(target, 1);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			focusNext(target, -1);
		} else if (e.key === "Home") {
			e.preventDefault();
			focusFirstItem();
		} else if (e.key === "End") {
			e.preventDefault();
			focusLastItem();
		} else if (e.key === "Enter" || e.key === " ") {
			if (target.tagName !== "BUTTON") {
				e.preventDefault();
				target.click();
			}
		}
	}

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
		if (isOpen && menuEl && triggerEl) {
			const rect = triggerEl.getBoundingClientRect();
			const menuRect = menuEl.getBoundingClientRect();
			const spaceBelow = window.innerHeight - rect.bottom;

			if (spaceBelow < menuRect.height && rect.top > menuRect.height) {
				placementStyles =
					"top: auto; bottom: 100%; margin-bottom: var(--spacing-2); margin-top: 0;";
			} else {
				placementStyles = "";
			}
		}
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
			"aria-haspopup": "menu",
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
			aria-haspopup="menu"
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
			role="menu"
			aria-labelledby={triggerId}
			tabindex="-1"
			onkeydown={onMenuKeyDown}
		>
			{#if children}
				{@render children({ close: () => close({ focusButton: true }) })}
			{:else}
				{#each items as item (item.id)}
					<button
						type="button"
						class="ds-dropdown-item ds-focus-ring"
						role="menuitem"
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
		</div>
	{/if}
</div>
