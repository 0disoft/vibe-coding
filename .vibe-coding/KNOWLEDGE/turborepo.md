# Turborepo 2.3 ~ 2.6 주요 변경사항 요약

먼저 결론부터 말할게요.
이 기간에 실질적으로 의미 있는 Turborepo 릴리즈는 2.3 / 2.4 / 2.5 / 2.6 (그리고 2.6.2 패치)입니다.
그 안에서 “코드 짤 때 진짜 알아야 하는 것들”만 골라서 정리했습니다.

---

## 1. 2024-11-13 ~ 2025-12-03 사이 주요 버전 / 날짜 요약

엄밀히 따지면 2.3의 정확한 릴리즈 날짜는 뉴스레터/포스트마다 하루 이틀 정도 오차가 있어 보입니다.
여기서는 “이 기간 동안 새로 등장해서 실사용에 영향을 미친 버전들”이라는 관점으로 2.3부터 포함했습니다.

| 버전  | 릴리즈 날짜 (대략)                                             | 주요 내용 한 줄 요약                                                                                            |
| ----- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 2.3.0 | 2024-11 중순 (뉴스레터 기준 11-12 전후로 추정) ([LinkedIn][1]) | Boundaries RFC, `package#task` 쇼트컷, 캐시 플래그 개편 (`--cache` 등)                                          |
| 2.4.0 | 2025-01-31 ([Turborepo][2])                                    | `turbo boundaries` 실험 기능, Watch Mode 캐시, TUI 개선, `schema.json` in `node_modules`, ESLint v9 Flat Config |
| 2.5.0 | 2025-04-03 ([Turborepo][3])                                    | Sidecar tasks(`with`), `--continue=dependencies-successful`, `turbo.jsonc`, Bun용 `turbo prune`, `$TURBO_ROOT$` |
| 2.6.0 | 2025-10-28 ([Turborepo][4])                                    | Microfrontends dev proxy, Bun 패키지 매니저 Stable, TUI task 검색(`/`)                                          |
| 2.6.2 | 2025-12-03 (GitHub Release 페이지 기준) ([GitHub][5])          | 2.6 기반 버그/안정화 패치, 사용법 자체는 큰 변화 없음                                                           |

참고로 Vercel 공식 문서에서는 Skew Protection 문제 때문에 Turborepo 2.4.1 이상 사용을 권장합니다. ([Vercel][6])
(날짜까지는 크게 중요하지 않고, “2.4 쓴다면 최소 2.4.1+로” 정도만 기억해두면 됩니다.)

---

## 2. “코딩할 때 꼭 알아야 하는 변화”만 골라서 버전별 정리

아래 표는 버전별로

- 무엇이 새로 생겼는지
- 무엇이 deprecated 되었는지
- 실제 코드를 어떻게 바꿔야 하는지
  에만 집중했습니다.
  순수 버그픽스·성능 개선은 전부 제외했습니다.

### 2.3 – Boundaries RFC, 캐시 플래그 개편, 패키지 태스크 쇼트컷

