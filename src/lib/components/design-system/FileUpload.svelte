<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import { tick } from "svelte";

	import { DsButton, DsIconButton } from "$lib/components/design-system";
	import { dedupeFiles, fileKey, formatBytes } from "./file-utils";

	type FileError = { key: string; message: string };

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		files?: File[];
		onFilesChange?: (files: File[]) => void;
		label?: string;
		description?: string;
		accept?: string;
		multiple?: boolean;
		disabled?: boolean;
		required?: boolean;
		name?: string;
		maxFiles?: number;
		maxSizeBytes?: number;
		showList?: boolean;
		clearable?: boolean;
	}

	let {
		files = $bindable<File[]>([]),
		onFilesChange,
		label = "Upload files",
		description = "Drag & drop, or choose files",
		accept,
		multiple = true,
		disabled = false,
		required = false,
		name,
		maxFiles = 10,
		maxSizeBytes,
		showList = true,
		clearable = true,
		class: className = "",
		...rest
	}: Props = $props();

	const generatedId = $props.id();
	let inputId = $derived(rest.id ?? generatedId);
	let helpId = $derived(`${inputId}__help`);
	let errorId = $derived(`${inputId}__error`);

	let inputEl = $state<HTMLInputElement | null>(null);
	let isDragActive = $state(false);
	let errors = $state<FileError[]>([]);
	let dragDepth = $state(0);

	function setFiles(next: File[]) {
		files = next;
		onFilesChange?.(next);
	}

	function resetInputValue() {
		// 같은 파일을 다시 선택해도 change가 발생하도록 value 초기화
		if (!inputEl) return;
		inputEl.value = "";
	}

	function validate(next: File[]): FileError[] {
		const nextErrors: FileError[] = [];

		if (maxFiles && next.length > maxFiles) {
			nextErrors.push({
				key: "__maxFiles__",
				message: `최대 ${maxFiles}개까지 업로드할 수 있습니다.`,
			});
		}

		if (maxSizeBytes) {
			for (const f of next) {
				if (f.size > maxSizeBytes) {
					nextErrors.push({
						key: fileKey(f),
						message: `${f.name}: 파일 크기가 너무 큽니다 (${formatBytes(f.size)} > ${formatBytes(maxSizeBytes)})`,
					});
				}
			}
		}

		return nextErrors;
	}

	function addFiles(nextFiles: File[]) {
		if (disabled) return;
		const merged = dedupeFiles([...files, ...nextFiles]);
		const next = maxFiles ? merged.slice(0, maxFiles) : merged;
		errors = validate(next);
		setFiles(next);
		resetInputValue();
	}

	function onInputChange(e: Event) {
		const list = (e.target as HTMLInputElement | null)?.files;
		if (!list) return;
		addFiles(Array.from(list));
	}

	function onDrop(e: DragEvent) {
		if (disabled) return;
		e.preventDefault();
		e.stopPropagation();
		isDragActive = false;
		dragDepth = 0;

		const list = e.dataTransfer?.files;
		if (!list || list.length === 0) return;
		addFiles(Array.from(list));
	}

	function onDragOver(e: DragEvent) {
		if (disabled) return;
		e.preventDefault();
		e.stopPropagation();
		isDragActive = true;
	}

	function onDragEnter(e: DragEvent) {
		if (disabled) return;
		e.preventDefault();
		e.stopPropagation();
		dragDepth += 1;
		isDragActive = true;
	}

	function onDragLeave(e: DragEvent) {
		if (disabled) return;
		e.preventDefault();
		e.stopPropagation();
		dragDepth = Math.max(0, dragDepth - 1);
		if (dragDepth === 0) isDragActive = false;
	}

	async function openPicker() {
		if (disabled) return;
		await tick();
		inputEl?.click();
	}

	function removeFile(key: string) {
		const next = files.filter((f) => fileKey(f) !== key);
		errors = validate(next);
		setFiles(next);
	}

	function clearAll() {
		errors = [];
		setFiles([]);
		resetInputValue();
	}

	let describedBy = $derived(
		[rest["aria-describedby"], helpId, errors.length ? errorId : ""]
			.filter(Boolean)
			.join(" "),
	);
</script>

<div {...rest} class={["ds-file-upload", className].filter(Boolean).join(" ")}>
	<input
		bind:this={inputEl}
		id={inputId}
		class="sr-only"
		tabindex="-1"
		type="file"
		{name}
		{accept}
		{multiple}
		{disabled}
		{required}
		aria-label={label}
		aria-describedby={describedBy}
		onchange={onInputChange}
	/>

	<div
		class="ds-file-dropzone ds-focus-ring"
		role="button"
		tabindex={disabled ? -1 : 0}
		aria-disabled={disabled ? "true" : undefined}
		aria-describedby={describedBy}
		data-active={isDragActive ? "true" : undefined}
		onclick={(e) => {
			const target = e.target as HTMLElement | null;
			if (target?.closest(".ds-file-dropzone-actions")) return;
			openPicker();
		}}
		onkeydown={(e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				openPicker();
			}
		}}
		ondrop={onDrop}
		ondragover={onDragOver}
		ondragenter={onDragEnter}
		ondragleave={onDragLeave}
	>
		<div class="ds-file-dropzone-main">
			<div class="ds-file-dropzone-title">{label}</div>
			<div class="ds-file-dropzone-desc">{description}</div>
			<div class="ds-file-dropzone-meta" id={helpId}>
				<span>Accept: {accept ?? "any"}</span>
				<span>•</span>
				<span>Max files: {maxFiles}</span>
				{#if maxSizeBytes}
					<span>•</span>
					<span>Max size: {formatBytes(maxSizeBytes)}</span>
				{/if}
			</div>
		</div>

		<div class="ds-file-dropzone-actions">
			<DsButton
				size="sm"
				variant="outline"
				intent="secondary"
				{disabled}
				onclick={(e) => {
					e.stopPropagation();
					openPicker();
				}}
			>
				Choose files
			</DsButton>
			{#if clearable}
				<DsButton
					size="sm"
					variant="ghost"
					intent="secondary"
					disabled={disabled || files.length === 0}
					aria-disabled={disabled || files.length === 0 ? "true" : undefined}
					onclick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						if (files.length === 0) return;
						clearAll();
					}}
				>
					Clear
				</DsButton>
			{/if}
		</div>
	</div>

	{#if errors.length}
		<div id={errorId} class="ds-file-errors" role="alert">
			{#each errors as err (err.key)}
				<div class="ds-file-error">{err.message}</div>
			{/each}
		</div>
	{/if}

	{#if showList}
		<div class="ds-file-list">
			{#if files.length === 0}
				<div class="ds-file-empty text-helper text-muted-foreground">
					No files selected.
				</div>
			{:else}
				{#each files as f (fileKey(f))}
					<div class="ds-file-item">
						<div class="ds-file-item-main">
							<div class="ds-file-name">{f.name}</div>
							<div class="ds-file-meta text-helper text-muted-foreground">
								{formatBytes(f.size)}
							</div>
						</div>
						<div class="ds-file-item-actions">
							<DsIconButton
								type="button"
								icon="x"
								label={`Remove ${f.name}`}
								size="sm"
								variant="ghost"
								intent="secondary"
								{disabled}
								onclick={() => removeFile(fileKey(f))}
							/>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	{/if}
</div>
