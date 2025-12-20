export type DebouncedRunner = {
	run: (fn: () => void, delayMs: number) => void;
	cancel: () => void;
};

export function createDebouncedRunner(): DebouncedRunner {
	let timer: ReturnType<typeof setTimeout> | null = null;

	function cancel() {
		if (!timer) return;
		clearTimeout(timer);
		timer = null;
	}

	function run(fn: () => void, delayMs: number) {
		cancel();
		if (delayMs <= 0) {
			fn();
			return;
		}
		timer = setTimeout(() => {
			timer = null;
			fn();
		}, delayMs);
	}

	return { run, cancel };
}
