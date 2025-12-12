# 현대 암호화 가이드

뚫리기 힘든 최신 암호화 기법들을 정리한 문서입니다. 레거시(MD5, SHA-1, DES, 3DES, RC4, ECB 모드 등)는 다루지 않습니다.

> [!NOTE]
> **SHA-2는 아직 레거시가 아니다.** SHA-256은 2025년 현재 preimage/collision 모두 실질적 공격 불가능. 다만 chosen-prefix collision 비용이 이론적으로 현실화되고 있으니, **새 프로젝트라면 BLAKE3나 SHA-3를 1순위로 고려**하고 SHA-256은 호환성용 백업으로 두는 게 미래 지향적이다.

## 핵심 원칙

> **"복잡성은 적, 단순함은 방패다."**

- **용도 우선**: 메모리 하드 함수(Argon2id)는 GPU 공격 방어용, 고속 해시/암호화(HKDF, XChaCha20)는 데이터 처리용. 용도에 맞지 않는 배치는 시스템을 망친다.
- **검증이 왕도**: "나만의 복잡한 조합"보다 검증된 표준 구현(libsodium, noble)을 따르는 것이 언제나 더 안전하다.
- **단순함의 힘**: 운영 복잡성이 보안 이득을 넘어서는 순간, 그 설계는 실패한 것이다. 버그는 복잡함 속에 숨는다.

---

## 패스워드 해싱

사용자 패스워드는 **절대 평문 저장 금지**. 느린 해싱 알고리즘으로 GPU/ASIC 공격 저항.

> [!CAUTION]
> 패스워드 해싱 함수는 **의도적으로 느리고 자원을 많이 소비**한다. 대량 데이터 암호화에 사용하면 서버가 녹아내린다. 데이터 암호화에는 HKDF + XChaCha20을 사용할 것.

### Argon2id (권장)

2015년 Password Hashing Competition 우승. 메모리 하드 + 시간 하드 조합.

> [!WARNING]
> **DoS 공격 주의**: 메모리 비용을 너무 높이면 동시 로그인 요청 시 서버 메모리가 고갈될 수 있습니다. 서버 자원에 맞는 레벨을 선택하세요.

| 프로필 | memory | iterations | parallelism | 용도 |
|--------|--------|------------|-------------|------|
| OWASP 하한선 | 19 MiB | 2 | 1 | "이 밑으로 절대 내려가지 마라". 신규 시스템 기본값으로는 약함 |
| **일반 권장** | 64 MiB | 3 | 1 | RFC 9106 저메모리 권장. 2025년 합리적 기본값 |
| 고보안 | 128 MiB | 4 | 2 | 금융/관리자 계정 |
| RFC 9106 최고 | 2 GiB | 1 | 1 | 디스크 암호화, 특수 환경용. 로그인에는 과함 |

> [!TIP]
> 파라미터는 "기준값"을 박아두기보다, 서버·모바일에서 각각 **목표 지연 시간(200~500ms)**&#8203;을 정하고 측정해서 맞춰라. 64~128 MiB를 넘기면 실사용 불편 대비 이득이 점점 줄어든다.

```typescript
// 예시 (@node-rs/argon2)
import { hash, verify } from '@node-rs/argon2';

const hashed = await hash(password, {
  memoryCost: 65536, // 64 MiB (일반 권장)
  timeCost: 3,
  parallelism: 1,
});
const isValid = await verify(hashed, password);
```

### Scrypt (차선책)

Argon2 지원 안 되는 환경용. 메모리 하드.

| 파라미터 | 권장값 | 설명 |
|----------|--------|------|
| N | 2^17 (131072) | CPU/메모리 비용 |
| r | 8 | 블록 크기 |
| p | 1 | 병렬화 |

> [!WARNING]
> bcrypt는 72바이트 입력 제한 + 메모리 하드 아님. 신규 프로젝트에서는 Argon2id 사용 권장.

### PBKDF2 (레거시 전용)

