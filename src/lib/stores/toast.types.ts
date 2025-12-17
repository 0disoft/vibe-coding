export type ToastIntent = 'neutral' | 'success' | 'warning' | 'error';

export type ToastAction =
	| {
			label: string;
			href?: string;
			onClick?: () => void;
	  }
	| undefined;

export type ToastItem = {
	id: string;
	/** dedupe/update용 키 (선택) */
	key?: string;
	title: string;
	message?: string;
	intent?: ToastIntent;
	duration?: number; // ms, Infinity for no auto-dismiss
	action?: ToastAction;
	createdAt: number;
	updatedAt?: number;
};

export type ToastOptions = Omit<ToastItem, 'id' | 'title' | 'createdAt' | 'updatedAt'>;

export type ToastUpdate = Partial<Omit<ToastItem, 'id' | 'createdAt'>> & {
	/** duration 변경 시 타이머를 새로 시작할지 여부 (기본 true) */
	resetTimer?: boolean;
};
