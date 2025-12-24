# 통합 플랫폼 구상 및 데이터 모델링 (IDEA)

## 1. 아키텍처 개요

- **Core Goal**: 30~100개 이상의 이종(Heterogeneous) 웹사이트를 통합 운영하며, 단일 계정으로 모든 사이트 이용 및 포인트 공유.
- **Brand**: "**Rodi Pass**" (글로벌 통합 멤버십) - 전 세계 어디서나 통용되는 단일 브랜드.
- **Tech Stack**: SvelteKit + Cloudflare D1 (Multi-DB Architecture) + Better-Auth.
- **Scaling Strategy (Physical Partitioning)**:
  - **Identity Core (DB1)**: `User`, `Subscription`, `UserConsent`, `Entitlement`. (인증/권한)
  - **Ledger Core (DB2)**: `PointLog`, `UserBalance`, `PaymentEventCore`. (포인트 원장 및 잔액)
  - **Support Core (DB3)**: `SupportThreadCoreIndex`. (전역 조회용 인덱스)
  - **Domain DB (DB4+)**: `CatalogItem`, `Order`, `Post`, `SupportMessage` 등은 `shardKey`로 분산.

> **⚠️ Cloudflare D1 물리 제약 대응**:
>
> - **Ledger 격리**: 포인트 트랜잭션 빈도가 높으므로 `DB2`로 분리한다.
> - **Saga Pattern**: DB 간 트랜잭션은 지원되지 않으므로, `eventKey` 기반 멱등성과 보상 트랜잭션(Refund/Clawback)으로 일관성을 유지한다.
>   - *Truth Source*: 결제/주문의 진실은 **`PaymentEventCore(DB2)`**이며, Domain DB의 상태는 파생 데이터로서 Outbox 재처리로 수렴한다.

## 2. 비즈니스 모델 (BM)

### A. 구독 모델: "Rodi Pass"

| 티어 (Tier) | 월 구독료 | 포인트 적립 | 혜택 구조 |
| :--- | :--- | :--- | :--- |
| **Pro** | **$7.77** | **5%** | **공통 기능** + **광고 제거** + **Pro 콘텐츠** (일부) |
| **Elite** | **$17.77** | **10%** | **공통 기능** + **광고 제거** + **Elite 콘텐츠** (전체) |
| **Ultra** | **$47.77** | **15%** | **공통 기능** + **광고 제거** + **Ultra 콘텐츠** + **전용 리소스** |

- **제약 사항**: 사용자당 **단 하나의 활성 구독**만 허용.
  - *DB 제약*: `CREATE UNIQUE INDEX idx_active_sub ON Subscription(userId) WHERE status IN ('ACTIVE', 'TRIALING');`
- **구독 변경 (Upgrade/Downgrade)**:
  - *업그레이드*: 즉시 적용, 남은 기간 비례 차액 청구 (`prorationMoneyCents`).
  - *다운그레이드*: `pendingTier`에 저장, 현재 기간 종료 후 적용 (`effectiveAt = currentPeriodEnd`).
  - *TRIALING → ACTIVE*: 체험 종료 시 결제 성공하면 해당 결제에 대한 포인트 적립 (`EARN_SUB`).
