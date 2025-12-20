<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { tick } from "svelte";

	import { DsIconButton } from "$lib/components/design-system";

	import {
		addDays,
		addMonths,
		addYears,
		clampToMonthDay,
		formatIsoDate,
		isSameDay,
		isSameMonth,
		parseIsoDate,
		startOfMonth,
		startOfWeek,
		type WeekdayIndex,
	} from "./date-utils";

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		value?: string | null;
		onValueChange?: (next: string | null) => void;
		locale?: string;
		label?: string;
		disabled?: boolean;
		min?: string;
		max?: string;
		weekStartsOn?: WeekdayIndex;
		showOutsideDays?: boolean;
		isDateDisabled?: (iso: string) => boolean;
		prevMonthLabel?: string;
		nextMonthLabel?: string;
	}

	let {
		value = $bindable<string | null>(null),
		onValueChange,
		locale,
		label = "Calendar",
		disabled = false,
		min,
		max,
		weekStartsOn = 0,
		showOutsideDays = true,
		isDateDisabled,
		prevMonthLabel = "Previous month",
		nextMonthLabel = "Next month",
		class: className = "",
		...rest
	}: Props = $props();

	let root: HTMLDivElement | null = $state(null);

	let selectedDate = $derived(value ? parseIsoDate(value) : null);
	let today = $derived(new Date());

	const initialSelected = value ? parseIsoDate(value) : null;
	const initialBase = initialSelected ?? new Date();
	let view = $state<Date>(startOfMonth(initialBase));
	let focused = $state<Date>(initialSelected ?? initialBase);

	let lastSyncedSelectedIso = $state<string | null>(null);
	$effect(() => {
		const nextIso = selectedDate ? formatIsoDate(selectedDate) : null;
		if (nextIso === lastSyncedSelectedIso) return;
		lastSyncedSelectedIso = nextIso;

		if (!selectedDate) return;
		if (!isSameMonth(selectedDate, view)) {
			view = startOfMonth(selectedDate);
		}
		if (!isSameDay(selectedDate, focused)) {
			focused = selectedDate;
		}
	});

	let minDate = $derived(min ? parseIsoDate(min) : null);
	let maxDate = $derived(max ? parseIsoDate(max) : null);

	function setValue(next: string | null) {
		value = next;
		onValueChange?.(next);
	}

	function isDisabledDate(date: Date, iso: string) {
		if (disabled) return true;
		if (minDate && date < minDate) return true;
		if (maxDate && date > maxDate) return true;
		if (isDateDisabled?.(iso)) return true;
		return false;
	}

	function monthLabel(date: Date) {
		const fmt = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
		return fmt.format(date);
	}

	function weekdayLabels() {
		const base = startOfWeek(new Date(2025, 0, 5, 12, 0, 0, 0), weekStartsOn); // 일요일 포함한 기준 주
		const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
		return Array.from({ length: 7 }, (_, i) => fmt.format(addDays(base, i)));
	}

	function dayAriaLabel(date: Date) {
		const fmt = new Intl.DateTimeFormat(locale, {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
		return fmt.format(date);
	}

	function focusIso(iso: string) {
		if (!root) return;
		const el = root.querySelector<HTMLElement>(`[data-iso="${iso}"]`);
		el?.focus();
	}

	async function moveFocus(next: Date) {
		focused = next;
		if (!isSameMonth(focused, view)) view = startOfMonth(focused);
		await tick();
		focusIso(formatIsoDate(focused));
	}

	function onDayKeydown(e: KeyboardEvent, date: Date) {
		const key = e.key;
		if (key === "ArrowLeft") {
			e.preventDefault();
			moveFocus(addDays(date, -1));
			return;
		}
		if (key === "ArrowRight") {
			e.preventDefault();
			moveFocus(addDays(date, 1));
			return;
		}
		if (key === "ArrowUp") {
			e.preventDefault();
			moveFocus(addDays(date, -7));
			return;
		}
		if (key === "ArrowDown") {
			e.preventDefault();
			moveFocus(addDays(date, 7));
			return;
		}
		if (key === "Home") {
			e.preventDefault();
			moveFocus(addDays(date, -((date.getDay() - weekStartsOn + 7) % 7)));
			return;
		}
		if (key === "End") {
			e.preventDefault();
			moveFocus(addDays(date, 6 - ((date.getDay() - weekStartsOn + 7) % 7)));
			return;
		}
		if (key === "PageUp") {
			e.preventDefault();
			const base = e.shiftKey ? addYears(date, -1) : addMonths(date, -1);
			moveFocus(clampToMonthDay(base, date.getDate()));
			return;
		}
		if (key === "PageDown") {
			e.preventDefault();
			const base = e.shiftKey ? addYears(date, 1) : addMonths(date, 1);
			moveFocus(clampToMonthDay(base, date.getDate()));
			return;
		}
		if (key === " " || key === "Enter") {
			e.preventDefault();
			const iso = formatIsoDate(date);
			if (isDisabledDate(date, iso)) return;
			setValue(iso);
		}
	}

	function goMonth(delta: number) {
		const next = addMonths(view, delta);
		view = startOfMonth(next);
		focused = clampToMonthDay(next, focused.getDate());
	}

	let weekdays = $derived(weekdayLabels());
	let caption = $derived(monthLabel(view));

	let gridStart = $derived(startOfWeek(startOfMonth(view), weekStartsOn));
	let days = $derived(Array.from({ length: 42 }, (_, i) => addDays(gridStart, i)));

	let focusedIso = $derived(formatIsoDate(focused));
	let selectedIso = $derived(selectedDate ? formatIsoDate(selectedDate) : null);
	let todayIso = $derived(formatIsoDate(today));
</script>

<div
	{...rest}
	class={["ds-calendar", className].filter(Boolean).join(" ")}
	aria-label={label}
	bind:this={root}
>
	<div class="ds-calendar-header">
		<div
			class="ds-calendar-caption"
			data-testid="ds-calendar-caption"
			aria-live="polite"
			aria-atomic="true"
		>
			{caption}
		</div>
		<div class="ds-calendar-nav">
			<DsIconButton
				type="button"
				icon="chevron-left"
				size="sm"
				variant="ghost"
				intent="secondary"
				label={prevMonthLabel}
				onclick={() => goMonth(-1)}
			/>
			<DsIconButton
				type="button"
				icon="chevron-right"
				size="sm"
				variant="ghost"
				intent="secondary"
				label={nextMonthLabel}
				onclick={() => goMonth(1)}
			/>
		</div>
	</div>

	<table class="ds-calendar-table" role="grid" aria-label={label}>
		<thead>
			<tr>
				{#each weekdays as wd (wd)}
					<th class="ds-calendar-weekday" scope="col" role="columnheader">{wd}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each Array.from({ length: 6 }, (_, week) => week) as week}
				<tr>
					{#each days.slice(week * 7, week * 7 + 7) as day (formatIsoDate(day))}
						{#if showOutsideDays || isSameMonth(day, view)}
							{#key formatIsoDate(day)}
								{@const iso = formatIsoDate(day)}
								{@const outside = !isSameMonth(day, view)}
								{@const selected = selectedIso === iso}
								{@const isToday = todayIso === iso}
								{@const tabIndex = focusedIso === iso ? 0 : -1}
								{@const dayDisabled = isDisabledDate(day, iso) || (outside && !showOutsideDays)}
								<td class="ds-calendar-cell">
									<button
										type="button"
										class="ds-calendar-day ds-focus-ring"
										role="gridcell"
										data-iso={iso}
										data-outside={outside ? "true" : undefined}
										data-selected={selected ? "true" : undefined}
										data-today={isToday ? "true" : undefined}
										aria-label={dayAriaLabel(day)}
										aria-selected={selected ? "true" : "false"}
										aria-current={isToday ? "date" : undefined}
										aria-disabled={dayDisabled ? "true" : undefined}
										disabled={dayDisabled}
										tabindex={tabIndex}
										data-testid={`ds-calendar-day-${iso}`}
										onclick={() => {
											if (dayDisabled) return;
											setValue(iso);
											focused = day;
										}}
										onkeydown={(e) => onDayKeydown(e, day)}
									>
										{day.getDate()}
									</button>
								</td>
							{/key}
						{:else}
							<td class="ds-calendar-cell"></td>
						{/if}
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
