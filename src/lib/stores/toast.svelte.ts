export type ToastIntent = 'neutral' | 'success' | 'warning' | 'error';

export type ToastItem = {
	id: string;
	title: string;
	message?: string;
	intent?: ToastIntent;
	duration?: number; // ms, Infinity for no auto-dismiss
};

class ToastStore {
	toasts = $state<ToastItem[]>([]);

	add(title: string, options?: Omit<ToastItem, 'id' | 'title'>) {
		const id = crypto.randomUUID();
		const newToast: ToastItem = {
			id,
			title,
			message: options?.message,
			intent: options?.intent ?? 'neutral',
			duration: options?.duration ?? 3000
		};

		this.toasts.push(newToast);

		if (newToast.duration !== Infinity) {
			setTimeout(() => {
				this.remove(id);
			}, newToast.duration);
		}

		return id;
	}

	remove(id: string) {
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