오래된 규제 환경이나 레거시 시스템 유지보수에서만 사용. **신규 프로젝트에서는 절대 선택하지 말 것.**

| 단점 | 설명 |
|------|------|
| 메모리 하드 아님 | GPU/ASIC 공격에 취약 |
| 반복 횟수 의존 | 충분한 보안을 위해 600,000회 이상 필요 (OWASP) |
| 구시대 설계 | 2000년대 초반 기준. 현대 공격에 부적합 |

### Salt 생성 규칙

패스워드 해싱 시 솔트는 필수. 없으면 Rainbow Table 공격에 무방비.

| 규칙 | 설명 |
|------|------|
| 길이 | **최소 16바이트 (128비트)** |
| 랜덤성 | `crypto.getRandomValues()` 사용 |
| 고유성 | 사용자마다 다른 값, 절대 재사용 금지 |
| 저장 | 평문으로 DB에 저장 가능 (비밀 아님) |

```typescript
// 올바른 솔트 생성
const salt = crypto.getRandomValues(new Uint8Array(16));

// ❌ 절대 하지 말 것
const badSalt = username; // 고정값
const badSalt2 = sha256(email); // 여전히 고정
```

---

## 키 파생 (KDF)

패스워드나 공유 비밀에서 암호화 키를 안전하게 추출.

> [!TIP]
> **마스터키 + HKDF 조합이 데이터 암호화의 표준**. 마스터키 하나만 KMS로 보호하면, 파생된 수천 개의 키가 털려도 원본은 안전하다. HKDF 연산은 비트 연산 수준으로 가벼워 대량 암호화에도 지연이 거의 없다.

### 봉투 암호화 (Envelope Encryption)

단일 마스터키로 모든 데이터를 직접 암호화하면 키 교체가 불가능에 가깝다. **DEK(데이터 암호화 키)**&#8203;와 **KEK(키 암호화 키)**&#8203;를 분리하라.

1. **DEK 생성**: 데이터마다 새로운 랜덤 키(DEK)를 생성해 데이터를 암호화
2. **DEK 암호화**: 마스터키(KEK)로 DEK를 암호화하여 데이터 옆에 저장
3. **복호화 시**: 마스터키로 DEK를 풀고, 그 DEK로 데이터를 복호화

**Re-wrapping (키 순환의 핵심)**:

마스터키가 유출되거나 순환 주기가 되면:

- ❌ **기존 방식**: 전체 데이터 복호화 → 재암호화 (테라바이트 단위, 서비스 멈춤)
- ✅ **봉투 방식**: DEK만 새 마스터키로 다시 암호화 (실제 데이터는 그대로)

> [!NOTE]
> Re-wrapping 시 실제 데이터 I/O는 0건. "감싸는 봉투"만 교체하는 것.
>
> DB에는 "마스터키로 암호화된 DEK"만 저장하고, 마스터키 자체는 **HSM·KMS·환경변수 등 별도 채널**에 둘 것. DB만 털려도 실데이터가 바로 복호화되지 않는다.

**키 순환 전략**:

| 상황 | 권장 조치 |
|------|----------|
| 일반 웹 서비스 정기 순환 | 마스터키: 1년마다 교체. 봉투 암호화면 DEK 재래핑만 수행 |
| 금융·의료 민감 데이터 | 마스터키: 6~12개월. 새 키 롤아웃 후 구키는 즉시 폐기 |
| 키 유출 의심 | 즉시 새 마스터키 생성 후 모든 DEK 재래핑, 접속 로그 조사 |
| 알고리즘 교체 | 신규 데이터부터 새 알고리즘 적용. 백필은 백그라운드 마이그레이션 |

**키 백업 전략**:

- 마스터키는 여러 위치에 암호화하여 분산 저장
- 고보안 환경: **Shamir's Secret Sharing**으로 키를 n개 조각으로 분할, k개 이상 모여야 복원 가능
- 정기적인 키 복구 절차 테스트 필수

