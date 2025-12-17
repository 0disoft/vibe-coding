/**
 * Clipboard helper (browser-safe)
 *
 * - 가능한 경우 `navigator.clipboard.writeText` 사용
 * - 불가하면 legacy `document.execCommand('copy')` fallback 시도
 */
export async function writeToClipboard(text: string): Promise<void> {
	if (typeof navigator !== "undefined") {
		const writeText = navigator.clipboard?.writeText;
		if (typeof writeText === "function") {
			await writeText.call(navigator.clipboard, text);
			return;
		}
	}

	if (typeof document !== "undefined") {
		const el = document.createElement("textarea");
		el.value = text;
		el.setAttribute("readonly", "true");
		el.style.position = "fixed";
		el.style.top = "-9999px";
		el.style.left = "-9999px";
		document.body.appendChild(el);
		el.select();

		const ok = document.execCommand?.("copy");
		document.body.removeChild(el);

		if (ok) return;
	}

	throw new Error("Clipboard write not available");
}

