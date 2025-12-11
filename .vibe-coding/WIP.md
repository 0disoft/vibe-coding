# Work In Progress

## 버그 바운티 피드백 반영 (2025-12-11)

피드백 출처: `.vibe-coding/temporary.txt`

### Phase 1: 핵심 수정 (High Priority)

- [x] 1.1 금전적 보상 문구 완화: "제공하지 않습니다" → "명예 인정 중심, 향후 검토 중"
- [x] 1.2 공개 정책 단축: 90일 → 60일 + Critical 7일 패치 노력
- [x] 1.3 요청 제한 완화: 초당 50개 → "과도한 자동화 스캔" 표현
- [x] 1.4 Safe Harbor 강화: "어떠한 법적 조치도 취하지 않습니다"

### Phase 2: 누락 섹션 추가 (Medium Priority)

- [x] 2.1 중복 신고 처리 기준 추가
- [x] 2.2 보고서 품질 기준 추가
- [x] 2.3 CVE 발급 가능 여부 추가
- [x] 2.4 응답 시간 SLA 강화 (Critical 24h, High 3일)

### Phase 3: 영문 동기화

- [x] 3.1 `en.md`에 동일 변경사항 적용

---

## 보안 정책 피드백 반영 (2025-12-11)

피드백 출처: `.vibe-coding/temporary.txt`

### Phase 1: 과장/위험 표현 완화 (High Priority)

- [x] 1.1 "강력한 다중 암호화 기술" → "여러 계층에서 암호화와 접근 통제 적용"
- [x] 1.2 "무결성을 확실하게 보장" → "무결성 검증에 사용"
- [ ] 1.3 TLS 표현 현실화: "TLS 1.3+" → "TLS 1.2 이상, 기본 TLS 1.3"
- [x] 1.4 "내부 전문팀" → "내부 점검" (1인 개발 현실 반영)
- [x] 1.5 제3자 인증 표현 완화: "인증 획득" → "동급 수준 보안 평가"

### Phase 2: 인시던트 대응 타임라인 현실화 (High Priority)

- [x] 2.1 "영향 분석 (2시간 내)" → "가능한 빠르게, 원칙적으로 수 시간 내"
- [x] 2.2 "사용자 통지 (24시간 내)" → "가능한 신속히, 법령 기한(72시간) 준수"
- [x] 2.3 탐지→분석→통지 단계별 표현 유연하게 조정

### Phase 3: 누락 섹션 추가 (Medium Priority)

- [x] 3.1 계정/세션 보안 섹션 추가 (로그인 제한, 세션 만료, 2FA 계획)
- [x] 3.2 애플리케이션 보안 섹션 추가 (OWASP Top 10, SQL Injection/XSS/CSRF 방어)
- [x] 3.3 공급망 보안 섹션 추가 (패키지 잠금, 의존성 취약점 점검)

### Phase 4: 세부 표현 개선 (Low Priority)

- [ ] 4.1 BLAKE3 설명 조정 (해시 vs AEAD 역할 분리)
- [ ] 4.2 Argon2id 파라미터 힌트 추가 ("충분한 메모리와 반복 횟수")
- [x] 4.3 데이터 삭제 섹션에 법적 보존 예외 조항 추가
- [x] 4.4 백업 데이터 완전 삭제 시간 소요 언급

### Phase 5: 영문 버전 동기화

- [x] 5.1 `en.md`에 동일한 변경사항 적용

---

## Aria Label Internationalization (Completed)

### 1. Define Messages
- [x] Add keys to `messages/en.json`
- [x] Add keys to `messages/ko.json`

### 2. Update Components
- [x] `src/lib/components/Header.svelte`
- [x] `src/lib/components/header-actions/ThemeToggle.svelte`
- [x] `src/lib/components/header-actions/LanguagePicker.svelte`
- [x] `src/lib/components/Footer.svelte`

### 3. Remaining Languages
- [/] Update 18 other language JSON files (can be done later/batch-processed)
