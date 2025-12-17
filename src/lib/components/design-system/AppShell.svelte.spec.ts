import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";

import AppShellTestHost from "$lib/components/design-system/__test__/AppShellTestHost.svelte";

let unmount: (() => void) | undefined;

afterEach(() => {
	unmount?.();
	unmount = undefined;
});

describe("DsAppShell", () => {
	it("타이틀이 렌더링되어야 한다", async () => {
		const result = render(AppShellTestHost);
		unmount = result.unmount;

		await expect.element(page.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
	});
});