| 항목                         | 종류                           | 내용 / 왜 중요한지                                                                                                                                                                                              | 실제 사용 예 / 마이그레이션 포인트                                                                                                                                                                                                                                            |
| ---------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Boundaries RFC               | 새 기능 (RFC 레벨)             | 모노레포에서 “어디까지 import 해도 되는지”, “어떤 패키지가 어떤 패키지를 참조해도 되는지”를 선언해서, 캐시 안정성과 DX를 유지하기 위한 제약 시스템. 2.4의 `turbo boundaries` CLI의 이론적 바탕. ([LinkedIn][1]) | 큰 단위의 설계/리팩토링 시 “패키지 간 계층 구조를 코드로 명시한다”는 개념으로 받아들이면 됨. 실 코드 변화보다는 `turbo.json` / 패키지 설정에 규칙을 넣는 방향으로 준비. (실제 CLI는 2.4에서 본격 도입)                                                                        |
| `package#task` 쇼트컷        | 새 기능                        | `turbo run web#build` 같이 “패키지+태스크”를 한 번에 지정하는 Microsyntax 도입. 기존에는 `--filter=web` + `build` 조합을 써야 했음. ([LinkedIn][1])                                                             | 예) `turbo run web#dev` 로 `web` 패키지의 `dev`만 돌리기. 복잡한 `--filter` 없이 단일 태스크를 빠르게 지정할 때 유용. CI에서도 특정 앱만 찍어서 돌릴 때 가독성이 훨씬 좋아짐.                                                                                                 |
| 캐시 플래그 개편 (`--cache`) | 사용법 변경 + Deprecation 기반 | 캐시 동작을 제어하는 플래그들이 `--cache`/`TURBO_CACHE` 중심으로 재편됨. 이와 함께 `--no-cache`, `--remote-only`, `TURBO_REMOTE_ONLY`는 Deprecated 목록에 들어감. ([Turborepo][7])                              | 앞으로는 `turbo run build --cache=<옵션>` 형태로 캐시 동작을 제어하는 게 기본. 기존에 `--no-cache`, `--remote-only` 쓰던 스크립트는 `--cache` 기반으로 옮겨야 함. 예) `--no-cache` 대신 “캐시 비활성화”에 해당하는 `--cache` 옵션으로 교체. (정확한 세부 값은 캐시 문서 참고) |

Deprecated 쪽은 공식 Support Policy에 이렇게 정리되어 있습니다:

- Deprecated: `TURBO_REMOTE_ONLY` / `--remote-only` → 앞으로는 `TURBO_CACHE` 또는 `--cache` 사용 ([Turborepo][7])
- `--no-cache` 역시 `--cache` 플래그로 대체될 예정이라고 run 문서에서 경고. ([Turborepo][8])

실무적으로는
“지금 CI 스크립트나 npm 스크립트에 `--remote-only`, `--no-cache` 있으면 전부 `--cache` 기반으로 갈아엎는다”
이게 2.3 세대에서 가장 중요한 포인트입니다.

---

### 2.4 – `turbo boundaries`, Watch Mode 캐시, `schema.json`, ESLint v9 Flat Config

| 버전 | 항목                                           | 종류                        | 내용 / 왜 중요한지                                                                                                                                                              | 실제 사용 예 / 마이그레이션 포인트                                                                                                                                                                                                    |
| ---- | ---------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.4  | `turbo boundaries`                             | 새 기능 (Experimental)      | Boundaries 기능의 첫 CLI 구현. 레포 전체를 검사해서 ① 패키지 디렉터리 밖 파일 import, ② `dependencies` 에 없는 패키지 import 를 잡아주는 정적 분석 툴. ([Turborepo][2])         | 단순히 `turbo boundaries` 실행만으로 “모노레포 구조 깨는 import”를 알려줌. 캐시 깨지는 원인을 초기에 잡을 수 있음. 아직 Experimental이기 때문에, CI 필수보다는 “주기적으로 돌려보는 린트” 정도로 쓰는 게 안전.                        |
| 2.4  | Watch Mode 캐시 (`--experimental-write-cache`) | 새 기능 (Experimental)      | `turbo watch` 실행 시도 캐시를 기록해서, 개발 중에도 캐시 이득을 얻도록 하는 실험 기능. `turbo watch dev --experimental-write-cache` 형태로 사용. ([Turborepo][2])              | 장점: 거대한 모노레포에서 watch 돌릴 때도 캐시 덕을 볼 수 있음. 단점: Experimental이라 예측하기 어려운 케이스가 있을 수 있음. 프로덕션 빌드 플로우에는 넣지 말고, 개인 개발 환경 또는 소규모 팀에서 먼저 시험해보는 용도 추천.        |
| 2.4  | TUI 개선 (키맵, 상태 유지)                     | 사용성 개선                 | `turbo` 터미널 UI가 이전 실행 상태를 기억하고, `h/c/j/k/p/u/d/m` 등 다양한 키바인딩이 추가됨. ([Turborepo][2])                                                                  | 코드 변화는 없지만, “우리 팀은 TUI를 기본 UI로 쓴다”면 개발자 온보딩 문서에 키맵만 추가해주면 됨. 대형 레포에서 태스크 로그를 보는 경험 자체가 달라짐.                                                                                |
| 2.4  | Circular dependency 추천 메시지                | 사용성 개선                 | 패키지 그래프에 순환 의존성이 있을 때, 단순히 “루프 있다”가 아니라 “어떤 의존성을 끊으면 되는지”까지 제안. ([Turborepo][2])                                                     | 실제 코드 상에서는 여전히 순환 의존성을 직접 끊어야 하지만, 어디를 자르면 되는지 출력이 훨씬 친절해져서, 대형 레포 마이그레이션할 때 시간을 많이 절약할 수 있음.                                                                      |
| 2.4  | `schema.json` in `node_modules`                | 새 기능                     | `turbo.json`의 JSON Schema 파일이 `node_modules/turbo/schema.json` 에 포함됨. 에디터에서 버전 동기화된 자동완성과 검증을 사용할 수 있음. ([Turborepo][2])                       | 루트 `turbo.json`에 다음처럼 넣으면 됨: `{ "$schema": "./node_modules/turbo/schema.json" }` 패키지별 `turbo.json`(Package Config)에서는 상대 경로를 맞춰서 `../../node_modules/turbo/schema.json` 식으로 설정.                        |
| 2.4  | ESLint Flat Config 지원 (v9)                   | 새 기능 (마이그레이션 지원) | `eslint-config-turbo` / `eslint-plugin-turbo` 가 ESLint v9 Flat Config를 지원. 기존 v8 기반 프로젝트도 호환되지만, 앞으로는 Flat Config로 가는 것이 기본 방향. ([Turborepo][2]) | Flat Config 예시: `import turboConfig from 'eslint-config-turbo/flat';` `export default [ ...turboConfig, /* 추가 규칙 */ ];` 새 프로젝트를 만든다면 애초에 Flat Config 기반으로 시작하는 것이 좋고, 기존 v8 설정은 천천히 옮기면 됨. |