### HKDF (HMAC-based KDF)

RFC 5869 표준. Extract → Expand 2단계.

```typescript
import { hkdf } from '@noble/hashes/hkdf';
import { blake3 } from '@noble/hashes/blake3';

// 마스터 시크릿에서 하위 키 파생
const encryptionKey = hkdf(blake3, masterSecret, salt, 'encryption', 32);
const authKey = hkdf(blake3, masterSecret, salt, 'authentication', 32);
```

### BLAKE3-KDF (derive_key 모드)

BLAKE3 내장 KDF 모드. high-entropy 시크릿에서 키 파생 시 사용.

```typescript
import { blake3 } from '@noble/hashes/blake3';

// derive_key 모드: context로 용도별 키 분리
const encKey = blake3(masterSecret, {
  context: 'myapp 2025-01-01 encryption key v1',
  dkLen: 32
});
```

> [!WARNING]
> BLAKE3 derive_key는 **비밀번호용이 아님**. 비밀번호는 반드시 Argon2id 같은 전용 해시를 사용할 것.

---

## 대칭 암호화 (Symmetric Encryption)

동일한 키로 암호화/복호화. AEAD(Authenticated Encryption with Associated Data) 모드 필수.

### 현실 순위 (2025년)

| 순위 | 알고리즘 | 설명 |
|------|-----------|------|
| **1** | XChaCha20-Poly1305 | 거의 모든 경우 1등. nonce 걱정 끝. |
| 2 | AES-256-GCM | AES-NI 있는 서버면 빠름. nonce 100% 랜덤 + 1회용 필수. |
| 3 | AES-256-GCM-SIV | 이론적으로 안전하지만 구현체 거의 없음 (libsodium, noble, Web Crypto 모두 미지원). |

### XChaCha20-Poly1305 (기본 권장)

- **ChaCha20**: 스트림 암호 (ARX 구조, 타이밍 공격 면역)
- **Poly1305**: MAC (무결성 보장)
- **XChaCha20**: 24바이트 nonce (충돌 위험 ↓, 랜덤 nonce 안전)

| 장점 | 단점 |
|------|------|
| 소프트웨어에서 빠름 | AES-NI 하드웨어 없으면 AES보다 빠름 |
| 타이밍 공격 저항 | AES-NI 있는 환경에서는 AES가 더 빠름 |
| 24바이트 nonce (안전) | 일부 규제 환경에서 AES 요구 |

```typescript
import { xchacha20poly1305 } from '@noble/ciphers/chacha';
import { randomBytes } from '@noble/ciphers/webcrypto';

const key = randomBytes(32);
const nonce = randomBytes(24);
const cipher = xchacha20poly1305(key, nonce);

const ciphertext = cipher.encrypt(plaintext);
const decrypted = cipher.decrypt(ciphertext);
```

### AES-256-GCM-SIV (AES-NI 환경용)

- **GCM-SIV**: nonce 실수에 대한 "안전망" (완전 면제가 아님)
- **AES-NI**: 하드웨어 가속으로 극한 성능

| 장점 | 단점 |
|------|------|
| AES-NI로 초고속 | 하드웨어 의존적 |
| nonce 오남용 저항 | 구현이 복잡 |
| 규제 준수 (FIPS) | 12바이트 nonce (랜덤 생성 시 주의) |

**Nonce 재사용 시 차이점**:

| 모드 | nonce 재사용 시 결과 |
|------|---------------------|
| AES-GCM | **완전 붕괴**: 평문이 직접 노출됨 (XOR 공격) |
| AES-GCM-SIV | **부분 정보 유출**: "이 두 암호문의 평문이 같은지" 여부만 드러남. 무결성은 유지 |

> [!IMPORTANT]
> GCM-SIV는 "한 번 삐끗해도 바로 전멸하지 않는 안전망"이지, nonce 관리를 대충 해도 된다는 면제권이 아니다. 대량 재사용은 여전히 위험하다.

---

## 해시 함수

