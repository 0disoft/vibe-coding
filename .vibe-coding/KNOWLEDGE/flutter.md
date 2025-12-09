# Flutter Stable 3.27-3.38 마이그레이션 전략: 안정성과 플랫폼 네이티브화

2024년 말부터 2025년 말까지의 Flutter Stable 릴리스는 **'Android/iOS 네이티브 경험 강화'**와 **'Material 3 디자인 시스템의 완전한 정착'**으로 요약됩니다. 특히 Android의 Predictive Back, Edge-to-Edge 기본화, 딥링크 정책 변경 등 플랫폼 종속적인 동작의 변화가 두드러지므로, 단순 SDK 버전업을 넘어선 플랫폼별 검증이 필수적입니다.

본 리포트는 해당 기간의 5개 Stable 버전을 분석하여, 프로덕션 레벨에서 반드시 대응해야 할 아키텍처 및 코드 변경 사항을 정리했습니다.

---

## 1. Executive Summary: 버전별 핵심 마이그레이션 포인트

| 버전      | 시기   | 핵심 변경 사항 (Critical Changes)                                                             | 대응 전략 (Strategy)                                                                      |
| :-------- | :----- | :-------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| **v3.27** | '24.12 | **Deep Link & Edge-to-Edge:** 딥링크 기본값 활성화 및 Android 15 대응 Edge-to-Edge 기본 적용. | 서드파티 딥링크 사용 시 Flutter 딥링크 비활성화 필수. UI 안전 영역(SafeArea) 재검토.      |
| **v3.29** | '25.02 | **Legacy Removal:** Android v1 Embedding 완전 제거. M3 위젯 디자인 플래그 도입.               | 레거시 Android 프로젝트의 v2 Embedding 마이그레이션 완료. M3 디자인 변경점 디자인팀 리뷰. |
| **v3.32** | '25.05 | **API Cleanup:** `ThemeData` 내 개별 속성들의 컴포넌트 테마(`*ThemeData`) 이관 가속화.        | `deprecated` 경고 기반으로 테마 설정 코드 리팩토링 수행.                                  |
| **v3.35** | '25.08 | **Form & Widget Logic:** `DropdownButtonFormField` 초기값 로직 변경(`initialValue`).          | 폼 필드 초기화 로직 전수 조사 및 수정. AppBar 등 컴포넌트별 테마 분리 적용.               |
| **v3.38** | '25.11 | **Platform UX:** Android Predictive Back 애니메이션 기본 적용. SnackBar 자동 닫힘 정책 변경.  | 커스텀 라우트 전환 애니메이션 호환성 점검. 액션 SnackBar의 명시적 닫기 로직 추가.         |

---

## 2. Platform-Specific Action Plan: 플랫폼별 대응 가이드

### 2-1. Android 대응 (v3.27, v3.29, v3.38)

- **Deep Link 충돌 방지 (v3.27):** Firebase Dynamic Links나 `uni_links` 등 별도 라이브러리를 사용 중이라면, `AndroidManifest.xml`에 `flutter_deeplinking_enabled = false` 메타데이터를 반드시 추가하여 충돌을 방지하십시오.
- **Edge-to-Edge UI (v3.27):** Android 15 타겟 시 시스템 바 영역까지 앱이 확장됩니다. `Scaffold`나 최상위 위젯에 적절한 `padding`이나 `SafeArea`가 적용되었는지 확인하여 콘텐츠가 시스템 바에 가려지는 것을 막으십시오.
- **Predictive Back (v3.38):** 뒤로 가기 제스처 시 미리보기 애니메이션이 기본 적용됩니다. 커스텀 `PageTransitionsTheme`을 사용 중이라면 `PredictiveBackPageTransitionBuilder`와의 호환성을 검토해야 합니다.
- **v1 Embedding 제거 (v3.29):** `MainActivity.java`가 `FlutterActivity`를 상속받는 방식 등 구형 임베딩 코드가 남아있다면 v2 방식으로 완전히 전환해야 빌드가 가능합니다.

### 2-2. Design System & Theme (v3.27, v3.29, v3.32, v3.35)

- **Material 3 토큰 동기화:** `Chip` 보더 색상 변경(v3.27) 등 미세한 색상 변경이 지속적으로 발생합니다. 디자인 QA를 통해 의도치 않은 색상 변경을 감지하고, 필요시 컴포넌트별 테마(`ChipThemeData` 등)로 오버라이드하십시오.
- **ThemeData 다이어트:** `dialogBackgroundColor`(v3.29), `indicatorColor`(v3.32) 등 `ThemeData` 직접 속성들이 제거되고 있습니다. 모든 스타일링을 `DialogTheme`, `TabBarTheme` 등 전용 테마 클래스로 이관하는 작업을 정례화하십시오.

### 2-3. Widget Logic & Stability (v3.35, v3.38)

- **Form 초기값 분리 (v3.35):** `DropdownButtonFormField`의 `value`는 상태 관리용, `initialValue`는 초기화용으로 역할이 분리되었습니다. 폼 리셋 로직이나 초기 렌더링 로직에서 `initialValue`를 사용하도록 수정하십시오.
- **SnackBar UX (v3.38):** '실행 취소' 등의 액션이 포함된 SnackBar가 자동으로 사라지지 않게 변경되었습니다. 사용자 경험을 해치지 않도록, 작업 완료 후나 일정 시간 경과 후 코드로 닫아주는 로직(`hideCurrentSnackBar`)을 추가해야 합니다.

---

## 3. Migration Workflow: 권장 업그레이드 순서

안전한 업그레이드를 위해 다음 3단계 워크플로우를 제안합니다.

1. **Code Analysis & Clean-up:**
   - `flutter analyze`를 실행하여 `deprecated` 경고를 식별합니다.
   - 특히 테마 관련 속성과 `DropdownButtonFormField` 등 로직 변경이 있는 API를 우선 수정합니다.
2. **Platform Configuration Check:**
   - `AndroidManifest.xml` (딥링크 설정)과 `build.gradle` (v2 embedding 확인) 설정을 점검합니다.
   - iOS `Info.plist`의 딥링크 설정도 동기화합니다.
3. **Visual Regression Test:**
   - Golden Test나 스냅샷 테스트를 통해 M3 색상 변경 및 레이아웃(Edge-to-Edge) 변경으로 인한 UI 회귀를 감지합니다.
   - Android 기기에서 제스처(Predictive Back) 동작을 육안으로 확인합니다.

Flutter는 이제 단순한 크로스 플랫폼 프레임워크를 넘어, 각 플랫폼의 최신 네이티브 UX를 가장 빠르게 흡수하는 방향으로 진화하고 있습니다. 이번 마이그레이션은 앱의 품질을 네이티브 수준으로 끌어올릴 수 있는 중요한 기회입니다.
