<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import { onMount } from "svelte";

	import DsLiveRegion from "./LiveRegion.svelte";

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

	const generatedId = $props.id();

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

	let id = $derived(idProp ?? generatedId);

	let normalizedApiEndpoint = $derived(
		apiEndpoint.endsWith("/") ? apiEndpoint : `${apiEndpoint}/`,
	);

	let widgetStyle = $derived(
		hideCredits ? "--cap-credits-font-size: 0px; --cap-opacity-hover: 0;" : "",
	);

	let i18nAttrs = $derived.by(() => {
		const attrs: Record<string, string> = {};
		if (!i18n) return attrs;

		for (const [key, value] of Object.entries(i18n)) {
			if (value) {
				const attrName = `data-cap-i18n-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
				attrs[attrName] = value;
			}
		}

		return attrs;
	});

	let isReady = $state(false);
	let liveRegion: { announce: (message: string) => void } | null = null;

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
		const fallbackMessage = i18n?.errorLabel ?? "Captcha error.";
		const message = i18n?.errorLabel ?? event.detail?.message ?? fallbackMessage;
		liveRegion?.announce(message);
		onError?.(event.detail);
	}

	function handleReset(_: CapResetEvent) {
		token = null;
		onTokenChange?.(token);
		setStatus("idle");
		onReset?.();
	}
</script>

<DsLiveRegion bind:this={liveRegion} politeness="polite" duration={4000} />

<div
	{...rest}
	class={["ds-captcha", className].filter(Boolean).join(" ")}
	data-status={status}
	data-ready={isReady ? "true" : undefined}
>
	<cap-widget
		{id}
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
		onsolve={handleSolve}
		onprogress={handleProgress}
		onerror={handleError}
		onreset={handleReset}
	></cap-widget>
</div>

<style>
	:global(.ds-captcha-widget[data-hide-credits="true"])::part(attribution) {
		display: none !important;
	}
</style>
