export function getDropdownItems(rootEl: HTMLElement | null, selector: string): HTMLElement[] {
	if (!rootEl) return [];
	return Array.from(rootEl.querySelectorAll<HTMLElement>(selector)).filter((el) => {
		if (el.hasAttribute('disabled')) return false;
		if (el.getAttribute('aria-disabled') === 'true') return false;
		if (el.hasAttribute('hidden') || el.closest('[hidden]')) return false;

		if (typeof window === 'undefined') return true;
		const style = window.getComputedStyle(el);
		if (style.display === 'none' || style.visibility === 'hidden') return false;
		if (el.offsetParent === null && style.position !== 'fixed') return false;
		if (el.getClientRects().length === 0) return false;
		return true;
	});
}

export function createDropdownFocusManager(getItems: () => HTMLElement[]) {
	function focusSelectedOrFirstItem(): void {
		const items = getItems();
		const selected = items.find(
			(el) =>
				el.getAttribute('aria-checked') === 'true' || el.getAttribute('aria-selected') === 'true'
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

	return {
		focusSelectedOrFirstItem,
		focusFirstItem,
		focusLastItem,
		focusNext
	};
}

export function createDropdownTypeahead(getItems: () => HTMLElement[], timeoutMs = 500) {
	let buffer = '';
	let timer: number | null = null;

	function reset() {
		buffer = '';
		if (typeof window === 'undefined') return;
		if (timer) window.clearTimeout(timer);
		timer = null;
	}

	function handleKey(key: string) {
		if (key.length !== 1) return;
		if (typeof window === 'undefined') return;

		if (timer) window.clearTimeout(timer);
		buffer += key.toLowerCase();

		timer = window.setTimeout(() => {
			buffer = '';
		}, timeoutMs);

		const items = getItems();
		const match = items.find((item) => {
			const text = item.textContent?.trim().toLowerCase() || '';
			return text.startsWith(buffer);
		});

		match?.focus();
	}

	return { handleKey, reset };
}

type DropdownKeyHandlerOptions = {
	getDisabled: () => boolean;
	getIsOpen: () => boolean;
	setOpen: (next: boolean) => void;
	close: (options?: { focusButton?: boolean }) => void;
	afterOpen: (fn: () => void) => void;
	getItemSelector: () => string;
	focusSelectedOrFirstItem: () => void;
	focusFirstItem: () => void;
	focusLastItem: () => void;
	focusNext: (current: HTMLElement, dir: 1 | -1) => void;
	focusOnOpen: () => 'always' | 'keyboard' | 'none';
	typeahead: { handleKey: (key: string) => void };
};

type TriggerKeyHandler = (e: KeyboardEvent) => void;
type MenuKeyHandler = (e: KeyboardEvent) => void;

function createTriggerKeyHandler(opts: DropdownKeyHandlerOptions): TriggerKeyHandler {
	return (e: KeyboardEvent) => {
		if (opts.getDisabled()) return;

		const isOpen = opts.getIsOpen();

		if (e.key === 'Escape' && isOpen) {
			e.preventDefault();
			opts.close({ focusButton: true });
			return;
		}

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (!isOpen) opts.setOpen(true);
			if (opts.focusOnOpen() !== 'none') {
				opts.afterOpen(opts.focusSelectedOrFirstItem);
			}
			return;
		}

		if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (!isOpen) opts.setOpen(true);
			if (opts.focusOnOpen() !== 'none') {
				opts.afterOpen(opts.focusLastItem);
			}
			return;
		}

		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			if (isOpen) {
				opts.close({ focusButton: true });
			} else {
				opts.setOpen(true);
				if (opts.focusOnOpen() !== 'none') {
					opts.afterOpen(opts.focusSelectedOrFirstItem);
				}
			}
		}
	};
}

function createMenuKeyHandler(opts: DropdownKeyHandlerOptions): MenuKeyHandler {
	return (e: KeyboardEvent) => {
		const target = e.target as HTMLElement | null;
		if (!target) return;

		if (e.key === 'Escape') {
			e.preventDefault();
			e.stopPropagation();
			opts.close({ focusButton: true });
			return;
		}

		if (e.key === 'Tab') {
			queueMicrotask(() => opts.close());
			return;
		}

		// 검색 입력창에서 ArrowDown/ArrowUp 키를 누른 경우 메뉴 아이템으로 포커스 이동
		const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
		if (isInput) {
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				opts.focusFirstItem();
				return;
			}
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				opts.focusLastItem();
				return;
			}
			// 입력창에서는 typeahead 무시 (일반 타이핑)
			return;
		}

		if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
			opts.typeahead.handleKey(e.key);
			return;
		}

		const item = target.closest<HTMLElement>(opts.getItemSelector());
		if (!item) return;

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			opts.focusNext(item, 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			opts.focusNext(item, -1);
		} else if (e.key === 'Home') {
			e.preventDefault();
			opts.focusFirstItem();
		} else if (e.key === 'End') {
			e.preventDefault();
			opts.focusLastItem();
		} else if (e.key === 'Enter' || e.key === ' ') {
			if (item.tagName !== 'BUTTON') {
				e.preventDefault();
				item.click();
			}
		}
	};
}

export function createDropdownKeyHandlers(opts: DropdownKeyHandlerOptions) {
	return {
		onTriggerKeyDown: createTriggerKeyHandler(opts),
		onMenuKeyDown: createMenuKeyHandler(opts)
	};
}

export function computeDropdownPlacementStyles(opts: {
	triggerEl: HTMLElement;
	menuEl: HTMLElement;
	side?: 'auto' | 'top' | 'bottom';
}): string {
	if (typeof window === 'undefined') return '';

	const rect = opts.triggerEl.getBoundingClientRect();
	const menuRect = opts.menuEl.getBoundingClientRect();
	const spaceBelow = window.innerHeight - rect.bottom;
	const viewportPadding = 8;
	const maxRight = window.innerWidth - viewportPadding;
	const minLeft = viewportPadding;
	const overflowLeft = minLeft - menuRect.left;
	const overflowRight = menuRect.right - maxRight;
	let shiftX = 0;

	if (overflowLeft > 0) shiftX += overflowLeft;
	if (overflowRight > 0) shiftX -= overflowRight;

	const horizontalShift = shiftX ? `transform: translateX(${shiftX}px);` : '';

	const preferTop = opts.side === 'top';
	const preferBottom = opts.side === 'bottom';

	if (preferTop) {
		return `top: auto; bottom: 100%; margin-bottom: var(--spacing-2); margin-top: 0; ${horizontalShift}`;
	}

	if (!preferBottom && spaceBelow < menuRect.height && rect.top > menuRect.height) {
		return `top: auto; bottom: 100%; margin-bottom: var(--spacing-2); margin-top: 0; ${horizontalShift}`;
	}

	return horizontalShift;
}
