# Directus 11.6 - 11.13 마이그레이션 리포트

2024년 말부터 2025년 11월까지 Directus의 진화는 \*\*'콘텐츠 버전 관리의 엄격화'\*\*와 \*\*'개발자 경험(SDK/Hook)의 표준화'\*\*로 요약됩니다. 특히 v11.9.0의 SDK 인증 방식 변경과 v11.12.0의 버전 메타데이터 의미 변경은 기존 로직을 파괴할 수 있는 중요한 분기점이므로 면밀한 검토가 필요합니다.

본 리포트는 해당 기간의 변경 사항을 분석하여, 실무에서 즉시 적용해야 할 아키텍처 전략과 마이그레이션 가이드를 제시합니다.

-----

## 1. Executive Summary: 핵심 아키텍처 변화

| 버전 | 핵심 키워드 | 아키텍처 영향 (Architectural Impact) |
| :--- | :--- | :--- |
| **v11.6.0** | **Visual Editor** | **[Headless UX]** 웹사이트 오버레이 편집 기능 도입으로, 헤드리스 CMS의 단점인 '미리보기/편집 경험' 개선. |
| **v11.7.0** | **Infrastructure** | **[EOL]** MySQL 5.7 지원 종료. 레거시 DB 환경의 강제 업그레이드 요구. |
| **v11.9.0** | **Security (SDK)** | **[Authentication]** SDK 로그인 시 자격 증명(Credential) 자동 포함 중단. 보안 정책의 명시적 제어로 전환. |
| **v11.12.0** | **Versioning** | **[Data Integrity]** 콘텐츠 버전 메타데이터(`USER_CREATED` 등)가 '프로모션 시점'이 아닌 '실제 수정 시점'을 반영하도록 변경. |
| **v11.13.0** | **Hook Logic** | **[Extension]** 삭제 훅(`delete`) 실행 시점이 권한 체크 이전으로 변경되어, 커스텀 훅의 방어 로직 강화 필요. |

-----

## 2. Critical Breaking Changes & Action Plan

다음 항목들은 코드 수정 없이는 서비스 장애나 데이터 불일치를 유발할 수 있는 '필수 점검' 대상입니다.

### 2-1. SDK 인증 로직 수정 (v11.9.0)

JS/TS SDK의 `login`, `refresh`, `logout` 메서드가 더 이상 쿠키 등의 자격 증명을 자동으로 포함하지 않습니다.

* **Impact:** 기존 코드가 로그인 상태 유지를 실패하거나, 인증된 요청이 거부될 수 있습니다.
* **Action:** 클라이언트 설정에서 `credentials: 'include'` 옵션을 명시적으로 추가하십시오.

    ```js
    // Before (Implicit)
    const client = createDirectus(url).with(authentication());

    // After (Explicit)
    const client = createDirectus(url, { 
      globals: { credentials: 'include' } 
    }).with(authentication());
    ```

### 2-2. 콘텐츠 버전 데이터 정합성 (v11.12.0)

`USER_CREATED`, `DATE_UPDATED` 등의 시스템 필드가 이제 '메인 버전으로 승격(Promote)된 시점'이 아니라 '해당 버전이 실제 수정된 시점'을 기록합니다.

* **Impact:** 감사 로그(Audit Log)나 리포팅 쿼리가 승격 시점을 기준으로 작성되어 있다면, 데이터 해석에 오류가 발생합니다.
* **Action:** 승격 시점을 추적해야 한다면 별도의 Activity Log를 참조하도록 쿼리를 수정하고, 버전 데이터의 의미 변화를 운영 팀에 공지하십시오.

### 2-3. 커스텀 훅 보안 강화 (v11.13.0)

`<scope>.delete` 필터 훅이 **권한 체크 이전**에 실행되도록 변경되었습니다.

* **Impact:** 권한이 없는 사용자의 삭제 시도에도 훅 로직이 실행되어, 의도치 않은 사이드 이펙트(외부 API 호출 등)가 발생할 수 있습니다.
* **Action:** 훅 내부에서 `accountability` 객체를 검사하여, 실행 주체의 권한을 직접 검증하는 방어 코드를 추가하십시오.

### 2-4. 인프라 업그레이드 (v11.7.0)

MySQL 5.7 지원이 공식적으로 중단되었습니다.

* **Action:** v11.7.0 이상으로 업그레이드하기 전에 반드시 MySQL 8.0+ 또는 MariaDB, PostgreSQL 등 지원되는 버전으로 DB 마이그레이션을 완료하십시오.

-----

## 3. Strategic Adoption: 도입해야 할 신규 패턴

### 3-1. MCP 기반 AI 툴링 (v11.12.0)

Model Context Protocol(MCP) 지원으로 Directus를 LLM의 '도구(Tool)'로 손쉽게 연동할 수 있습니다. 자체 RAG 파이프라인이나 AI 에이전트를 구축할 때 Directus를 지식 베이스로 활용하는 아키텍처를 검토하십시오.

### 3-2. 검색 성능 최적화 (v11.13.0)

대용량 텍스트 필드에 대해 `searchable: false` 옵션을 적용하여 불필요한 인덱싱 부하를 줄이십시오. 이는 검색 쿼리의 성능을 높이고 DB 리소스를 절약하는 간단하고 강력한 방법입니다.

-----

## 4. Conclusion

Directus v11.6\~11.13 구간은 "데이터 관리의 정확성"과 "개발 환경의 표준화"를 위한 체질 개선 기간이었습니다. **SDK 인증 옵션 수정**과 **커스텀 훅 보안 점검**을 최우선으로 진행하고, 이후 **Visual Editor**와 **MCP** 같은 신기능을 도입하여 헤드리스 CMS로서의 활용도를 극대화하십시오.
