<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  import DsFileUpload from "./FileUpload.svelte";
  import DsIconButton from "./IconButton.svelte";

  interface PreviewItem {
    file: File;
    url: string;
  }

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    files?: File[];
    onFilesChange?: (files: File[]) => void;
    label?: string;
    description?: string;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    maxSizeBytes?: number;
    disabled?: boolean;
  }

  let {
    files = $bindable<File[]>([]),
    onFilesChange,
    label = "Images",
    description = "Choose image files",
    accept = "image/*",
    multiple = true,
    maxFiles = 10,
    maxSizeBytes,
    disabled = false,
    class: className = "",
    ...rest
  }: Props = $props();

  const urlByFile = new Map<File, string>();

  function setFiles(next: File[]) {
    files = next;
    onFilesChange?.(next);
  }

  function removeFile(target: File) {
    setFiles(files.filter((f) => f !== target));
  }

  $effect(() => {
    // 새 파일 URL 생성
    for (const f of files) {
      if (!urlByFile.has(f)) {
        urlByFile.set(f, URL.createObjectURL(f));
      }
    }
    // 제거된 파일 URL 정리
    for (const [f, url] of urlByFile.entries()) {
      if (!files.includes(f)) {
        URL.revokeObjectURL(url);
        urlByFile.delete(f);
      }
    }
  });

  $effect(() => {
    return () => {
      for (const url of urlByFile.values()) URL.revokeObjectURL(url);
      urlByFile.clear();
    };
  });

  let previews = $derived<PreviewItem[]>(
    files.map((f) => ({ file: f, url: urlByFile.get(f) ?? "" })),
  );
</script>

<div {...rest} class={["ds-media-picker", className].filter(Boolean).join(" ")}>
  <DsFileUpload
    bind:files
    {accept}
    {multiple}
    {disabled}
    {maxFiles}
    {maxSizeBytes}
    {label}
    {description}
    showList={false}
    clearable={false}
    onFilesChange={(next) => setFiles(next)}
  />

  {#if previews.length}
    <div class="ds-media-grid" aria-label="Selected images">
      {#each previews as p (p.file.name + p.file.size)}
        <div class="ds-media-item">
          <img class="ds-media-thumb" src={p.url} alt={p.file.name} loading="lazy" />
          <div class="ds-media-remove">
            <DsIconButton
              icon="x"
              label="Remove image"
              size="sm"
              variant="ghost"
              intent="neutral"
              onclick={() => removeFile(p.file)}
            />
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

