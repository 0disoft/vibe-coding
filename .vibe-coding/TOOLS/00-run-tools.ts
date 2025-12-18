import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// ANSI 색상 헬퍼
const c = {
	green: (t: string) => `\x1b[32m${t}\x1b[0m`,
	red: (t: string) => `\x1b[31m${t}\x1b[0m`,
	cyan: (t: string) => `\x1b[36m${t}\x1b[0m`,
	gray: (t: string) => `\x1b[90m${t}\x1b[0m`,
	bold: (t: string) => `\x1b[1m${t}\x1b[0m`,
};

const startTime = performance.now();

// 파이프라인 전용 옵션 (forwardArgs에서 제외됨)
const PIPELINE_OPTIONS = new Set([
	'--stop-on-fail',
	'--fix-bold-write',
	'--lint-nonstrict',
	'--lint-warn',
	'--lint-no-ds-tokens',
]);

type Step = {
	file: string;
	label: string;
	args?: string[];
	/** 외부 명령 (bun run 등) - 설정 시 file 대신 cmd로 직접 실행 */
	cmd?: string[];
	/** forwardArgs 전달 여부 (기본: true) */
	forward?: boolean;
};

const scriptDir = fileURLToPath(new URL('.', import.meta.url));
const bunExe = process.execPath;

const rawArgs = process.argv.slice(2);
const separatorIndex = rawArgs.indexOf('--');
const pipelineArgs =
	separatorIndex === -1 ? rawArgs : rawArgs.slice(0, separatorIndex);
const tailArgs = separatorIndex === -1 ? [] : rawArgs.slice(separatorIndex + 1);

const stopOnFail = pipelineArgs.includes('--stop-on-fail');
const fixBoldWrite = pipelineArgs.includes('--fix-bold-write');
const lintNonStrict =
	pipelineArgs.includes('--lint-nonstrict') || pipelineArgs.includes('--lint-warn');
const lintNoDsTokens = pipelineArgs.includes('--lint-no-ds-tokens');

const forwardArgs =
	separatorIndex === -1
		? pipelineArgs.filter((arg) => !PIPELINE_OPTIONS.has(arg))
		: tailArgs;

const steps: Step[] = [
	{ file: '01-security-patterns.ts', label: 'security-patterns' },
	{
		file: '02-lint-patterns.ts',
		label: 'lint-patterns',
		args: [
			...(lintNonStrict ? [] : ['--strict']),
			...(lintNoDsTokens ? ['--no-ds-tokens'] : []),
		],
	},
	{ file: '03-route-audit.ts', label: 'route-audit' },
	{ file: '04-a11y-ux-patterns.ts', label: 'a11y-ux-patterns' },
	{ file: '05-file-size-patterns.ts', label: 'file-size-patterns' },
	{
		file: '06-fix-bold-issues.ts',
		label: 'fix-bold-issues',
		args: fixBoldWrite ? [] : ['--dry-run'],
	},
	{
		file: '', // cmd 사용 시 무시됨
		label: 'lint (biome check --write)',
		// bunx 대신 로컬 biome 사용 (속도/버전 일관성)
		cmd: ['bun', 'run', 'biome', 'check', '.', '--write'],
		forward: false,
	},
];

/** 단일 단계 실행 및 결과 반환 */
function runStep(step: Step): boolean {
	const cmd = step.cmd
		? [...step.cmd]
		: [bunExe, join(scriptDir, step.file), ...(step.args ?? [])];

	// forward 옵션이 false가 아니면 forwardArgs 추가
	if (step.forward !== false) {
		cmd.push(...forwardArgs);
	}

	console.log(c.gray(`$ ${cmd.join(' ')}`));

	const stepStart = performance.now();
	const result = Bun.spawnSync({
		cmd,
		stdout: 'inherit',
		stderr: 'inherit',
	});
	const stepDuration = ((performance.now() - stepStart) / 1000).toFixed(2);

	if ((result.exitCode ?? 1) === 0) {
		console.log(
			`${c.green('✔')} ${c.bold(step.label)} ${c.gray(`(${stepDuration}s)`)}`,
		);
		return true;
	}

	console.log(
		`${c.red('✖')} ${c.bold(step.label)} ${c.red('failed')} ${c.gray(`(${stepDuration}s)`)}`,
	);
	return false;
}

let hasFailure = false;

console.log(c.cyan('🚀 Starting tools pipeline...'));
console.log(c.gray(`Options: ${pipelineArgs.join(' ') || 'none'}\n`));

for (const step of steps) {
	console.log(c.bold(`\n[ ${step.label} ]`));

	const success = runStep(step);
	if (!success) {
		hasFailure = true;
		if (stopOnFail) {
			console.log(c.red('\n🛑 Aborting due to failure (--stop-on-fail)'));
			break;
		}
	}
}

const totalTime = ((performance.now() - startTime) / 1000).toFixed(2);
console.log(`\n⏱️ Total execution time: ${totalTime}s`);

if (hasFailure) {
	console.log(c.red('💥 Some checks failed.'));
	process.exit(1);
} else {
	console.log(c.green('✨ All checks passed!'));
	process.exit(0);
}