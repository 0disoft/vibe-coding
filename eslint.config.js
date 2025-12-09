import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

// .gitignore 파일 경로 (이 파일의 패턴들은 ESLint에서 무시됨)
const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default defineConfig(
	// .gitignore 패턴 자동 적용 (node_modules, build 등 무시)
	includeIgnoreFile(gitignorePath),

	// Paraglide 자동 생성 파일 무시 (eslint-disable 경고 방지)
	{
		ignores: ['src/paraglide/**']
	},

	// JavaScript 기본 권장 규칙
	js.configs.recommended,

	// TypeScript 권장 규칙
	...ts.configs.recommended,

	// Svelte 권장 규칙
	...svelte.configs.recommended,

	// Prettier와 충돌하는 규칙 비활성화
	prettier,
	...svelte.configs.prettier,

	// 전역 설정
	{
		languageOptions: {
			// 브라우저 + Node.js 전역 변수 인식 (window, document, process 등)
			globals: { ...globals.browser, ...globals.node }
		},
		rules: {
			// TypeScript에서 no-undef 비활성화
			// (타입 체커가 더 정확하게 처리하므로 ESLint 규칙은 불필요)
			'no-undef': 'off'
		}
	},

	// Svelte 파일 전용 설정
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				// 타입 인식 린팅 활성화 (더 정확한 타입 기반 규칙)
				projectService: true,
				// Svelte 파일 확장자 인식
				extraFileExtensions: ['.svelte'],
				// TypeScript 파서 사용
				parser: ts.parser,
				// Svelte 설정 파일 참조
				svelteConfig
			}
		},
		rules: {
			// localizeUrl()을 사용 중이므로 resolve() 강제 비활성화
			// (Paraglide의 localizeUrl도 유효한 i18n URL 처리 방식)
			'svelte/no-navigation-without-resolve': 'off',

			// {@html}은 신뢰할 수 있는 서버 데이터에만 사용 (경고로 완화)
			'svelte/no-at-html-tags': 'warn',

			// 삼항 연산자 표현식 허용 (모달 토글 패턴에서 사용)
			'@typescript-eslint/no-unused-expressions': 'off'
		}
	}
);
