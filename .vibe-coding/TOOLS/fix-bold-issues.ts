import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DRY_RUN = process.argv.includes('--dry-run');

// 제로폭 공백을 HTML 엔티티로 삽입
const ZWS_ENTITY = '&#8203;';

// CJK 문자 판별 (한글, 한자, 히라가나, 가타카나)
function isCJK(char: string): boolean {
	if (!char) return false;
	const code = char.charCodeAt(0);
	return (
		(code >= 0xac00 && code <= 0xd7af) || // 한글 음절
		(code >= 0x1100 && code <= 0x11ff) || // 한글 자모
		(code >= 0x4e00 && code <= 0x9fff) || // CJK 통합 한자
		(code >= 0x3040 && code <= 0x309f) || // 히라가나
		(code >= 0x30a0 && code <= 0x30ff) // 가타카나
	);
}

// 구두점으로 끝나는 볼드 패턴 (lookahead 없이)
// **...구두점** 형태를 캡처
const boldEndingWithPunct = /(\*\*(?:(?!\*\*).)+?[.:;!?)]\*\*)/g;

// 볼드 뒤에 CJK가 오는 경우에만 ZWS 삽입
function fixBoldBeforeCJK(text: string): { text: string; count: number; } {
	let count = 0;
	const result = text.replace(boldEndingWithPunct, (match, _bold, offset) => {
		const nextChar = text[offset + match.length];
		if (isCJK(nextChar)) {
			count++;
			return match + ZWS_ENTITY;
		}
		return match;
	});
	return { text: result, count };
}

async function walk(dir: string): Promise<string[]> {
	const files: string[] = [];
	const entries = await readdir(dir, { withFileTypes: true });

	for (const entry of entries) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await walk(path)));
		} else if (entry.isFile()) {
			const ext = extname(path);
			if (ext === '.md' || ext === '.mdx') files.push(path);
		}
	}
	return files;
}

// 인라인 코드 범위를 상태 머신으로 정확하게 찾음 (멀티 백틱 지원)
interface InlineCodeRange {
	start: number;
	end: number;
}

function findInlineCodeRanges(line: string): InlineCodeRange[] {
	const ranges: InlineCodeRange[] = [];
	const n = line.length;
	let i = 0;

	while (i < n) {
		if (line[i] !== '`') {
			i++;
			continue;
		}

		const start = i;

		let tickLen = 0;
		while (i < n && line[i] === '`') {
			tickLen++;
			i++;
		}

		let j = i;
		let foundEnd = -1;

		while (j < n) {
			if (line[j] !== '`') {
				j++;
				continue;
			}

			let closeLen = 0;
			while (j < n && line[j] === '`') {
				closeLen++;
				j++;
			}

			if (closeLen === tickLen) {
				foundEnd = j;
				break;
			}
		}

		if (foundEnd !== -1) {
			ranges.push({ start, end: foundEnd });
			i = foundEnd;
		} else {
			// 닫힘 하나라도 못 찾으면 라인 전체를 위험 구역으로 보고 스킵 유도
			return [];
		}
	}

	return ranges;
}

// 인라인 코드 구간을 피해 볼드 교정 (상태 머신 기반)
function fixLineOutsideInlineCode(line: string): { line: string; count: number; skipped: boolean; } {
	// 빠른 경로 1: 볼드 표식이 없으면 바로 리턴 (수정 대상 없음)
	if (!line.includes('**')) {
		return { line, count: 0, skipped: false };
	}

	// 빠른 경로 2: 백틱이 없으면 바로 처리 (코드 경로 단순화)
	if (!line.includes('`')) {
		const fixed = fixBoldBeforeCJK(line);
		return { line: fixed.text, count: fixed.count, skipped: false };
	}

	const ranges = findInlineCodeRanges(line);

	// 닫히지 않은 백틱이 있을 수 있음 - 안전하게 원본 유지하고 스킵 표시
	if (ranges.length === 0) {
		return { line, count: 0, skipped: true };
	}

	let result = '';
	let count = 0;
	let lastEnd = 0;

	for (const range of ranges) {
		// 방어 가드: 겹치거나 역전된 range 건너뛰기
		if (range.end <= lastEnd) continue;

		// 코드 외부 구간 처리
		if (range.start > lastEnd) {
			const outside = line.slice(lastEnd, range.start);
			const fixed = fixBoldBeforeCJK(outside);
			result += fixed.text;
			count += fixed.count;
		}

		// 코드 내부는 그대로 유지 (겹침 안전 처리)
		result += line.slice(Math.max(range.start, lastEnd), range.end);
		lastEnd = Math.max(lastEnd, range.end);
	}

	// 마지막 코드 이후 나머지 처리
	if (lastEnd < line.length) {
		const outside = line.slice(lastEnd);
		const fixed = fixBoldBeforeCJK(outside);
		result += fixed.text;
		count += fixed.count;
	}

	return { line: result, count, skipped: false };
}

