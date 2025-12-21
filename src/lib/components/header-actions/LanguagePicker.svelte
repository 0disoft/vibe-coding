<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";

  import { DsLocaleSwitcher } from "$lib/components/design-system";
</script>

<DsLocaleSwitcher
  label={m.language_picker_label()}
  triggerTestId="header-language-picker"
  disableCurrent={false}
  searchPlaceholder={m.language_picker_search_placeholder()}
  emptyText={m.language_picker_empty()}
  announceMessage={(info) =>
    m.language_picker_changed({ language: info.selfName })
  }
/>
