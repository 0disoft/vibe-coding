<script lang="ts">
  import type { Snippet } from "svelte";

  import CodeBlock from "$lib/components/CodeBlock.svelte";
  import {
    DsBadge,
    DsButton,
    DsCard,
    DsCopyButton,
    DsDropdown,
    DsDropdownItem
  } from "$lib/components/design-system";

  type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

  export type ApiExample = {
    label: string;
    language: string;
    code: string;
  };

  interface Props {
    method: HttpMethod;
    path: string;
    description?: string;
    examples?: ApiExample[];
    onExampleSelect?: (index: number) => void;
    children?: Snippet;
  }

  let {
    method,
    path,
    description,
    examples = [],
    onExampleSelect,
    children
  }: Props = $props();

  let activeExampleIndex = $state(0);

  $effect(() => {
    if (activeExampleIndex >= examples.length) activeExampleIndex = 0;
  });

  function methodIntent(m: HttpMethod) {
    if (m === "GET") return "secondary";
    if (m === "POST") return "primary";
    if (m === "DELETE") return "danger";
    return "warning";
  }

  function selectExample(index: number) {
    activeExampleIndex = index;
    onExampleSelect?.(index);
  }

  let activeExample = $derived(examples[activeExampleIndex] ?? null);
  let exampleLabel = $derived(activeExample?.label ?? "예제 선택");
</script>

<DsCard class="space-y-4">
  <div class="flex flex-wrap items-center gap-2">
    <DsBadge intent={methodIntent(method)} variant="solid" size="sm">{method}</DsBadge>
    <code class="text-code">{path}</code>
    <DsCopyButton
      size="sm"
      variant="ghost"
      intent="neutral"
      icon="copy"
      copiedIcon="check"
      label="Copy path"
      copiedLabel="Copied"
      text={path}
    />
  </div>

  {#if description}
    <p class="text-body-secondary text-muted-foreground">{description}</p>
  {/if}

  {#if examples.length}
    <DsDropdown align="start" menuClass="w-64" itemSelector='[role="menuitemradio"]'>
      {#snippet trigger(props)}
        <DsButton {...props} variant="outline" intent="secondary">
          {exampleLabel}
        </DsButton>
      {/snippet}

      {#snippet children({ close })}
        {#each examples as ex, index (ex.label)}
          <DsDropdownItem
            role="menuitemradio"
            aria-checked={index === activeExampleIndex}
            onclick={() => {
              selectExample(index);
              close();
            }}
          >
            {ex.label}
          </DsDropdownItem>
        {/each}
      {/snippet}
    </DsDropdown>
  {/if}

  {#if activeExample}
    <CodeBlock code={activeExample.code} language={activeExample.language} />
  {/if}

  {#if children}
    <div class="pt-2">
      {@render children()}
    </div>
  {/if}
</DsCard>
