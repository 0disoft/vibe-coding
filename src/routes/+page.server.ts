import { type BundledLanguage, type BundledTheme, createHighlighter, type Highlighter } from 'shiki';
import type { PageServerLoad } from './$types';

const THEME: BundledTheme = 'catppuccin-mocha';
const LANGUAGES: BundledLanguage[] = ['typescript', 'toml'];

// TOML 코드 예시
const tomlCode = `[package]
name = "my-app"
version = "1.0.0"
edition = "2024"

[dependencies]
serde = { version = "1.0", features = ["derive"] }
tokio = { version = "1", features = ["full"] }

[dev-dependencies]
pretty_assertions = "1.4"`;

// TypeScript 코드 예시
const tsCode = `interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  if (!response.ok) {
    throw new Error('User not found');
  }
  return response.json();
}

const user = await fetchUser(123);
console.log(user.name);`;

// HTML 이스케이프 함수 (폴백용)
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// 폴백용 기본 HTML 생성
function createFallbackHtml(code: string): string {
  return `<pre class="shiki" style="background-color:#1e1e2e"><code>${escapeHtml(code)}</code></pre>`;
}

// 모듈 로드 시 미리 하이라이팅 (서버 시작 시 1회만 실행)
// 이후 모든 요청은 캐시된 HTML을 즉시 반환
let highlighter: Highlighter | null = null;
let cachedCodeBlocks: {
  toml: { code: string; html: string; };
  typescript: { code: string; html: string; };
};

const ready = (async () => {
  try {
    highlighter = await createHighlighter({
      themes: [THEME],
      langs: LANGUAGES
    });

    // 서버 시작 시 미리 하이라이팅 완료
    cachedCodeBlocks = {
      toml: {
        code: tomlCode,
        html: highlighter.codeToHtml(tomlCode, { lang: 'toml', theme: THEME })
      },
      typescript: {
        code: tsCode,
        html: highlighter.codeToHtml(tsCode, { lang: 'typescript', theme: THEME })
      }
    };
  } catch (error) {
    // Shiki 초기화 실패 시 폴백: 하이라이팅 없이 기본 스타일로 표시
    console.error('[SSR Highlighter] Failed to initialize Shiki:', error);
    cachedCodeBlocks = {
      toml: {
        code: tomlCode,
        html: createFallbackHtml(tomlCode)
      },
      typescript: {
        code: tsCode,
        html: createFallbackHtml(tsCode)
      }
    };
  }
})();

export const load: PageServerLoad = async () => {
  // 첫 요청에서만 초기화 대기, 이후는 즉시 반환
  await ready;
  return { codeBlocks: cachedCodeBlocks };
};
