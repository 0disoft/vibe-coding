export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function pad2(n: number) {
	return String(n).padStart(2, '0');
}

export function isIsoDate(value: string): boolean {
	return ISO_DATE_RE.test(value);
}

export function parseIsoDate(value: string): Date | null {
	if (!isIsoDate(value)) return null;
	const [y, m, d] = value.split('-').map(Number);
	if (!y || !m || !d) return null;
	// DST 경계에서도 안전하게 "날짜"로만 취급하기 위해 정오로 고정
	const date = new Date(y, m - 1, d, 12, 0, 0, 0);
	// 유효하지 않은 날짜(예: 2025-02-30) 방어
	if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
	return date;
}

export function formatIsoDate(date: Date): string {
	return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function startOfMonth(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0, 0);
}

export function addDays(date: Date, days: number): Date {
	const next = new Date(date);
	next.setDate(next.getDate() + days);
	return next;
}

export function addMonths(date: Date, months: number): Date {
	// JS Date의 setMonth는 1/31 + 1month = 3/3처럼 오버플로가 발생할 수 있어
	// "목표 월"을 먼저 만들고, day-of-month는 clamp 해서 유지합니다.
	const target = new Date(date.getFullYear(), date.getMonth() + months, 1, 12, 0, 0, 0);
	return clampToMonthDay(target, date.getDate());
}

export function addYears(date: Date, years: number): Date {
	const target = new Date(date.getFullYear() + years, date.getMonth(), 1, 12, 0, 0, 0);
	return clampToMonthDay(target, date.getDate());
}

export function isSameDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

export function isSameMonth(a: Date, b: Date): boolean {
	return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function isDateDisabled(date: Date, min?: Date | null, max?: Date | null): boolean {
	if (min && date < min && !isSameDay(date, min)) return true;
	if (max && date > max && !isSameDay(date, max)) return true;
	return false;
}

export function startOfWeek(date: Date, weekStartsOn: WeekdayIndex): Date {
	const weekday = date.getDay();
	const delta = (weekday - weekStartsOn + 7) % 7;
	return addDays(date, -delta);
}

export function getCalendarGrid(monthDate: Date, weekStartsOn: WeekdayIndex = 0): Date[] {
	const monthStart = startOfMonth(monthDate);
	const startDate = startOfWeek(monthStart, weekStartsOn);
	return Array.from({ length: 42 }, (_, i) => addDays(startDate, i));
}

export function getWeekdayNames(
	locale: string | undefined,
	weekStartsOn: WeekdayIndex = 0,
	format: 'short' | 'narrow' | 'long' = 'short',
): string[] {
	const base = startOfWeek(new Date(2025, 0, 5, 12, 0, 0, 0), weekStartsOn);
	const formatter = new Intl.DateTimeFormat(locale, { weekday: format });
	return Array.from({ length: 7 }, (_, i) => formatter.format(addDays(base, i)));
}

export function clampToMonthDay(target: Date, preferredDay: number): Date {
	const y = target.getFullYear();
	const m = target.getMonth();
	const end = new Date(y, m + 1, 0, 12, 0, 0, 0).getDate();
	const day = Math.max(1, Math.min(end, preferredDay));
	return new Date(y, m, day, 12, 0, 0, 0);
}
