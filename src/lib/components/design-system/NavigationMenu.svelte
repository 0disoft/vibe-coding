<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { createControllableState } from "$lib/shared/utils/controllable-state.svelte";

	import DsIcon from "./Icon.svelte";
	import DsPopover from "./Popover.svelte";

	export type NavigationMenuLink = {
		label: string;
		href: string;
		description?: string;
		icon?: string;
		disabled?: boolean;
	};

	export type NavigationMenuSection = {
		title?: string;
		links: ReadonlyArray<NavigationMenuLink>;
	};

	export type NavigationMenuItem = {
		/** 식별자(미지정 시 label 기반으로 자동 생성) */
		id?: string;
		label: string;
		/** 패널이 없는 단순 링크 항목 */
		href?: string;
		/** 메가 메뉴 패널 구성 */
		sections?: ReadonlyArray<NavigationMenuSection>;
	};

	interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		label?: string;
		items: ReadonlyArray<NavigationMenuItem>;
		/** 열려있는 item id (controlled) */
		openId?: string | null;
		/** openId 변경 콜백 */
		onOpenIdChange?: (next: string | null) => void;
		/** 패널 열림 위치 */
		align?: "start" | "center" | "end";
		/** 패널 offset(px) */
		offset?: number;
		/** 메가 메뉴 패널에 추가할 class */
		panelClass?: string;
		/** 트리거 버튼에 추가할 class */
		triggerClass?: string;
		/** 단순 링크(a)에 추가할 class */
		linkClass?: string;
		/** 항목 렌더 커스터마이즈(고급) */
		renderItem?: Snippet<
			[
				{
					item: NavigationMenuItem;
					isOpen: boolean;
					open: () => void;
					close: () => void;
				},
			]
		>;
	}

	let {
		label = "Navigation",
		items,
		openId,
		onOpenIdChange,
		align = "start",
		offset = 10,
		panelClass = "",
		triggerClass = "",
		linkClass = "",
		renderItem,
		class: className = "",
		...rest
	}: Props = $props();

	let openState = createControllableState<string | null>({
		value: () => openId,
		onChange: (next) => onOpenIdChange?.(next),
		defaultValue: null,
	});

	function normalizeId(value: string) {
		return value
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
	}

	let normalizedItems = $derived(
		items.map((item, index) => {
			const fallbackId = `${normalizeId(item.label) || "item"}-${index + 1}`;
			return { ...item, id: item.id ?? fallbackId };
		}),
	);

	function setOpenId(next: string | null) {
		openState.value = next;
	}

	function openItem(id: string) {
		setOpenId(id);
	}

	function closeAll() {
		setOpenId(null);
	}

	function isMega(item: NavigationMenuItem): boolean {
		return Boolean(item.sections?.length);
	}

	let triggerEls = $state<(HTMLButtonElement | null)[]>([]);

	function triggerAction(
		node: HTMLButtonElement,
		params: { refFn: (el: HTMLElement) => void; index: number },
	) {
		params.refFn(node);
		triggerEls[params.index] = node;

		return {
			destroy() {
				if (triggerEls[params.index] === node) triggerEls[params.index] = null;
			},
		};
	}

	function focusTriggerAt(index: number) {
		const node = triggerEls[index];
		node?.focus();
	}

	function findNextTriggerIndex(from: number, dir: -1 | 1) {
		for (let i = from + dir; i >= 0 && i < triggerEls.length; i += dir) {
			if (triggerEls[i]) return i;
		}
		return from;
	}

	function findFirstTriggerIndex() {
		for (let i = 0; i < triggerEls.length; i += 1) {
			if (triggerEls[i]) return i;
		}
		return 0;
	}

	function findLastTriggerIndex() {
		for (let i = triggerEls.length - 1; i >= 0; i -= 1) {
			if (triggerEls[i]) return i;
		}
		return Math.max(0, triggerEls.length - 1);
	}

	function handleTriggerKeyDown(
		e: KeyboardEvent,
		index: number,
		popoverClick: () => void,
	) {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			popoverClick();
			return;
		}

		if (e.key === "ArrowLeft") {
			e.preventDefault();
			focusTriggerAt(findNextTriggerIndex(index, -1));
			return;
		}

		if (e.key === "ArrowRight") {
			e.preventDefault();
			focusTriggerAt(findNextTriggerIndex(index, 1));
			return;
		}

		if (e.key === "Home") {
			e.preventDefault();
			focusTriggerAt(findFirstTriggerIndex());
			return;
		}

		if (e.key === "End") {
			e.preventDefault();
			focusTriggerAt(findLastTriggerIndex());
			return;
		}
	}