추가로, Support Policy 문서 기준으로 현재 Experimental/Deprecated 상태는 다음과 같습니다. ([Turborepo][7])

- Experimental: `turbo query`, `turbo boundaries` / Tags, `--experimental-write-cache` (watch), `turbo ls --affected --output=json`
- Deprecated: `TURBO_REMOTE_ONLY`, `--remote-only` (→ `TURBO_CACHE` / `--cache` 사용)

---

### 2.5 – Sidecar tasks, `turbo.jsonc`, `$TURBO_ROOT$`, Bun prune

| 버전 | 항목                                 | 종류        | 내용 / 왜 중요한지                                                                                                                                                                  | 실제 사용 예 / 마이그레이션 포인트                                                                                                                                                                                                                                                                                                            |
| ---- | ------------------------------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.5  | Sidecar tasks (`with`)               | 새 기능     | 오래 도는 태스크(예: `api#start`)를 다른 태스크(예: `web#dev`)와 항상 같이 띄우기 위한 새로운 설정 키 `with`. 기존에는 `dependsOn`으로는 해결이 불가능했던 케이스. ([Turborepo][3]) | `apps/web/turbo.json` 예시: `\"dev\": { \"with\": [\"api#start\"], \"persistent\": true, \"cache\": false }` `turbo run web#dev` 를 돌리면 `api#start`가 함께 실행됨. “프론트 dev 켤 때 백엔드도 같이 켜져야 하는” 모노레포에서 매우 유용. 기존에 `dev` 스크립트에 터널/백엔드를 직접 붙여두었다면 `with` 쪽으로 분리하는 게 구조가 깔끔해짐. |
| 2.5  | `--continue=dependencies-successful` | 사용법 확장 | `--continue` 플래그에 새로운 값 추가. 실패가 있더라도 태스크 실행을 이어가되, “해당 태스크의 의존성들은 성공한 경우에만” 실행하도록 제어. ([Turborepo][3])                          | 예) 테스트 러너에 적용: `turbo run test --continue=dependencies-successful` 빌드가 실패한 패키지에 대해 추가 테스트를 돌리느라 로그가 뒤엉키는 문제를 줄여줌. CI에서 “가능한 한 많이 돌리되, 완전 무의미한 태스크는 건너뛰기” 같은 정책을 만들 때 좋음.                                                                                       |
| 2.5  | `turbo.jsonc`                        | 새 기능     | Turborepo 설정 파일에 JSONC 지원. 즉, `turbo.jsonc` 파일을 쓰면 주석을 직접 적어둘 수 있음. ([Turborepo][3])                                                                        | 예) `./turbo.jsonc`: `\"test\": { // 빌드 후 테스트 실행 \"dependsOn\": [\"^build\"] }` 기존 `turbo.json` 그대로 두고 싶다면 유지해도 되지만, 장기 유지보수 관점에서는 `turbo.jsonc`로 갈아타고 “왜 이렇게 설정했는지”를 주석으로 적어두는 편이 훨씬 안전.                                                                                    |
| 2.5  | Bun용 `turbo prune`                  | 새 기능     | `turbo prune`이 Bun v1.2+의 텍스트 기반 `bun.lock`을 지원. Bun 모노레포에서도 “프룬된 서브 레포”를 만들어 도커 이미지 줄일 수 있음. ([Turborepo][3])                                | Bun을 패키지 매니저로 쓰면서 “배포용 최소 레포” 뽑아내고 싶다면 이제 Bun도 1등 시민. 기존에 pnpm/yarn에서만 prune 파이프라인을 쓰고 있었다면 Bun 레포에도 그대로 복제 가능.                                                                                                                                                                   |
| 2.5  | `$TURBO_ROOT$` microsyntax           | 새 기능     | `inputs` 같은 경로 설정에서 `../../..` 같은 상대 경로 대신 “워크스페이스 루트”를 가리키는 `$TURBO_ROOT$` 사용 가능. ([Turborepo][3])                                                | 예전: `\"inputs\": [\"../../important-file.txt\"]` → 패키지 위치 바뀌면 다 깨짐. 이제: `\"inputs\": [\"$TURBO_ROOT$/important-file.txt\"]` 패키지를 옮겨도 경로가 안전해져서, 장기적으로 모노레포 구조 갈아엎을 계획이 있으면 무조건 새 방식으로 쓰는 게 좋음.                                                                                |
| 2.5  | OpenAPI viewer (Remote Cache)        | 새 기능     | Remote Cache 프로토콜의 OpenAPI 스펙을 웹에서 인간 친화적인 뷰로 제공. 자체 호스팅 Remote Cache 구현을 만들거나 디버깅할 때 도움. ([Turborepo][3])                                  | 직접 Remote Cache 서버를 구현하거나 포크할 계획이 아니라면 당장 코드 변경은 필요 없음. 다만 “나중에 Remote Cache를 커스텀해야겠다” 싶으면 이 스펙 문서가 기준점이 됨.                                                                                                                                                                         |

