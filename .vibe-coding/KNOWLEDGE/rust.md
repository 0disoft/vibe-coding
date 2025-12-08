# Rust 1.82 ~ 1.91 주요 변경 사항

## 1. Rust 안정 릴리스 타임라인 (2024-09-13 ~ 2025-12-08)

| 순서 | 버전 | 릴리스 날짜 | 비고 |
| --- | --- | --- | --- |
| 1 | 1.82.0 | 2024-10-17 | wasm32-wasip2 Tier 2, AsyncFn* 프리루드 추가 등 |
| 2 | 1.83.0 | 2024-11-28 | 주로 라이브러리·컴파일러 개선, 눈에 띄는 새 문법은 적음 |
| 3 | 1.84.0 | 2025-01-09 | 차세대 trait solver, wasm32-wasi 타깃 제거, 여러 호환성 변화 |
| 4 | 1.84.1 | 2025-01-30 | 1.84.0 회귀 버그 수정용 패치 (ICE·빌드 문제 등) |
| 5 | 1.85.0 | 2025-02-20 | Rust 2024 에디션 정식 안정화, async 클로저 등 |
| 6 | 1.85.1 | 2025-03-18 | 주로 doctest·빌드·fs 버그 수정 (코드 사용법 변화 거의 없음) |
| 7 | 1.86.0 | 2025-04-03 | trait object upcasting 안정화, safe #[target_feature], 새 린트 |
| 8 | 1.87.0 | 2025-05-15 | asm_goto 안정화, precise_capturing_in_traits, std::arch 안전 호출 확대 |
| 9 | 1.88.0 | 2025-06-26 | 2024 에디션에서 let_chains·naked functions 안정화, 위험한 포인터 린트 추가 |
| 10 | 1.89.0 | 2025-08-07 | const generic 자동 추론 안정화, 새 lifetime 린트, repr(128) 안정화 |
| 11 | 1.90.0 | 2025-09-18 | 새 문법은 거의 없고 린트 분할·LLD 기본 링크, Cargo workspace publish 등 |
| 12 | 1.91.0 | 2025-10-30 | 패턴 바인딩 드롭 순서 명확화, C variadic FFI 안정화 |
| 13 | 1.91.1 | 2025-11-10 | wasm 링크 회귀 및 illumos 파일락 수정 (기능 추가 아님) |

## 2. "코드 짤 때 진짜로 신경 써야 하는 것만" 버전별 정리

단순 버그픽스·성능향상은 뺐고,
다음 기준에 해당하는 것만 골랐습니다.

* 새 문법·언어 기능·표준 라이브러리 기능
* 린트 레벨 변화(경고/에러 승격)
* 타깃/도구체인 호환성 변화
* deprecated·제거·타깃 이름 변경 등

형식은

* "언어/라이브러리/Cargo/플랫폼"
* "뭐가 바뀌었는지"
* "코드에서 어떻게 대응해야 하는지"

를 한 번에 볼 수 있게 표로 묶었습니다.

### 2.1 Rust 1.82.0 (2024-10-17)