// 인용문 기호(>)와 공백을 제거하여 펜스 패턴 확인
function stripBlockquote(line: string): string {
	return line.replace(/^(?:\s*>\s*)+/, '');
}

// 펜스 코드블록과 인라인 코드를 건너뛰며 마크다운 교정
function fixMarkdownKeepingCodeFences(
	content: string,
	maxSkippedLinesToStore: number = 0
): { content: string; count: number; skipped: number; skippedLines: number[]; } {
	const lineEnding = content.includes('\r\n') ? '\r\n' : '\n';
	const lines = content.split(lineEnding);

	let inFence = false;
	let fenceChar = '';
	let fenceLength = 0;
	let count = 0;
	let skipped = 0;
	const skippedLines: number[] = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const stripped = stripBlockquote(line).trimStart();

		if (!inFence) {
			// 펜스 시작 감지 (3개 이상 백틱/틸드)
			const m = stripped.match(/^(`{3,}|~{3,})/);
			if (m) {
				inFence = true;
				fenceChar = m[1][0];
				fenceLength = m[1].length;
				continue;
			}
		} else {
			// 펜스 종료 감지 (시작과 같거나 더 긴 길이)
			const closing = new RegExp(`^${fenceChar}{${fenceLength},}\\s*$`);
			if (closing.test(stripped)) {
				inFence = false;
				fenceChar = '';
				fenceLength = 0;
			}
			continue;
		}

		const fixed = fixLineOutsideInlineCode(line);
		lines[i] = fixed.line;
		count += fixed.count;
		if (fixed.skipped) {
			skipped++;
			// 메모리 최적화: 상한선 이하일 때만 줄번호 저장
			if (maxSkippedLinesToStore > 0 && skippedLines.length < maxSkippedLinesToStore) {
				skippedLines.push(i + 1); // 1-indexed
			}
		}
	}

	return { content: lines.join(lineEnding), count, skipped, skippedLines };
}

interface FixResult {
	file: string;
	count: number;
	skipped: number;
	skippedLines: number[];
}

async function fixFile(path: string, maxSkippedLinesToStore: number = 0): Promise<FixResult | null> {
	const original = await readFile(path, 'utf-8');
	const fixed = fixMarkdownKeepingCodeFences(original, maxSkippedLinesToStore);

	if (fixed.content !== original || fixed.skipped > 0) {
		const parts: string[] = [];
		if (fixed.count > 0) parts.push(`${fixed.count}건 수정`);
		if (fixed.skipped > 0) parts.push(`${fixed.skipped}줄 스킵`);
		console.log(`[FIX] ${path}  (${parts.join(', ')})`);
		if (!DRY_RUN && fixed.content !== original) {
			await writeFile(path, fixed.content, 'utf-8');
		}
		return { file: path, count: fixed.count, skipped: fixed.skipped, skippedLines: fixed.skippedLines };
	}
	return null;
}

function formatReport(
	results: FixResult[],
	target: string,
	totalFiles: number,
	dryRun: boolean,
	verbose: boolean = false,
	elapsed: string = ''
): string {
	const lines: string[] = [];
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

	lines.push(`Fix Bold Issues Report - ${timestamp}`);
	lines.push(`Target: ${target}`);
	if (elapsed) lines.push(`Elapsed: ${elapsed}`);
	lines.push(`Mode: ${dryRun ? 'DRY RUN (파일 미수정)' : 'APPLIED (파일 수정됨)'}`);
	lines.push('='.repeat(50));

	const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);

	if (results.length === 0) {
		lines.push('\n✅ 수정이 필요한 파일이 없습니다.');
	} else {
		lines.push(`\n📝 수정된 파일: ${results.length}개 / 전체 ${totalFiles}개\n`);

		for (const r of results) {
			const parts: string[] = [];
			if (r.count > 0) parts.push(`${r.count}건`);
			if (r.skipped > 0) parts.push(`${r.skipped}줄 스킵`);
			lines.push(`  📄 ${r.file} (${parts.join(', ')})`);
			// verbose 모드: 스킵된 줄번호 표시 (상위 10개까지)
			if (verbose && r.skippedLines.length > 0) {
				const displayLines = r.skippedLines.slice(0, 10);
				// 실제 스킵 수 기준으로 남은 줄 계산 (저장 상한과 무관)
				const remaining = Math.max(0, r.skipped - displayLines.length);
				const suffix = remaining > 0 ? ` ... 외 ${remaining}줄` : '';
				// 저장 상한에 걸렸으면 안내 추가
				const capped = r.skippedLines.length < r.skipped;
				const capNote = capped ? ' (줄번호는 저장 상한으로 일부만 기록됨)' : '';
				lines.push(`       └─ L${displayLines.join(', L')}${suffix}${capNote}`);
			}
		}

		const totalFixes = results.reduce((sum, r) => sum + r.count, 0);
		lines.push(`\n${'─'.repeat(50)}`);
		lines.push(`총 ${totalFixes}건 수정${dryRun ? ' 예정' : ' 완료'}`);
	}

	// 스킵된 라인이 있으면 안내 추가
	if (totalSkipped > 0) {
		lines.push(`\n⚠️  ${totalSkipped}줄이 닫히지 않은 백틱으로 인해 스킵됨 (--verbose로 줄번호 확인)`);
	}

	return lines.join('\n');
}

// 회귀 방지용 미니 테스트 (--self-test 옵션으로 실행)
function runSelfTests(): void {
	// 라인 단위 테스트 (shouldSkip 필드 추가로 skipped 플래그도 검증)
	const lineTests: Array<{ input: string; shouldChange: boolean; shouldSkip?: boolean; description: string; }> = [
		// 수정돼야 함
		{ input: '**무료:**이', shouldChange: true, shouldSkip: false, description: '구두점 뒤 한글 조사' },
		// 수정되면 안 됨
		{ input: '**무료:** 이', shouldChange: false, shouldSkip: false, description: '구두점 뒤 공백' },
		{ input: '`**무료:**이`', shouldChange: false, shouldSkip: false, description: '인라인 코드 내부' },
		{ input: '``**무료:**이``', shouldChange: false, shouldSkip: false, description: '멀티 백틱 인라인 코드' },
		// 멀티 백틱 안에 단일 백틱 포함 (멀티 백틱의 핵심 용도)
		{ input: '``코드 안에 `백틱` 있고 **무료:**이``', shouldChange: false, shouldSkip: false, description: '멀티 백틱 안에 단일 백틱' },
		// 닫히지 않은 백틱은 손대지 않음 + skipped
		{ input: '`닫히지 않은 **무료:**이', shouldChange: false, shouldSkip: true, description: '닫히지 않은 백틱' },
		// 정상 스팬 후 미닫힘 백틱 (안전 구멍 테스트) + skipped
		{ input: '`ok` 그리고 `닫히지 않은 **무료:**이', shouldChange: false, shouldSkip: true, description: '정상 스팬 후 미닫힘 백틱' },
	];

	for (const test of lineTests) {
		const result = fixLineOutsideInlineCode(test.input);
		// 문자열 비교로 판정 (count는 내부 구현에 묶임)
		const changed = result.line !== test.input;
		if (changed !== test.shouldChange) {
			throw new Error(
				`self-test failed: ${test.description}\n` +
				`input: ${test.input}\n` +
				`expected change: ${test.shouldChange}, got: ${changed}`
			);
		}
		// shouldSkip이 정의된 경우 skipped 플래그도 검증
		if (test.shouldSkip !== undefined && result.skipped !== test.shouldSkip) {
			throw new Error(
				`self-test failed: ${test.description}\n` +
				`input: ${test.input}\n` +
				`expected skipped: ${test.shouldSkip}, got: ${result.skipped}`
			);
		}
	}

	// 펜스 회귀 방지 테스트: 4개 펜스 내부는 절대 수정 안 됨
	const fenceContent = '````markdown\n**무료:**이\n````';
	const fenceResult = fixMarkdownKeepingCodeFences(fenceContent);
	if (fenceResult.content !== fenceContent) {
		throw new Error('self-test failed: fence test - content inside fence was modified');
	}

	// 멱등성 테스트: 두 번 돌려도 결과가 같아야 함
	const idempotentInput = '**무료:**이';
	const first = fixLineOutsideInlineCode(idempotentInput);
	const second = fixLineOutsideInlineCode(first.line);
	if (first.line !== second.line) {
		throw new Error('self-test failed: idempotent test - result changed on second run');
	}

	// formatReport 출력 검증: 저장 상한에 걸렸을 때 정확한 숫자와 안내 표시
	const mockResult: FixResult = {
		file: 'test.md',
		count: 0,
		skipped: 1000, // 실제 스킵 1000줄
		skippedLines: Array.from({ length: 500 }, (_, i) => i + 1) // 저장은 500개만
	};
	const reportOutput = formatReport([mockResult], 'test', 1, false, true);
	// " ... 외 990줄"이 포함되어야 함 (1000 - 10 = 990)
	if (!reportOutput.includes(' ... 외 990줄')) {
		throw new Error('self-test failed: formatReport - remaining count incorrect');
	}
	// 저장 상한 안내가 포함되어야 함
	if (!reportOutput.includes('저장 상한')) {
		throw new Error('self-test failed: formatReport - cap note missing');
	}

	// 비캡 케이스: 상한에 안 걸렸을 때 "저장 상한" 문구가 없어야 함
	const nonCappedResult: FixResult = {
		file: 'test2.md',
		count: 0,
		skipped: 15, // 실제 스킵 15줄
		skippedLines: Array.from({ length: 15 }, (_, i) => i + 1) // 전부 저장됨
	};
	const nonCappedOutput = formatReport([nonCappedResult], 'test', 1, false, true);
	if (nonCappedOutput.includes('저장 상한')) {
		throw new Error('self-test failed: formatReport - cap note shown when not capped');
	}
	// 긍정 케이스: 15줄 중 10줄 표시 후 " ... 외 5줄"이 반드시 표시되어야 함
	if (!nonCappedOutput.includes(' ... 외 5줄')) {
		throw new Error('self-test failed: formatReport - remaining suffix missing when expected');
	}

	// remaining 0 케이스: 스킵 수가 표시 상한(10) 이하면 "외 N줄"이 없어야 함
	const noRemainResult: FixResult = {
		file: 'test3.md',
		count: 0,
		skipped: 3, // 실제 스킵 3줄
		skippedLines: [1, 2, 3] // 전부 저장 + 전부 표시됨
	};
	const noRemainOutput = formatReport([noRemainResult], 'test', 1, false, true);
	// " ... 외 " 패턴으로 검사 ("예외 " 같은 단어와 충돌 방지)
	if (noRemainOutput.includes(' ... 외 ')) {
		throw new Error('self-test failed: formatReport - suffix shown when remaining is 0');
	}

	// 경계값 케이스: 표시 상한(10)과 같을 때도 "외 N줄"이 없어야 함
	const boundaryResult: FixResult = {
		file: 'test4.md',
		count: 0,
		skipped: 10, // 표시 상한과 동일
		skippedLines: Array.from({ length: 10 }, (_, i) => i + 1)
	};
	const boundaryOutput = formatReport([boundaryResult], 'test', 1, false, true);
	if (boundaryOutput.includes(' ... 외 ')) {
		throw new Error('self-test failed: formatReport - suffix shown at exact display limit');
	}
}

async function main() {
	// self-test 모드
	if (process.argv.includes('--self-test')) {
		try {
			runSelfTests();
			console.log('✅ self-test passed');
			process.exit(0);
		} catch (error) {
			console.error(error);
			process.exit(1);
		}
	}

	// --로 시작하지 않는 첫 번째 인자를 경로로 사용
	const TARGET = process.argv.slice(2).find((arg) => !arg.startsWith('--')) || 'src/content';
	const VERBOSE = process.argv.includes('--verbose');
	// 메모리 최적화: verbose일 때만 줄번호 저장 (상한 500개)
	const MAX_SKIPPED_LINES = VERBOSE ? 500 : 0;
	console.log(`Scanning: ${TARGET}`);
	if (DRY_RUN) console.log('DRY RUN MODE: No files will be modified.');
	if (VERBOSE) console.log('VERBOSE MODE: Skipped line numbers will be shown.');

	try {
		const startTime = performance.now();
		const targetStat = await stat(TARGET);
		let files: string[];

		if (targetStat.isFile()) {
			// 단일 파일 처리
			const ext = extname(TARGET);
			if (ext !== '.md' && ext !== '.mdx') {
				console.log('Error: Only .md or .mdx files are supported.');
				return;
			}
			files = [TARGET];
		} else {
			// 디렉토리 처리
			files = await walk(TARGET);
		}

		console.log(`Found ${files.length} markdown file(s).`);

		const results: FixResult[] = [];
		for (const file of files) {
			const result = await fixFile(file, MAX_SKIPPED_LINES);
			if (result) results.push(result);
		}

		const elapsed = performance.now() - startTime;
		const elapsedStr = elapsed < 1000 ? `${elapsed.toFixed(0)}ms` : `${(elapsed / 1000).toFixed(2)}s`;

		const totalFixes = results.reduce((sum, r) => sum + r.count, 0);
		console.log(`Done. Total fixes: ${totalFixes}`);
		console.log(`⏱️ 소요 시간: ${elapsedStr}`);

		// 결과 파일 저장 (reports 폴더 자동 생성)
		const report = formatReport(results, TARGET, files.length, DRY_RUN, VERBOSE, elapsedStr);
		const scriptDir = dirname(fileURLToPath(import.meta.url));
		const reportsDir = join(scriptDir, 'reports');
		await mkdir(reportsDir, { recursive: true });
		const reportPath = join(reportsDir, 'fix-bold-report.txt');
		await writeFile(reportPath, report, 'utf-8');
		console.log(`📝 리포트 저장됨: ${reportPath}`);
	} catch (error) {
		console.error('Error:', error);
	}
}

main();