데이터 무결성 검증, 핑거프린트 생성용.

### BLAKE3 (최신 권장)

2020년 출시. 극한의 속도 + 충분한 보안.

| 특징 | 값 |
|------|-----|
| 출력 | 256비트 (가변 가능) |
| 속도 | SHA-256의 6~10배 |
| 병렬화 | SIMD + 멀티스레드 지원 |
| 용도 | KDF, MAC, PRF, XOF 모드 내장 |

```typescript
import { blake3 } from '@noble/hashes/blake3';

const digest = blake3('hello world');
const longHash = blake3('data', { dkLen: 64 }); // 가변 길이
```

### SHA-3 / SHAKE (NIST 표준)

Keccak 기반. SHA-2와 다른 구조로 백업 알고리즘.

| 변형 | 출력 | 용도 |
|------|------|------|
| SHA3-256 | 256비트 | 일반 해싱 |
| SHA3-512 | 512비트 | 고보안 해싱 |
| SHAKE128 | 가변 | XOF (확장 출력) |
| SHAKE256 | 가변 | XOF (고보안) |

---

## 비대칭 암호화 / 키 교환

### X25519 (ECDH)

Curve25519 기반 키 교환. TLS 1.3 기본.

```typescript
import { x25519 } from '@noble/curves/ed25519';

// 키 쌍 생성
const privateKey = x25519.utils.randomPrivateKey();
const publicKey = x25519.getPublicKey(privateKey);

// 공유 비밀 생성
const sharedSecret = x25519.getSharedSecret(myPrivateKey, theirPublicKey);
```

### ML-KEM (포스트 양자)

NIST 표준화 완료 (2024). 양자 컴퓨터 저항.

| 레벨 | 보안 수준 | 공개키 크기 |
|------|----------|------------|
| ML-KEM-512 | AES-128 동등 | 800 bytes |
| ML-KEM-768 | AES-192 동등 | 1,184 bytes |
| ML-KEM-1024 | AES-256 동등 | 1,568 bytes |

**성능 영향**: ML-KEM은 기존 ECDH 대비 3~5배 느리고, 키/암호문 크기가 10~30배 큼. 모바일 환경에서는 네트워크 오버헤드 고려 필수.

**PQC 도입 기준 (연도가 아닌 "데이터 보관 기간"으로 판단)**:

| 데이터 유형 | 권장 조치 |
|------------|----------|
| **10년 이상 기밀 유지** 필요 (의료기록, 국가기밀 등) | 2025년 지금부터 X25519 + ML-KEM-768 하이브리드 적용 |
| 일반 세션 키 (단기 기밀성) | 당분간 X25519 단독도 현실적. 점진적 하이브리드 전환 |
| 순수 ML-KEM 전환 | 시점 불확실. 알고리즘을 플러그인처럼 교체 가능한 구조 먼저 확보 |

> [!TIP]
> "언제 PQC로 갈까?"보다 "내 데이터가 몇 년간 비밀이어야 하나?"로 생각하라. 양자 컴퓨터가 2035년에 나온다 해도, 지금 암호화된 데이터를 그때 복호화할 수 있다면 문제다.
>
> [!IMPORTANT]
> **NIST 공식 일정**: 2035년까지 RSA, ECDSA, ECDH 등 기존 취약 알고리즘 사용 중단 예정. 고위험 시스템은 더 일찍 전환해야 한다. ML-KEM/ML-DSA는 이미 NIST 최종 표준(FIPS 203, 204)으로 발표됨.

### PQC 대체 알고리즘

| 알고리즘 | 유형 | 상태 | 용도 |
|-----------|------|------|------|
| HQC | KEM | NIST 표준화 (2025) | ML-KEM 백업 옵션 |
| SPHINCS+ | 서명 | NIST 표준화 | 서명 크기 볠는 환경에서 ML-DSA 대안 |

---

## 디지털 서명

### Ed25519

Curve25519 기반 서명. 빠르고 안전.

