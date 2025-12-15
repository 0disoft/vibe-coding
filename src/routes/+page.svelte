<script lang="ts">
	import { dev } from "$app/environment";
	import { goto } from "$app/navigation";

	import {
		DsButton,
		DsCard,
		DsDropdown,
		DsField,
		DsInput,
		DsTooltip,
	} from "$lib/components/design-system";

	import { site } from "$lib/constants";
	import * as m from "$lib/paraglide/messages.js";
	import { localizeUrl } from "$lib/paraglide/runtime.js";
	import { theme } from "$lib/stores";

	// ─────────────────────────────────────────────────────────────
	// Design System Pilot (DEV only)
	// ─────────────────────────────────────────────────────────────

	let pilotEmail = $state("");
	let pilotEmailInvalid = $derived(
		pilotEmail.length > 0 && !pilotEmail.includes("@"),
	);

	let lastDropdown = $state<string | null>(null);
</script>

<div class="container py-12">
	<section class="space-y-8">
		<div class="space-y-4">
			<p class="text-label text-muted-foreground">Design System 적용 진행 중</p>
			<h1 class="text-h1 font-semibold">
				{m.meta_site_title({ siteName: site.name })}
			</h1>
			<p class="text-body-secondary text-muted-foreground max-w-2xl">
				{m.meta_site_description({ siteDescription: site.description })}
			</p>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			{#if dev}
				<DsButton intent="primary" onclick={() => goto("/lab/design-system")}
					>디자인 시스템 lab 보기</DsButton
				>
			{/if}
			<DsButton
				intent="secondary"
				variant="outline"
				onclick={() => goto(localizeUrl("/terms").pathname)}
				>문서/약관 보기</DsButton
			>
		</div>

		<div class="grid gap-4 md:grid-cols-3">
			<DsCard class="space-y-2">
				<div class="text-label font-medium">Tokens</div>
				<p class="text-body-secondary text-muted-foreground">
					`--color-*`, `--font-size-*` 같은 시맨틱 토큰을 SSOT(DTCG)에서
					생성합니다.
				</p>
			</DsCard>
			<DsCard class="space-y-2">
				<div class="text-label font-medium">Patterns</div>
				<p class="text-body-secondary text-muted-foreground">
					Field/Dialog/Dropdown/Tooltip 같은 패턴을 스펙으로 고정하고 접근성
					계약을 지킵니다.
				</p>
			</DsCard>
			<DsCard class="space-y-2">
				<div class="text-label font-medium">CI Guard</div>
				<p class="text-body-secondary text-muted-foreground">
					토큰/매니페스트/문서 드리프트를 CI에서 조기에 잡습니다.
				</p>
			</DsCard>
		</div>

		<DsCard class="space-y-3">
			<h2 class="text-h3 font-semibold">간단한 폼 예시</h2>
			<p class="text-body-secondary text-muted-foreground">
				실제 템플릿 UI에서 DS 컴포넌트를 사용하는 최소 예시입니다.
			</p>

			<form class="space-y-3" onsubmit={(e) => e.preventDefault()}>
				<DsField
					id="email"
					label="Email"
					helpText="예시 입력입니다."
					required
					invalid={pilotEmailInvalid}
					errorText="이메일 형식이 아닙니다."
				>
					{#snippet children(p)}
						<DsInput
							id={p.id}
							type="email"
							placeholder="you@example.com"
							required={p.required}
							aria-describedby={p.describedBy}
							invalid={p.invalid}
							bind:value={pilotEmail}
						/>
					{/snippet}
				</DsField>

				<div class="flex flex-wrap gap-2">
					<DsButton intent="primary" type="submit">Submit</DsButton>
					<DsButton
						intent="secondary"
						variant="outline"
						type="button"
						onclick={() => (pilotEmail = "")}>Reset</DsButton
					>
				</div>
			</form>
		</DsCard>
	</section>

	{#if dev}
		<section class="mt-16 space-y-4">
			<h2 class="text-2xl font-bold">Design System Pilot (DEV only)</h2>
			<p class="text-body-secondary text-muted-foreground">
				실제 템플릿 페이지 안에서 토큰/컴포넌트를 점진 적용하기 위한 파일럿
				섹션입니다. (프로덕션에는 노출되지 않음)
			</p>

			<div class="ds-lab" data-ds-theme={theme.current}>
				<DsCard class="space-y-4" motion>
					<div class="flex flex-wrap items-center justify-between gap-3">
						<div>
							<div class="text-label font-medium">Theme</div>
							<div class="text-helper text-muted-foreground font-mono">
								data-ds-theme="{theme.current}"
							</div>
						</div>

						<div class="flex flex-wrap items-center gap-2">
							<DsTooltip
								content="hover 또는 키보드 포커스에서 열리고, ESC로 닫힙니다."
							>
								{#snippet children(p)}
									<button
										type="button"
										class="ds-button ds-focus-ring"
										data-ds-intent="secondary"
										data-ds-variant="outline"
										aria-describedby={p.describedBy}
										onpointerover={p.onpointerover}
										onpointerout={p.onpointerout}
										onfocus={p.onfocus}
										onblur={p.onblur}
										onkeydown={p.onkeydown}
									>
										Tooltip
									</button>
								{/snippet}
							</DsTooltip>

							<DsDropdown
								label="Menu"
								items={[
									{ id: "profile", label: "Profile" },
									{ id: "settings", label: "Settings" },
									{ id: "logout", label: "Logout" },
								]}
								onSelect={(id) => (lastDropdown = id)}
							/>
						</div>
					</div>

					{#if lastDropdown}
						<div class="text-helper text-muted-foreground font-mono">
							Selected: {lastDropdown}
						</div>
					{/if}

					<DsField
						id="pilot-email"
						label="Email"
						helpText="required + error + describedby 연결을 확인합니다."
						errorText="이메일 형식이 아닙니다."
						required
						invalid={pilotEmailInvalid}
					>
						{#snippet children(p)}
							<DsInput
								id={p.id}
								type="email"
								placeholder="you@example.com"
								required={p.required}
								aria-describedby={p.describedBy}
								invalid={p.invalid}
								bind:value={pilotEmail}
							/>
						{/snippet}
					</DsField>

					<div class="flex flex-wrap gap-2">
						<DsButton intent="primary">Primary</DsButton>
						<DsButton intent="secondary" variant="outline">Secondary</DsButton>
						<DsButton intent="danger" variant="ghost">Danger</DsButton>
					</div>
				</DsCard>
			</div>
		</section>
	{/if}
</div>
