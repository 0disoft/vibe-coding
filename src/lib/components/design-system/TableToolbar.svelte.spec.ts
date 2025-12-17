import { afterEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";

import DsTableToolbar from "$lib/components/design-system/TableToolbar.svelte";

let unmount: (() => void) | undefined;

afterEach(() => {
	unmount?.();
	unmount = undefined;
});

describe("DsTableToolbar", () => {
	it("검색 입력이 존재하고 onQueryChange가 호출되어야 한다", async () => {
		const onQueryChange = vi.fn();
		const result = render(DsTableToolbar, {
			title: "Users",
			query: "",
			onQueryChange,
			placeholder: "Search users",
		});
		unmount = result.unmount;

		const input = page.getByPlaceholder("Search users");
		await input.click();
		await input.fill("abc");
		expect(onQueryChange).toHaveBeenCalled();
	});
});

