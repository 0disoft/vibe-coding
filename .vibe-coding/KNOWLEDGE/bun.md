# Bun v1.1 - v1.3: 런타임을 넘어선 "통합 인프라"로의 진화

2024년 하반기에서 2025년 초에 걸친 Bun의 행보는 명확합니다. 단순한 "빠른 Node.js 대체재"를 넘어, 데이터베이스, 프론트엔드 빌드, 보안, 테스팅 도구를 모두 내재화한 **All-in-One 인프라**로 거듭나고 있습니다.

개발팀은 이제 Bun을 단순 실행기가 아닌, **기술 스택의 통합 솔루션**으로 바라보고 아키텍처를 설계해야 합니다.

---

## 1. Executive Summary: 핵심 변화의 3대 축

1. **Zero-Dependency Data Layer:** PostgreSQL, MySQL, SQLite, Redis 클라이언트를 런타임 레벨에서 내장(`Bun.SQL`)했습니다. 외부 드라이버 의존성을 제거하고 I/O 성능을 극대화하려는 전략입니다.
2. **Full-Stack DX Consolidation:** `bun ./index.html` 명령 하나로 Vite와 유사한 개발 환경을 제공합니다. 프론트엔드와 백엔드의 경계를 허물고 단일 런타임 위에서 풀스택 애플리케이션을 구동하는 모델을 제시합니다.
3. **Enterprise-Grade Tooling:** JUnit 리포터, 비밀 관리(`Bun.secrets`), CSRF 보호, 시큐리티 스캐너 등 엔터프라이즈 환경에서 필수적인 보안 및 CI/CD 기능을 표준 라이브러리로 흡수했습니다.

---

## 2. Critical Milestones: 버전별 아키텍처 영향도

단순 기능 추가가 아닌, 개발 패러다임을 바꿀 수 있는 마일스톤 위주로 재구성했습니다.

| 버전        | 핵심 마일스톤            | 아키텍처 및 개발 전략 변화                                                                                                                                                             |
| :---------- | :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **v1.1.35** | **CI/CD Integration**    | **[테스트]** `junit` 리포터 지원으로 Jenkins, GitLab CI 등 엔터프라이즈 파이프라인과의 연동성이 완성되었습니다. `--preload`를 통해 워커(Worker) 환경의 초기화 제어권이 강화되었습니다. |
| **v1.2.0**  | **Native Data Layer**    | **[데이터]** `Bun.SQL`의 등장은 외부 DB 드라이버(pg, mysql2 등) 제거를 의미합니다. `import { sql } from "bun"` 패턴을 표준으로 채택하여 의존성 관리를 단순화하십시오.                  |
| **v1.2.3**  | **Frontend Integration** | **[프론트엔드]** HTML을 진입점으로 사용하는 개발 서버가 도입되었습니다. 간단한 SPA/MPA 프로젝트에서 Vite나 Webpack 같은 복잡한 번들러 구성을 생략할 수 있습니다.                       |
| **v1.2.5**  | **Security Foundation**  | **[보안]** `Bun.CSRF`와 향상된 Node-API 호환성은 레거시 Node 모듈을 수용하면서도, 보안 로직을 런타임 레벨에서 강제할 수 있게 합니다.                                                   |
| **v1.3.0**  | **The Full-Stack Leap**  | **[인프라]** 가장 거대한 도약입니다. Redis 내장, `Bun.secrets`를 통한 OS 키체인 연동, 패키지 보안 스캐너 등 **"프로덕션 레디"** 기능이 대거 탑재되었습니다.                            |
| **v1.3.2**  | **Stability Fix**        | **[운영]** 패키지 설치 전략이 `hoisted`로 회귀했습니다. 1.3.0 초기 도입 시 발생했던 모노레포/워크스페이스 호환성 문제가 해결되었으므로, **1.3.x 도입의 최적기**는 v1.3.2 이후입니다.   |

---

## 3. Strategic Action Plan: 상황별 도입 가이드

### 3-1. Greenfield Project (신규 프로젝트)

- **Database:** `pg`나 `mysql2` 설치를 금지하고 `Bun.SQL`과 `Bun.Redis`를 표준으로 채택하십시오. ORM이 필요하다면 Drizzle ORM 등과 조합하여 Bun Native 드라이버를 활용하는 것이 성능상 유리합니다.
- **Architecture:** 별도의 백엔드/프론트엔드 분리 없이 `Bun.serve()`와 HTML Imports를 활용한 단일 프로세스 아키텍처를 검토하십시오. 배포 복잡도가 획기적으로 낮아집니다.
- **Security:** `.env` 파일에 비밀키를 평문으로 저장하는 관행을 버리고, `Bun.secrets`를 통해 인프라 레벨의 보안 저장소를 활용하십시오.

### 3-2. Legacy Migration (기존 Node.js 전환)

- **Testing:** Jest를 `bun:test`로 교체하는 것이 가장 ROI가 높습니다. v1.2.1의 인라인 스냅샷과 v1.3.0의 `test.failing`/`expectTypeOf` 지원으로 마이그레이션 장벽이 거의 사라졌습니다.
- **Lockfile:** v1.2.23의 `pnpm-lock.yaml` 마이그레이션 도구를 활용하여 패키지 매니저를 전환하십시오. 단, **v1.3.2 이상**을 사용하여 `hoisted` 설치 전략의 안정성을 확보해야 합니다.
- **Performance:** 병목이 발생하는 API 서버에 우선적으로 Bun을 도입하되, 호환성이 중요한 레거시 라이브러리가 많다면 v1.2.5 이상의 Node-API 개선 사항을 반드시 확인해야 합니다.

### 3-3. CI/CD Pipeline

- **Security Gate:** CI 단계에서 `bun install` 시 Security Scanner API 기능을 활성화하여, 악성 패키지 유입을 차단하는 절차를 의무화하십시오.
- **Artifacts:** `bun build --compile`을 사용하여 소스코드가 아닌, 단일 실행 바이너리 형태로 배포하는 전략을 취하면 콜드 스타트와 배포 속도를 동시에 개선할 수 있습니다.

Bun은 이제 단순한 'JS 런타임'이 아닙니다. 데이터, 보안, 빌드, 테스트를 모두 아우르는 **"인프라 스트럭처로서의 자바스크립트"**를 지향하고 있습니다. 팀의 기술 스택을 단순화(Simplification)하고 싶다면, 지금이 Bun v1.3.2+ 도입을 진지하게 고려해야 할 시점입니다.

---

## 4. Bun v1.3.4 (2025-12-06) 요약

- URLPattern 지원, `bun:test` fake timers, `fetch` 프록시 헤더, `console.log('%j')` 추가로 Node 호환성과 DX가 크게 개선됨.
- `http.Agent({ keepAlive: true })` 커넥션 재사용 버그가 고쳐져 장기 실행 서비스의 연결 누수 위험이 낮아짐.
- `bun build --compile` 산출물이 기본으로 `tsconfig.json`과 `package.json`을 자동 로드하지 않으니, 필요한 경우 autoload 옵션을 명시해야 함.
- SQLite 3.51.1 업그레이드와 각종 크래시/호환성 수정으로 복잡한 쿼리, 프록시 기반 통신, 타이머 의존 테스트에서 안정성이 향상됨.
