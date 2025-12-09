# Anchor v0.31 - v0.32 아키텍처 리포트: 유연성과 표준화의 진화

2025년 상반기에서 하반기까지 Anchor는 \*\*'Discriminator의 유연화'\*\*와 \*\*'개발 워크플로우의 표준화'\*\*라는 두 가지 큰 축으로 변화했습니다. 특히 v0.31.0의 커스텀 Discriminator 도입은 기존의 엄격했던 계정 구조 제약을 풀어주어 비 Anchor 프로그램과의 호환성을 극대화했고, v0.32.0은 배포 및 검증 프로세스를 CLI 레벨에서 내재화하여 운영 효율성을 높였습니다.

본 리포트는 해당 기간의 변경 사항을 분석하여, 실무에서 즉시 적용 가능한 아키텍처 전략과 마이그레이션 포인트를 제시합니다.

---

## 1. Executive Summary: 버전별 핵심 아키텍처 변화

| 버전        | 릴리즈 시기 | 핵심 아키텍처 변화 (Paradigm Shift)                                                                            |
| :---------- | :---------- | :------------------------------------------------------------------------------------------------------------- |
| **v0.31.0** | '25.03      | **Flexibility:** 8바이트 고정 Discriminator 제약 해제. `LazyAccount`를 통한 대량 계정 처리 성능 최적화.        |
| **v0.31.1** | '25.04      | **Stability:** Rust 툴체인 및 의존성 이슈 해결. TS 클라이언트의 유연성(Wallet 없는 Provider) 확보.             |
| **v0.32.0** | '25.10      | **DevOps:** `anchor deploy` 시 IDL 업로드 자동화 및 `solana-verify` 기반의 검증 가능한 빌드 파이프라인 표준화. |

---

## 2. Critical Action Items: 마이그레이션 필수 점검

### 2-1. Discriminator 전략 수정 (v0.31.0)

Discriminator가 더 이상 8바이트 고정이 아니므로, 관련 로직의 전면적인 검토가 필요합니다.

- **Impact:** 기존 `8 + data_len` 공식이나 `discriminator()` 메서드를 사용하는 코드는 컴파일 에러를 유발합니다.
- **Action:**
  - 스페이스 계산 로직을 `MyAccount::DISCRIMINATOR.len() + data_len`으로 동적 변경하십시오.
  - `#[account(zero)]`를 사용하는 구조체에 `Discriminator` 트레이트 구현이 누락되지 않았는지 확인하십시오.
  - 커스텀 Discriminator(`#[account(discriminator = ...)]`) 도입 시, 충돌 가능성을 배제하기 위해 명확한 네이밍 규칙이나 상수 관리가 필요합니다.

### 2-2. 프로그램 검증 및 호출 로직 (v0.32.0)

- **Program 타입 단순화:** 특정 프로그램이 실행 가능한지만 검증하면 되는 경우, 제네릭 없는 `Program<'info>` 타입을 사용하여 코드를 간소화하십시오. 불필요한 `UncheckedAccount` 사용을 줄여 보안성을 높일 수 있습니다.
- **CPI 호출 최적화:** 별도의 코드 수정 없이 Anchor 내부적으로 `solana-invoke`를 사용하여 CU 소모를 줄입니다. CPI가 빈번한 프로그램이라면 성능 테스트를 통해 절감 효과를 확인해 볼 가치가 있습니다.

### 2-3. 배포 및 검증 파이프라인 (v0.32.0)

- **IDL 자동화:** `anchor deploy`가 IDL 업로드를 기본 수행합니다. CI/CD 파이프라인에서 IDL 업로드를 별도 단계로 분리해 두었다면, `--no-idl` 옵션을 추가하거나 파이프라인을 단순화하여 중복 업로드를 방지하십시오.
- **Verifiable Build:** Docker 이미지 기반 검증에서 `solana-verify` CLI 도구 기반으로 전환되었습니다. 검증 스크립트를 업데이트하고, 로컬 개발 환경과 CI 환경에 해당 도구를 설치하십시오.

---

## 3. Strategic Recommendations: 코드 패턴 예시

**Legacy Pattern (Deprecated):**

```rust
// v0.30.x: Fixed discriminator size assumption
let space = 8 + MyAccount::INIT_SPACE;
```

**Modern Pattern (Recommended):**

```rust
// v0.31.0+: Dynamic discriminator handling
let space = MyAccount::DISCRIMINATOR.len() + MyAccount::INIT_SPACE;

// v0.32.0+: Simplified program validation
#[derive(Accounts)]
pub struct MyContext<'info> {
    pub my_program: Program<'info>, // No generic needed if only executable check is required
}
```

Anchor v0.31\~0.32 구간은 "유연한 설계"와 "견고한 운영"을 동시에 잡기 위한 도약기였습니다. 기존의 경직된 구조를 **커스텀 Discriminator**와 **LazyAccount**로 유연하게 풀고, 배포 프로세스는 **CLI 자동화**로 단단하게 조이는 것이 이번 업그레이드의 핵심 전략입니다.
