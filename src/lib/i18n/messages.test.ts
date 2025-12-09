import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('messages/', () => {
	const messagesDir = join(process.cwd(), 'messages');
	const messageFiles = readdirSync(messagesDir).filter((file) => file.endsWith('.json'));

	it('20개의 언어 파일이 있어야 한다', () => {
		expect(messageFiles.length).toBe(20);
	});

	it('모든 언어 파일의 키 개수가 같아야 한다', () => {
		const keyCounts: Record<string, number> = {};

		for (const file of messageFiles) {
			const content = JSON.parse(readFileSync(join(messagesDir, file), 'utf-8'));
			// $schema 키는 제외하고 실제 번역 키만 카운트
			const keys = Object.keys(content).filter((key) => key !== '$schema');
			keyCounts[file] = keys.length;
		}

		// 모든 파일의 키 개수가 동일해야 함
		const counts = Object.values(keyCounts);
		const firstCount = counts[0];

		for (const [file, count] of Object.entries(keyCounts)) {
			expect(count, `${file} has ${count} keys, expected ${firstCount}`).toBe(firstCount);
		}
	});

	it('모든 언어 파일의 키가 일치해야 한다', () => {
		// 기준 파일로 en.json 사용
		const baseContent = JSON.parse(readFileSync(join(messagesDir, 'en.json'), 'utf-8'));
		const baseKeys = new Set(Object.keys(baseContent).filter((key) => key !== '$schema'));

		for (const file of messageFiles) {
			if (file === 'en.json') continue;

			const content = JSON.parse(readFileSync(join(messagesDir, file), 'utf-8'));
			const keys = new Set(Object.keys(content).filter((key) => key !== '$schema'));

			// 누락된 키 확인
			const missingKeys = [...baseKeys].filter((key) => !keys.has(key));
			expect(missingKeys, `${file} is missing keys`).toEqual([]);

			// 추가된 키 확인 (en.json에 없는 키)
			const extraKeys = [...keys].filter((key) => !baseKeys.has(key));
			expect(extraKeys, `${file} has extra keys not in en.json`).toEqual([]);
		}
	});
});
