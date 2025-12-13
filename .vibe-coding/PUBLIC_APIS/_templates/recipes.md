# (Provider 이름) 레시피

실제 사용 시나리오별 코드 예시 모음입니다.

## 목차

1. [기본 설정](#기본-설정)
1. [(시나리오명 2)](#시나리오명-2)

---

## 기본 설정

SDK 초기화 및 기본 설정 방법

사전 조건:

- 환경변수: `PROVIDER_API_KEY`
- 패키지: `bun add provider-sdk`

```typescript
import { Provider } from 'provider-sdk';

const client = new Provider({
  apiKey: process.env.PROVIDER_API_KEY,
});
```

---

## (시나리오명 2)

(어떤 상황에서 이 코드를 사용하는지)

사전 조건 및 주의사항:

- (필요한 환경변수)
- (필요한 패키지)
- (주의할 점)

```typescript
// 예시 코드
```
