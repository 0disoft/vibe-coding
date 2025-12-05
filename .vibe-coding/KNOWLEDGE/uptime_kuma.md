# Uptime Kuma v2.0.0 실무 대응 전략 리포트 (2024.12 - 2025.10)

2024년 12월부터 2025년 10월까지 Uptime Kuma는 **v2.0.0 메이저 릴리스**를 통해 대규모 구조적 변화를 단행했습니다. 이 과정에서 **보안 취약점 패치**와 **알림 템플릿 엔진 교체**가 발생하여 기존 v1 코드베이스 및 운영 환경에 직접적인 마이그레이션 압박을 가했습니다.

---

## 1. Executive Summary: v2.0.0 마이그레이션 핵심 (2025년 10월)

| 버전 | 핵심 아키텍처 변화 (Architectural Impact) | 영향도 |
| :--- | :--- | :--- |
| **v2.0.0** | **Template Engine Replacement:** SMTP 템플릿 엔진을 LiquidJS로 교체. (파괴적 변경) | 높음 |
| | **Legacy Feature Removal:** JSON 백업/복원 기능 및 HTTP DNS 캐시 제거. | 중간 |
| | **Default Behavior Change:** 신규 모니터의 기본 재시도 횟수(`retries`)가 1 → 0으로 변경. | 중간 |
| **v1.23.17** | **SSTI/LFI Fix:** Real-Browser 및 Notification 템플릿 취약점 패치. (보안 필수) | 높음 |

---

## 2. Critical Action Items: 코드 및 인프라 필수 점검

### 2-1. 알림 템플릿 및 보안 (Notification & Security)

* **LiquidJS 문법 전환 (v2.0.0):** SMTP 알림의 제목 및 본문 템플릿을 **LiquidJS** 문법에 맞춰 전면 수정하십시오.
  * **파괴적 변경:** 기존 `{{STATUS}}` 같은 템플릿 변수 대신, **소문자** 변수 이름(`{{status}}`, `{{monitorJSON}}`)을 사용해야 합니다.
  * **SSTI 대응:** v1.23.17 이상으로 업데이트하여 Notification 템플릿을 통한 SSTI(서버 측 템플릿 인젝션) 취약점을 반드시 패치하십시오.
* **배지 API URL 수정 (v2.0.0):** 자동화 스크립트에서 사용하던 `/api/badge/:monitorID/ping/:duration` 엔드포인트의 `:duration` 파라미터를 `24h`, `30d`, `1y` 등 **제한된 프리셋 값**으로 변경해야 합니다.

### 2-2. 운영 환경 및 데이터 관리

* **백업 전략 변경 (v2.0.0):** JSON 기반 백업/복원 API가 제거되었습니다. 자동화된 백업 스크립트는 이제 **`data` 디렉터리 전체(SQLite DB, 설정 등)를 OS 레벨에서 스냅샷/볼륨 백업**하는 방식으로 전환해야 합니다.
* **Docker 이미지 교체:** v2는 Alpine 기반 이미지를 더 이상 제공하지 않습니다. Docker Compose 파일에서 `:latest` 또는 `*-slim`, `*-rootless` 등 v2에서 지원되는 태그로 업데이트하십시오.
* **Node.js 버전 상향:** Docker를 사용하지 않는 환경에서는 **Node.js 20.4 이상**으로 런타임을 업그레이드해야 합니다.

---

## 3. Strategic Adoption: 도입해야 할 신규 패턴 (v2.0.0-beta.3/4)

### 3-1. 모니터링 유연성 강화

* **Manual Monitor:** 실제 서비스 가동 여부와 무관한 정적/설명용 엔트리가 필요할 때 **Manual 모니터**를 활용하십시오. (예: 서비스 만료일 알림, 오프라인 장비 설명 등).
* **고급 옵션:** API로 HTTP 모니터를 생성할 때, `IPv4/IPv6 강제 옵션` 및 `ping` 모니터의 `count`/`timeout` 옵션을 활용하여 특정 네트워크 환경에 최적화된 모니터링을 구성하십시오.
* **Markdown 설명:** 모니터 설명 필드에 Markdown을 사용하여 Runbook 링크, 트러블슈팅 가이드 등을 풍부하게 문서화하십시오.

### 3-2. 알림 및 인증 통합

* **Custom Email HTML:** 알림 이메일 본문에 HTML을 직접 사용하여 브랜딩을 강화하거나 복잡한 서식의 리포트를 첨부할 수 있습니다.
* **OAuth2 Audience (v2.0.0-beta.4):** HTTP 모니터의 OAuth2 인증 플로우에서 `audience`를 설정하여, 외부 인증 서버(Auth0, Azure AD 등)와의 통합 보안 정책을 강화하십시오.

---

## 4. Conclusion

Uptime Kuma v2.0.0은 **인프라 종속성(Node.js, Docker Base)**을 최신화하고 **보안 취약점을 해결**한 필수 업그레이드입니다. 마이그레이션은 **Node.js 20.4+ 환경 구축**과 **LiquidJS 템플릿 전환**을 최우선으로 진행하고, JSON 백업 의존성을 제거하여 운영 안정성을 확보해야 합니다.
