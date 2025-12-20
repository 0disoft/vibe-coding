<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import { onMount } from "svelte";

	import { useId } from "$lib/shared/utils/use-id";

	export type CapStatus = "idle" | "solving" | "solved" | "error";

	export type CapI18n = {
		initialState?: string;
		verifyingLabel?: string;
		solvedLabel?: string;
		errorLabel?: string;
		wasmDisabled?: string;
		verifyAriaLabel?: string;
		verifyingAriaLabel?: string;
		verifiedAriaLabel?: string;
		errorAriaLabel?: string;
	};

	type CapProgressEventDetail = {
		progress: number;
	};

	type CapSolveEventDetail = {
		token: string;
	};

	type CapErrorEventDetail = {
		isCap: boolean;
		message: string;
	};

	type CapProgressEvent = CustomEvent<CapProgressEventDetail>;
	type CapSolveEvent = CustomEvent<CapSolveEventDetail>;
	type CapErrorEvent = CustomEvent<CapErrorEventDetail>;
	type CapResetEvent = CustomEvent<Record<string, never>>;

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		apiEndpoint?: string;
		workerCount?: number;
		hiddenFieldName?: string;
		hideCredits?: boolean;
		token?: string | null;
		status?: CapStatus;
		i18n?: CapI18n;
		id?: string;
		describedBy?: string;
		invalid?: boolean;
		required?: boolean;
		onTokenChange?: (token: string | null) => void;
		onStatusChange?: (status: CapStatus) => void;
		onProgress?: (detail: CapProgressEventDetail) => void;
		onError?: (detail: CapErrorEventDetail) => void;
		onReset?: () => void;
	}

	let {
		apiEndpoint = "/api/cap/",
		workerCount,
		hiddenFieldName = "cap-token",
		hideCredits = true,
		token = $bindable<string | null>(null),
		status = $bindable<CapStatus>("idle"),
		i18n,
		id: idProp,
		describedBy,
		invalid = false,
		required = false,
		class: className = "",
		onTokenChange,
		onStatusChange,
		onProgress,
		onError,
		onReset,
		...rest
	}: Props = $props();

	const generatedId = useId("ds-captcha");
	let widgetId = $derived(idProp ?? generatedId);

	let normalizedApiEndpoint = $derived(
		apiEndpoint.endsWith("/") ? apiEndpoint : `${apiEndpoint}/`,
	);

	let widgetStyle = $derived(
		hideCredits ? "--cap-credits-font-size: 0px; --cap-opacity-hover: 0;" : "",
	);

	let i18nAttrs = $derived.by(() => {
		const attrs: Record<string, string> = {};
		if (!i18n) return attrs;

		if (i18n.initialState) {
			attrs["data-cap-i18n-initial-state"] = i18n.initialState;
		}
		if (i18n.verifyingLabel) {
			attrs["data-cap-i18n-verifying-label"] = i18n.verifyingLabel;
		}
		if (i18n.solvedLabel) {
			attrs["data-cap-i18n-solved-label"] = i18n.solvedLabel;
		}
		if (i18n.errorLabel) {
			attrs["data-cap-i18n-error-label"] = i18n.errorLabel;
		}
		if (i18n.verifyAriaLabel) {
			attrs["data-cap-i18n-verify-aria-label"] = i18n.verifyAriaLabel;
		}
		if (i18n.verifyingAriaLabel) {
			attrs["data-cap-i18n-verifying-aria-label"] = i18n.verifyingAriaLabel;
		}
		if (i18n.verifiedAriaLabel) {
			attrs["data-cap-i18n-verified-aria-label"] = i18n.verifiedAriaLabel;
		}
		if (i18n.errorAriaLabel) {
			attrs["data-cap-i18n-error-aria-label"] = i18n.errorAriaLabel;
		}
		if (i18n.wasmDisabled) {
			attrs["data-cap-i18n-wasm-disabled"] = i18n.wasmDisabled;
		}

		return attrs;
	});

	let isReady = $state(false);

	onMount(async () => {
		await import("@cap.js/widget");
		isReady = true;
	});

	function setStatus(next: CapStatus) {
		status = next;
		onStatusChange?.(next);
	}

	function handleSolve(event: CapSolveEvent) {
		token = event.detail?.token ?? null;
		onTokenChange?.(token);
		setStatus("solved");
	}

	function handleProgress(event: CapProgressEvent) {
		if (status !== "solving") setStatus("solving");
		onProgress?.(event.detail);
	}

	function handleError(event: CapErrorEvent) {
		token = null;
		onTokenChange?.(token);
		setStatus("error");
		onError?.(event.detail);
	}

	function handleReset(_: CapResetEvent) {
		token = null;
		onTokenChange?.(token);
		setStatus("idle");
		onReset?.();
	}
</script>

<div
	{...rest}
	class={["ds-captcha", className].filter(Boolean).join(" ")}
	data-status={status}
	data-ready={isReady ? "true" : undefined}
>
	<cap-widget
		id={widgetId}
		class="ds-captcha-widget"
		data-hide-credits={hideCredits ? "true" : undefined}
		data-cap-api-endpoint={normalizedApiEndpoint}
		data-cap-worker-count={workerCount}
		data-cap-hidden-field-name={hiddenFieldName}
		style={widgetStyle}
		aria-describedby={describedBy}
		aria-invalid={invalid ? "true" : undefined}
		aria-required={required ? "true" : undefined}
		{...i18nAttrs}
		on:solve={handleSolve}
		on:progress={handleProgress}
		on:error={handleError}
		on:reset={handleReset}
	/>
</div>

<style>
	:global(.ds-captcha-widget[data-hide-credits="true"])::part(attribution) {
		display: none !important;
	}
</style>
