# MCP 서버 추천 가이드

로컬에서 바로 사용 가능한 MCP(Model Context Protocol) 서버 모음.
`bunx`/`uvx` 기반 설정 포함. 일부 서버는 API 키 필요.

> 💡 MCP는 AI 에이전트가 외부 도구/데이터와 상호작용하는 표준 프로토콜 (Anthropic, 2024)

---

## 🎯 선택 기준

1. **로컬 실행 우선** - 대부분 API 키 불필요
2. **범용성** - 개발 워크플로우에 실질적 도움
3. **유용한 원격 서버 포함** - GitHub, Context7 등 (API 키 필요)

---

## ⭐ 추천 MCP 서버 목록

### 1. Memory (지식 그래프 메모리)

세션 간 지속되는 지식 그래프 기반 메모리 시스템.

| 항목 | 내용 |
|------|------|
| 패키지 | `@modelcontextprotocol/server-memory` |
| 런타임 | Node.js (bunx) |
| 용도 | 컨텍스트 기억, 프로젝트 지식 누적, 관계 그래프 |

---

### 2. Sequential Thinking (순차적 사고)

복잡한 문제를 단계별로 분해하여 해결.

| 항목 | 내용 |
|------|------|
| 패키지 | `@modelcontextprotocol/server-sequential-thinking` |
| 런타임 | Node.js (bunx) |
| 용도 | 복잡한 추론, 단계별 문제 해결, 사고 과정 시각화 |

---

### 3. Fetch (웹 콘텐츠)

웹 페이지를 가져와 LLM 친화적 형식으로 변환.

| 항목 | 내용 |
|------|------|
| 패키지 | `mcp-server-fetch` |
| 런타임 | Python (uvx) |
| 용도 | 문서 참조, API 문서 읽기, 외부 정보 수집 |

---

### 4. Puppeteer (브라우저 자동화)

Chromium 기반 브라우저 제어 및 스크래핑.

| 항목 | 내용 |
|------|------|
| 패키지 | `@modelcontextprotocol/server-puppeteer` |
| 런타임 | Node.js (bunx) |
| 용도 | 웹 자동화, 스크린샷, 폼 입력, 데이터 추출 |

---

### 5. GitHub (API 키 필요)

저장소 관리, 이슈, PR 등. Personal Access Token 필요.

| 항목 | 내용 |
|------|------|
| 패키지 | `@modelcontextprotocol/server-github` |
| 런타임 | Node.js (bunx) |
| API 키 | GitHub Settings → Developer → Personal Access Token → `GITHUB_PERSONAL_ACCESS_TOKEN` |

---

### 6. Context7 (라이브러리 문서, API 키 필요)

최신 라이브러리 문서를 LLM에 직접 주입. 오래된 정보로 인한 hallucination 방지.

| 항목 | 내용 |
|------|------|
| 패키지 | `@upstash/context7-mcp` |
| 런타임 | Node.js (bunx) |
| API 키 | Context7 계정에서 API 키 발급 → `CONTEXT7_API_KEY` 환경변수 |
| 용도 | 프롬프트에 "use context7" 추가 시 최신 문서 참조 |

---

### 7. Chrome DevTools (브라우저 디버깅)

Chrome DevTools 기반 브라우저 자동화 및 디버깅. Puppeteer보다 강력한 성능 분석.

| 항목 | 내용 |
|------|------|
| 패키지 | `chrome-devtools-mcp` |
| 런타임 | Node.js (bunx) |
| 용도 | 성능 트레이싱, 네트워크 분석, 스크린샷, 콘솔 로그 |

---

### 8. Playwright (크로스 브라우저)

멀티 브라우저 자동화 (Chrome, Firefox, Safari). E2E 테스트에 적합.

| 항목 | 내용 |
|------|------|
| 패키지 | `@playwright/mcp` |
| 런타임 | Node.js (bunx) |
| 용도 | 크로스 브라우저 테스트, 웹 자동화, 스크래핑 |

---

### 9. Shell (터미널 명령어)

안전한 셸 명령어 실행 및 터미널 관리.

