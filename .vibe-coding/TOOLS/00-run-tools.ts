#!/usr/bin/env bun
/**
 * 00-run-tools.ts — 툴 체인 실행 오케스트레이터
 *
 * 모든 분석 도구를 순차적으로 실행하고 결과를 요약합니다.
 */

import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// ─────────────────────────────────────────────────────────────────────────────
// 🔧 Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

interface Step {
	file: string;
	label: string;
	args?: string[];
	/** 외부 명령 (bun run 등) - 설정 시 file 대신 cmd로 직접 실행 */
	cmd?: string[];
	/** forwardArgs 전달 여부 (기본: true) */
	forward?: boolean;
}

interface PipelineConfig {
	stopOnFail: boolean;
	fixBoldWrite: boolean;
	lintNonStrict: boolean;
	lintNoDsTokens: boolean;
	forwardArgs: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 🎨 Constants & Helpers
// ─────────────────────────────────────────────────────────────────────────────

const c = {
	green: (t: string) => `\x1b[32m${t}\x1b[0m`,
	red: (t: string) => `\x1b[31m${t}\x1b[0m`,
	cyan: (t: string) => `\x1b[36m${t}\x1b[0m`,
	gray: (t: string) => `\x1b[90m${t}\x1b[0m`,
	bold: (t: string) => `\x1b[1m${t}\x1b[0m`,
};

// 파이프라인 전용 옵션 (forwardArgs에서 제외됨)
const PIPELINE_OPTIONS = new Set([
	'--stop-on-fail',
	'--fix-bold-write',
	'--lint-nonstrict',
	'--lint-warn',
	'--lint-no-ds-tokens',
]);

const SCRIPT_DIR = fileURLToPath(new URL('.', import.meta.url));
const BUN_EXE = process.execPath;

// ─────────────────────────────────────────────────────────────────────────────
// 💡 Services & Components
// ─────────────────────────────────────────────────────────────────────────────

/** Service to handle configuration and arguments */
class PipelineConfigService {
	public static parseArgs(args: string[]): PipelineConfig {
		const separatorIndex = args.indexOf('--');
		const pipelineArgs = separatorIndex === -1 ? args : args.slice(0, separatorIndex);
		const tailArgs = separatorIndex === -1 ? [] : args.slice(separatorIndex + 1);

		const stopOnFail = pipelineArgs.includes('--stop-on-fail');
		const fixBoldWrite = pipelineArgs.includes('--fix-bold-write');
		const lintNonStrict = pipelineArgs.includes('--lint-nonstrict') || pipelineArgs.includes('--lint-warn');
		const lintNoDsTokens = pipelineArgs.includes('--lint-no-ds-tokens');

		const forwardArgs = separatorIndex === -1
			? pipelineArgs.filter((arg) => !PIPELINE_OPTIONS.has(arg))
			: tailArgs;

		return {
			stopOnFail,
			fixBoldWrite,
			lintNonStrict,
			lintNoDsTokens,
			forwardArgs,
		};
	}
}

/** Logger for unified output handling */
class ConsoleLogger {
	log(message: string) {
		console.log(message);
	}

	stepSuccess(label: string, duration: string) {
		console.log(`${c.green('✔')} ${c.bold(label)} ${c.gray(`(${duration}s)`)}`);
	}

	stepFail(label: string, duration: string) {
		console.log(`${c.red('✖')} ${c.bold(label)} ${c.red('failed')} ${c.gray(`(${duration}s)`)}`);
	}

	header(config: PipelineConfig) {
		console.log(c.cyan('🚀 Starting tools pipeline...'));
		console.log(c.gray(`Options: ${JSON.stringify(config, null, 2)}\n`));
	}

	command(cmd: string[]) {
		console.log(c.gray(`$ ${cmd.join(' ')}`));
	}
}

/** Service to execute individual tools */
class ToolRunner {
	constructor(
		private config: PipelineConfig,
		private logger: ConsoleLogger
	) { }

	public run(step: Step): boolean {
		this.logger.log(c.bold(`\n[ ${step.label} ]`));

		const cmd = this.buildCommand(step);
		this.logger.command(cmd);

		const stepStart = performance.now();
		const result = Bun.spawnSync({
			cmd,
			stdout: 'inherit',
			stderr: 'inherit',
		});
		const stepDuration = ((performance.now() - stepStart) / 1000).toFixed(2);

		if ((result.exitCode ?? 1) === 0) {
			this.logger.stepSuccess(step.label, stepDuration);
			return true;
		}

		this.logger.stepFail(step.label, stepDuration);
		return false;
	}

	private buildCommand(step: Step): string[] {
		const cmd = step.cmd
			? [...step.cmd]
			: [BUN_EXE, join(SCRIPT_DIR, step.file), ...(step.args ?? [])];

		// forward 옵션이 false가 아니면 forwardArgs 추가
		if (step.forward !== false) {
			cmd.push(...this.config.forwardArgs);
		}

		return cmd;
	}
}

/** Manager to orchestrate the pipeline */
class PipelineManager {
	private config: PipelineConfig;
	private logger: ConsoleLogger;
	private runner: ToolRunner;
	private steps: Step[];

	constructor() {
		const rawArgs = process.argv.slice(2);
		this.config = PipelineConfigService.parseArgs(rawArgs);
		this.logger = new ConsoleLogger();
		this.runner = new ToolRunner(this.config, this.logger);
		this.steps = this.defineSteps();
	}

	private defineSteps(): Step[] {
		return [
			{ file: '01-security-patterns.ts', label: 'security-patterns' },
			{
				file: '02-lint-patterns.ts',
				label: 'lint-patterns',
				args: [
					...(this.config.lintNonStrict ? [] : ['--strict']),
					...(this.config.lintNoDsTokens ? ['--no-ds-tokens'] : []),
				],
			},
			{ file: '03-route-audit.ts', label: 'route-audit' },
			{ file: '04-a11y-ux-patterns.ts', label: 'a11y-ux-patterns' },
			{ file: '05-file-size-patterns.ts', label: 'file-size-patterns' },
			{
				file: '06-fix-bold-issues.ts',
				label: 'fix-bold-issues',
				args: this.config.fixBoldWrite ? [] : ['--dry-run'],
			},
			{
				file: '', // cmd 사용 시 무시됨
				label: 'lint (biome check --write)',
				// bunx 대신 로컬 biome 사용 (속도/버전 일관성)
				cmd: ['bun', 'run', 'biome', 'check', '.', '--write'],
				forward: false,
			},
		];
	}

	public run() {
		this.logger.header(this.config);
		const startTime = performance.now();
		let hasFailure = false;

		for (const step of this.steps) {
			const success = this.runner.run(step);
			if (!success) {
				hasFailure = true;
				if (this.config.stopOnFail) {
					this.logger.log(c.red('\n🛑 Aborting due to failure (--stop-on-fail)'));
					break;
				}
			}
		}

		const totalTime = ((performance.now() - startTime) / 1000).toFixed(2);
		this.logger.log(`\n⏱️ Total execution time: ${totalTime}s`);

		if (hasFailure) {
			this.logger.log(c.red('💥 Some checks failed.'));
			process.exit(1);
		} else {
			this.logger.log(c.green('✨ All checks passed!'));
			process.exit(0);
		}
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// 🚀 Main Entry
// ─────────────────────────────────────────────────────────────────────────────

if (import.meta.main) {
	const pipeline = new PipelineManager();
	pipeline.run();
}
