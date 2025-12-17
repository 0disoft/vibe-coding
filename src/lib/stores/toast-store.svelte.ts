import type { ToastItem, ToastOptions, ToastUpdate } from './toast.types';

/** 최소 duration (ms) */
const MIN_DURATION = 1000;

/** 동시에 표시할 최대 토스트 개수 */
const MAX_TOASTS = 5;

type TimerState = {
	timeoutId?: ReturnType<typeof setTimeout>;
	startedAt: number;
	remaining: number;
};

type ToastDescriptor<T> =
	| string
	| ((input: T) => string | { title: string; options?: ToastOptions; resetTimer?: boolean })
	| { title: string; options?: ToastOptions; resetTimer?: boolean };

function normalizeDuration(input: number | undefined) {
	let duration = input ?? 3000;
	if (duration === Infinity) return Infinity;
	if (!Number.isFinite(duration) || duration < MIN_DURATION) return MIN_DURATION;
	return duration;
}

function normalizeDescriptor<T>(
	desc: ToastDescriptor<T>,
	input: T
): { title: string; options?: ToastOptions; resetTimer?: boolean } {
	const value = typeof desc === 'function' ? desc(input) : desc;
	if (typeof value === 'string') return { title: value };
	return value;
}

export class ToastStore {
	toasts = $state<ToastItem[]>([]);
	private timerStates = new Map<string, TimerState>();
	private paused = $state(false);

	private ensureCapacity() {
		while (this.toasts.length >= MAX_TOASTS) {
			const oldest = this.toasts[0];
			if (!oldest) break;
			this.dismiss(oldest.id);
		}
	}

	private clearTimer(id: string) {
		const state = this.timerStates.get(id);
		if (!state?.timeoutId) return;
		clearTimeout(state.timeoutId);
		state.timeoutId = undefined;
	}

	private scheduleTimer(id: string, duration: number) {
		if (duration === Infinity) return;
		const now = Date.now();
		const remaining = Math.max(MIN_DURATION, duration);
		const state: TimerState = { startedAt: now, remaining };
		this.timerStates.set(id, state);

		if (this.paused) return;

		state.timeoutId = setTimeout(() => {
			this.dismiss(id);
		}, remaining);
	}

	private rescheduleTimer(id: string, duration: number) {
		this.clearTimer(id);
		this.timerStates.delete(id);
		this.scheduleTimer(id, duration);
	}

	private pauseTimer(id: string) {
		const state = this.timerStates.get(id);
		if (!state?.timeoutId) return;
		const now = Date.now();
		this.clearTimer(id);
		state.remaining = Math.max(0, state.remaining - (now - state.startedAt));
	}

	private resumeTimer(id: string) {
		const state = this.timerStates.get(id);
		if (!state) return;
		if (state.timeoutId) return;
		if (state.remaining <= 0) {
			this.dismiss(id);
			return;
		}
		state.startedAt = Date.now();
		state.timeoutId = setTimeout(() => {
			this.dismiss(id);
		}, state.remaining);
	}

	private upsert(title: string, options?: ToastOptions) {
		const duration = normalizeDuration(options?.duration);
		const key = options?.key?.trim() || undefined;

		if (key) {
			const existingIndex = this.toasts.findIndex((t) => t.key === key);
			if (existingIndex >= 0) {
				const existing = this.toasts[existingIndex];
				if (!existing) return existingIndex;

				const nextToast: ToastItem = {
					...existing,
					key,
					title,
					message: options?.message,
					intent: options?.intent ?? existing.intent ?? 'neutral',
					duration,
					action: options?.action ?? existing.action,
					updatedAt: Date.now()
				};

				this.toasts[existingIndex] = nextToast;
				if (duration !== Infinity) this.rescheduleTimer(existing.id, duration);
				return existingIndex;
			}
		}

		this.ensureCapacity();

		const id = crypto.randomUUID();
		const now = Date.now();
		const newToast: ToastItem = {
			id,
			key,
			title,
			message: options?.message,
			intent: options?.intent ?? 'neutral',
			duration,
			action: options?.action,
			createdAt: now
		};

		this.toasts.push(newToast);
		if (newToast.duration !== Infinity) {
			this.scheduleTimer(id, newToast.duration ?? 3000);
		}

		return this.toasts.length - 1;
	}

