# 통합 플랫폼 구상 및 데이터 모델링 (IDEA)

## 1. 아키텍처 개요

- **Core Goal**: 30~100개 이상의 이종(Heterogeneous) 웹사이트를 통합 운영하며, 단일 계정으로 모든 사이트 이용 및 포인트 공유.
- **Tech Stack**: SvelteKit + Cloudflare D1 (Central Core + Domain Sharding) + Better-Auth.
- **Scaling Strategy (샤딩 라우팅 규칙)**:
  - **Core DB**: `User`, `Subscription`, `PointLog`, `UserConsent`, `Entitlement` 등 "전역 공유 및 권한 판정 데이터"는 중앙 D1에 유지.
  - **Domain DB**: `CatalogItem`, `Order`, `OrderItem`, `PaymentHistory` 등 대용량 도메인 데이터는 `Sites.shardKey`를 통해 별도 D1 인스턴스로 분리.

## 2. 비즈니스 모델 (BM)

### A. 구독 모델: "Network Membership"

| 티어 (Tier) | 월 구독료 | 포인트 적립 | 혜택 구조 |
| :--- | :--- | :--- | :--- |
| **Pro** | **$7.77** | **5%** | **공통 기능** + **Pro 콘텐츠** (일부) |
| **Elite** | **$17.77** | **10%** | **공통 기능** + **Elite 콘텐츠** (전체) |
| **Ultra** | **$47.77** | **15%** | **공통 기능** + **Ultra 콘텐츠** + **전용 리소스** |

- **제약 사항**: 사용자당 **단 하나의 활성 구독(Active Subscription)**만 허용.
- **변경 정책 (Lifecycle Policy)**:
  - **업그레이드 (Instant)**: 즉시 반영. `currentPeriodEnd`는 유지하며, 남은 기간 비례(Proration) 차액 결제. 차액에 대해 상위 티어 비율로 포인트 추가 지급.
  - **다운그레이드 (Scheduled)**: 다음 갱신일(Current Period End)부터 반영 (`pendingTier` 예약). 당월 환불 및 포인트 회수 없음.

### B. 포인트 정책 (Point Policy)

- **환산율**: **1 USD (100 Cents) = 100 Points** (1 Cent = 1 Point).
- **적립 (Earn)**:
  - **원칙**: **실제 결제 성공액(Cash Paid)** 기준으로만 지급하며, 소수점은 **내림(Floor)** 처리.
  - **구독**: `floor(cashPaidMoneyCents * TierRate)` 적립 (`EARN_SUB`).
  - **충전**: 포인트 패키지의 `attributes.pointsAmount` 적립 (`EARN_TOPUP`).
  - *확정 시점*: 결제 완료(SUCCEEDED) 시 Core DB `PointLog`에 `CONFIRMED` 상태로 기록.
- **사용 (Redeem) - 상품 유형별 분기**:
  - **Cash Primary** (`priceMoney > 0`, `pricePoints = 0`): 현금 결제만 가능하며, 포인트는 **최대 50%까지만** 사용 가능 (할인 개념).
  - **Points Only** (`priceMoney = 0`, `pricePoints > 0`): 포인트 **100% 전액 결제** 가능.
  - **Dual Price**: 구매자가 결제 모드(현금/포인트) 선택. 현금 모드 시 50% 제한, 포인트 모드 시 100% 차감.
  - *예외*: 포인트 충전 상품(`POINT_PACKAGE`)은 포인트 사용 불가.
- **유효기간**: 최종 활동 기준 1년 연장. **단, 잔액이 양수(>0)일 때만 만료일을 갱신.**
- **환불/회수**:
  - **원칙**: 결제 수단별 원상 복구 (현금은 현금으로, 포인트는 포인트로).
  - **회수**: 부분 환불 시 해당 금액 비례 포인트 회수 (`REFUND_REVERSAL`). 잔액 부족 시 **마이너스 상계**.
- **동시성/중복 방지**:
  - `EARN` 계열: `referenceType='PAYMENT'`, `referenceId=providerPaymentId`.
  - `REFUND` 계열: `referenceType='REFUND'`, `referenceId=providerRefundId` (부분 환불 대응).
  - *Unique Constraint*: `(userId, type, referenceType, referenceId)` 제약으로 중복 처리 원천 봉쇄.

## 3. 3-Layer Data Strategy (데이터 모델링 전략)

### Layer 1: Core (Global Shared)

> 모든 사이트가 공통으로 참조하며, 정규화된 테이블로 관리합니다.

- **User**: `id`, `email`, `currentPoints`, `pointsExpiresAt`
- **Subscription**:
  - `id`, `userId`, `tier`, `status`
  - `currentPeriodStart`, `currentPeriodEnd`
  - `cancelAtPeriodEnd` (해지 예약 플래그)
  - `pendingTier`, `pendingEffectiveAt` (다운그레이드 예약)
