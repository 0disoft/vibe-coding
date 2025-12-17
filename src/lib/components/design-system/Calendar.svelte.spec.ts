import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";

import CalendarTestHost from "$lib/components/design-system/__test__/CalendarTestHost.svelte";

let unmount: (() => void) | undefined;

afterEach(() => {
	unmount?.();
	unmount = undefined;
});

function dispatchKey(el: Element, key: string, shiftKey = false) {
	el.dispatchEvent(new KeyboardEvent("keydown", { key, shiftKey, bubbles: true }));
}

describe("DsCalendar", () => {
	it("선택 상태가 aria-selected와 값에 반영되어야 한다", async () => {
		const result = render(CalendarTestHost, { initial: "2025-01-15" });
		unmount = result.unmount;

		const selected = page.getByTestId("ds-calendar-day-2025-01-15");
		await expect.element(selected).toHaveAttribute("aria-selected", "true");

		await page.getByTestId("ds-calendar-day-2025-01-16").click();
		await expect.element(page.getByTestId("calendar-value")).toHaveTextContent("2025-01-16");
	});

	it("Arrow/Enter로 포커스 이동 및 선택이 가능해야 한다", async () => {
		const result = render(CalendarTestHost, { initial: "2025-01-15" });
		unmount = result.unmount;

		const start = page.getByTestId("ds-calendar-day-2025-01-15");
		start.element().focus();
		await expect.element(start).toHaveFocus();

		dispatchKey(start.element(), "ArrowRight");
		await expect.element(page.getByTestId("ds-calendar-day-2025-01-16")).toHaveFocus();

		dispatchKey(page.getByTestId("ds-calendar-day-2025-01-16").element(), "Enter");
		await expect.element(page.getByTestId("calendar-value")).toHaveTextContent("2025-01-16");
	});

	it("PageDown으로 월 이동이 가능해야 한다", async () => {
		const result = render(CalendarTestHost, { initial: "2025-01-31" });
		unmount = result.unmount;

		const start = page.getByTestId("ds-calendar-day-2025-01-31");
		start.element().focus();

		dispatchKey(start.element(), "PageDown");
		await expect.element(page.getByTestId("ds-calendar-caption")).toHaveTextContent("February 2025");
	});

	it("min/max 범위 밖 날짜는 disabled여야 한다", async () => {
		const result = render(CalendarTestHost, {
			initial: "2025-01-15",
			min: "2025-01-10",
			max: "2025-01-20",
		});
		unmount = result.unmount;

		await expect.element(page.getByTestId("ds-calendar-day-2025-01-09")).toHaveAttribute(
			"disabled",
			"",
		);
		await expect.element(page.getByTestId("ds-calendar-day-2025-01-21")).toHaveAttribute(
			"disabled",
			"",
		);
	});
});