	add(title: string, options?: ToastOptions) {
		const index = this.upsert(title, options);
		const id = this.toasts[index]?.id;
		if (!id) throw new Error('Toast id 생성에 실패했습니다.');
		return id;
	}

	update(id: string, patch: ToastUpdate) {
		const index = this.toasts.findIndex((t) => t.id === id);
		if (index < 0) return false;
		const current = this.toasts[index];
		if (!current) return false;

		const { resetTimer: resetTimerProp, ...toastPatch } = patch;
		const resetTimer = resetTimerProp ?? true;
		const nextDuration =
			toastPatch.duration === undefined
				? (current.duration ?? 3000)
				: normalizeDuration(toastPatch.duration);

		this.toasts[index] = {
			...current,
			...toastPatch,
			duration: nextDuration,
			updatedAt: Date.now()
		};

		if (current.duration !== nextDuration && nextDuration !== Infinity) {
			if (resetTimer) this.rescheduleTimer(id, nextDuration);
		}

		if (nextDuration === Infinity) {
			this.clearTimer(id);
			this.timerStates.delete(id);
		}

		return true;
	}

	dismiss(id: string) {
		this.clearTimer(id);
		this.timerStates.delete(id);
		this.toasts = this.toasts.filter((t) => t.id !== id);
	}

	remove(id: string) {
		this.dismiss(id);
	}

	dismissAll() {
		for (const id of this.timerStates.keys()) {
			this.clearTimer(id);
		}
		this.timerStates.clear();
		this.toasts = [];
	}

	pause() {
		if (this.paused) return;
		this.paused = true;
		for (const toastItem of this.toasts) {
			const duration = toastItem.duration ?? 3000;
			if (duration === Infinity) continue;
			this.pauseTimer(toastItem.id);
		}
	}

	resume() {
		if (!this.paused) return;
		this.paused = false;
		for (const toastItem of this.toasts) {
			const duration = toastItem.duration ?? 3000;
			if (duration === Infinity) continue;
			this.resumeTimer(toastItem.id);
		}
	}

	success(title: string, message?: string) {
		return this.add(title, { message, intent: 'success' });
	}

	error(title: string, message?: string) {
		return this.add(title, { message, intent: 'error', duration: 5000 });
	}

	warning(title: string, message?: string) {
		return this.add(title, { message, intent: 'warning', duration: 4000 });
	}

	info(title: string, message?: string) {
		return this.add(title, { message, intent: 'neutral' });
	}

	promise<T>(
		p: Promise<T>,
		opts: {
			key?: string;
			loading: ToastDescriptor<void>;
			success: ToastDescriptor<T>;
			error: ToastDescriptor<unknown>;
		}
	) {
		const loading = normalizeDescriptor(opts.loading, undefined);
		const id = this.add(loading.title, {
			...loading.options,
			key: opts.key,
			intent: loading.options?.intent ?? 'neutral',
			duration: Infinity
		});

		const unwrap = p
			.then((value) => {
				const success = normalizeDescriptor(opts.success, value);
				this.update(id, {
					title: success.title,
					...(success.options ?? {}),
					intent: success.options?.intent ?? 'success',
					duration: normalizeDuration(success.options?.duration ?? 3000),
					resetTimer: success.resetTimer ?? true
				});
				return value;
			})
			.catch((err: unknown) => {
				const error = normalizeDescriptor(opts.error, err);
				this.update(id, {
					title: error.title,
					...(error.options ?? {}),
					intent: error.options?.intent ?? 'error',
					duration: normalizeDuration(error.options?.duration ?? 5000),
					resetTimer: error.resetTimer ?? true
				});
				throw err;
			});

		return { id, unwrap };
	}
}

export const toast = new ToastStore();
