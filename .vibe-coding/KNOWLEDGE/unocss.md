# UnoCSS v65-v66 아키텍처 리포트: Epoch SemVer 도입과 프리셋 통합 전략

2024년 11월부터 2025년 11월까지 UnoCSS의 변화는 단순한 기능 추가가 아닌, **엔터프라이즈급 안정성 확보를 위한 구조적 재설계**로 정의됩니다. 버전 체계의 근본적 변화(Epoch SemVer)와 프리셋 생태계의 통폐합(`preset-wind3/4`)은 기술 부채를 청산하고 Tailwind 4 및 최신 CSS 스펙에 대응하기 위한 필수적인 전환점입니다.

본 리포트는 해당 기간의 변경 사항을 분석하여, 개발 조직이 수행해야 할 아키텍처 마이그레이션 전략을 제시합니다.

---

## 1. Executive Summary: 핵심 변경 벡터

1. **Epoch SemVer 도입 (Stability):** `v0.x`의 실험적 이미지를 탈피하고 `v65+`로 버전을 격상했습니다. 이는 API 안정성을 선언함과 동시에, 기존 의존성 관리 전략의 전면 수정을 요구합니다.
2. **프리셋 생태계 통합 (Consolidation):** 파편화되었던 `preset-uno`, `preset-wind`가 제거(Deprecated)되고, **`preset-wind3` 및 `preset-wind4` 체계로 이원화**되었습니다.
3. **차세대 CSS 엔진 (Modernity):** Wind4 프리셋을 통해 '다중 전략 다크 모드'와 '원자화된 컨테이너 쿼리'를 도입, Viewport 중심에서 컴포넌트 중심(Container-First) 레이아웃으로 패러다임이 이동했습니다.

---

## 2. Infrastructure: 버전 체계와 프리셋 마이그레이션

### 2-1. Epoch SemVer: 의존성 관리의 위기

UnoCSS는 '세대(Epoch)'와 '버전(SemVer)'을 결합한 독자적인 버저닝을 채택했습니다. 이는 단순한 숫자의 증가가 아니라, 패키지 매니저의 해결 규칙(Resolution Logic)을 깨뜨리는 변화입니다.

- **현상:** `v0.65.3`에서 `v65.3.0`으로의 급격한 점프는 기존 `package.json`의 버전 범위(`^0.65.x`)를 무효화합니다.
- **영향:** CI/CD 파이프라인에서 의존성 설치 실패가 발생하거나, 플러그인 간 `peerDependency` 충돌이 발생합니다.
- **대응:** `package.json` 내 UnoCSS 관련 패키지 버전을 `65.x.x` 또는 `66.x.x` 형식으로 명시적 업데이트가 필수적입니다.

### 2-2. Preset Architecture: Wind3와 Wind4로의 재편

기존의 모호했던 프리셋 경계를 허물고, \*\*하위 호환성(Wind3)\*\*과 \*\*미래 기술(Wind4)\*\*로 명확히 역할을 분리했습니다.

| 레거시 프리셋 (Deprecated) | 통합/대체 프리셋 (Standard) | 기술적 특성 및 용도                                                                                                  |
| :------------------------- | :-------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| `@unocss/preset-uno`       | **`@unocss/preset-wind3`**  | **[Stability]** Tailwind 3 및 Windi CSS 호환성을 유지하며 안정적인 유틸리티 제공. 기존 프로젝트의 마이그레이션 타겟. |
| `@unocss/preset-wind`      | **`@unocss/preset-wind3`**  | 상동 (내부 구현이 `wind3`를 re-export하는 얇은 래퍼로 변경됨)                                                        |
| (New)                      | **`@unocss/preset-wind4`**  | **[Innovation]** Tailwind 4 스펙 대응. 컨테이너 쿼리 엔진 및 고도화된 다크 모드 전략 탑재. 신규 프로젝트 권장.       |

> **Warning:** 현재 `preset-uno`가 동작하는 이유는 내부적으로 `preset-wind3`를 호출하도록 리다이렉트되어 있기 때문입니다. 이는 임시 조치이므로, 즉시 코드베이스에서 import 경로를 수정하여 기술 부채를 제거하십시오.

