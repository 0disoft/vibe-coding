import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

import { locales } from '$lib/paraglide/runtime';

// import.meta.url 기반 경로 (CI/모노레포 환경에서 안정적)
const __dirname = dirname(fileURLToPath(import.meta.url));
const messagesDir = join(__dirname, '../../../../messages');

// Paraglide의 locales를 단일 소스로 사용 (string[]로 캐스팅하여 타입 호환성 확보)
const SUPPORTED_LOCALES: string[] = [...locales];

/** BOM 제거 후 JSON 파일을 안전하게 파싱 */
function parseJsonFile(filePath: string, fileName: string): Record<string, unknown> {
	let parsed: unknown;

	try {
		// BOM 방어: 일부 편집기/번역툴이 BOM을 삽입할 수 있음
		const content = readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '');
		parsed = JSON.parse(content);
	} catch (e) {
		throw new Error(`JSON 파싱 실패: ${fileName}`, { cause: e });
	}

	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		throw new Error(`JSON 형식 오류: 객체가 아님: ${fileName}`);
	}

	return parsed as Record<string, unknown>;
}

/** 중첩 객체를 펼쳐서 점 표기법 키 목록 추출 (깊은 키 누락 감지) */
function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
	const out: string[] = [];
	for (const [k, v] of Object.entries(obj)) {
		if (k === '$schema') continue;
		const path = prefix ? `${prefix}.${k}` : k;
		if (v && typeof v === 'object' && !Array.isArray(v)) {
			out.push(...flattenKeys(v as Record<string, unknown>, path));
		} else {
			out.push(path);
		}
	}
	return out;
}

/** 문자열에서 {placeholder} 토큰 추출 */
function extractPlaceholders(value: unknown): string[] {
	if (typeof value !== 'string') return [];
	const matches = value.match(/\{[^}]+\}/g);
	return matches ? matches.sort() : [];
}

/** 중첩 객체에서 모든 문자열 값의 플레이스홀더를 키별로 추출 */
function extractAllPlaceholders(
	obj: Record<string, unknown>,
	prefix = ''
): Record<string, string[]> {
	const result: Record<string, string[]> = {};
	for (const [k, v] of Object.entries(obj)) {
		if (k === '$schema') continue;
		const path = prefix ? `${prefix}.${k}` : k;
		if (typeof v === 'string') {
			result[path] = extractPlaceholders(v);
		} else if (v && typeof v === 'object' && !Array.isArray(v)) {
			Object.assign(result, extractAllPlaceholders(v as Record<string, unknown>, path));
		}
	}
	return result;
}

describe('messages/', () => {
	let messageFiles: string[] = [];
	const keysByFile: Record<string, string[]> = {};
	const contentByFile: Record<string, Record<string, unknown>> = {};

	beforeAll(() => {
		expect(existsSync(messagesDir), `messages 폴더를 찾을 수 없음: ${messagesDir}`).toBe(true);

		messageFiles = readdirSync(messagesDir)
			.filter((file) => file.endsWith('.json'))
			.sort();

		expect(messageFiles.includes('en.json'), 'en.json이 존재해야 함').toBe(true);

		for (const file of messageFiles) {
			const content = parseJsonFile(join(messagesDir, file), file);
			contentByFile[file] = content;
			keysByFile[file] = flattenKeys(content);
		}
	});

	it('지원 로케일 수만큼 언어 파일이 있어야 한다', () => {
		expect(
			messageFiles.length,
			`messages/ 파일 수: ${messageFiles.length}, SUPPORTED_LOCALES: ${SUPPORTED_LOCALES.length}`
		).toBe(SUPPORTED_LOCALES.length);
	});

	it('messages 파일과 SUPPORTED_LOCALES가 1:1 매칭되어야 한다', () => {
		const fileLocales = messageFiles.map((f) => f.replace('.json', '')).sort();
		const supportedLocales = [...SUPPORTED_LOCALES].sort();

		// 파일은 있는데 locales에 없는 경우
		const extraFiles = fileLocales.filter((l) => !supportedLocales.includes(l));
		expect(extraFiles, 'messages/에 불필요한 파일 존재').toEqual([]);

		// locales에는 있는데 파일이 없는 경우
		const missingFiles = supportedLocales.filter((l) => !fileLocales.includes(l));
		expect(missingFiles, 'messages/에 누락된 파일 존재').toEqual([]);
	});

	it('모든 언어 파일의 키 개수가 같아야 한다', () => {
		const baseCount = keysByFile['en.json']?.length;
		expect(baseCount, 'en.json의 키 개수를 읽지 못함').toBeTypeOf('number');

		for (const file of messageFiles) {
			const count = keysByFile[file].length;
			expect(count, `${file}: ${count}개 키 (기준 en.json: ${baseCount}개)`).toBe(baseCount);
		}
	});

	it('모든 언어 파일의 키가 일치해야 한다', () => {
		const baseKeys = new Set(keysByFile['en.json']);
		const baseCount = baseKeys.size;

		for (const file of messageFiles) {
			if (file === 'en.json') continue;

			const keys = new Set(keysByFile[file]);
			const targetCount = keys.size;

			const missingKeys = [...baseKeys].filter((key) => !keys.has(key)).sort();
			expect(missingKeys, `${file} 누락 키 (기준: ${baseCount}개, 대상: ${targetCount}개)`).toEqual(
				[]
			);

			const extraKeys = [...keys].filter((key) => !baseKeys.has(key)).sort();
			expect(
				extraKeys,
				`${file} 추가 키 (en.json에 없음, 기준: ${baseCount}개, 대상: ${targetCount}개)`
			).toEqual([]);
		}
	});

	it('모든 언어 파일의 플레이스홀더가 일치해야 한다', () => {
		const basePlaceholders = extractAllPlaceholders(contentByFile['en.json']);

		for (const file of messageFiles) {
			if (file === 'en.json') continue;

			const targetPlaceholders = extractAllPlaceholders(contentByFile[file]);

			for (const [key, basePh] of Object.entries(basePlaceholders)) {
				const targetPh = targetPlaceholders[key] ?? [];
				expect(
					targetPh,
					`${file}의 "${key}" 플레이스홀더 불일치 (기준: ${basePh.join(', ')})`
				).toEqual(basePh);
			}
		}
	});
});