| 영역 | 변화 내용 | 코드에 미치는 영향 / 대응 |
| --- | --- | --- |
| 언어 | `wasm32-wasip2` 타깃이 공식 Tier 2가 됨 | `rustup target add wasm32-wasip2` 로 WASI 0.2를 정식 지원. WASI 0.2 기반 런타임 겨냥 서비스라면 이제 CI에 이 타깃 추가 가능. |
| 언어 | `AsyncFn`, `AsyncFnMut`, `AsyncFnOnce` 가 모든 에디션의 prelude 에 추가 | 더 이상 `use core::ops::AsyncFn` 같은 수동 import 필요 없음. 반대로 동일 이름을 로컬에서 쓰고 있었다면 이름 충돌 가능성 있으니 확인 필요. |
| 언어 | inline asm 에 const 피연산자 사용 안정화, const 컨텍스트에서 부동소수 연산·여러 std 함수 사용 가능 | `const fn` 안에서 float 연산, `mem::size_of_val`, `Layout::array`, `swap`, 여러 numeric 메서드를 그대로 사용 가능. 상수 계산 로직을 런타임이 아니라 컴파일 타임으로 올리기 쉬워짐. |
| 언어 | macro_rules에서 `$x:stmt` 가 예전처럼 패턴까지 과하게 매칭하지 않도록 수정 | `$e:stmt` 를 이용해 사실상 패턴을 받던 "애매한" 매크로가 있다면 빌드가 깨질 수 있음. statement vs pattern 구분을 의도에 맞게 다시 명시해야 함. |
| 컴파일러/플랫폼 | `wasm32-wasip2` 가 rustup 에서 바로 설치 가능, Tier 2 보장(빌드 성공 보장 등) | Wasm + WASI 0.2로 서비스 쪽 실험할 계획이면, 최소 MSRV를 1.82 이상으로 잡는 게 안전. |
| 라이브러리 | tuple에 대한 `Extend` / `FromIterator` 구현, 다양한 midpoint/`Waker::noop` 등 여러 API 안정화 | iterator 결과를 튜플로 모으는 패턴이 단순해짐. 예: `let (xs, ys): (Vec<_>, Vec<_>) = iter.collect();` 식 패턴이 더 자연스럽게 작동. |
| Cargo | `unknown_or_malformed_diagnostic_attributes` 와는 별개로, `check-cfg` 에서 `cfg(test)` 가 "자동 인식"이 아님 | `rustc --check-cfg` 를 직접 쓰는 빌드 시스템이라면 `--check-cfg=cfg(test)` 를 명시해야 `cfg(test)` 를 허용된 cfg로 인식. 안 그러면 경고 또는 에러 가능. |

### 2.2 Rust 1.83.0 (2024-11-28)

이 릴리스는 주로 라이브러리 API 추가, 컴파일러/플랫폼 개선, 진단 메시지 개선 위주입니다. 공개된 릴리스 노트 기준으로 새로운 문법·강한 호환성 변화는 거의 없고, "코드 작성 관점에서 반드시 챙겨야 할" 변화는 크지 않습니다.

실무에서 굳이 신경 쓸 부분은:

* 새로 안정화된 std API 몇 개
* 일부 타깃/플랫폼 관련 설정

정도라, 여기서는 다른 버전에 비해 상세 표는 생략해도 무방한 수준입니다.

### 2.3 Rust 1.84.0 / 1.84.1

| 버전 | 영역 | 변화 내용 | 코드 영향 / 대응 |
| --- | --- | --- | --- |
| 1.84.0 | 언어 | 차세대 trait solver 를 coherence에 사용하기 시작 | 어떤 impl 들이 "충돌"로 간주되는지, 그리고 trait bound 추론 에러 메시지가 바뀔 수 있음. 기존에 애매하게 돌아가던 impl 조합이 이제는 에러로 잡힐 수 있으니, 경계선에 걸린 제네릭/trait 설계가 있다면 다시 점검 필요. |
| 1.84.0 | 언어 | `-Ctarget-feature` 로 ABI를 깨뜨릴 수 있는 조합을 켜면 경고 | x86/ARM에서 CPU feature를 수동으로 건드리는 빌드 스크립트라면 경고가 늘어날 수 있음. ABI가 깨지지 않는지 확인 후, 필요하면 설정을 세분화하거나 `RUSTFLAGS` 관리 개선. |
| 1.84.0 | 언어 | `raw const` / `raw mut` 로 `*ptr` 의 raw ref 를 취하는 것이 안전한 것으로 변경 | 기존에는 `unsafe` 가 필요했던 패턴이 이제 safe가 되어 `unused_unsafe` 경고가 생길 수 있음. 관련 코드를 정리해도 됨. |
| 1.84.0 | 언어 | `include!()` 에서 Windows 에서도 `/` 를 경로 구분자로 항상 허용 | cross-platform 매크로 코드에서 경로 처리에 약간 여유가 생김. |
| 1.84.0 | 언어 | s390x, Arm64EC inline asm 안정화, drop glue 가 `extern "C"` 함수에서도 unwind 시 정상 실행 | 저수준/FFI 코드에서 예외(패닉) 전파와 자원 정리에 영향. `extern "C"` 함수에서 panic 가능성을 고려하고 싶다면 이 버전 이후의 동작을 기준으로 생각하는 게 안전. |
| 1.84.0 | 라이브러리 | `From<&mut [T]> for Box<[T]> / Rc<[T]> / Arc<[T]>`, `FromStr for CString` 등 편의 변환 추가 | 소유권 전환/문자열 변환 코드가 간단해짐. 기존 수동 변환을 새 API로 치환 가능. |
| 1.84.0 | Cargo | MSRV-aware resolver v3 안정화 | `package.rust-version` 값을 더 적극적으로 활용해 종속성 해석. workspace·다중 크레이트에서 "지원 Rust 버전"을 명시하면 동작이 달라질 수 있으므로, 오래된 Rust를 지원해야 한다면 MSRV 설정을 꼼꼼히 관리해야 함. |
| 1.84.0 | 호환성 | `wasm32-wasi` 타깃 이름 완전히 제거, `wasm32-wasip1` 로 대체 | 기존에 `--target wasm32-wasi` 를 쓰던 빌드는 1.84 이후 바로 깨짐. 타깃 이름을 전부 `wasm32-wasip1` 로 바꿔야 함. |
| 1.84.0 | 호환성 | `std::arch` 레거시 호출 문법에서 아이템 선언(클로저, inline const, async 블록 등) 금지 | 매크로나 weird macro-style 코드에서 이런 패턴을 쓰고 있었다면 컴파일 에러로 바뀜. 새 스타일로 수정 필요. |
| 1.84.1 | 전체 | 여러 컴파일러 회귀(ICE, incremental 빌드, 디버그정보 등) 수정 | 코드 사용법은 그대로지만, 1.84.0 사용 중 빌드나 툴체인 문제가 있었다면 1.84.1 로 올리는 것이 사실상 필수. |