- **광고 제거 (Ad-free) - Provider-Agnostic Module**:
  - **권한**: `Entitlement(kind='FEATURE', targetType='FEATURE_FLAG', targetId='AD_FREE', siteId='GLOBAL', source='SUBSCRIPTION_BENEFIT')` 부여.
  - **구현 원칙**: 유료 회원은 **광고 스크립트 네트워크 요청 자체를 차단**한다.
  - *기술 전략*:
    1. 서버는 HTML을 사용자 구분 없이 캐시 친화적으로 서빙.
    2. 로그인/갱신 시 `__Host-adfree` 쿠키 발급 (**비대칭 서명(RS256/ES256)된 JWT/Token**).
        - *Payload*: `iss`(발급자 고정), `sub`(userId), `tier`, `exp`(1h), `aud`(site domain).
        - *Header*: `kid` 포함 (Key Rotation 대응).
        - *Security*: `Secure`, `Path=/`, `SameSite=Lax` 필수.
        - *쿠키 정책*: **host-only**(각 사이트 도메인별)로 발급하며, SSO 콜백(로그인 완료 리다이렉트)에서 해당 도메인에 세팅.
    3. 1st-party `ad-bootstrap.js`가 **Public Key(`/.well-known/jwks.json` 캐시)로 로컬 검증**:
        - *검증 항목*: `signature`, `iss`, `aud`, `exp` (만료 토큰 무효).
        - 검증 성공 & `aud` 일치: 즉시 종료 (스크립트 로드 X).
        - 실패/없음: `SiteConfig.config.ads.provider`에 맞는 어댑터(Ezoic, Raptive 등)를 동적 로드.
        - *CSP 정책*: `SiteConfig.config.ads.cspAllowlist`를 기반으로 사이트별 `script-src` 헤더 구성. `nonce` 기반 권장, `unsafe-inline` 회피.
        - *GDPR 정책*:
          - `ADS` 동의 없음: 광고 로드 차단 (보수적 접근).
          - `ADS` 동의 O, `PERSONALIZED_ADS` 동의 X: **비개인화 광고(NPA)** 모드로 로드.

### B. 포인트 정책 (Point Policy)

- **환산율**: **1 USD (100 Cents) = 100 Points** (1 Cent = 1 Point).
- **적립 (Earn)**:
  - **원칙**: 구독 결제와 포인트 충전에만 발생. 소수점은 **내림(Floor)** 처리.
  - **구독**: `floor(cashPaidMoneyCents * TierRate)` 적립 (`EARN_SUB`).
  - **충전**: 포인트 패키지의 `attributes.pointsAmount` 적립 (`EARN_TOPUP`).
  - *확정 시점*: 결제 완료(SUCCEEDED) 시 `Ledger Core`에 `CONFIRMED` 상태로 기록.
- **사용 (Redeem) - 상품 유형별 분기**:
  - **단일 모드 주문 원칙**: 하나의 주문에는 **동일한 결제 모드(Cash Mode 또는 Point Mode)**의 상품만 담을 수 있다.
  - **Cash Primary** (`priceMoneyCents > 0`, `pricePoints = 0`): 현금 결제 모드. 포인트는 **할인(Discount)** 목적으로만 사용 가능.
  - **Points Only** (`priceMoneyCents = 0`, `pricePoints > 0`): 포인트 결제 모드. 포인트 **100% 전액 결제**만 가능.
  - **Dual Price**: 구매자가 결제 모드 선택 (Cash Mode면 50% 제한, Point Mode면 100% 차감).
  - *예외*: 포인트 충전 상품(`POINT_PACKAGE`)은 포인트 사용 불가.
- **50% 한도 기준**: 쿠폰/할인 적용 후 금액(`capBaseMoneyCents`) 기준. **`pointsDiscountTotal`에만 적용.**
- **유효기간**: 최종 활동 기준 1년 연장. **단, 잔액이 양수(>0)일 때만 만료일을 갱신.**
- **악용 방지 (Rate Limiting)**:
  - *충전 한도*: 일 $100 / 월 $500 최대.
  - *연속 환불 탐지*: 7일 내 3회 이상 환불 시 자동 플래그 및 수동 검토.
  - *Balance Freeze*: 이상 거래 탐지 시 `UserBalance.frozenAt` 설정, 포인트 사용 차단.
- **환불/회수**:
  - **`REFUND_RETURN`**: 주문 환불 시 사용했던 포인트를 되돌려줌 (+).
  - **`REFUND_CLAWBACK`**: 결제(구독/충전) 취소 시 적립받았던 포인트를 회수함 (-). 잔액 부족 시 **마이너스 상계**.