| 항목 | 내용 |
|------|------|
| 패키지 | `shell-mcp-server` |
| 런타임 | Node.js (bunx) |
| 용도 | 터미널 명령 실행, 프로세스 관리, 빌드 자동화 |
| ⚠️ 주의 | 보안상 허용할 명령어/디렉토리를 제한하는 것을 권장 |

---

### 10. Time (시간/타임존)

현재 시간, 타임존 변환, 날짜 계산 등.

| 항목 | 내용 |
|------|------|
| 패키지 | `mcp-server-time` |
| 런타임 | Python (uvx) |
| 용도 | 현재 시간 조회, 타임존 변환, 날짜 계산 |

---

### 11. Calculator (계산기)

수학 연산 및 계산 지원.

| 항목 | 내용 |
|------|------|
| 패키지 | `mcp-server-calculator` |
| 런타임 | Python (uvx) |
| 용도 | 수학 연산, 단위 변환, 공식 계산 |

---

### 12. Filesystem (파일시스템)

로컬 파일/디렉토리 읽기, 쓰기, 검색.

| 항목 | 내용 |
|------|------|
| 패키지 | `@modelcontextprotocol/server-filesystem` |
| 런타임 | Node.js (bunx) |
| 용도 | 파일 탐색, 코드 읽기/수정, 프로젝트 구조 파악 |
| ⚠️ 주의 | 접근 가능한 디렉토리를 인자로 지정해야 함 |

---

## 📋 통합 설정 예시

### Claude Desktop / Cursor 등의 `mcp_config.json`

```json
{
  "mcpServers": {
    "memory": {
      "command": "bunx",
      "args": ["@modelcontextprotocol/server-memory"]
    },
    "sequential-thinking": {
      "command": "bunx",
      "args": ["@modelcontextprotocol/server-sequential-thinking"]
    },
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"]
    },
    "puppeteer": {
      "command": "bunx",
      "args": ["@modelcontextprotocol/server-puppeteer"]
    },
    "github": {
      "command": "bunx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_PAT"
      }
    },
    "context7": {
      "command": "bunx",
      "args": ["@upstash/context7-mcp"],
      "env": {
        "CONTEXT7_API_KEY": "YOUR_CONTEXT7_API_KEY"
      }
    },
    "chrome-devtools": {
      "command": "bunx",
      "args": ["chrome-devtools-mcp@latest"]
    },
    "playwright": {
      "command": "bunx",
      "args": ["@playwright/mcp"]
    },
    "shell": {
      "command": "bunx",
      "args": ["shell-mcp-server"]
    },
    "time": {
      "command": "uvx",
      "args": ["mcp-server-time"]
    },
    "calculator": {
      "command": "uvx",
      "args": ["mcp-server-calculator"]
    },
    "filesystem": {
      "command": "bunx",
      "args": ["@modelcontextprotocol/server-filesystem", "."]
    }
  }
}
```

---

## 🔧 설정 파일 위치

| 클라이언트 | 설정 파일 경로 |
|-----------|---------------|
| **Claude Desktop** (macOS) | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| **Claude Desktop** (Windows) | `%APPDATA%\Claude\claude_desktop_config.json` |
| **Claude Code** | `~/.claude.json` 또는 프로젝트 `.mcp.json` |
| **Cursor** | `.cursor/mcp.json` (프로젝트) 또는 전역 설정 |
| **VSCode** | `.vscode/mcp.json` (프로젝트) 또는 User Profile |
| **Gemini CLI** (macOS/Linux) | `~/.gemini/settings.json` |
| **Gemini CLI** (Windows) | `%USERPROFILE%\.gemini\settings.json` |
| **Antigravity** | VSCode/Cursor 설정 사용 (동일) |
| **Codex (OpenAI)** | `~/.codex/config.json` 또는 프로젝트 `.codex/` |

---

## 📚 참고 자료

- [MCP 공식 서버 저장소](https://github.com/modelcontextprotocol/servers)
- [MCP 공식 문서](https://modelcontextprotocol.io)
- [MCP 서버 디렉토리](https://mcpservers.org)