### 2.4 Rust 1.85.0 / 1.85.1

| 버전 | 영역 | 변화 내용 | 코드 영향 / 대응 |
| --- | --- | --- | --- |
| 1.85.0 | 언어 | Rust 2024 에디션 정식 안정화 | 새 프로젝트나 크레이트에서 `edition = "2024"` 를 선택할 수 있음. 에디션별 차이(예: let_chains 의미, trait solver 기본 정책 등)를 이해한 뒤 올리는 게 좋고, 기존 코드의 에디션을 무작정 2024로 바꾸기보단 새 크레이트부터 적용하는 전략이 안전함. |
| 1.85.0 | 언어 | async 클로저 안정화 (`let f = async \| x \| { ... };`) | 별도 unstable feature 없이 async 클로저 사용 가능. 기존엔 `async move` 블록이나 별도 async fn 을 써야 했던 부분을 간단히 줄일 수 있음. |
| 1.85.0 | 언어/진단 | `#[diagnostic::do_not_recommend]` 안정화 | 라이브러리 작성자가 "자동 완성/에러 메시지에서 이 함수는 추천하지 말라"고 표시 가능. public API 정리할 때 유용. |
| 1.85.0 | 언어/린트 | `unpredictable_function_pointer_comparisons` 린트 추가 | 함수 포인터 비교는 플랫폼·링커에 따라 의미가 애매해서 실제 동작이 예측 불가할 수 있음. 이 린트가 켜지면 해당 비교 코드를 재설계하는 게 좋음(예: enum/ID로 추상화). |
| 1.85.0 | 언어/린트 | `#[no_mangle]` 와 `#[export_name]` 을 같이 쓰면 린트 | 둘 다 심볼 이름을 제어하는데, 동시에 쓰면 의미가 충돌할 수 있어 경고. 하나만 남기도록 정리해야 함. |
| 1.85.1 | 전체 | doctest 병합, target_feature 관련 문서 빌드, Windows `fs::rename` 버그, 커스텀 타깃 빌드 등 수정 | 주로 도구/빌드/플랫폼 버그 수정이라, 코드 레벨에서 바뀌는 점은 거의 없음. 1.85 사용 중이라면 1.85.1 로 올려 두는 게 안정성 측면에서 이득. |

### 2.5 Rust 1.86.0 (2025-04-03)

