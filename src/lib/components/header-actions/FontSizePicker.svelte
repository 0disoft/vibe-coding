<script lang="ts">
	import { fontSize, type FontSize } from '$lib/font-size.svelte';

	let showFontSizeModal = $state(false);
	let modalRef: HTMLDivElement | undefined = $state();
	let buttonRef: HTMLButtonElement | undefined = $state();

	// 닫기 로직 통합 헬퍼
	function closeFontSizeModal() {
		if (!showFontSizeModal) return;
		showFontSizeModal = false;
		buttonRef?.focus(); // 항상 포커스 복귀
	}

	function toggleFontSizeModal() {
		showFontSizeModal ? closeFontSizeModal() : (showFontSizeModal = true);
	}

	function selectFontSize(level: FontSize) {
		fontSize.set(level);
		closeFontSizeModal();
	}

	function handleOutsideClick(event: MouseEvent) {
		if (
			showFontSizeModal &&
			modalRef &&
			!modalRef.contains(event.target as Node) &&
			buttonRef &&
			!buttonRef.contains(event.target as Node)
		) {
			closeFontSizeModal();
		}
	}

	// ESC 키로 모달 닫기 (접근성 필수)
	function handleKeyDown(event: KeyboardEvent) {
		if (showFontSizeModal && event.key === 'Escape') {
			event.stopPropagation(); // 다른 ESC 핸들러로 전파 방지
			closeFontSizeModal();
		}
	}
</script>

<svelte:window onclick={handleOutsideClick} onkeydown={handleKeyDown} />

<div class="relative">
	<button
		type="button"
		bind:this={buttonRef}
		onclick={toggleFontSizeModal}
		class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
		aria-label="글자 크기 변경"
		aria-haspopup="dialog"
		aria-expanded={showFontSizeModal}
	>
		<span class="i-lucide-type h-4 w-4"></span>
	</button>

	<!-- 폰트 크기 모달 -->
	{#if showFontSizeModal}
		<div
			bind:this={modalRef}
			class="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg bg-popover p-2 shadow-lg"
			role="dialog"
			aria-modal="true"
			aria-label="글자 크기 선택"
		>
			<div class="mb-2 px-2 text-xs font-medium text-muted-foreground">
				글자 크기 (현재: {fontSize.current})
			</div>
			<div class="grid grid-cols-3 gap-1">
				{#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as const as level}
					<button
						type="button"
						onclick={() => selectFontSize(level)}
						class="inline-flex h-8 w-full items-center justify-center rounded-md text-sm transition-colors {fontSize.current ===
						level
							? 'bg-primary text-primary-foreground'
							: 'hover:bg-accent hover:text-accent-foreground'}"
						aria-pressed={fontSize.current === level}
					>
						{level}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