---

### 2.6 – Microfrontends dev proxy, Bun 안정화, TUI task 검색

| 버전 | 항목                       | 종류        | 내용 / 왜 중요한지                                                                                                                                                                       | 실제 사용 예 / 마이그레이션 포인트                                                                                                                                                                                                                                                                                                                                                       |
| ---- | -------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.6  | Microfrontends dev proxy   | 새 기능     | 하나의 도메인(예: `localhost:3024`)에서 여러 앱을 zone 단위로 서빙하는 vertical microfrontends를 로컬 개발에서 지원하는 프록시. `microfrontends.json` 파일을 통해 정의. ([Turborepo][4]) | 예시 `./apps/web/microfrontends.json`: `\"applications\": { \"web\": { \"development\": { \"local\": 3000 } }, \"docs\": { \"development\": { \"local\": 3001 }, \"routing\": [{ \"paths\": [\"/docs\", \"/docs/:path*\"] }] } }` 그냥 `turbo dev`만 돌리면, `/:path*`는 `web`, `/docs/*` 는 `docs`로 라우팅. 로컬에서 “실제 프로덕션과 거의 같은 microfrontends 구조”를 흉내낼 수 있음. |
| 2.6  | Bun package manager Stable | 안정화      | 이제 Bun 패키지 매니저가 Turborepo에서 Stable로 승격. Bun의 `bun.lock` v1 포맷을 정식으로 지원하고, 의존성 변경에 따라 필요한 패키지에서만 캐시를 무효화할 수 있음. ([Turborepo][4])     | 이미 Bun을 쓰고 있던 레포는 “갑자기 전체가 캐시 미스 나는 문제”가 크게 줄어듦. 새 레포에서 패키지 매니저를 고를 때 `pnpm / npm / yarn / bun` 중에서 Bun도 완전히 동급 옵션이 된 셈.                                                                                                                                                                                                      |
| 2.6  | TUI task 검색(`/`)         | 사용성 개선 | 터미널 UI에서 `/`를 눌러 task 이름으로 필터링 가능. 대형 레포에서 수십·수백개의 태스크 중 원하는 것만 빠르게 찾을 수 있음. ([Turborepo][4])                                              | 실무적으로는 “터보 TUI를 제대로 쓰려면 `/`로 검색하는 습관을 들인다” 정도. 코드나 설정에는 영향 없음.                                                                                                                                                                                                                                                                                    |

