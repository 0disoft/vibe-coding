<script lang="ts">
  import { DsCard, DsDataTable } from "$lib/components/design-system";

  import { onMount } from "svelte";

  const typographyTokenKeys = [
    "h1",
    "h2",
    "h3",
    "h4",
    "body",
    "body-secondary",
    "comment",
    "prose",
    "menu-lg",
    "menu",
    "menu-sm",
    "btn-lg",
    "btn",
    "btn-sm",
    "label",
    "placeholder",
    "helper",
    "caption",
    "xs-resp",
    "badge",
    "tag",
    "tooltip",
    "toast",
    "breadcrumb",
    "logo",
    "brand",
    "stat",
    "price",
    "timestamp",
    "code",
    "inline-code",
  ] as const;

  type TypographyTokenKey = (typeof typographyTokenKeys)[number];

  let typographyTokenValues = $state<Record<TypographyTokenKey, string>>(
    Object.fromEntries(typographyTokenKeys.map((k) => [k, "—"])) as Record<
      TypographyTokenKey,
      string
    >,
  );

  function readTypographyTokens() {
    const style = getComputedStyle(document.documentElement);
    const next = {} as Record<TypographyTokenKey, string>;

    for (const key of typographyTokenKeys) {
      const cssVar = `--font-size-${key}`;
      next[key] = style.getPropertyValue(cssVar).trim() || "—";
    }

    typographyTokenValues = next;
  }

  function t(key: TypographyTokenKey) {
    return typographyTokenValues[key] ?? "—";
  }

  onMount(() => {
    readTypographyTokens();

    const observer = new MutationObserver(() => {
      readTypographyTokens();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-font-size"],
    });

    return () => observer.disconnect();
  });
</script>

<section id="tokens" class="space-y-4">
  <h2 class="text-h2 font-semibold">Tokens</h2>
  <DsCard class="space-y-4">
    <p class="text-body-secondary text-muted-foreground">
      타이포그래피 토큰(`--font-size-*`)과 DS 클래스(`text-*`)를 한 번에 확인합니다.
    </p>
    <DsDataTable
      columns={[
        { id: "token", header: "Token", sortable: true },
        { id: "value", header: "Value", sortable: true },
        { id: "sample", header: "Sample", sortable: false },
      ]}
      rows={typographyTokenKeys.map((k) => ({ token: k, value: t(k) }))}
      getValue={(row, id) => row?.[id]}
    >
      {#snippet cell({ row, columnId, value })}
        {#if columnId === "token"}
          <code class="text-code">text-{String(value ?? "")}</code>
        {:else if columnId === "value"}
          <code class="text-code">{String(value ?? "—")}</code>
        {:else}
          <span class={`text-${row.token}`}>Aa Typography</span>
        {/if}
      {/snippet}
    </DsDataTable>
  </DsCard>
</section>

