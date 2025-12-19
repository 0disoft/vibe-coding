<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { createControllableState } from "$lib/shared/utils/controllable-state.svelte";

	import DsButton from "./Button.svelte";
	import DsIcon from "./Icon.svelte";
	import DsIconButton from "./IconButton.svelte";
	import DsTabs from "./Tabs.svelte";
	import DsTabsContent from "./TabsContent.svelte";
	import DsTabsList from "./TabsList.svelte";
	import DsTabsTrigger from "./TabsTrigger.svelte";

	export type NotificationItem = {
		id: string;
		title: string;
		message?: string;
		meta?: string;
		intent?: "neutral" | "success" | "warning" | "error";
		read?: boolean;
		href?: string;
		disabled?: boolean;
	};

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		title?: string;
		items: NotificationItem[];

		filter?: "all" | "unread";
		onFilterChange?: (next: "all" | "unread") => void;
		defaultFilter?: "all" | "unread";

		emptyText?: string;

		onOpen?: (id: string) => void;
		onMarkRead?: (id: string) => void;
		onDismiss?: (id: string) => void;
		onMarkAllRead?: () => void;

		action?: Snippet<[NotificationItem]>;
	}

	let {
		title = "Notifications",
		items,
		filter,
		onFilterChange,
		defaultFilter = "all",
		emptyText = "No notifications",
		onOpen,
		onMarkRead,
		onDismiss,
		onMarkAllRead,
		action,
		class: className = "",
		...rest
	}: Props = $props();

	let filterState = createControllableState<"all" | "unread">({
		value: () => filter ?? undefined,
		onChange: (next) => onFilterChange?.(next),
		defaultValue: () => defaultFilter,
	});

	let unreadItems = $derived(items.filter((i) => !i.read));
	let unreadCount = $derived(unreadItems.length);

	const intentIcon: Record<string, string> = {
		neutral: "bell",
		success: "circle-check",
		warning: "triangle-alert",
		error: "circle-alert",
	};

	function openItem(item: NotificationItem) {
		if (item.disabled) return;
		onOpen?.(item.id);
	}
</script>

{#snippet notificationList(list: NotificationItem[], label: string)}
	<ul class="ds-notification-list" aria-label={label}>
		{#if list.length === 0}
			<li class="ds-notification-empty">{emptyText}</li>
		{:else}
			{#each list as item (item.id)}
				<li
					class="ds-notification-item"
					data-read={item.read ? "true" : undefined}
					data-disabled={item.disabled ? "true" : undefined}
				>
					<button
						type="button"
						class="ds-notification-main ds-focus-ring flex items-start text-start gap-3 py-2"
						onclick={() => openItem(item)}
						disabled={item.disabled}
					>
						<span class="ds-notification-icon mt-1 shrink-0" aria-hidden="true">
							<DsIcon
								name={intentIcon[item.intent ?? "neutral"] ?? "bell"}
								size="sm"
							/>
						</span>
						<span class="ds-notification-text">
							<span class="ds-notification-item-title">{item.title}</span>
							{#if item.message}
								<span class="ds-notification-item-message">{item.message}</span>
							{/if}
							{#if item.meta}
								<span class="ds-notification-item-meta">{item.meta}</span>
							{/if}
						</span>
					</button>

					<div class="ds-notification-item-actions">
						{#if action}
							{@render action(item)}
						{/if}
						<DsIconButton
							icon="check"
							label="Mark read"
							size="sm"
							variant="ghost"
							intent="neutral"
							disabled={item.read || item.disabled}
							onclick={() => onMarkRead?.(item.id)}
						/>
						<DsIconButton
							icon="x"
							label="Dismiss"
							size="sm"
							variant="ghost"
							intent="neutral"
							disabled={item.disabled}
							onclick={() => onDismiss?.(item.id)}
						/>
					</div>
				</li>
			{/each}
		{/if}
	</ul>
{/snippet}

<div
	{...rest}
	class={["ds-notification-center", className].filter(Boolean).join(" ")}
>
	<div class="ds-notification-header">
		<div class="ds-notification-title">
			<div class="text-body font-semibold">{title}</div>
			<div class="text-helper text-muted-foreground">
				unread: {unreadCount}
			</div>
		</div>

		<div class="ds-notification-actions">
			<DsButton
				size="sm"
				variant="outline"
				intent="secondary"
				disabled={unreadCount === 0}
				onclick={() => onMarkAllRead?.()}
			>
				Mark all read
			</DsButton>
		</div>
	</div>

	<DsTabs
		value={filterState.value}
		onValueChange={(v) => (filterState.value = v as "all" | "unread")}
	>
		<DsTabsList class="w-full justify-start">
			<DsTabsTrigger value="all">All</DsTabsTrigger>
			<DsTabsTrigger value="unread">Unread</DsTabsTrigger>
	</DsTabsList>

	<DsTabsContent value="all">
		{@render notificationList(items, "Notification list")}
	</DsTabsContent>

	<DsTabsContent value="unread">
		{@render notificationList(unreadItems, "Unread notification list")}
	</DsTabsContent>
	</DsTabs>
</div>