| 영역 | 변화 내용 | 코드 영향 / 대응 |
| --- | --- | --- |
| 언어 | trait object upcasting 안정화: `&dyn Sub` → `&dyn Super` 로 안전하게 "업캐스트" | 예: `trait Read: Debug {}` 라면 `&dyn Read` 를 `&dyn Debug` 로 올리는 것이 안정 기능이 됨. 이전에는 우회 코드가 필요했는데, 이제는 표준 trait object 업캐스팅으로 더 깔끔하게 구현 가능. |
| 언어 | `#[target_feature]` 를 safe 함수에도 붙일 수 있게 허용 | CPU feature 가 켜졌다는 전제 하에, 해당 함수를 safe하게 호출할 수 있음. 대신 호출자는 `is_x86_feature_detected!` 같은 체크로 환경을 보장해야 하고, 그 규약이 깨지면 UB 가능성이 있으므로 래퍼 함수를 잘 설계하는 게 중요. |
| 언어/린트 | `missing_abi` 린트가 warn-by-default 로 승격 | extern 함수 선언에서 ABI를 명시하지 않아 애매한 경우 경고. FFI 나 C와의 연동 코드에서는 `extern "C"` 등을 명시하는 습관을 들여야 함. |
| 언어/린트 | "이중 부정" 관련 새 린트 추가 (예: 다른 언어의 `--x` 를 착각해서 쓴 코드 탐지) | `x = !!x` 같은 혼동하기 쉬운 코드가 경고될 수 있음. 무심코 타 언어 습관으로 코드를 쓴 경우 바로 잡게 도와줌. |
| 라이브러리/Cargo | 1.82에서 이어진 const/표준 라이브러리 정리와 Cargo 기능 조정 | 기존 API 의미를 바꾸는 식의 큰 깨짐은 없지만, const 가능한 영역이 넓어져 메타프로그래밍·임베디드 쪽에서는 활용 폭이 더 커짐. |

### 2.6 Rust 1.87.0 (2025-05-15)

| 영역 | 변화 내용 | 코드 영향 / 대응 |
| --- | --- | --- |
| 언어 | `asm_goto` 안정화 | 저수준 제어 흐름(예: 커널/RTOS 코드)에서 `asm!` 으로 라벨 점프를 구현할 수 있게 됨. 보통 애플리케이션 개발자는 거의 안 쓰지만, OS·런타임 레벨 코드는 이 기능에 의존할 수 있음. |
| 언어 | `..expr`(open beginning range) 가 `!`, `-`, `*` 뒤에서도 파싱 가능 | 매우 마이너한 문법 편의. 매크로/DSL 수준에서만 체감될 가능성이 큼. |
| 언어 | `Self: Sized` 가 붙은 메서드는 unsized 타입에 대한 impl 에서 구현하지 않아도 허용 | `impl MyTrait for dyn MyTrait {}` 같은 곳에서 실제로 호출할 수 없는 메서드 구현을 강제로 만들 필요가 줄어듦. trait 설계가 조금 더 유연해짐. |
| 언어 | `feature(precise_capturing_in_traits)` 안정화 → trait 의 `-> impl Trait` 반환 타입에 `use<...>` 문법 허용 | RPITIT(return-position impl Trait in traits) 설계 시 "어떤 제네릭/수명 파라미터를 캡처하는지"를 더 정확히 표현 가능. 복잡한 async trait, GAT-heavy 코드에서 타입 지옥을 줄이는 데 도움. |
| 라이브러리 | 많은 `std::arch` intrinsic 이 "조건부로" safe 로 바뀜 (포인터 인자가 없는 경우 등) | 이로 인해 기존 `unsafe` 블록이 불필요해져 `unused_unsafe` 경고가 늘 수 있음. 이제는 "CPU feature가 켜졌는가"를 타입/호출 계층에서 보장하는 설계가 더 중요해짐. |
| 라이브러리 | `env::home_dir` undeprecate | 한동안 deprecated였던 `home_dir` 가 다시 정식으로 쓸 수 있게 됨. 직접 구현한 대체 함수를 쓰고 있었다면 표준 API로 회귀 가능. |
| 라이브러리/린트 | `ControlFlow` 가 `#[must_use]` 가 됨, 포맷 width/precision 을 16bit 로 제한 | `try_for_each` 같은 제어 흐름에서 `ControlFlow` 반환을 무시하면 경고. 반대로, 엄청난 width/precision 값을 포맷에 넣는 이상한 코드는 이제 에러나 경고로 잡힘. |
| 컴파일러 | i686 타깃에서 SSE2 요구 | 32비트 x86 중 매우 오래된 CPU는 더 이상 지원하지 않을 수 있음. 임베디드나 구형 장비를 타깃팅한다면 주의. |

### 2.7 Rust 1.88.0 (2025-06-26)

