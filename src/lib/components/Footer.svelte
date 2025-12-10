<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import { localizeUrl } from '$lib/paraglide/runtime.js';
  import FooterMenu from './footer-actions/FooterMenu.svelte';

  interface Props {
    siteName?: string;
  }

  let { siteName = 'Site' }: Props = $props();
  const currentYear = new Date().getFullYear();
</script>

<footer class="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div class="mx-auto flex h-12 max-w-5xl items-center justify-between gap-2 px-4 sm:gap-4 md:px-6">
    <small class="text-xs text-muted-foreground">
      &copy; {currentYear}
      {siteName}. {m.footer_rights()}
    </small>
    <div class="flex items-center gap-4">
      <nav aria-label="Footer navigation" class="flex gap-4 text-xs text-muted-foreground">
        <a
          href={localizeUrl('/terms').href}
          class="transition-colors hover:text-foreground hover:underline underline-offset-2"
          data-testid="footer-terms-link">{m.footer_terms()}</a
        >
        <a
          href={localizeUrl('/privacy').href}
          class="transition-colors hover:text-foreground hover:underline underline-offset-2"
          data-testid="footer-privacy-link">{m.footer_privacy()}</a
        >
        <a
          href={localizeUrl('/cookie').href}
          class="transition-colors hover:text-foreground hover:underline underline-offset-2"
          data-testid="footer-cookie-link">{m.footer_cookie_policy()}</a
        >
      </nav>
      <FooterMenu />
    </div>
  </div>
</footer>
