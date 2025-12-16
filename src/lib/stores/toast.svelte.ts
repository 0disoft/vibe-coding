export type ToastIntent = 'neutral' | 'success' | 'warning' | 'error';

export type ToastItem = {
	id: string;
	title: string;
	message?: string;
	intent?: ToastIntent;
	duration?: number; // ms, Infinity for no auto-dismiss
};

/** 최소 duration (ms) */
const MIN_DURATION = 1000;

/** 동시에 표시할 최대 토스트 개수 */
const MAX_TOASTS = 5;

class ToastStore {
	toasts = $state<ToastItem[]>([]);
	/** 타이머 관리 (수동 닫기 시 정리용) */
	private timers = new Map<string, ReturnType<typeof setTimeout>>();

	add(title: string, options?: Omit<ToastItem, 'id' | 'title'>) {
		// 최대 개수 초과 시 가장 오래된 토스트 제거 (FIFO)
		while (this.toasts.length >= MAX_TOASTS) {
			const oldest = this.toasts[0];
			if (oldest) this.remove(oldest.id);
		}

		const id = crypto.randomUUID();
		// duration 유효성 검증: Infinity 허용, NaN/음수/0 방어
		let duration = options?.duration ?? 3000;
		if (duration !== Infinity) {
			if (!Number.isFinite(duration) || duration < MIN_DURATION) {
				duration = MIN_DURATION;
			}
		}

		const newToast: ToastItem = {
			id,
			title,
			message: options?.message,
			intent: options?.intent ?? 'neutral',
			duration
		};

		this.toasts.push(newToast);

		if (newToast.duration !== Infinity) {
			const timerId = setTimeout(() => {
				this.remove(id);
			}, newToast.duration);
			this.timers.set(id, timerId);
		}

		return id;
	}

	remove(id: string) {
		// 타이머 정리 (수동 닫기 시 누적 방지)
		const timerId = this.timers.get(id);
		if (timerId) {
			clearTimeout(timerId);
			this.timers.delete(id);
		}
		this.toasts = this.toasts.filter((t) => t.id !== id);
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
}

export const toast = new ToastStore();
