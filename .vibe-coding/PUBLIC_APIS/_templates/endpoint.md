# 엔드포인트/기능 템플릿

## 목적

(한 줄 요약: 이 엔드포인트가 하는 일)

## 요청

| 항목 | 값 |
| --- | --- |
| 메서드 | `POST` / `GET` / `PUT` / `DELETE` |
| 경로 | `/v1/resource/{id}` |
| 인증 | Bearer Token / API Key |

### 필수 파라미터

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `param1` | `string` | (설명) |

### 선택 파라미터

| 이름 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `param2` | `number` | `10` | (설명) |

### 요청 예시

```typescript
const response = await fetch('https://api.example.com/v1/resource', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ param1: 'value' }),
});
```

## 응답

### 성공 응답 (200)

```json
{
  "id": "res_123",
  "status": "success",
  "data": {}
}
```

### 에러 응답

| 코드 | 의미 | 대응 |
| --- | --- | --- |
| 400 | 잘못된 요청 | 파라미터 확인 |
| 401 | 인증 실패 | API 키 확인 |
| 429 | 레이트리밋 초과 | 재시도 대기 |

## 레이트리밋

| 구분 | 제한 |
| --- | --- |
| (구분) | (제한) |

## 실패/주의사항

- (주의할 점 1)
- (주의할 점 2)

## 테스트 체크리스트

- [ ] 정상 요청 테스트
- [ ] 필수 파라미터 누락 시 에러 확인
- [ ] 인증 실패 시 에러 확인
- [ ] 레이트리밋 동작 확인