- **안전장치 (Safety & Integrity)**:
  - **원자성 구현(Atomicity) - 표준**:
    - `UPDATE UserBalance SET ... WHERE currentPoints >= needed;`
    - `INSERT INTO PointLog ... SELECT ... WHERE changes() > 0;` (조건부 실행).
    - *주의*: `changes()`는 **직전 UPDATE 바로 다음 statement**에서만 사용 (중간에 다른 write 금지).
    - *동시성*: Reserve 단계의 UPDATE+INSERT는 **항상 동일 batch/트랜잭션 컨텍스트**에서 실행.
    - *실패 처리*: `changes() == 0`이면 아무것도 실행되지 않으며, 서버는 이를 감지해 실패 응답.
  - **Saga Flow (3-Phase)**:
    1. **Reserve**: `UserBalance` 선차감(Hold) + `PointLog(PENDING)` 생성.
        - *needed 정의*: `needed = (mode=='POINT') ? pointsPaidTotal : pointsDiscountTotal`
    2. **Order**: `DB4 Order` 생성 및 결제(PAID).
    3. **Confirm**: `UPDATE PointLog SET status='CONFIRMED' WHERE eventKey=? AND status='PENDING'`.
    - *보상(Compensation)*: 실패 시 `UserBalance` 환불 + `PointLog(CANCELLED)` (단, `status='PENDING'`일 때만).
  - **PENDING 청소**: Cron 배치 + User Action 시 Lazy Cleanup 병행. 만료(`expiresAt`) 시 자동 취소.
  - **멱등성(EventKey 표준)**:
    - Reserve/Confirm/Cancel: `ORDER_RESERVE:<orderId>` (동일 키로 **status만 전환**)
    - Refund: `ORDER_REFUND:<orderId>:<seq>`
    - Payment: `PAYMENT:<provider>:<paymentId>`

## 3. 3-Layer Data Strategy (데이터 모델링 전략)

### Layer 1: Core (Global Shared - Physically Partitioned)

DB1: Identity Core (인증/권한)

- **User**: `id`, `email`, `createdAt`, `updatedAt` (포인트 잔액은 DB2로 이동)
- **Subscription**:
  - `id`, `userId`, `tier`, `status`
  - `currentPeriodStart/End`, `cancelAtPeriodEnd`, `pendingTier/EffectiveAt`
- **SubscriptionChangeLog**: `id`, `status`('REQUESTED', 'APPLIED', 'CANCELLED'), `fromTier`, `toTier`, `effectiveAt`, `prorationMoneyCents`
- **UserConsent**: `userId`, `siteId`, `channel`, `purpose`, `status`, `consentVersion`, `agreedAt/revokedAt`, `proofIp/UserAgent`
- **UserSitePresence**: `userId`, `siteId`, `firstSeenAt`, `lastSeenAt` (**Asia/Seoul 자정 기준 1일 1회 갱신**), `visitDays`
  - *운영 참고*: 쓰기량 급증 시 별도 Analytics DB로 분리 가능. `approximate` 허용.
- **Sites**: `id`, `domain`, `shardKey`
- **Entitlement**:
  - *물리 저장*: **Identity Core DB** (권한 판정 중앙화).
  - `kind`, `targetType`, `targetId`, `siteId`('GLOBAL' or Value), `source`
  - `expiresAt` (기간제 권한용), `createdAt`
  - `attributes` (TEXT/JSON): 수량/메타데이터 저장.
  - *Unique Constraint*: `(userId, kind, targetType, targetId, siteId, source)` (**source 포함**).
  - *효력 판정*: **`expiresAt IS NULL OR expiresAt > now`인 행이 하나라도 존재하면 유효.** (`expiresAt=NULL`은 무기한)
  - *수량 판정*: 유효한 Entitlement들의 `attributes.count`를 **합산(SUM)**. (`count` 없으면 0으로 간주)
  - *갱신 규칙*: 중복 권한 부여 시 **UPSERT로 `expiresAt` 연장**.

DB2: Ledger Core (포인트/결제 원장)

- **UserBalance** (잔액 원본):
  - `userId` (PK), `currentPoints`, `pointsExpiresAt`, `updatedAt`
- **PointLog**:
  - `id`, `userId`, `siteId` (발생 사이트)
  - `amount`, `balanceAfter` (디버깅/리포팅용, Nullable)
  - `type`: 'EARN_SUB', 'EARN_TOPUP', 'USE_ORDER', 'REFUND_RETURN', 'REFUND_CLAWBACK', 'ADMIN'
  - `status` ('PENDING', 'CONFIRMED', 'CANCELLED')
  - `expiresAt` (PENDING 상태 자동 만료용)
  - `eventKey`: 멱등성 보장용 합성 키.
  - *Unique Constraint*: `(eventKey)` **(단독 유니크)**.
