<script lang="ts">
	import {
		DsButton,
		DsCard,
		DsDataTable,
		DsLinkButton,
		DsPageHeader,
	} from "$lib/components/design-system";

	import { pages as pageRegistry } from "$lib/constants";
	import { localizeUrl } from "$lib/paraglide/runtime.js";
</script>

<section id="pages" class="space-y-4">
	<h2 class="text-h2 font-semibold">Pages</h2>
	<DsCard class="space-y-4">
		<div class="space-y-2">
			<div class="text-label text-muted-foreground">PageHeader</div>
			<DsPageHeader
				title="이용약관"
				description="서비스 이용에 필요한 기본 약관을 안내합니다."
				breadcrumbs={[
					{ label: "Vibe", href: "/" },
					{
						label: "정책",
						href: "/policy",
						menuItems: [
							{ label: "이용약관", href: "/terms", disabled: true },
							{ label: "개인정보처리방침", href: "/privacy" },
							{ label: "쿠키 정책", href: "/cookie" },
						],
						menuLabel: "정책 항목 선택",
					},
					{ label: "이용약관" },
				]}
			>
				{#snippet actions()}
					<div class="flex flex-wrap items-center gap-2">
						<DsButton size="sm" variant="outline" intent="secondary">
							Version history
						</DsButton>
						<DsButton size="sm" intent="primary">Agree</DsButton>
					</div>
				{/snippet}
			</DsPageHeader>
		</div>
		<p class="text-body-secondary text-muted-foreground">
			요청된 페이지 스캐폴딩을 한 번에 확인할 수 있는 링크 목록입니다.
		</p>
		<DsDataTable
			columns={[
				{ id: "title", header: "Page", sortable: true },
				{ id: "group", header: "Group", sortable: true },
				{ id: "path", header: "Path", sortable: true },
			]}
			rows={pageRegistry.filter((p) => p.path !== "/")}
			getValue={(row, id) => row?.[id]}
		>
			{#snippet cell({ row, columnId, value })}
				{#if columnId === "title"}
					<DsLinkButton
						size="sm"
						variant="link"
						intent="secondary"
						href={localizeUrl(String(row.path)).href}
					>
						{String(value ?? "")}
					</DsLinkButton>
				{:else if columnId === "path"}
					<code class="text-code">{String(value ?? "")}</code>
				{:else}
					{String(value ?? "")}
				{/if}
			{/snippet}
		</DsDataTable>
	</DsCard>
</section>
