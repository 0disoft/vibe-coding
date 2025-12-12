import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

/** JSON 파일을 안전하게 파싱하고, 실패 시 파일명을 포함한 에러를 던진다 */
function parseJsonFile(filePath: string, fileName: string): Record<string, unknown> {
	let parsed: unknown;

	try {
		parsed = JSON.parse(readFileSync(filePath, 'utf-8'));
	} catch (e) {
		throw new Error(`JSON 파싱 실패: ${fileName}`, { cause: e });
	}

	// JSON.parse 결과가 배열이나 문자열일 경우를 방어
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		throw new Error(`JSON 형식 오류: 객체가 아님: ${fileName}`);
	}

	return parsed as Record<string, unknown>;
}

/** $schema를 제외한 키 목록 추출 */
function getTranslationKeys(content: Record<string, unknown>): string[] {
	return Object.keys(content).filter((key) => key !== '$schema');
}

describe('messages/', () => {
	const messagesDir = join(process.cwd(), 'messages');
	let messageFiles: string[] = [];
	// beforeAll에서 파싱하여 캐시 → 테스트 간 동일 입력 보장, 중복 파싱 제거
	const keysByFile: Record<string, string[]> = {};

	beforeAll(() => {
		expect(existsSync(messagesDir), `messages 폴더를 찾을 수 없음: ${messagesDir}`).toBe(true);

		messageFiles = readdirSync(messagesDir)
			.filter((file) => file.endsWith('.json'))
			.sort();

		// en.json이 기준 파일이므로 반드시 존재해야 함
		expect(messageFiles.includes('en.json'), 'en.json이 존재해야 함').toBe(true);

		// 모든 파일의 키를 미리 파싱하여 캐시
		for (const file of messageFiles) {
			const content = parseJsonFile(join(messagesDir, file), file);
			keysByFile[file] = getTranslationKeys(content);
		}
	});

	it('20개의 언어 파일이 있어야 한다', () => {
		expect(messageFiles.length).toBe(20);
	});

	it('모든 언어 파일의 키 개수가 같아야 한다', () => {
		const baseCount = keysByFile['en.json']?.length;
		expect(baseCount, 'en.json의 키 개수를 읽지 못함').toBeTypeOf('number');

		for (const file of messageFiles) {
			const count = keysByFile[file].length;
			expect(count, `${file} has ${count} keys, expected ${baseCount}`).toBe(baseCount);
		}
	});

	it('모든 언어 파일의 키가 일치해야 한다', () => {
		const baseKeys = new Set(keysByFile['en.json']);

		for (const file of messageFiles) {
			if (file === 'en.json') continue;

			const keys = new Set(keysByFile[file]);

			// 누락된 키 확인 (정렬하여 CI 로그 일관성 확보)
			const missingKeys = [...baseKeys].filter((key) => !keys.has(key)).sort();
			expect(missingKeys, `${file} is missing keys`).toEqual([]);

			// 추가된 키 확인 (en.json에 없는 키)
			const extraKeys = [...keys].filter((key) => !baseKeys.has(key)).sort();
			expect(extraKeys, `${file} has extra keys not in en.json`).toEqual([]);
		}
	});
});
