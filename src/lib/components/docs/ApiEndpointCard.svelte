<script lang="ts">
  import type { Snippet } from "svelte";

  import { DsBadge, DsButton, DsCard, DsDropdown, DsDropdownItem } from "$lib/components/design-system";

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
    children?: Snippet;
  }

  let { method, path, description, examples = [], children }: Props = $props();

  function methodIntent(m: HttpMethod) {
    if (m === "GET") return "secondary";
    if (m === "POST") return "primary";
    if (m === "DELETE") return "danger";
    return "warning";
  }
</script>

<DsCard class="space-y-4">
  <div class="flex flex-wrap items-center gap-2">
    <DsBadge intent={methodIntent(method)} variant="solid" size="sm">{method}</DsBadge>
    <code class="text-code">{path}</code>
  </div>

  {#if description}
    <p class="text-body-secondary text-muted-foreground">{description}</p>
  {/if}

  {#if examples.length}
    <DsDropdown align="end" menuClass="w-64" itemSelector='[role="menuitemradio"]'>
      {#snippet trigger(props)}
        <DsButton {...props} variant="outline" intent="secondary">
          예제 선택
        </DsButton>
      {/snippet}

      {#snippet children({ close })}
        {#each examples as ex (ex.label)}
          <DsDropdownItem
            role="menuitemradio"
            aria-checked={false}
            onclick={() => close()}
          >
            {ex.label}
          </DsDropdownItem>
        {/each}
      {/snippet}
    </DsDropdown>
  {/if}

  {#if children}
    <div class="pt-2">
      {@render children()}
    </div>
  {/if}
</DsCard>