</script>

<nav {...rest} class={["ds-nav-menu", className].filter(Boolean).join(" ")} aria-label={label}>
	<ul class="ds-nav-menu-list">
		{#each normalizedItems as item, index (item.id)}
			{@const itemId = item.id ?? `${index}`}
			{@const open = () => openItem(itemId)}
			{@const close = () => {
				if (openState.value === itemId) closeAll();
			}}
			{@const isOpen = openState.value === itemId}

			<li class="ds-nav-menu-item">
				{#if renderItem}
					{@render renderItem({ item, isOpen, open, close })}
				{:else if isMega(item)}
					<DsPopover
						open={isOpen}
						onOpenChange={(next) => setOpenId(next ? itemId : null)}
						side="bottom"
						{align}
						{offset}
						initialFocus='a[href]:not([aria-disabled="true"])'
						panelClass={["ds-nav-menu-panel", panelClass].filter(Boolean).join(" ")}
					>
						{#snippet trigger(props)}
							{@const { ref, onclick: popoverClick, onkeydown: popoverKeyDown, ...a11y } = props}
							<button
								type="button"
								use:triggerAction={{ refFn: ref, index }}
								class={["ds-nav-menu-trigger ds-focus-ring", triggerClass]
									.filter(Boolean)
									.join(" ")}
								{...a11y}
								onclick={popoverClick}
								onkeydown={(e) =>
									{
										handleTriggerKeyDown(e, index, popoverClick);
										popoverKeyDown(e);
									}}
							>
								<span class="ds-nav-menu-trigger-label">{item.label}</span>
								<DsIcon
									name="chevron-down"
									size="sm"
									class={`ds-nav-menu-trigger-icon ${isOpen ? "is-open" : ""}`}
								/>
							</button>
						{/snippet}

						{#snippet children({ close: closePanel })}
							<div class="ds-nav-menu-mega">
								{#each item.sections ?? [] as section, sectionIndex (sectionIndex)}
									<div class="ds-nav-menu-section">
										{#if section.title}
											<div class="ds-nav-menu-section-title">{section.title}</div>
										{/if}

										<div class="ds-nav-menu-links">
											{#each section.links as link, linkIndex (linkIndex)}
												<a
													href={link.disabled ? undefined : link.href}
													aria-disabled={link.disabled || undefined}
													tabindex={link.disabled ? -1 : undefined}
													class="ds-nav-menu-link ds-focus-ring"
													onclick={() => closePanel()}
												>
													<div class="ds-nav-menu-link-title">
														{#if link.icon}
															<DsIcon name={link.icon} size="sm" />
														{/if}
														<span class="truncate">{link.label}</span>
													</div>
													{#if link.description}
														<div class="ds-nav-menu-link-desc">{link.description}</div>
													{/if}
												</a>
											{/each}
										</div>
									</div>
								{/each}
							</div>
						{/snippet}
					</DsPopover>
				{:else if item.href}
					<a
						href={item.href}
						class={["ds-nav-menu-link-top ds-focus-ring", linkClass]
							.filter(Boolean)
							.join(" ")}
					>
						<span class="ds-nav-menu-trigger-label">{item.label}</span>
					</a>
				{:else}
					<span class="ds-nav-menu-link-top is-disabled" aria-disabled="true">
						<span class="ds-nav-menu-trigger-label">{item.label}</span>
					</span>
				{/if}
			</li>
		{/each}
	</ul>
</nav>
