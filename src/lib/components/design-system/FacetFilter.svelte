<script module lang="ts">
	export type FacetOption = {
		value: string;
		label: string;
		/** 결과 수 (옵션) */
		count?: number;
		disabled?: boolean;
	};

	export type FacetGroup = {
		id: string;
		title: string;
		options: FacetOption[];
		/** 초기 접힘 여부 */
		defaultOpen?: boolean;
	};

	export type FacetValues = Record<string, string[]>;
</script>

<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { DsIcon } from "$lib/components/design-system";
	import DsCheckbox from "./Checkbox.svelte";

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		groups: FacetGroup[];

		/** 선택된 필터 값 { groupId: [values...] } (양방향 바인딩) */
		values?: FacetValues;
		onValuesChange?: (next: FacetValues) => void;

		/** 옵션 커스텀 렌더링 스니펫 */
		renderOption?: Snippet<
			[
				{
					groupId: string;
					option: FacetOption;
					checked: boolean;
					toggle: () => void;
				},
			]
		>;
	}

	let {
		groups,
		values = $bindable({}),
		onValuesChange,
		renderOption,
		class: className = "",
		...rest
	}: Props = $props();

	function toggle(groupId: string, value: string) {
		const currentList = values[groupId] ?? [];
		const set = new Set(currentList);

		if (set.has(value)) {
			set.delete(value);
		} else {
			set.add(value);
		}

		// 불변성 유지 업데이트 (Svelte 5 반응성 트리거)
		const nextList = Array.from(set);
		const nextValues = { ...values, [groupId]: nextList };

		// 리스트가 비었으면 키 삭제 (선택 사항 - URL 쿼리 정리용)
		if (nextList.length === 0) {
			delete nextValues[groupId];
		}

		values = nextValues;
		onValuesChange?.(nextValues);
	}
</script>

<div {...rest} class={["ds-facet-filter", className].filter(Boolean).join(" ")}>
	{#each groups as group (group.id)}
		<details class="ds-facet-group" open={group.defaultOpen ?? true}>
			<summary class="ds-facet-summary ds-focus-ring">
				<h3 class="ds-facet-title">{group.title}</h3>
				<DsIcon
					name="chevron-down"
					size="sm"
					class="ds-facet-summary-icon"
					aria-hidden="true"
				/>
			</summary>
			<div class="ds-facet-options">
				{#each group.options as option (option.value)}
					{@const checked = (values[group.id] ?? []).includes(option.value)}
					{#if renderOption}
						{@render renderOption({
							groupId: group.id,
							option,
							checked,
							toggle: () => toggle(group.id, option.value),
						})}
					{:else}
						<label class="ds-facet-option">
							<DsCheckbox
								{checked}
								disabled={option.disabled}
								onchange={() => toggle(group.id, option.value)}
							>
								{#snippet children()}
									<span class="ds-facet-option-label">{option.label}</span>
									{#if typeof option.count === "number"}
										<span class="ds-facet-option-count"
											>({option.count.toLocaleString()})</span
										>
									{/if}
								{/snippet}
							</DsCheckbox>
						</label>
					{/if}
				{/each}
			</div>
		</details>
	{/each}
</div>
