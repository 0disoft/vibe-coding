<script lang="ts">
	import type { HTMLButtonAttributes } from "svelte/elements";

	import { writeToClipboard } from "$lib/shared/utils/clipboard";

	import DsIconButton from "./IconButton.svelte";
	import type { IconButtonVariant, IntentWithNeutral, Size } from "./types";

	type ButtonClickEvent = Parameters<NonNullable<HTMLButtonAttributes["onclick"]>>[0];

	interface Props {
		text: string;
		size?: Size;
		variant?: IconButtonVariant;
		intent?: IntentWithNeutral;
		disabled?: boolean;
		style?: string;
		flipInRtl?: boolean;
		loadingLabel?: string;
		type?: "button" | "submit" | "reset";
		ref?: HTMLButtonElement | null;
		class?: string;
		describedBy?: string;
		/** 기본 상태 aria-label */
		label?: string;
		/** 복사 완료 상태 aria-label */
		copiedLabel?: string;
		/** 기본 상태 아이콘 */
		icon?: string;
		/** 복사 완료 상태 아이콘 */
		copiedIcon?: string;
		/** copied 상태 유지 시간 */
		resetMs?: number;
		/** 성공 콜백 */
		onCopied?: () => void;
		/** 실패 콜백 */
		onCopyError?: (error: unknown) => void;
		/** 클릭 콜백(복사 시도 이후 호출) */
		onclick?: (e: ButtonClickEvent) => void;
	}

	let {
		text,
		size = "md",
		variant = "ghost",
		intent = "neutral",
		disabled = false,
		style,
		flipInRtl = false,
		loadingLabel,
		type = "button",
		ref = $bindable(null),
		describedBy,
		label = "Copy to clipboard",
		copiedLabel = "Copied to clipboard",
		icon = "copy",
		copiedIcon = "check",
		resetMs = 1500,
		onCopied,
		onCopyError,
		onclick,
		class: className = "",
	}: Props = $props();

	let copied = $state(false);
	let timerId = $state<ReturnType<typeof setTimeout> | null>(null);

	function setCopied(next: boolean) {
		copied = next;
		if (timerId) {
			clearTimeout(timerId);
			timerId = null;
		}
		if (next) {
			timerId = setTimeout(() => {
				copied = false;
				timerId = null;
			}, resetMs);
		}
	}

	async function handleClick(e: ButtonClickEvent) {
		try {
			await writeToClipboard(text);
			setCopied(true);
			onCopied?.();
		} catch (error) {
			if (import.meta.env.DEV) {
				console.error("[DsCopyButton] Failed to copy:", error);
			}
			onCopyError?.(error);
		} finally {
			onclick?.(e);
		}
	}
</script>

<DsIconButton
	{type}
	{ref}
	{size}
	{variant}
	{intent}
	{disabled}
	style={style}
	{flipInRtl}
	{loadingLabel}
	class={className}
	aria-describedby={describedBy}
	label={copied ? copiedLabel : label}
	icon={copied ? copiedIcon : icon}
	onclick={handleClick}
/>
