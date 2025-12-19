<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import DsAlert from "./Alert.svelte";
  import type { IntentWithNeutral } from "./types";

  type Role = "status" | "alert";

  interface Props extends Omit<HTMLAttributes<HTMLElement>, "children" | "role"> {
    intent?: IntentWithNeutral;
    title?: string;
    role?: Role;
    icon?: string | null;
    children?: Snippet;
  }

  let { intent = "neutral", title, role, icon, children, ...rest }: Props = $props();
</script>

<DsAlert {...rest} {intent} {title} {role} {icon}>
  {#if children}
    {@render children()}
  {/if}
</DsAlert>
