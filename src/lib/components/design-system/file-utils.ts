export function formatBytes(bytes: number): string {
	const units = ['B', 'KB', 'MB', 'GB'] as const;
	let value = bytes;
	let unitIndex = 0;
	while (value >= 1024 && unitIndex < units.length - 1) {
		value /= 1024;
		unitIndex += 1;
	}
	const unit = units[unitIndex] ?? 'B';
	const precision = unitIndex === 0 ? 0 : value < 10 ? 2 : 1;
	return `${value.toFixed(precision)} ${unit}`;
}

export function fileKey(file: File): string {
	return `${file.name}:${file.size}:${file.lastModified}`;
}

export function dedupeFiles(files: File[]): File[] {
	const seen = new Set<string>();
	const next: File[] = [];
	for (const f of files) {
		const key = fileKey(f);
		if (seen.has(key)) continue;
		seen.add(key);
		next.push(f);
	}
	return next;
}