```typescript
import { ed25519 } from '@noble/curves/ed25519';

const privateKey = ed25519.utils.randomPrivateKey();
const publicKey = ed25519.getPublicKey(privateKey);

const signature = ed25519.sign(message, privateKey);
const isValid = ed25519.verify(signature, message, publicKey);
```

### ML-DSA (포스트 양자)

NIST 표준화 완료. Dilithium 기반.

| 레벨 | 보안 수준 | 서명 크기 |
|------|----------|----------|
| ML-DSA-44 | 128비트 | 2,420 bytes |
| ML-DSA-65 | 192비트 | 3,309 bytes |
| ML-DSA-87 | 256비트 | 4,627 bytes |

---

## 안티패턴: 절대 하지 말 것

> [!CAUTION]
> **다중 암호화 / 자체 조합은 절대 금지**
>
> "AES로 잠그고 그 결과를 다시 RSA로 잠그면 더 안전하겠지?"라는 생각은 보안 업계에서 가장 위험한 착각이다.

| 문제점 | 설명 |
|--------|------|
| 검증 불가 | 검증되지 않은 알고리즘 조합은 수학적 충돌 가능성을 내포 |
| 셀프 랜섬웨어 | 키 하나만 꼬여도 복호화가 불가능해짐 |
| 복잡성 폭증 | 유지보수 비용 증가, 버그 발생 확률 상승 |

**"한 층을 더 두껍게" 만들지 말고, "한 층을 제대로" 만들어야 한다.**

### 흔한 실수 패턴 (2025년판)

| 패턴 | 왜 위험한가 |
|--------|----------|
| Argon2id로 대량 파일 암호화 | 서버가 10초씩 걸려서 DoS 당함 |
| HKDF 없이 패스워드를 바로 키로 사용 | 패스워드 바꿨 때마다 모든 데이터 재암호화 필요 |
| nonce를 카운터 대신 UUID v4 사용 | 122비트라 안전 착각 → 2^61번 사용 시 50% 충돌 확률 |
| 암호화된 데이터에 솔트 안 씀 | 동일 평문 → 동일 암호문 → 패턴 분석 당함 |
| **레거시 키/인증서 재사용** | 구 시스템의 오래된 키를 새 시스템에 재사용 → 과거 취약점 그대로 상속 |

### Nonce 재사용이 위험한 이유 (XOR 공격)

AES-GCM에서 같은 nonce로 두 메시지를 암호화하면:

```plaintext
C1 = AES(Plain1 ⊕ nonce)
C2 = AES(Plain2 ⊕ nonce)

공격자가 C1 ⊕ C2 계산 시:
C1 ⊕ C2 = Plain1 ⊕ Plain2 (← nonce가 상쇄됨!)
```

**결과**: 키가 아닌 **평문이 직접 노출**됨. 개발자가 nonce 관리를 "생존 문제"로 인식해야 하는 이유.

### 상수 시간 비교 (Timing Attack 방어)

```typescript
import { equalBytes } from '@noble/ciphers/utils';

// ❌ 타이밍 공격 취약
if (computedMAC.toString() === receivedMAC.toString()) { ... }

// ✅ 상수 시간 비교 (맞아도 틀려도 항상 같은 시간)
if (equalBytes(computedMAC, receivedMAC)) { ... }
```

> [!TIP]
> libsodium은 내부적으로 상수 시간 비교를 사용하지만, noble-ciphers나 Web Crypto 사용 시 직접 `equalBytes()` 호출 필수.

### Math.random() 사용 금지

> [!CAUTION]
> **`Math.random()`은 절대 암호화에 사용하지 마세요!** 예측 가능한 난수는 전체 시스템의 보안을 무너뜨립니다.

| 환경 | 안전한 방법 |
|------|------------|
| 브라우저 | `crypto.getRandomValues()` |
| Node.js | `crypto.randomBytes()` |
| noble 라이브러리 | `@noble/ciphers/webcrypto.randomBytes()` |