---

## 3. Wind4 Core: 차세대 CSS 패턴 도입 (v65.5.0+)

### 3-1. 다중 전략 다크 모드 (Multi-Strategy Dark Mode)

단순 클래스 토글을 넘어, 디자인 시스템의 복잡성을 수용하는 \*\*'3-Mode Dark System'\*\*이 도입되었습니다.

- **기존 한계:** `class="dark"` 또는 `media` 쿼리에 의존하여, 중첩된 테마나 테넌트별 테마 적용에 한계.
- **개선:** 커스텀 셀렉터 매핑을 지원하여 DOM 구조에 종속되지 않는 유연한 테마 제어 가능.

  ```ts
  // uno.config.ts
  presetWind4({
  	dark: {
  		light: '[data-theme="light"]', // 속성 기반 제어
  		dark: '[data-theme="dark"]'
  	}
  });
  ```

### 3-2. 원자화된 컨테이너 쿼리 (Atomic Container Queries)

반응형 디자인의 기준이 '화면(Viewport)'에서 '컴포넌트(Container)'로 이동함에 따라, Wind4는 컨테이너 쿼리 엔진을 내재화했습니다.

- **변화:** `@container` 문법을 유틸리티 클래스로 승격. 복잡한 Grid/Flex 레이아웃 내에서 부모 요소의 크기에 반응하는 독립적 컴포넌트 설계가 가능해집니다.
- **전략:** 신규 대시보드나 카드 UI 구현 시 Media Query 대신 Container Query 유틸리티 사용을 표준으로 채택하십시오.

---

## 4. Critical Impact: 주의해야 할 런타임 변경 (v66.5.4)

v66.5.4 업데이트는 '마이너' 버전임에도 불구하고 CSS 생성 로직에 중요한 변화를 포함하고 있어, 시각적 회귀(Visual Regression) 테스트가 요구됩니다.

1. **Group Selector 분리:** `transformer-directives`가 `@apply` 사용 시 그룹 셀렉터(`h1, h2`)를 개별 셀렉터로 분리하여 생성합니다. 이는 CSS Specificity(명시도)에 미세한 영향을 줄 수 있습니다.
2. **Typography & Hidden:** `preset-typography`와 `hidden` 유틸리티의 셀렉터 생성 로직이 수정되었습니다. 리셋 스타일과 충돌하던 버그가 수정되었으나, 기존의 '버그성 동작'에 의존하던 레이아웃은 깨질 수 있습니다.

---

## 5. Action Plan: 마이그레이션 체크리스트

다음 순서에 따라 코드베이스를 점검하고 현대화하십시오.

1. **의존성 범위 재설정:** `package.json` 내 `unocss` 관련 버전을 `^65.0.0` 이상으로 고정하고, `npm install`을 수행하여 Epoch SemVer로 진입하십시오.
2. **Legacy Preset 제거:**
   - `import presetUno` / `presetWind` 구문을 탐색하여 전량 `presetWind3`로 교체하십시오.
   - 신규 프로젝트라면 과감하게 `presetWind4`를 도입하여 Tailwind 4 스펙을 선점하십시오.
3. **테마 아키텍처 동기화:** Wind4 도입 시, 앱의 다크 모드 구현 방식(Class vs Attribute)을 확인하고 `config.dark` 옵션에 명시적으로 매핑하십시오.
4. **Regression Test:** v66.5.4 이상으로 업데이트 시, Typography 플러그인을 사용하는 페이지와 `@apply` 지시자를 과도하게 사용하는 컴포넌트에 대해 UI 전수 검사를 수행하십시오.

지금은 UnoCSS가 '빠른 프로토타이핑 도구'에서 '안정적인 인프라'로 도약한 시점입니다. 레거시 프리셋을 방치하는 것은 잠재적인 호환성 폭탄을 안고 가는 것과 같으므로, 즉각적인 리팩토링을 권장합니다.
