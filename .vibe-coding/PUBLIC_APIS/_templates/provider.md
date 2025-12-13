---
id: (예: stripe)
category: [payment, subscription]
auth: [api_key, oauth2]
base_url: https://api.example.com/v1
sdk: [node, python, go]
---

# (Provider 이름)

## 목적

(한 줄 요약: 어떤 서비스인지)

## 인증

| 방식 | 환경변수 | 비고 |
| --- | --- | --- |
| API Key | `PROVIDER_API_KEY` | (설명) |

## 요금/무료 티어

| 티어 | 제한 | 비용 |
| --- | --- | --- |
| Free | (제한 사항) | $0 |
| Pro | (제한 사항) | (가격) |

> 정확한 요금은 [공식 가격 페이지](링크)에서 확인하세요.

## 레이트리밋/쿼터

| 구분 | 제한 | 비고 |
| --- | --- | --- |
| (구분) | (제한) | (비고) |

> 정확한 제한은 [공식 문서](링크)에서 확인하세요.

## SDK/라이브러리

| 언어 | 패키지 | 설치 명령 |
| --- | --- | --- |
| Node.js | `package-name` | `bun add package-name` |
| Python | `package-name` | `uv add package-name` |

## 웹훅 (있다면)

- 엔드포인트 설정: (설명)
- 서명 검증: (방법)
- 재시도 정책: (설명)

## 에러/리트라이/멱등성(Idempotency)

- 주요 에러 코드: (설명)
- 리트라이 전략: (설명)
- 멱등성 키: (지원 여부 및 헤더명)

## 자주 쓰는 작업 (Top 5)

1. (작업명) → `recipes.md#작업명` 참조
1. (작업명)
1. (작업명)
1. (작업명)
1. (작업명)

## 참고 링크

- 공식 문서: (링크)
- API 레퍼런스: (링크)
- 상태 페이지: (링크)
