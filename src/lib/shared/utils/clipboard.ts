/**
 * Clipboard helper (browser-safe)
 *
 * - 가능한 경우 `navigator.clipboard.writeText` 사용
 * - 불가하면 legacy `document.execCommand('copy')` fallback 시도
 */
export async function writeToClipboard(text: string): Promise<void> {
	if (typeof navigator !== 'undefined') {
		const writeText = navigator.clipboard?.writeText;
		if (typeof writeText === 'function') {
			try {
				await writeText.call(navigator.clipboard, text);
				return;
			} catch {
				// 권한/보안 컨텍스트 이슈 등으로 실패할 수 있으므로 fallback 시도
			}
		}
	}

	if (typeof document !== 'undefined') {
		const activeElement = document.activeElement as HTMLElement | null;
		const selection = document.getSelection?.() ?? null;
		const ranges =
			selection && selection.rangeCount > 0
				? Array.from({ length: selection.rangeCount }, (_, i) =>
						selection.getRangeAt(i).cloneRange()
					)
				: [];

		const el = document.createElement('textarea');
		el.value = text;
		el.setAttribute('readonly', 'true');
		el.setAttribute('aria-hidden', 'true');
		el.style.position = 'fixed';
		el.style.top = '0';
		el.style.left = '-9999px';
		el.style.opacity = '0';
		el.style.pointerEvents = 'none';
		el.style.fontSize = '16px'; // iOS zoom 방지
		document.body.appendChild(el);
		el.focus();
		el.select();
		el.setSelectionRange(0, el.value.length);

		const ok = document.execCommand?.('copy');
		document.body.removeChild(el);

		// selection/focus 복구
		if (selection) {
			try {
				selection.removeAllRanges();
				for (const range of ranges) selection.addRange(range);
			} catch {
				// 일부 환경에서 selection 복구가 실패해도 치명적이지 않음
			}
		}
		activeElement?.focus?.();

		if (ok) return;
	}

	throw new Error('Clipboard write not available');
}
