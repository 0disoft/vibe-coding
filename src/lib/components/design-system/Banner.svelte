<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { DsIcon, DsIconButton } from "$lib/components/design-system";
	import type { IntentWithNeutral } from "./types";
	import { toIntentCss } from "./types";

	type Role = "status" | "alert";

	interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		intent?: IntentWithNeutral;
		title?: string;
		description?: string;
		role?: Role;
		icon?: string | null;
		children?: Snippet;
		actions?: Snippet;
		/** 닫기 버튼 표시 */
		dismissible?: boolean;
		/** 닫기 버튼 라벨 (SR용) */
		dismissLabel?: string;
		/** 닫힘 상태 쿠키 키(지정하면 쿠키로 기억) */
		dismissKey?: string;
		/** 쿠키 만료일(일) */
		dismissDays?: number;
		/** 이미 닫혔는지(제어) */
		dismissed?: boolean;
	}

	let {
		intent = "neutral",
		title,
		description,
		role,
		icon,
		class: className = "",
		children,
		actions,
		dismissible = false,
		dismissLabel = "Dismiss banner",
		dismissKey,
		dismissDays = 365,
		dismissed = $bindable(false),
		...rest
	}: Props = $props();

	let intentCss = $derived(toIntentCss(intent));

	const defaultIconByIntent: Record<string, string> = {
		neutral: "info",
		primary: "star",
		secondary: "info",
		success: "circle-check",
		warning: "triangle-alert",
		error: "circle-alert",
	};

	let computedRole = $derived<Role>(
		role ??
			(intentCss === "error" || intentCss === "warning" ? "alert" : "status"),
	);

	let iconName = $derived(
		icon === null ? null : (icon ?? defaultIconByIntent[intentCss] ?? "info"),
	);

	function getCookie(name: string): string | null {
		if (typeof document === "undefined") return null;
		const key = `${encodeURIComponent(name)}=`;
		const raw = document.cookie.split("; ");
		for (const item of raw) {
			if (item.startsWith(key)) {
				const value = item.slice(key.length);
				try {
					return decodeURIComponent(value);
				} catch {
					return value;
				}
			}
		}
		return null;
	}

	function setCookie(name: string, value: string, days = 365): void {
		if (typeof document === "undefined") return;
		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		const expires = `; expires=${date.toUTCString()}`;
		const secure = location.protocol === "https:" ? "; Secure" : "";
		// biome-ignore lint/suspicious/noDocumentCookie: 배너 dismiss 상태 저장
		document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax${secure}`;
	}

	$effect(() => {
		if (!dismissKey || typeof document === "undefined") return;
		dismissed = getCookie(dismissKey) === "1";
	});

	$effect(() => {
		if (!dismissKey || !dismissed) return;
		setCookie(dismissKey, "1", dismissDays);
	});

	let rootClass = $derived(["ds-banner", className].filter(Boolean).join(" "));

	let showDismiss = $derived(dismissible || !!dismissKey);
</script>

{#if !dismissed}
	<section
		{...rest}
		class={rootClass}
		data-ds-intent={intentCss}
		role={computedRole}
	>
		{#if iconName}
			<div class="ds-banner-icon" aria-hidden="true">
				<DsIcon name={iconName} size="md" />
			</div>
		{/if}

		<div class="ds-banner-body">
			{#if title}
				<h5 class="ds-banner-title">{title}</h5>
			{/if}

			{#if description}
				<div class="ds-banner-description">{description}</div>
			{/if}

			{#if children}
				<div class="ds-banner-content">
					{@render children()}
				</div>
			{/if}
		</div>

		<div class="ds-banner-actions">
			{#if actions}
				{@render actions()}
			{/if}

			{#if showDismiss}
				<DsIconButton
					size="sm"
					variant="ghost"
					intent="neutral"
					icon="x"
					label={dismissLabel}
					onclick={() => {
						dismissed = true;
					}}
				/>
			{/if}
		</div>
	</section>
{/if}
