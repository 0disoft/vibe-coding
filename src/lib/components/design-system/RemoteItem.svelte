<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import { DsIcon, DsTooltip } from "$lib/components/design-system";

	export type RemoteItemVariant = "ghost" | "solid";
	export type RemoteItemSize = "sm" | "md" | "lg";
	export type TooltipPlacement = "top" | "bottom" | "left" | "right";

	type RemoteItemBase = {
		label: string;
		icon?: string;
		href?: string;
		target?: string;
		rel?: string;
		active?: boolean;
		disabled?: boolean;
		variant?: RemoteItemVariant;
		size?: RemoteItemSize;
		showLabel?: boolean;
		tooltip?: string | false;
		tooltipPlacement?: TooltipPlacement;
		onSelect?: () => void;
	};

	export type RemoteItemConfig = RemoteItemBase & { id: string };

	type BaseProps = Omit<HTMLAttributes<HTMLElement>, "children">;

	type ClickEvent = Parameters<NonNullable<HTMLAttributes<HTMLElement>["onclick"]>>[0];

	interface Props extends BaseProps, RemoteItemBase {
		type?: "button" | "submit" | "reset";
	}

	let {
		label,
		icon,
		href,
		target,
		rel,
		active = false,
		disabled = false,
		variant = "ghost",
		size = "md",
		showLabel = false,
		tooltip,
		tooltipPlacement = "left",
		type = "button",
		onSelect,
		class: className = "",
		onclick,
		onkeydown,
		tabindex,
		...rest
	}: Props = $props();

	let isLink = $derived(!!href);
	let elementTag = $derived(isLink ? "a" : "button");
	let computedHref = $derived(!disabled && isLink ? href : undefined);
	let computedTabIndex = $derived(disabled ? -1 : tabindex);
	let tooltipContent = $derived(tooltip === false ? "" : (tooltip ?? label));
	let shouldTooltip = $derived(!showLabel && !!tooltipContent);
	let shouldDescribe = $derived(!!tooltipContent && tooltipContent !== label);
	let iconSize = $derived<"sm" | "md" | "lg">(
		size === "sm" ? "sm" : size === "lg" ? "lg" : "md",
	);

	let rootClass = $derived(
		[
			"ds-remote-item",
			"ds-focus-ring",
			"ds-no-select",
			showLabel ? "has-label" : "",
			active ? "is-active" : "",
			disabled ? "is-disabled" : "",
			className,
		]
			.filter(Boolean)
			.join(" "),
	);

	function handleClick(e: MouseEvent) {
		if (disabled) {
			e.preventDefault();
			e.stopPropagation();
			return;
		}
		onclick?.(e as ClickEvent);
		if (e.defaultPrevented) return;
		onSelect?.();
	}

	const ariaLabel = $derived(showLabel ? undefined : label);
	const ariaCurrent = $derived(isLink && active ? "page" : undefined);
	const ariaPressed = $derived(!isLink && active ? "true" : undefined);
</script>

{#if shouldTooltip}
	<DsTooltip content={tooltipContent} placement={tooltipPlacement}>
		{#snippet children(props)}
			{@const describedBy = shouldDescribe ? props["aria-describedby"] : undefined}
			<svelte:element
				this={elementTag}
				{...rest}
				{...(elementTag === "a"
					? { href: computedHref, target, rel }
					: { type, disabled })}
				class={rootClass}
				aria-current={ariaCurrent}
				aria-pressed={ariaPressed}
				aria-disabled={disabled ? "true" : undefined}
				aria-label={ariaLabel}
				aria-describedby={describedBy}
				tabindex={computedTabIndex}
				data-ds-variant={variant}
				data-ds-size={size}
				onclick={handleClick}
				onkeydown={onkeydown}
			>
				{#if icon}
					<DsIcon name={icon} size={iconSize} />
				{/if}
				{#if showLabel}
					<span class="ds-remote-item-label">{label}</span>
				{/if}
			</svelte:element>
		{/snippet}
	</DsTooltip>
{:else}
	<svelte:element
		this={elementTag}
		{...rest}
		{...(elementTag === "a" ? { href: computedHref, target, rel } : { type, disabled })}
		class={rootClass}
		aria-current={ariaCurrent}
		aria-pressed={ariaPressed}
		aria-disabled={disabled ? "true" : undefined}
		aria-label={ariaLabel}
		tabindex={computedTabIndex}
		data-ds-variant={variant}
		data-ds-size={size}
		onclick={handleClick}
		onkeydown={onkeydown}
	>
		{#if icon}
			<DsIcon name={icon} size={iconSize} />
		{/if}
		{#if showLabel}
			<span class="ds-remote-item-label">{label}</span>
		{/if}
	</svelte:element>
{/if}
