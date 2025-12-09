# RevenueCat 주요 변경 사항 요약 및 대응 전략 (2024-11 ~ 2025-12)

2024년 11월부터 2025년 12월까지 RevenueCat SDK는 **'Google Play Billing v8 의무화'**와 **'리텐션 및 웹-앱 연계 마케팅 기능 강화'**를 중심으로 발전했습니다. Android 계열 SDK v9.0.0의 출시로 인해 Flutter, React Native, KMP를 포함한 모든 크로스 플랫폼 앱에 **툴체인 및 API 시그니처 변경**이 요구되었습니다.

---

## 1. Executive Summary: 핵심 아키텍처 변화

| SDK 계열                   | 버전                | 핵심 아키텍처 변화 (Architectural Impact)                                              | 영향도    |
| :------------------------- | :------------------ | :------------------------------------------------------------------------------------- | :-------- |
| **Android/Cross-Platform** | **v9.0.0**          | **[Platform Mandate]** Google Play Billing Library 8 대응 및 레거시 API 제거.          | 매우 높음 |
| **iOS**                    | **v5.9.0 ~ 5.12.0** | **[Retention]** Win-back Offers 및 Anonymous Web Purchase Redemption API 추가.         | 높음      |
| **iOS**                    | **v5.47.0+**        | **[UX/Marketing]** Paywalls v2에 비디오 배경, 카운트다운 등 고급 마케팅 컴포넌트 추가. | 중간      |
| **iOS**                    | **v5.13.0**         | **[Data Model]** `CustomerInfo`에 `subscriptions` 컬렉션 추가. 데이터 모델 정교화.     | 중간      |

---

## 2. Critical Action Items: 크로스 플랫폼 마이그레이션 (v9.0.0)

Android, KMP, Flutter, React Native 프로젝트는 v9.0.0 업그레이드 시 다음의 **플랫폼 종속적 브레이킹 체인지**에 대응해야 합니다.

### 2-1. 툴체인 및 환경 요구사항 상향

- **Flutter/Dart:** 최소 Flutter 3.22.0, Dart 3.4.0 이상 요구. 구 버전 Flutter를 사용 중인 프로젝트는 SDK 업그레이드와 함께 **프레임워크 전체 업그레이드**가 필수적입니다.
- **Kotlin/RN:** KMP/RN 프로젝트는 최소 Kotlin 2.1.0 (KMP) 및 Kotlin 1.8.0 이상(RN)을 요구합니다. `build.gradle` 및 Gradle 버전 설정을 함께 상향해야 합니다.

### 2-2. Play Billing API 시그니처 변경

- **Legacy API 제거:** `querySkuDetailsAsync` 등 Google이 제거한 API는 SDK에서도 완전히 사라졌습니다.
- **새로운 응답 처리:** `queryProductDetailsAsync`와 `onProductDetailsResponse`의 응답 시그니처가 변경되어, **실패한 상품 목록의 상태 코드**까지 반환하도록 확장되었습니다. 커스텀 래퍼나 리스너를 사용하는 코드는 새로운 응답 구조에 맞춰 타입 정의와 에러 핸들링 로직을 수정해야 합니다.

---

## 3. Strategic Adoption: 리텐션 및 마케팅 기능 도입 (iOS v5.x)

### 3-1. 리텐션 및 웹 연계 플로우

- **Win-back Offers:** `eligibleWinBackOffers(forPackage:)` API를 활용하여, 구독 이탈 고객에게 패키지별 맞춤형 복귀 오퍼를 제공하는 로직을 구현하십시오.
- **Web-to-App Redemption:** **Anonymous web purchase** 시나리오를 지원하십시오. 앱에서 Web Purchase Link를 통해 웹 구매를 완료한 익명 사용자의 구매 기록을 앱 계정과 연동하는 리딤(Redeem) API를 호출하는 코드를 추가하십시오.

### 3-2. Paywalls v2 및 UX 강화

- **고급 마케팅 컴포넌트:** Paywalls v2를 커스터마이징할 때, v5.47.0의 **비디오 배경** 및 v5.48.0의 **카운트다운** 컴포넌트를 활용하여 구독 유도율(Conversion Rate)을 높이는 동적인 UI를 구성하십시오.
- **구매 전 훅:** v5.47.0에서 추가된 **구매 플로우 딜레이 hook**을 활용하여, 실제 결제 트랜잭션 시작 전에 자체 약관 확인, 분석 로깅 등의 비즈니스 로직을 삽입하십시오.

### 3-3. 데이터 모델 정교화

`CustomerInfo.subscriptions` 컬렉션을 활용하여 구독 데이터를 entitlements 중심이 아닌 **상품 및 기간 중심**으로 분석하도록 앱의 데이터 접근 레이어를 개선하십시오. 이는 구독 갱신, 만료 등 복잡한 상태를 더 정확하게 추적하는 데 필수적입니다.

---

## 4. Conclusion

RevenueCat SDK의 이번 업데이트는 **Play Billing v8**이라는 플랫폼적 강제를 기반으로, **iOS/Android 전체의 툴체인을 상향 평준화**했습니다. **v9.0.0으로의 업그레이드**를 최우선 과제로 진행하고, **Win-back Offer**와 **Web Purchase Redemption** 기능을 활용하여 웹과 앱을 통합하는 리텐션 전략을 수립하십시오.