| 영역 | 변화 내용 | 코드 영향 / 대응 |
| --- | --- | --- |
| 언어 | 2024 에디션에서 `let_chains` 안정화 (`if cond && let Some(x) = y && x > 0 { ... }`) | 2024 에디션에서만 기본 제공. guard + 패턴 매칭을 섞어 쓰는 코드가 훨씬 깔끔해짐. 다만 2021 이하 에디션과 의미가 살짝 다를 수 있으니, 에디션 업 시 기존 패턴 매칭 로직이 의도대로 동작하는지 확인 필요. |
| 언어 | `#[naked]` 함수 안정화 (naked functions) | 프로로그/에필로그를 완전히 제어하고 싶은 low-level 코드에서 사용. 호출 규약·스택 정리를 전부 직접 책임져야 하므로, 일반 애플리케이션에서는 사용을 피하는 게 안전. |
| 언어/린트 | `invalid_null_arguments` 린트 추가 (Clippy 에서 승격) | null 포인터를 넘겨선 안 되는 API에 잘못 넘기는 경우를 잡음. 예를 들어 C FFI에서 "NULL 허용"이 아닌데 습관적으로 0을 넣은 코드 등이 경고 대상. UB 가능성이 있는 코드라면 이 린트를 계기로 수정해야 함. |
| 언어/린트 | `dangerous_implicit_autorefs` 린트 추가 (raw pointer deref 의 암묵적 autoref 경고) | `&*raw_ptr` 같은 패턴이 암묵적으로 삽입되던 케이스에서, 예상치 못한 reference lifetime/aliasing 문제를 경고. unsafe 코드가 많은 프로젝트라면 경고를 유심히 봐야 함. |
| 라이브러리 / Cargo | 2024 에디션과 연계된 여러 API·resolver 개선 | 새로운 린트/에디션 동작을 전제로 하는 라이브러리가 늘어날 것이라, "라이브러리 의존성 때문에 프로젝트도 2024 에디션으로 올리는" 시나리오가 점점 현실화될 가능성이 큼. MSRV 전략을 미리 생각해 두는 게 좋음. |

### 2.8 Rust 1.89.0 (2025-08-07)

| 영역 | 변화 내용 | 코드 영향 / 대응 |
| --- | --- | --- |
| 언어 | const generic "명시적 추론" 안정화 (`feature(generic_arg_infer)`) | 일부 const generic 인자를 생략하고 컴파일러가 추론하게 할 수 있음. 예제 수준에서는 크게 안 느껴질 수 있지만, 매크로/라이브러리에서 const generic 사용성을 개선하는 기반 기능. |
| 언어/린트 | `mismatched_lifetime_syntaxes` 린트(warn-by-default) 추가, 기존 `elided_named_lifetimes` 를 대체 | 동일한 수명을 `'a` 와 생략형(예: `&T`)으로 섞어 쓰면 읽기 어렵기 때문에 경고. API 시그니처에서 lifetime 표기를 일관되게 정리하는 계기가 됨. |
| 언어/린트 | `unpredictable_function_pointer_comparisons` 린트를 외부 매크로 사용처까지 확장 | 매크로 기반 DSL에서도 함수 포인터 비교를 숨겨두기 어렵게 됨. "어떤 함수냐"로 분기하고 싶다면 enum/trait object/함수 ID 등 다른 표현으로 리팩터링하는 것이 좋음. |
| 언어/FFI | `#[repr(u128)]`, `#[repr(i128)]` 안정화, `improper_ctypes_definitions` 에서 i128/u128 제거 | FFI·바이너리 프로토콜에서 128bit 정수 기반 enum 레이아웃을 직접 제어할 수 있음. C·다른 언어 쪽도 동일한 ABI를 사용하도록 맞춰야 하므로, 양쪽 구현이 정확히 일치하는지 주의. |

### 2.9 Rust 1.90.0 (2025-09-18)

