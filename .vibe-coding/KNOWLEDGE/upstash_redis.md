# Upstash Redis SDK (@upstash/redis) v1.34 - v1.35 마이그레이션 리포트

2024년 말부터 2025년 말까지 Upstash Redis SDK의 변화는 \*\*'명령어의 완전성 확보'\*\*와 \*\*'서버리스 환경 최적화'\*\*로 요약됩니다. 특히 Redis 7.x의 고급 기능(GETEX, HEXPIRE)이 SDK에 통합되었으며, Auto Pipeline과 Blocking 연산에 대한 정책이 정비되어 서버리스 환경에서의 예측 가능성이 높아졌습니다.

본 리포트는 해당 기간의 변경 사항을 분석하여, 실무에서 즉시 적용 가능한 코드 리팩토링 및 아키텍처 전략을 제시합니다.

-----

## 1. Executive Summary: 핵심 아키텍처 변화

| 버전 | 릴리즈 시기 | 핵심 아키텍처 변화 (Paradigm Shift) |
| :--- | :--- | :--- |
| **v1.34.4** | '25.02 | **Efficiency:** `GETEX` 도입으로 조회와 TTL 갱신을 단일 RTT(Round Trip Time)로 처리. |
| **v1.34.5** | '25.03 | **Messaging:** `SUBSCRIBE`/`PSUBSCRIBE` 공식 지원으로 SDK 내 Pub/Sub 패턴 구현 가능. |
| **v1.34.7+** | '25.04 | **Granularity:** `HEXPIRE` 계열 명령 추가로 Hash 자료구조의 필드 단위 만료 시간 제어 가능. |
| **v1.35.2** | '25.07 | **Stability:** `EXEC`의 Auto Pipeline 제외 및 `XREAD` Block 옵션 Deprecate로 서버리스 런타임 안정성 강화. |

-----

## 2. Critical Action Items: 코드 최적화 및 안정성 확보

### 2-1. 네트워크 효율화 (Latency Reduction)

* **GETEX 활용:** 캐시 조회 후 TTL을 연장하는 `GET + EXPIRE` 패턴을 `GETEX` 단일 명령으로 교체하십시오. 이는 HTTP 요청 수를 줄여 레이턴시를 직접적으로 개선합니다.

    ```ts
    // Legacy
    const val = await redis.get(key);
    if (val) await redis.expire(key, 60);

    // Modern
    const val = await redis.getex(key, { ex: 60 });
    ```

### 2-2. 데이터 모델링 유연성 확보

* **Hash Field TTL:** 세션 관리나 사용자 설정 저장 시, 전체 키 만료 대신 `HEXPIRE`를 사용하여 특정 필드만 만료시키는 정교한 캐싱 전략을 도입하십시오. 이는 불필요한 데이터 재적재를 방지합니다.
* **Smart SCAN:** 대규모 키스페이스 분석이나 마이그레이션 작업 시 `SCAN`의 `withtypes` 옵션을 사용하여, 키 조회와 타입 확인을 한 번에 수행하십시오.

### 2-3. 서버리스 런타임 안정성 (Stability)

* **Blocking 연산 제거:** `XREAD`의 `block` 옵션이 Deprecated 되었습니다. 서버리스 환경(Lambda, Workers 등)에서 장시간 블로킹은 타임아웃 및 비용 증가의 원인이므로, 폴링(Polling) 기반이나 Upstash Qstash 같은 비동기 큐 서비스와의 연동으로 설계를 변경하십시오.
* **Pipeline 격리:** 트랜잭션(`EXEC`)이 Auto Pipeline에서 분리되었습니다. 트랜잭션 로직은 독립적으로 실행되도록 구성하여, 파이프라인 실패 시 에러 핸들링의 명확성을 확보하십시오.

-----

## 3. Strategic Adoption: 도입해야 할 신규 패턴

### 3-1. Pub/Sub의 제한적 도입

SDK 레벨에서 Pub/Sub가 지원되지만, 연결 지속성이 보장되지 않는 서버리스 환경에서는 \*\*'짧은 수명의 이벤트 구독'\*\*이나 **'일회성 알림'** 용도로만 제한적으로 사용하십시오. 장기적인 실시간 통신은 WebSocket 서버나 전용 메시지 브로커를 사용하는 것이 아키텍처적으로 안전합니다.

### 3-2. Request Context 통합

`AbortSignal`을 함수 형태로 주입하는 패턴을 활용하여, Next.js나 Cloudflare Workers의 요청 컨텍스트와 Redis 요청의 생명주기를 동기화하십시오. 이는 불필요한 리소스 낭비를 막고 클라이언트 연결 해제 시 백엔드 작업을 즉시 중단시키는 데 유용합니다.

-----

## 4. Conclusion

Upstash Redis SDK v1.34\~1.35 구간은 "Redis의 모든 기능을 서버리스스럽게" 제공하는 방향으로 진화했습니다. 기존의 비효율적인 다중 호출 패턴을 `GETEX`와 `HEXPIRE`로 최적화하고, 블로킹 연산을 제거하여 런타임 안정성을 높이는 것이 이번 마이그레이션의 핵심 과제입니다.
