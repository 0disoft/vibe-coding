import { afterEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";

import DocsAnchoredHeading from "$lib/components/docs/DocsAnchoredHeading.svelte";

let unmount: (() => void) | undefined;

afterEach(() => {
  unmount?.();
  unmount = undefined;
});

describe("DocsAnchoredHeading", () => {
  it("링크 복사 버튼이 해시 URL을 clipboard에 기록해야 한다", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    try {
      const result = render(DocsAnchoredHeading, {
        id: "intro",
        level: 2,
        text: "Intro",
      });
      unmount = result.unmount;

      const link = page.getByRole("link", { name: /copy link/i });
      // Playwright click은 opacity:0 요소를 "not visible"로 판단하므로 DOM click을 사용
      (link.element() as HTMLElement).click();

      expect(writeText).toHaveBeenCalled();
      const arg = writeText.mock.calls[0]?.[0] as string;
      expect(arg).toContain("#intro");
    } finally {
      Object.defineProperty(navigator, "clipboard", {
        value: originalClipboard,
        configurable: true,
      });
    }
  });
});