| 영역 | 변화 내용 | 코드 영향 / 대응 |
| --- | --- | --- |
| 언어/린트 | `unknown_or_malformed_diagnostic_attributes` 린트를 네 개의 세분화된 린트로 분리 (`unknown_diagnostic_attributes`, `misplaced_diagnostic_attributes`, `malformed_diagnostic_attributes` 등) | 진단 관련 attribute(`#[diagnostic(...)]`, `#[warn(...)]`류)를 잘못 쓰면 더 구체적인 경고를 받게 됨. 린트 이름/위치를 잘못 썼을 때 원인을 찾기 쉬워짐. 기존 코드가 갑자기 에러로 바뀌는 수준은 아님. |
| 컴파일러/링커 | 여러 플랫폼에서 LLD를 기본 링커로 사용하도록 전환 | 커스텀 링크 옵션을 직접 쓰는 프로젝트라면, `ld` 를 가정하던 스크립트가 깨질 수 있으므로 빌드 로그를 확인하는 게 좋음. 반대로 일반적인 프로젝트는 링크 속도가 좋아질 수 있음. |
| Cargo | workspace 단위 publish 지원 | 모노레포 형태의 workspace에서 여러 크레이트를 한 번에 publish 하는 워크플로우가 쉬워짐. crates.io 공개 전략을 workspace 단위로 재설계할 수 있음. |
| 언어 | 새 문법 기능은 사실상 없음 | Rust 커뮤니티에서도 "눈에 띄는 언어 기능이 없는 릴리스"로 받아들여지는 버전. 언어를 새로 배우는 입장에서는 1.89와 거의 동일한 느낌으로 써도 무방. |

### 2.10 Rust 1.91.0 / 1.91.1

| 버전 | 영역 | 변화 내용 | 코드 영향 / 대응 |
| --- | --- | --- | --- |
| 1.91.0 | 언어 | 패턴 바인딩의 평가·drop 순서를 "작성된 순서"대로 정의 | 복잡한 패턴 매칭에서 어떤 값이 먼저 드롭되는지 더 예측 가능해짐. 기존 코드는 대부분 "우연히 맞게" 돌아가고 있었겠지만, drop 순서에 의존하던 미묘한 버그를 잡는 데 도움. |
| 1.91.0 | 언어/FFI | C 스타일 가변 인자 함수 선언이 여러 ABI(sysv64, win64, efiapi, aapcs 등)에서 안정화 | `unsafe extern "C" fn foo(a: i32, ...)` 같은 선언을 안정적으로 사용할 수 있음. C 라이브러리와의 FFI 레이어를 더 정식 문법 위에서 구현 가능. |
| 1.91.0 | 플랫폼 | `target_env = "macabi"` 추가 등(맥 Catalyst) | Apple 생태계에서 iOS 앱을 macOS로 가져오는 시나리오(Catalyst) 지원이 좋아짐. 여기에 Rust를 끼워 넣는다면 타깃 설정을 이쪽으로 옮기게 됨. |
| 1.91.1 | 컴파일러/도구 | WASM 타깃에서 `wasm_import_module` cross-crate 사용 시 발생하던 링크 오류 수정 | 1.91.0에서 wasm 모듈을 나눠 빌드할 때 링크가 깨지던 프로젝트는 1.91.1로 올려야 정상 동작. 코드 자체는 그대로여도 "빌드가 되느냐"가 달라지는 변경. |
| 1.91.1 | Cargo | illumos 에서 파일락 미동작 문제 수정 | illumos 기반 환경에서 Cargo 빌드 디렉토리 락이 제대로 작동. 병렬 빌드·멀티 유저 환경에서 안전성 향상. |

## 3. "이 버전들 중 뭘 기준으로 잡을까?" 요약

실무에서 MSRV·마이그레이션 기준으로 잡을 만한 포인트만 뽑으면:

* **WASI 0.2 / wasm 컴포넌트**를 쓸 거면
  → 최소 1.82.0 이상 (wasm32-wasip2 Tier 2)

* **2024 에디션 + async 클로저 + let_chains** 를 본격적으로 쓰고 싶다면
  → 사실상 1.88.0 이상을 권장 (1.85에서 에디션/async 클로저, 1.88에서 let_chains 안정화)

* **FFI·저수준 코드**가 많다면
  * 1.84.0: wasm32-wasi 제거, WebAssembly target feature 안정화, calling convention 관련 hard error
  * 1.87.0: asm_goto / std::arch safe화
  * 1.89.0: repr(128) 안정화, function pointer 비교 린트 강화
  * 1.91.0: C variadic 안정화

* **일반 웹/백엔드 애플리케이션** 기준으로
  * 1.85 ~ 1.88 쯤을 "언어 기능은 꽤 풍부하면서도 비교적 안정된 구간"으로 보는 것이 현실적
  * 1.90~1.91은 새 문법은 적고, 린트·플랫폼 쪽 다듬기 단계라, 최신 환경을 따라가고 싶다면 1.91.1을 기준으로 보는 게 무난