- **PaymentEventCore** (전역 결제 조회용 최소 이력 - **Source of Truth**):
  - `id`, `userId`, `kind`, `provider`, `providerAccountId`, `providerPaymentId`, `moneyCents`, `currency`(ISO 4217, 기본 'USD'), `status`, `createdAt`, `siteId`, `shardKey`, `domainRefId`
  - *Unique Constraint*: `(provider, providerAccountId, providerPaymentId)`
  - *내부 결제 규칙*: 포인트 결제 등은 `provider='INTERNAL'`, `providerPaymentId='POINT:' + orderId` 사용.
  - *Webhook 재시도*: 외부 결제 이벤트 실패 시 Exponential Backoff (5s → 30s → 2m → 10m), 최대 5회. Dead Letter Queue 후 수동 처리.

DB3: Support Core (운영 인덱스)

- **SupportThreadCoreIndex**: `id`(ULID), `userId`, `siteId`, `category`, `status`, `lastMessageAt`, `shardKey`

### Layer 2: Module (Standardized Interface - Domain DBs)

> 반복되는 패턴(커머스, 소유권, 커뮤니티 등)을 추상화하여 `shardKey`로 분산 저장합니다.

- **CatalogItem**: `type`, `priceMoneyCents`, `pricePoints`, `attributes`(JSON)
- **Order**:
  - `mode`: 'CASH', 'POINT'
  - `totalMoneyCents`, `capBaseMoneyCents`(스냅샷), `totalPoints`(스냅샷)
  - `pointsDiscountTotal`, `pointsPaidTotal`, `cashPaidMoneyCents`
  - `status`: 'PENDING', 'PAID', 'REFUNDED', 'PARTIAL_REFUNDED'
  - *불변식(CASH)*: `pointsPaidTotal=0`, `cashPaid = total - pointsDiscount`.
  - *불변식(POINT)*: `cashPaid=0`, `pointsDiscount=0`, `total=0`.
- **OrderItem**:
  - `quantity`, `itemPointsDiscount` (배분: 잔여 몰아주기), `itemPointsPaid`
  - `unitMoneyCents`, `unitPoints` (가격 스냅샷)
  - `refundedMoneyCents`, `refundedPoints`, `status`
- **PaymentHistory**: `providerPaymentId`, `idempotencyKey` 등.
- **RefundHistory**: `providerRefundId` 또는 `refundSequence` 기반 멱등성 보장.
- **SupportThread/Message/Attachment**: 문의 본문 및 첨부파일 정보.
- **Outbox**: `eventId`, `type`, `aggregateId`, `payloadJson`, `createdAt`, `processedAt` (Core 동기화용)
- **Community** (Post, Comment, Reaction, Report): 대용량 커뮤니티 데이터.

### Layer 3: Meta (Site-Specific)

- **SiteConfig**: `siteId`, `config` (JSON)
  - `config.ads` 예시:

    ```json
    {
      "ads": {
        "enabled": true,
        "provider": "ezoic",
        "slots": {},
        "cspAllowlist": ["https://*.googlesyndication.com"]
      }
    }
    ```

- **UserSiteMeta**: `userId`, `siteId`, `data` (JSON)

## 4. 사이트별 운영 전략 (시나리오)

- **Site A (강의) - AdSense 사용**:
  - `SiteConfig`: `provider='generic_adapter_a'` (예: adsense).
  - Pro 유저 방문 -> `__Host-adfree` 쿠키(서명됨, `iss`/`aud`/`exp` 검증) -> `ad-bootstrap.js` 로컬 검증 성공 -> 스크립트 로드 차단.
  - 일반 유저 방문 -> `__Host-adfree` 없음/검증실패 -> `ad-bootstrap.js`가 어댑터 로드 (`ADS` 동의 O, `PERSONALIZED_ADS` 동의 X면 NPA 모드).
- **Site B (스터디카페) - 광고 없음**:
  - `SiteConfig`: `enabled=false`.
- **Site C (커뮤니티) - 할인 & 역할**:
  - **성격**: 커뮤니티 중심, Pro 이상 광고 제거.
  - **역할**: 운영자 `Entitlement(targetType='SYSTEM_ROLE', targetId='MODERATOR', siteId='siteC')`.
  - **포인트(할인)**: 굿즈 판매 `CatalogItem(priceMoney>0, pricePoints=0)`. `Order(mode='CASH')`에서 포인트 할인(50% 제한).
