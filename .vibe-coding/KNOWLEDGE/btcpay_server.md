# BTCPay Server v2.0.5 - v2.2.0 실무 대응 전략 리포트 (2024.11 - 2025.09)

2024년 11월부터 2025년 9월까지 BTCPay Server는 **v2.2.0 메이저 라인**을 통해 **'Payment Request 기능의 금융화'**와 **'다중 코인 지원의 모듈화'**에 집중했습니다. 특히 v2.2.0의 인보이스 포맷 변경과 v2.1.0의 Monero/Zcash 코어 제거는 기존 통합 시스템에 직접적인 마이그레이션 압박을 가하는 핵심적인 변화입니다.

---

## 1. Executive Summary: 핵심 아키텍처 변화 (v2.0.3 - v2.2.0)

| 버전       | 릴리즈 시기 | 핵심 아키텍처 변화 (Architectural Impact)                                                           |
| :--------- | :---------- | :-------------------------------------------------------------------------------------------------- |
| **v2.0.5** | '24.12      | **Security/Exposure:** PoS Greenfield 인증 요구 제거. (공개 API 노출 전략 변경)                     |
| **v2.1.0** | '25.04      | **Core Decoupling:** Monero, Zcash 코어 제거 및 플러그인 의존성 전환. (브레이킹 변경)               |
| **v2.1.1** | '25.04      | **Compliance/Integration:** BIP86(Taproot), Payment Request `ReferenceId` 및 전액 지불 웹훅 추가.   |
| **v2.1.2** | '25.06      | **Webhooks Granularity:** `InvoiceExpiredPaidPartial` 등 세분화된 웹훅 도입. 부분 결제 로직 정교화. |
| **v2.2.0** | '25.07      | **Breaking Format:** **Invoice Export 포맷 변경.** 거래 당시 환율 추적 강화. (마이그레이션 필수)    |

---

## 2. Critical Action Items: 코드 및 통합 필수 점검

### 2-1. 브레이킹 변경 및 포맷 수정 (v2.1.0, v2.2.0)

- **Monero/Zcash 의존성:** v2.1.0 이상으로 업그레이드 시, XMR/ZEC를 사용하는 상점은 **반드시 해당 코인 플러그인을 설치**해야 합니다. Docker가 아닌 환경에서는 체인 설정(`BTCPAY_CHAINS`)을 직접 업데이트해야 합니다.
- **Invoice Export 마이그레이션 (v2.2.0):** BI/세무 파이프라인에서 인보이스 Export 파일을 사용 중이라면, **컬럼명 및 순서가 변경**되었으므로 파싱 로직을 전면 수정해야 합니다. 레거시 포맷 유지가 필요하면 `LegacyInvoiceExport` 플러그인을 설치하십시오.

### 2-2. 웹훅 및 상태 머신 정교화 (v2.1.2)

- **세분화된 웹훅 처리:** v2.1.2에서 추가된 `InvoiceExpiredPaidPartial`, `InvoicePaidAfterExpiration` 등의 새 웹훅을 처리하도록 백엔드 로직을 확장하십시오. 기존 단일 `InvoiceExpired` 이벤트만 처리하던 로직은 비즈니스 케이스를 놓칠 수 있습니다.
- **부분 결제 추적:** Greenfield API의 Invoice 응답에 **`amountPaid`** 필드가 추가되었습니다. 부분 결제 시 클라이언트/백엔드에서 이 필드를 활용하여 실시간으로 잔액을 추적하십시오.

### 2-3. 통합 및 지갑 정책 (v2.1.1, v2.2.0)

- **Payment Request 외부 연동:** Payment Request 생성 시 `ReferenceId` 필드를 사용하여 외부 회계/CRM 시스템의 인보이스 ID와 1:1 매핑하십시오. 또한 전액 지불 시 트리거되는 새 웹훅을 활용하여 자동 정산 파이프라인을 구축하십시오.
- **지갑 정책 현대화:** BIP86(Taproot), BIP388/389 등 최신 지갑 정책 및 Miniscript 지원이 강화되었습니다. 지갑 생성 자동화 코드에서 새 Descriptor 기반 정책 구성을 지원하도록 업데이트하십시오.

---

## 3. Strategic Adoption: 도입해야 할 신규 패턴

- **Fallback 환율 소스:** Greenfield API를 통해 스토어 레벨에서 Fallback 환율 소스를 설정하십시오. 메인 환율 공급자 장애 시에도 결제 로직이 안정적으로 유지되도록 이중화합니다.
- **PoS 데이터 공개:** PoS 카탈로그를 프론트엔드에서 직접 렌더링해야 하는 경우, v2.0.5에서 인증 요구가 제거된 PoS 관련 Greenfield 엔드포인트를 활용하여 데이터 접근을 단순화할 수 있습니다. (단, 방화벽 레벨에서 보안 통제 필요)

---

## 4. Conclusion

BTCPay Server v2.1.x~2.2.x는 **레거시 코인 지원을 정리**하고 **결제 트랜잭션의 세부 상태를 코드 레벨에서 통제**할 수 있도록 설계되었습니다. **인보이스 Export 포맷 변경**에 대한 마이그레이션을 우선 수행하고, **새 웹훅** 및 **ReferenceId**를 활용하여 BTCPay Server와 외부 회계 시스템 간의 통합 정교도를 높이십시오.
