<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { DsButton } from "$lib/components/design-system";
	import { createControllableState } from "$lib/shared/utils/controllable-state.svelte";
	import { useId } from "$lib/shared/utils/use-id";

	type Item = {
		id: string;
		label: string;
		disabled?: boolean;
	};

	/**
	 * trigger 슬롯에 전달되는 Props
	 * 커스텀 트리거 요소에 필수 속성들을 spread해야 합니다.
	 */
	export type TriggerProps = {
		id: string;
		"aria-controls": string;
		"aria-haspopup": "menu";
		"aria-expanded": boolean;
		disabled: boolean;
		onclick: () => void;
		onkeydown: (e: KeyboardEvent) => void;
	};

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		/** 기본 트리거 버튼 라벨 (trigger 슬롯 미사용 시 필수) */
		label?: string;
		/** 메뉴 아이템 배열 */
		items?: Item[];
		/** 아이템 선택 콜백 */
		onSelect?: (id: string) => void;
		/** 메뉴 열림 상태 (controlled) */
		open?: boolean;
		/** 상태 변경 콜백 */
		onOpenChange?: (next: boolean) => void;
		/** 메뉴 정렬 방향 */
		align?: "start" | "end";
		/** 트리거 비활성화 */
		disabled?: boolean;
		/** 커스텀 트리거 슬롯 */
		trigger?: Snippet<[TriggerProps]>;
		/** 커스텀 메뉴 콘텐츠 */
		children?: Snippet;
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
		trigger,
		children,
		...rest
	}: Props = $props();

	let rootEl = $state<HTMLDivElement | null>(null);
	let buttonEl = $state<HTMLButtonElement | null>(null);

	// SSR-safe ID 생성 (컴포넌트 초기화 시 한 번만)
	const triggerId = useId("ds-dropdown");
	const menuId = `${triggerId}-menu`;

	// Controlled/Uncontrolled 상태 통합 관리
	let openState = createControllableState({
		value: () => open,
		onChange: onOpenChange,
		defaultValue: false,
	});

	// isOpen getter로 간소화
	let isOpen = $derived(openState.value);

	function setOpen(next: boolean): void {
		openState.value = next;
	}

	function toggle(): void {
		if (disabled) return;
		setOpen(!isOpen);
	}

	function close(options?: { focusButton?: boolean }): void {
		setOpen(false);
		if (options?.focusButton) queueMicrotask(() => buttonEl?.focus());
	}

	function focusFirstItem(): void {
		const root = rootEl;
		if (!root) return;
		const itemsEls = Array.from(
			root.querySelectorAll<HTMLElement>('[data-ds-dropdown-item="true"]'),
		);
		const first = itemsEls.find((el) => !el.hasAttribute("data-disabled"));
		first?.focus();
	}

	function focusLastItem(): void {
		const root = rootEl;
		if (!root) return;
		const itemsEls = Array.from(
			root.querySelectorAll<HTMLElement>('[data-ds-dropdown-item="true"]'),
		);
		const enabled = itemsEls.filter((el) => !el.hasAttribute("data-disabled"));
		enabled.at(-1)?.focus();
	}

	function focusNext(current: HTMLElement, dir: 1 | -1): void {
		const root = rootEl;
		if (!root) return;
		const itemsEls = Array.from(
			root.querySelectorAll<HTMLElement>('[data-ds-dropdown-item="true"]'),
		);
		const enabled = itemsEls.filter((el) => !el.hasAttribute("data-disabled"));
		const idx = enabled.indexOf(current);
		if (idx === -1) return;
		const next = enabled[(idx + dir + enabled.length) % enabled.length];
		next?.focus();
	}

	function onTriggerKeyDown(e: KeyboardEvent): void {
		if (disabled) return;

		if (e.key === "Escape") {
			e.preventDefault();
			close();
			return;
		}

		if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			if (!isOpen) setOpen(true);
			queueMicrotask(focusFirstItem);
		}

		if (e.key === "ArrowUp") {
			e.preventDefault();
			if (!isOpen) setOpen(true);
			queueMicrotask(focusLastItem);
		}
	}

	function onMenuKeyDown(e: KeyboardEvent): void {
		const target = e.target as HTMLElement | null;
		if (!target) return;

		if (e.key === "Escape") {
			e.preventDefault();
			close({ focusButton: true });
			return;
		}

		if (e.key === "ArrowDown") {
			e.preventDefault();
			focusNext(target, 1);
			return;
		}

		if (e.key === "ArrowUp") {
			e.preventDefault();
			focusNext(target, -1);
			return;
		}

		if (e.key === "Home") {
			e.preventDefault();
			focusFirstItem();
			return;
		}

		if (e.key === "End") {
			e.preventDefault();
			focusLastItem();
			return;
		}
	}

	function onRootFocusOut(e: FocusEvent): void {
		const root = rootEl;
		if (!root) return;
		if (!isOpen) return;

		const next = e.relatedTarget;
		if (!(next instanceof Node)) {
			close();
			return;
		}

		if (root.contains(next)) return;
		close();
	}

	function onDocumentPointerDown(e: PointerEvent): void {
		const root = rootEl;
		if (!root) return;
		if (!isOpen) return;
		if (root.contains(e.target as Node)) return;
		close();
	}

	$effect(() => {
		document.addEventListener("pointerdown", onDocumentPointerDown, {
			capture: true,
		});
		return () =>
			document.removeEventListener("pointerdown", onDocumentPointerDown, true);
	});
</script>

<div
	{...rest}
	bind:this={rootEl}
	class={`ds-dropdown ${className}`.trim()}
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
		})}
	{:else}
		<DsButton
			bind:ref={buttonEl}
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
			id={menuId}
			class="ds-dropdown-menu ds-elevation-2"
			role="menu"
			aria-labelledby={triggerId}
			tabindex="-1"
		>
			{#if children}
				{@render children()}
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
							close();
						}}
						onkeydown={onMenuKeyDown}
					>
						{item.label}
					</button>
				{/each}
			{/if}
		</div>
	{/if}
</div>
