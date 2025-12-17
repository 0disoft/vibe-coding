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

	// Typeahead State
	let typeaheadBuffer = "";
	let typeaheadTimer: number | null = null;

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
		if (next) tick().then(focusSelectedOrFirstItem);
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
		// itemSelector를 사용하여 커스텀 아이템(menuitemradio 등)도 지원
		return Array.from(
			rootEl.querySelectorAll<HTMLElement>(effectiveItemSelector),
		).filter(
			(el) =>
				!el.hasAttribute("disabled") &&
				el.getAttribute("aria-disabled") !== "true",
		);
	}

	function focusSelectedOrFirstItem(): void {
		const items = getItems();
		// 선택된 아이템(aria-checked 또는 aria-selected) 먼저 찾기
		const selected = items.find(
			(el) =>
				el.getAttribute("aria-checked") === "true" ||
				el.getAttribute("aria-selected") === "true",
		);
		(selected || items[0])?.focus();
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

		if (e.key === "Escape" && isOpen) {
			e.preventDefault();
			close({ focusButton: true });
			return;
		}

		if (e.key === "ArrowDown") {
			e.preventDefault();
			if (!isOpen) setOpen(true);
			tick().then(focusSelectedOrFirstItem);
			return;
		}

		if (e.key === "ArrowUp") {
			e.preventDefault();
			if (!isOpen) setOpen(true);
			tick().then(focusLastItem);
			return;
		}

		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			if (isOpen) {
				close({ focusButton: true });
			} else {
				setOpen(true);
				tick().then(focusSelectedOrFirstItem);
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
			// 기본 Tab 이동 후 닫기 (자연스러운 포커스 이동)
			queueMicrotask(() => close());
			return;
		}

		// Typeahead
		if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
			handleTypeahead(e.key);
			return;
		}

		const item = target.closest<HTMLElement>(effectiveItemSelector);
		if (!item) return;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			focusNext(item, 1);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			focusNext(item, -1);
		} else if (e.key === "Home") {
			e.preventDefault();
			focusFirstItem();
		} else if (e.key === "End") {
			e.preventDefault();
			focusLastItem();
		} else if (e.key === "Enter" || e.key === " ") {
			if (item.tagName !== "BUTTON") {
				e.preventDefault();
				item.click();
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

	// 닫힐 때 타입어헤드 버퍼 정리
	$effect(() => {
		if (!isOpen) {
			typeaheadBuffer = "";
			if (typeaheadTimer) {
				window.clearTimeout(typeaheadTimer);
				typeaheadTimer = null;
			}
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
