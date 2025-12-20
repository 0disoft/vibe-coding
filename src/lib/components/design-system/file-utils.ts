export function formatBytes(bytes: number, locale?: string): string {
	const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const;
	let value = bytes;
	let unitIndex = 0;
	while (value >= 1024 && unitIndex < units.length - 1) {
		value /= 1024;
		unitIndex += 1;
	}
	const unit = units[unitIndex] ?? 'B';
	const precision = unitIndex === 0 ? 0 : value < 10 ? 2 : 1;
	const formatted = new Intl.NumberFormat(locale, {
		minimumFractionDigits: precision,
		maximumFractionDigits: precision
	}).format(value);
	return `${formatted} ${unit}`;
}

export type FileKeySource = Pick<File, 'name' | 'type' | 'size' | 'lastModified'>;

export function fileKey(file: FileKeySource): string {
	return `${file.name}:${file.type}:${file.size}:${file.lastModified}`;
}

export function dedupeFiles<T extends FileKeySource>(files: T[]): T[] {
	const seen = new Set<string>();
	const next: T[] = [];
	for (const f of files) {
		const key = fileKey(f);
		if (seen.has(key)) continue;
		seen.add(key);
		next.push(f);
	}
	return next;
}