- **Site D (디지털 마켓) - 소유권 & Dual Price**:
  - **성격**: 템플릿 판매, 광고 없음.
  - **상품**: `CatalogItem(priceMoney=2900, pricePoints=2900)` -> Dual Price.
  - **포인트 결제**: `Order(mode='POINT')` -> Saga(Reserve -> Order -> Confirm) -> `Entitlement(source='PURCHASED')`.
  - **권한 판정**: 다운로드 요청 시 Domain 주문 여부가 아닌 **Core Entitlement**로 판정.
- **Site E (SaaS/툴) - 기능 플래그 & Slot**:
  - **성격**: 생산성 툴, 구독 티어별 기능 차등.
  - **기능**: 구독 시 `Entitlement(kind='FEATURE', targetType='FEATURE_FLAG', targetId='EXPORT_PDF', siteId='siteE')` 부여.
  - **Slot**: Ultra 티어 `Entitlement(kind='SLOT', targetType='SLOT', targetId='TEAM_SEAT', attributes={"count":5})` 부여.
  - **Support**: 문의 발생 시 Domain `Outbox` -> Core `SupportThreadCoreIndex` 동기화.
- **공통 (포인트 충전)**:
  - `CatalogItem(type='POINT_PACKAGE', priceMoneyCents=300, pricePoints=0)` 구매.
  - 결제 성공($3.00) -> Ledger Core `PointLog` Insert(`EARN_TOPUP`, `CONFIRMED`) + `UserBalance` 적립 Update (Batch).

## 5. 데이터 보존 정책 (Data Retention)

- **Soft Delete**: `User.deletedAt` 설정 시 로그인 차단, 관련 데이터 익명화 예약.
- **보관 기간**:
  - `PointLog`, `Order`: 삭제 후 **5년** 보관 (세금/감사 대응).
  - `PaymentEventCore`: 삭제 후 **7년** 보관.
  - 미동의 데이터(`UserConsent` 거부): 즉시 삭제.
- **익명화**: `email` → `deleted_{ulid}@anon.local`, 개인정보 필드 널 처리.
- **GDPR 요청**: 30일 내 완료 목표, 사전 포인트 잔액 소멸 안내.

## 6. 향후 논의 과제

- [ ] **DB 마이그레이션**: D1 스키마 SQL 작성.
- [ ] **API 표준화**: Module 레이어(Catalog, Order, Entitlement) 공통 API 설계.
- [ ] **Consent UI**: 회원가입/로그인 시 약관 동의 UI 표준화.
- [ ] **Multi-Currency**: 글로벌 확장 시 `currency` 필드 활성화 및 환율 스냅샷 전략 수립.

## 7. 재사용 가이드 (Reuse Guide)

이 프로젝트의 DB 스키마는 **Core(플랫폼 공통)**와 **Domain(사이트 개별)**으로 분리되어 있어, 다수의 사이트 확장에 최적화되어 있습니다.

### Core DB (`/db-schema/core`)

- **역할**: Rodi Pass 통합 플랫폼 (DB1: Identity, DB2: Ledger, DB3: Support).
- **재사용**: **최초 1회 구축** 후 모든 사이트가 이를 공유(Bind)합니다.
- **주의**: 새 사이트를 만들 때마다 Core DB를 새로 만드는 것이 아니라, 기존 Core DB에 연결합니다.

### Domain DB (`/db-schema/domain/template.sql`)

- **역할**: 각 웹사이트별 고유 데이터 (DB4+: 상품, 주문, 게시글 등).
- **재사용**: 새 사이트를 구축할 때마다 이 템플릿을 복사하여 **새 D1 인스턴스를 생성**합니다.
- **구조**: `CatalogItem`, `Order`, `Post` 등 표준화된 모듈 테이블이 포함되어 있습니다.

> **💡 요약**: "Rodi Pass" 생태계에 합류하는 새 사이트를 만들 때는 **Core DB는 건드리지 않고, Domain DB만 새로 생성**하여 연결하세요.
