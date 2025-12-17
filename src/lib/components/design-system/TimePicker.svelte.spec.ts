import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";

import TimePickerTestHost from "$lib/components/design-system/__test__/TimePickerTestHost.svelte";

let unmount: (() => void) | undefined;

afterEach(() => {
	unmount?.();
	unmount = undefined;
});

function dispatchKey(el: Element, key: string) {
	el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
}

describe("DsTimePicker", () => {
	it("입력값이 바인딩되어야 한다", async () => {
		const result = render(TimePickerTestHost, { initial: "09:30" });
		unmount = result.unmount;

		const input = page.getByPlaceholder("Select time");
		await input.click();
		await input.fill("10:30");
		await expect.element(page.getByTestId("time-picker-value")).toHaveTextContent("10:30");
	});

	it("Escape로 clearable 입력을 비울 수 있어야 한다", async () => {
		const result = render(TimePickerTestHost, { initial: "09:30" });
		unmount = result.unmount;

		const input = page.getByPlaceholder("Select time");
		await input.click();
		dispatchKey(input.element(), "Escape");
		await expect.element(page.getByTestId("time-picker-value")).toHaveTextContent("");
	});
});

