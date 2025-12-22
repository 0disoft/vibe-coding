<script lang="ts">
  import { page } from "$app/state";

  import { DsLocaleSwitcher } from "$lib/components/design-system";
  import * as m from "$lib/paraglide/messages.js";
  import { getLocaleFromUrl, type Locale } from "$lib/shared/utils/locale";

  let currentLocale = $derived<Locale>(getLocaleFromUrl(page.url));
</script>

<DsLocaleSwitcher
  label={m.language_picker_label({}, { locale: currentLocale })}
  triggerTestId="header-language-picker"
  disableCurrent={false}
  searchPlaceholder={m.language_picker_search_placeholder({}, { locale: currentLocale })}
  emptyText={m.language_picker_empty({}, { locale: currentLocale })}
  announceMessage={(info) =>
    m.language_picker_changed({ language: info.selfName }, { locale: currentLocale })
  }
/>
