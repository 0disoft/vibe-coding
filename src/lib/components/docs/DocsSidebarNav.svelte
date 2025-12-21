<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import * as m from "$lib/paraglide/messages.js";

	import { DsLinkButton, DsSeparator } from "$lib/components/design-system";

	type DocsNavItem = {
		href: string;
		label: string;
		items?: ReadonlyArray<DocsNavItem>;
	};

	interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		title?: string;
		items: ReadonlyArray<DocsNavItem>;
		/** 활성 경로(예: page.url.pathname). 미지정 시 href 매칭 비활성 */
		activePath?: string;
	}

	let {
		title = m.nav_docs(),
		items,
		activePath,
		class: className = "",
		...rest
	}: Props = $props();

	function isActive(href: string) {
		if (!activePath) return false;
		return activePath === href || activePath.startsWith(`${href}/`);
	}
</script>

<nav
	{...rest}
	class={["rounded-lg border border-border bg-surface p-4", className]
		.filter(Boolean)
		.join(" ")}
	aria-label={title}
>
	<div class="text-menu-sm font-semibold text-foreground">{title}</div>
	<DsSeparator class="my-3" />
	<ul class="grid gap-1">
		{#each items as item (item.href)}
			<li>
				<DsLinkButton
					href={item.href}
					variant="link"
					intent="secondary"
					class={[
						"w-full !justify-start rounded-md px-2 py-1 text-menu-sm",
						isActive(item.href)
							? "bg-surface-hover text-foreground"
							: "text-muted-foreground",
					].join(" ")}
					aria-current={isActive(item.href) ? "page" : undefined}
				>
					{item.label}
				</DsLinkButton>
				{#if item.items?.length}
					<ul class="mt-1 grid gap-1 ps-4">
						{#each item.items as sub (sub.href)}
							<li>
								<DsLinkButton
									href={sub.href}
									variant="link"
									intent="secondary"
									class={[
										"w-full !justify-start rounded-md px-2 py-1 text-menu-sm",
										isActive(sub.href)
											? "bg-surface-hover text-foreground"
											: "text-muted-foreground",
									].join(" ")}
									aria-current={isActive(sub.href) ? "page" : undefined}
								>
									{sub.label}
								</DsLinkButton>
							</li>
						{/each}
					</ul>
				{/if}
			</li>
		{/each}
	</ul>
</nav>
