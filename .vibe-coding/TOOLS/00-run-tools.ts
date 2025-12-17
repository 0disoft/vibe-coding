import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

type Step = {
	file: string;
	label: string;
	args?: string[];
};

const scriptDir = fileURLToPath(new URL('.', import.meta.url));
const bunExe = process.execPath;

const rawArgs = process.argv.slice(2);
const separatorIndex = rawArgs.indexOf('--');
const pipelineArgs = separatorIndex === -1 ? rawArgs : rawArgs.slice(0, separatorIndex);
const tailArgs = separatorIndex === -1 ? [] : rawArgs.slice(separatorIndex + 1);

const stopOnFail = pipelineArgs.includes('--stop-on-fail');
const fixBoldWrite = pipelineArgs.includes('--fix-bold-write');
const lintNonStrict = pipelineArgs.includes('--lint-nonstrict') || pipelineArgs.includes('--lint-warn');
const lintNoDsTokens = pipelineArgs.includes('--lint-no-ds-tokens');

const forwardArgs =
	separatorIndex === -1
		? pipelineArgs.filter(
				(arg) =>
					arg !== '--stop-on-fail' &&
					arg !== '--fix-bold-write' &&
					arg !== '--lint-nonstrict' &&
					arg !== '--lint-warn' &&
					arg !== '--lint-no-ds-tokens'
			)
		: tailArgs;

const steps: Step[] = [
	{ file: '01-security-patterns.ts', label: 'security-patterns' },
	{
		file: '02-lint-patterns.ts',
		label: 'lint-patterns',
		args: [
			...(lintNonStrict ? [] : ['--strict']),
			...(lintNoDsTokens ? ['--no-ds-tokens'] : [])
		]
	},
	{ file: '03-route-audit.ts', label: 'route-audit' },
	{ file: '04-a11y-ux-patterns.ts', label: 'a11y-ux-patterns' },
	{ file: '05-file-size-patterns.ts', label: 'file-size-patterns' },
	{
		file: '06-fix-bold-issues.ts',
		label: 'fix-bold-issues',
		args: fixBoldWrite ? [] : ['--dry-run'],
	},
];

let hasFailure = false;

for (const step of steps) {
	const wrapperPath = join(scriptDir, step.file);
	console.log(`\n==> ${step.label}`);

	const result = Bun.spawnSync({
		cmd: [bunExe, wrapperPath, ...(step.args ?? []), ...forwardArgs],
		stdout: 'inherit',
		stderr: 'inherit',
	});

	const exitCode = result.exitCode ?? 1;
	if (exitCode !== 0) {
		hasFailure = true;
		console.log(`✖ ${step.label} failed (exit ${exitCode})`);
		if (stopOnFail) break;
	} else {
		console.log(`✔ ${step.label} ok`);
	}
}

// 마지막 단계: biome 린트 및 포맷팅 자동 수정
console.log('\n==> lint (biome check --write)');
const lintResult = Bun.spawnSync({
	cmd: ['bunx', 'biome', 'check', '.', '--write'],
	stdout: 'inherit',
	stderr: 'inherit',
});

if ((lintResult.exitCode ?? 1) !== 0) {
	hasFailure = true;
	console.log('✖ lint failed');
} else {
	console.log('✔ lint ok');
}

process.exit(hasFailure ? 1 : 0);
