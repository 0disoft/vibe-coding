<script lang="ts">
	import { untrack } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import DsDropdown from "./Dropdown.svelte";
	import DsDropdownItem from "./DropdownItem.svelte";
	import DsEditorImagesButton from "./EditorImagesButton.svelte";
	import DsIcon from "./Icon.svelte";
	import DsIconButton from "./IconButton.svelte";
	import DsSelect from "./Select.svelte";

	export type EditorBlockType = "paragraph" | "h2" | "h3";
	export type EditorCommand =
		| "bold"
		| "italic"
		| "link"
		| "bulletList"
		| "orderedList"
		| "codeBlock"
		| "insertImages"
		| "blockquote"
		| "callout"
		| "clearFormatting";

	type ActiveState = Partial<Record<EditorCommand, boolean>>;
	type DisabledState = Partial<Record<EditorCommand, boolean>>;

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		/** 블록 타입 (controlled) */
		blockType?: EditorBlockType;
		onBlockTypeChange?: (next: EditorBlockType) => void;
		defaultBlockType?: EditorBlockType;

		/** 버튼 active/disabled 상태 */
		active?: ActiveState;
		disabled?: DisabledState;

		/** 버튼 클릭 시 호출 */
		onCommand?: (cmd: EditorCommand, detail?: unknown) => void;

		blockLabel?: string;
		labels?: Partial<Record<EditorCommand, string>>;

		/** 이미지 삽입 팝오버 */
		imageLabel?: string;
		imageAccept?: string;
		imageMultiple?: boolean;
		imageMaxFiles?: number;
		imageMaxSizeBytes?: number;
		imageInsertLabel?: string;
		imageCancelLabel?: string;
	}

	let {
		defaultBlockType = "paragraph",
		blockType = $bindable<EditorBlockType>(defaultBlockType),
		onBlockTypeChange,
		active = {},
		disabled = {},
		onCommand,
		blockLabel = "Block type",
		labels = {},
		imageLabel = "Insert images",
		imageAccept = "image/*",
		imageMultiple = true,
		imageMaxFiles = 10,
		imageMaxSizeBytes,
		imageInsertLabel = "Insert",
		imageCancelLabel = "Cancel",
		class: className = "",
		...rest
	}: Props = $props();

	let selectValue = $state(blockType);

	$effect(() => {
		const sv = selectValue;
		untrack(() => {
			if (sv !== blockType) handleBlockChange(sv);
		});
	});

	$effect(() => {
		const bt = blockType;
		untrack(() => {
			if (selectValue !== bt) selectValue = bt;
		});
	});

	const blockOptions = [
		{ value: "paragraph", label: "Text" },
		{ value: "h2", label: "Heading 2" },
		{ value: "h3", label: "Heading 3" },
	] as const;

	function cmdLabel(cmd: EditorCommand) {
		return (
			labels[cmd] ??
			(
				{
					bold: "Bold",
					italic: "Italic",
					link: "Link",
					bulletList: "Bulleted list",
					orderedList: "Numbered list",
					codeBlock: "Code block",
					insertImages: "Insert images",
					blockquote: "Blockquote",
					callout: "Callout",
					clearFormatting: "Clear formatting",
				} satisfies Record<EditorCommand, string>
			)[cmd]
		);
	}

	function isPressed(cmd: EditorCommand) {
		return Boolean(active?.[cmd]);
	}

	function isDisabled(cmd: EditorCommand) {
		return Boolean(disabled?.[cmd]);
	}

	const simpleCommands = [
		{ cmd: "bold", icon: "bold", label: "Bold" },
		{ cmd: "italic", icon: "italic", label: "Italic" },
		{ cmd: "link", icon: "link", label: "Link" },
		{ separator: true },
		{ cmd: "bulletList", icon: "list", label: "Bulleted list" },
		{ cmd: "orderedList", icon: "list-ordered", label: "Numbered list" },
		{ cmd: "codeBlock", icon: "code", label: "Code block" },
	] as const;

	function handleInsertImages(files: File[]) {
		onCommand?.("insertImages", { files });
	}

	function handleBlockChange(next: string) {
		blockType = next as EditorBlockType;
		onBlockTypeChange?.(blockType);
	}
</script>

<div
	{...rest}
	class={["ds-editor-toolbar", className].filter(Boolean).join(" ")}
>
	<div class="ds-editor-toolbar-left">
		<div class="ds-editor-toolbar-block">
			<span class="sr-only">{blockLabel}</span>
			<DsSelect
				options={blockOptions.map((o) => ({ value: o.value, label: o.label }))}
				bind:value={selectValue}
			/>
		</div>

		<div
			class="ds-editor-toolbar-buttons"
			role="toolbar"
			aria-label="Editor toolbar"
		>
			{#each simpleCommands as item}
				{#if "separator" in item}
					<div class="ds-editor-toolbar-sep" aria-hidden="true"></div>
				{:else}
					<DsIconButton
						icon={item.icon}
						label={cmdLabel(item.cmd)}
						size="sm"
						variant="ghost"
						intent="neutral"
						pressed={isPressed(item.cmd)}
						disabled={isDisabled(item.cmd)}
						onclick={() => onCommand?.(item.cmd)}
					/>
				{/if}
			{/each}

			<DsEditorImagesButton
				disabled={isDisabled("insertImages")}
				label={cmdLabel("insertImages")}
				accept={imageAccept}
				multiple={imageMultiple}
				maxFiles={imageMaxFiles}
				maxSizeBytes={imageMaxSizeBytes}
				insertLabel={imageInsertLabel}
				cancelLabel={imageCancelLabel}
				onInsert={handleInsertImages}
			/>

			<DsDropdown align="start">
				{#snippet trigger(props)}
					<DsIconButton
						{...props}
						icon="quote"
						label="Quote / Callout"
						size="sm"
						variant="ghost"
						intent="neutral"
						pressed={isPressed("blockquote") || isPressed("callout")}
						disabled={isDisabled("blockquote") && isDisabled("callout")}
					/>
				{/snippet}

				{#snippet children({ close })}
					<DsDropdownItem
						type="button"
						disabled={isDisabled("blockquote")}
						onclick={() => {
							onCommand?.("blockquote");
							close();
						}}
					>
						{#snippet children()}
							<span class="inline-flex items-center gap-2">
								<span class="inline-flex h-4 w-4 items-center justify-center">
									{#if isPressed("blockquote")}
										<DsIcon name="check" size="sm" />
									{/if}
								</span>
								{cmdLabel("blockquote")}
							</span>
						{/snippet}
					</DsDropdownItem>

					<DsDropdownItem
						type="button"
						disabled={isDisabled("callout")}
						onclick={() => {
							onCommand?.("callout");
							close();
						}}
					>
						{#snippet children()}
							<span class="inline-flex items-center gap-2">
								<span class="inline-flex h-4 w-4 items-center justify-center">
									{#if isPressed("callout")}
										<DsIcon name="check" size="sm" />
									{/if}
								</span>
								{cmdLabel("callout")}
							</span>
						{/snippet}
					</DsDropdownItem>
				{/snippet}
			</DsDropdown>

			<DsIconButton
				icon="remove-formatting"
				label={cmdLabel("clearFormatting")}
				size="sm"
				variant="ghost"
				intent="neutral"
				pressed={isPressed("clearFormatting")}
				disabled={isDisabled("clearFormatting")}
				onclick={() => onCommand?.("clearFormatting")}
			/>
		</div>
	</div>
</div>