2.6.2는 위 기능들을 기반으로 한 버그픽스/안정화 패치라, 설정/사용법 차원에서 새로 알아야 할 내용은 없다고 봐도 됩니다. ([GitHub][5])

---

## 3. 지금 Turborepo 쓰면서 최소한으로 챙기면 좋은 체크리스트

요약해서, 제로디 입장에서 “실제 코드에 당장 영향 있는 것만” 좁혀보면 대략 이렇게 정리됩니다.

- 기존 스크립트에 `--remote-only`, `--no-cache`, `TURBO_REMOTE_ONLY` 있으면 전부 `--cache` / `TURBO_CACHE` 기반으로 갈아타기
- 모노레포의 패키지 간 의존 구조가 복잡하다면
  - Boundaries를 실험적으로 켜 보고 (`turbo boundaries`)
  - 이상 없으면 CI나 pre-commit 단계에 “경고용”으로 붙이기

- dev 환경에서 항상 같이 떠야 하는 태스크들이 있다면
  - `with` 를 도입해서 Sidecar tasks로 명시하기 (`dev` 켤 때 API, 터널, worker 같이 띄우기)

- `turbo.json`을 장기 유지보수할 생각이라면
  - `turbo.jsonc`로 바꾸고, 중요한 태스크/캐시 설정에 주석을 남겨두기

- 경로 설정에 `../../..` 지옥이 있다면
  - `$TURBO_ROOT$`로 바꿔서 “패키지 이동에 안전한 설정”으로 리팩토링

- microfrontends 아키텍처를 검토 중이라면
  - 먼저 Turborepo 2.6의 `microfrontends.json` 기반 dev proxy로 워크플로부터 익숙해지기
  - 이후 Vercel microfrontends 같은 인프라 레벨 기능과 엮을 수 있음 ([Turborepo][4])

이 정도를 머리에 두면, Turborepo 2.3 → 2.6 세대에서 “진짜 실무에 영향 있는” 부분은 거의 다 커버된다고 봐도 됩니다.

---

[1]: https://www.linkedin.com/posts/turborepo_turborepo-23-activity-7262897627204071424-RDC5?utm_source=chatgpt.com 'Turborepo 2.3'
[2]: https://turborepo.com/blog/turbo-2-4 'Turborepo 2.4 | Turborepo'
[3]: https://turborepo.com/blog/turbo-2-5 'Turborepo 2.5 | Turborepo'
[4]: https://turborepo.com/blog/turbo-2-6 'Turborepo 2.6 | Turborepo'
[5]: https://github.com/vercel/turborepo/releases 'Releases · vercel/turborepo · GitHub'
[6]: https://vercel.com/docs/monorepos/turborepo?utm_source=chatgpt.com 'Deploying Turborepo to Vercel'
[7]: https://turborepo.com/docs/support-policy 'Support policy | Turborepo'
[8]: https://turborepo.com/docs/reference/run 'run | Turborepo'
