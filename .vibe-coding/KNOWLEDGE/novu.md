# Novu: 2024년 11월 ~ 2025년 12월 주요 아키텍처 변화 및 마이그레이션 가이드

Novu는 2024년 11월부터 2025년 12월까지 **'레거시 SDK 퇴출 및 Framework 전환'**과 **'고급 워크플로 제어권(Throttle, Delay)의 Novu 이관'**을 중심으로 발전했습니다. 특히 `@novu/node`의 `deprecated` 선언은 기존 서버 SDK 사용 코드에 직접적인 마이그레이션 압박을 가했습니다.

---

## 1. Executive Summary: 핵심 아키텍처 변화 (v2.0.2 - v2.9.0)

| 버전 / SDK            | 릴리즈 시기 | 핵심 아키텍처 변화 (Architectural Impact)                                                                | 영향도    |
| :-------------------- | :---------- | :------------------------------------------------------------------------------------------------------- | :-------- |
| **@novu/node**        | '25.02      | **EOL (End-of-Life):** `@novu/node` 패키지 Deprecated 선언.                                              | 매우 높음 |
| **2.0.2**             | '24.11      | **Channel Expansion:** 이메일 웹훅, WhatsApp Business, FCM 오버라이드 지원 추가.                         | 높음      |
| **2.8.0 (Framework)** | '25.11      | **Workflow Control:** **Throttle, Dynamic Delay** Step 추가. 앱의 Rate Limit/지연 로직 Novu로 이관 가능. | 높음      |
| **2.9.0 (Framework)** | '25.12      | **Security & i18n:** 템플릿 내 `img` 태그 XSS 방어 강화. Liquid 번역 필터 지원.                          | 중간      |

---

## 2. Critical Action Items: 코드 및 의존성 필수 점검

### 2-1. 레거시 SDK 전환 (v2.0.2 → `@novu/api`)

- **Deprecated:** 기존 서버 SDK인 **`@novu/node`**
- **Replacement:** **`@novu/api`** 또는 **`@novu/framework`**
- **Action:** `import { Novu } from "@novu/node"` 구문을 찾아 `@novu/api`로 전환하고, 생성자에 API 키를 넘기는 방식 등 메서드 호출부를 최신 문서 예제와 맞추어 재점검해야 합니다.

### 2-2. 워크플로 로직의 Novu 이관 (v2.8.0)

`@novu/framework`를 사용하여 워크플로를 정의한다면, 앱 레벨의 로직을 Novu로 옮겨야 합니다.

- **Rate Limiting:** `Throttle step`을 활용하여 **"사용자별/키별 N 분에 한 번"** 발송 제한 로직을 워크플로에 선언하십시오. 기존 애플리케이션 DB에 있던 별도의 Rate Limit 로직을 제거할 수 있습니다.
- **Delay Logic:** `Dynamic delay` 및 `Timed delay`를 활용하여 "사용자 가입 후 3일" 또는 "특정 이벤트 발생 시각 + 12시간"과 같은 복잡한 지연 시나리오를 워크플로에서 직접 구현하십시오.

### 2-3. 채널 및 페이로드 확장 (v2.0.2)

- **Email Webhooks:** 이메일 공급자(SES 등)의 웹훅을 Novu로 받아 **Bounce, Spam 이벤트**를 추적하고, 이를 기반으로 알림 발송을 중단하거나 우회하는 워크플로를 설계하십시오.
- **Push Override:** FCM 푸시 알림 발송 시, `extra options` 필드를 통해 **Android/APNs 플랫폼별 세부 설정**을 Novu 페이로드에 포함하도록 코드를 확장하십시오.

### 2-4. 보안 및 템플릿 (v2.9.0)

- **XSS 방어:** 메시지 템플릿에 사용자 입력이 포함되는 경우, v2.9.0 이후 템플릿 렌더링 결과에서 `img` 태그 등의 **위험한 속성이 자동으로 제거**될 수 있습니다. 렌더링 결과에 의존하던 코드가 있다면 확인이 필요합니다.
- **위젯 JWT 설정:** In-App Inbox를 사용한다면 `SUBSCRIBER_WIDGET_JWT_EXPIRATION_TIME` 환경 변수를 설정하여, 토큰 만료 정책을 명시하고 위젯의 안정성을 확보해야 합니다.

---

## 3. Strategic Adoption: 도입해야 할 신규 패턴

- **Subscriber 채널 선호:** `subscriber` 모델에 **선호 채널** 필드를 저장하고, 워크플로가 이 선호를 존중하여 알림을 발송하도록 설계하십시오. 이는 사용자별 맞춤형 알림 설정 UI 구축의 기반이 됩니다.
- **Liquid 번역:** `Liquid Filters` 및 중첩 번역 지원을 활용하여, 다국어 템플릿의 가독성과 유지보수성을 높이십시오.

---

## 4. Conclusion

Novu는 **`@novu/node`의 퇴출**을 통해 SDK 생태계를 정리하고, **Framework**를 통해 **Throttle 및 Delay** 같은 고급 기능을 내재화했습니다. **레거시 SDK를 `@novu/api`로 전환**하고, **Throttle step**을 활용하여 애플리케이션 로직의 복잡성을 Novu 워크플로 안으로 이관하는 것이 이번 업그레이드의 핵심 전략입니다.
