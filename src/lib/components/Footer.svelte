<script lang="ts">
  import { page } from '$app/state';
  import * as m from '$lib/paraglide/messages.js';
  import { localizeUrl } from '$lib/paraglide/runtime.js';
  import { getLocaleFromUrl, type Locale } from '$lib/shared/utils/locale';
  import FooterMenu from './footer-actions/FooterMenu.svelte';

  interface Props {
    siteName?: string;
  }

  let { siteName = 'Site' }: Props = $props();
  const currentYear = new Date().getFullYear();
  let currentLocale = $derived<Locale>(getLocaleFromUrl(page.url));
</script>

<footer class="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div class="mx-auto flex h-12 max-w-5xl items-center justify-between gap-2 px-4 sm:gap-4 md:px-6">
    <small class="ds-no-select text-xs-resp text-muted-foreground">
      &copy; {currentYear}
      {siteName}. {m.footer_rights({}, { locale: currentLocale })}
    </small>
    <div class="flex items-center gap-4">
      <nav
        aria-label={m.footer_nav_label({}, { locale: currentLocale })}
        class="ds-no-select hidden gap-4 text-xs-resp text-muted-foreground sm:flex"
      >
        <a
          href={localizeUrl('/terms', { locale: currentLocale }).href}
          class="transition-colors hover:text-foreground hover:underline underline-offset-2"
          data-testid="footer-terms-link">{m.footer_terms({}, { locale: currentLocale })}</a
        >
        <a
          href={localizeUrl('/privacy', { locale: currentLocale }).href}
          class="transition-colors hover:text-foreground hover:underline underline-offset-2"
          data-testid="footer-privacy-link">{m.footer_privacy({}, { locale: currentLocale })}</a
        >
        <a
          href={localizeUrl('/cookie', { locale: currentLocale }).href}
          class="transition-colors hover:text-foreground hover:underline underline-offset-2"
          data-testid="footer-cookie-link">{m.footer_cookie_policy({}, { locale: currentLocale })}</a
        >
      </nav>
      <FooterMenu />
    </div>
  </div>
</footer>