- **SubscriptionChangeLog**:
  - `id`, `userId`, `subscriptionId`, `status`('REQUESTED', 'APPLIED', 'CANCELLED')
  - `fromTier`, `toTier`, `effectiveAt`, `prorationMoneyCents`
- **PointLog**:
  - `id`, `userId`, `siteId` (발생 사이트)
  - `amount`, `balanceAfter`
  - `type`: 'EARN_SUB', 'EARN_TOPUP', 'USE_ORDER', 'REFUND_REVERSAL', 'ADMIN'
  - `referenceType` ('PAYMENT', 'REFUND', 'ORDER', 'SYSTEM')
  - `referenceId` (Logical Ref)
  - `status` ('PENDING', 'CONFIRMED', 'CANCELLED')
  - *Unique Constraint*: `(userId, type, referenceType, referenceId)`
- **UserConsent**:
  - `userId`, `siteId`
  - `channel` ('EMAIL', 'SMS')
  - `purpose` ('TOS', 'PRIVACY', 'MARKETING')
  - `status` ('OPTED_IN', 'OPTED_OUT')
  - `consentVersion`, `agreedAt`, `revokedAt`, `proofIp`, `proofUserAgent`
- **UserSitePresence**:
  - `userId`, `siteId`
  - `firstSeenAt`, `lastSeenAt` (**Asia/Seoul 자정 기준 1일 1회 갱신 강제**)
  - `loginCount`, `visitCount`
- **Sites**: `id`, `domain`, `shardKey`

### Layer 2: Module (Standardized Interface)

> 반복되는 패턴(커머스, 소유권 등)을 추상화하여 공통 테이블로 관리합니다.

- **CatalogItem** (상품/콘텐츠):
  - `type`: 'LECTURE', 'SEAT', 'EBOOK', 'POINT_PACKAGE'
  - `priceMoneyCents`: 0이면 현금 구매 불가. (**충전 상품은 최소 300($3) 이상**)
  - `pricePoints`: 0이면 포인트 구매 불가. (**충전 상품은 반드시 0**)
  - `attributes` (JSON): 지급 포인트량(`pointsAmount`) 명시.
- **Order** (주문):
  - `totalMoneyCents`, `pointsAppliedTotal` (**충전 주문은 반드시 0**)
  - `cashPaidMoneyCents`
  - `status`: 'PENDING', 'PAID', 'REFUNDED', 'PARTIAL_REFUNDED'
- **OrderItem** (주문 상세):
  - `refundedMoneyCents`, `refundedPoints`, `status`('ACTIVE', 'REFUNDED'...)
- **PaymentHistory** (Domain DB):
  - `id`, `userId`, `siteId`, `subscriptionId`, `orderId`
  - `amountMoneyCents`, `currency`, `provider`
  - `providerPaymentId`, `idempotencyKey`
  - `status` ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED')
  - `createdAt`, `updatedAt`
  - *정합성 전략*: 결제 성공(Domain) → 포인트 지급(Core) 간 트랜잭션 분리됨. 멱등성 키(`providerPaymentId`)를 통해 Core DB 중복 지급 원천 차단.
- **Entitlement** (통합 권한/소유권):
  - `kind`: 'ACCESS', 'SLOT', 'FEATURE'(멤버십 제한 해제 등 ADDON 성격)
  - `source`: 'SUBSCRIPTION_BENEFIT', 'PURCHASED', 'ADMIN'
  - *판정 원칙*: 도메인 DB가 분리되더라도 권한 확인은 반드시 Core DB 기준으로 수행.

### Layer 3: Meta (Site-Specific)

- **SiteConfig**, **UserSiteMeta** (JSON 허용, 이력 데이터 저장 금지)

## 4. 사이트별 운영 전략 (시나리오)

- **Site A (강의)**:
  - 구독 시 `Entitlement(kind='SLOT', source='SUBSCRIPTION_BENEFIT')` 생성.
  - 포인트로 추가 구매 시 `Order` -> `Entitlement(kind='ACCESS', source='PURCHASED')` 생성.
- **Site B (스터디카페)**:
  - `CatalogItem(type='SEAT')` 등록.
  - 예약 시 `Order` 생성 -> `Entitlement(kind='ACCESS', expiresAt='...')` 생성.
- **공통 (포인트 충전)**:
  - `CatalogItem(type='POINT_PACKAGE', priceMoney=3000, pricePoints=0)` 구매.
  - 결제 성공($3.00) -> Core DB `PointLog(type='EARN_TOPUP', amount=300)` 기록.

## 5. 향후 논의 과제

- [ ] **DB 마이그레이션**: D1 스키마 SQL 작성.
- [ ] **API 표준화**: Module 레이어(Catalog, Order, Entitlement) 공통 API 설계.
- [ ] **Consent UI**: 회원가입/로그인 시 약관 동의 UI 표준화.