---

## 실전 권장 조합

### 용도별 최종 매핑

| 사용 목적 | 최종 추천 조합 | CPU 부담 | 메모리 부담 |
|-----------|---------------|----------|------------|
| 패스워드 저장 | Argon2id + 솔트 | 높음 | 높음 |
| 데이터 암호화 (마스터키 기반) | HKDF → XChaCha20-Poly1305 | 매우 낮음 | 매우 낮음 |
| 데이터 암호화 (사용자 비번 기반) | Argon2id → HKDF → XChaCha20 | 높음 | 높음 |

### 일반 웹 앱

| 용도 | 알고리즘 |
|------|---------|
| 패스워드 해싱 | Argon2id |
| 세션 토큰 | 32바이트 CSPRNG |
| 데이터 암호화 | 마스터키 + HKDF → XChaCha20-Poly1305 |
| 해싱 | BLAKE3 |
| 키 파생 | HKDF-BLAKE3 |

### E2E 암호화 앱

| 용도 | 알고리즘 |
|------|---------|
| 키 교환 | X25519 (+ ML-KEM 하이브리드 옵션) |
| 키 파생 | HKDF-SHA256 또는 BLAKE3 |
| 메시지 암호화 | XChaCha20-Poly1305 |
| 서명 | Ed25519 |
| Double Ratchet | Signal Protocol |

### 규제 준수 (금융, 의료)

| 용도 | 알고리즘 |
|------|---------|
| 암호화 | AES-256-GCM-SIV |
| 키 교환 | ECDH (P-256 또는 P-384) |
| 해싱 | SHA-3-256 |
| 서명 | ECDSA (P-256) |

---

## 추천 라이브러리 (JavaScript/TypeScript)

| 라이브러리 | 용도 | 특징 |
|-----------|------|------|
| `@noble/hashes` | 해시, KDF | 순수 JS, 제로 의존성, 감사 완료 |
| `@noble/ciphers` | 대칭 암호화 | ChaCha20, AES |
| `@noble/curves` | ECC | Ed25519, X25519, secp256k1 |
| `@node-rs/argon2` | 패스워드 해싱 | Rust 바인딩, 빠름 |
| `libsodium-wrappers` | 올인원 | NaCl 기반, 검증된 API |

> [!CAUTION]
> **deprecated 패키지 주의**: `noble-hashes`, `noble-ciphers` 등 namespace 없는 버전은 더 이상 업데이트되지 않음. 반드시 `@noble/hashes`, `@noble/ciphers` 형태로 사용할 것.
>
> `crypto-js`, `bcryptjs` 등 오래된 라이브러리도 피할 것. 최신 감사된 라이브러리 사용 권장.

### 무설치 대안: Web Crypto API

외부 라이브러리 사용이 불가능하거나 극단적인 번들 최적화가 필요할 때 사용.

| 장점 | 단점 |
|------|------|
| 브라우저/Node.js(v15+) 내장 | API가 복잡하고 장황함 |
| C++ 바인딩으로 속도 빠름 | XChaCha20, Argon2, BLAKE3 전부 미지원 |
| 제로 의존성 | 주로 AES-GCM만 지원 |
| (N/A) | Node.js 18 이하에서 일부 기능 불안정 |

```typescript
// AES-GCM-256 (내장 API)
const key = await crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']
);
const iv = crypto.getRandomValues(new Uint8Array(12)); // 12바이트 필수
// 주의: GCM은 IV(Nonce) 재사용 시 보안 붕괴. 절대 재사용 금지.
```

---

## 참고 자료

- [libsodium 문서](https://doc.libsodium.org/)
- [Latacora Cryptographic Right Answers](https://latacora.micro.blog/2018/04/03/cryptographic-right-answers.html)
- [NIST Post-Quantum Standards](https://csrc.nist.gov/projects/post-quantum-cryptography)
- [noble-hashes 저장소](https://github.com/paulmillr/noble-hashes)
