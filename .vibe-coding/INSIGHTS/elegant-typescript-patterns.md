# 우아한 타입스크립트 구조의 미학

실제 프로젝트 코드에서 추출한 타입스크립트 설계 패턴 모음.
"왜 이렇게 짜면 좋을까?"에 대한 답을 담았다.

> 📌 **전제 환경**: TypeScript 4.9+, Svelte 5 + SvelteKit 2, 서비스 워커 사용 환경 기준

---

## 1. 팩토리 함수 + Getter 패턴

Svelte 5의 `$state`와 함께 사용하면 반응성을 유지하면서 캡슐화된 상태를 만들 수 있다.

```ts
// 반환 타입 인터페이스 정의
interface PersistedState<T> {
  get current(): T;
  init(): void;
  set(value: T): void;
}

// persisted-state.svelte.ts
export function createPersistedState<T extends string | number>(
  key: string,
  initial: T,
  allowedValues?: readonly T[]
): PersistedState<T> {  // 명시적 반환 타입
  let current = $state<T>(initial);

  return {
    get current() { return current; },  // getter로 반응성 유지
    init() { /* ... */ },
    set(value: T) { /* ... */ }
  };
}
```

**왜 좋은가:**

- 상태를 직접 노출하지 않아 불변성 보장
- getter를 통해 반응성 유지
- 메서드를 통해서만 상태 변경 가능 → 예측 가능한 흐름
- 인터페이스로 반환 타입 명시 → 자동완성 및 타입 추론 강화

> 💡 더 간결한 방식이 필요하다면 아래 **1-1. Module-scoped Rune** 패턴 참고.

---

### 1-1. Module-scoped Rune (Svelte 5 간결 버전)

모듈 스코프에서 `$state`를 선언하고 함수로만 노출하는 패턴.

```ts
// counter.svelte.ts
let count = $state(0);  // 모듈 스코프 - 외부에서 직접 접근 불가

export function useCounter() {
  return {
    get count() { return count; },
    inc() { count++; },
    dec() { count--; },
    reset() { count = 0; }
  };
}
```

**왜 좋은가:**

- `count` 변수 자체는 절대 외부로 노출되지 않음
- 반응성을 유지하면서 진정한 private 상태 구현
- 팩토리 패턴보다 더 간결하고 직관적

**언제 사용:**

- 단일 상태를 관리하는 간단한 경우
- 1번 패턴은 키-값 기반 영속 상태나 복잡한 옵션이 필요할 때 적합

---

## 2. as const + 타입 추론

허용 값 배열과 타입을 동기화하여 런타임과 컴파일 타임 모두에서 안전성 확보.

```ts
// theme.svelte.ts
type Theme = 'light' | 'dark';

const store = createPersistedState<Theme>(
  'theme',
  'light',
  ['light', 'dark']  // 허용 값 명시
);
```

**더 강력한 패턴:**

```ts
const themeValues = ['light', 'dark', 'system'] as const;
type Theme = (typeof themeValues)[number];  // 'light' | 'dark' | 'system'

// 실제 사용 예시: themeValues와 Theme이 항상 동기화됨
const themeState = createPersistedState<Theme>(
  'theme',
  'light',
  themeValues  // allowedValues로 themeValues 전달
);
```

**💡 DEV 모드 안전장치:**

`initial` 값이 `allowedValues`에 없는 실수를 방지하려면:

```ts
export function createPersistedState<T extends string | number>(
  key: string,
  initial: T,
  allowedValues?: readonly T[]
): PersistedState<T> {
  let current = $state(initial);

  // DEV 모드에서만 불변식 검증
  if (import.meta.env.DEV && allowedValues && !allowedValues.includes(initial)) {
    console.warn(
      `[persistedState] initial "${initial}" is not in allowedValues for "${key}"`
    );
  }

  // 나머지 로직...
}
```

**🚨 주의사항:** `as const`는 선언 시점에만 적용되며, 이후 할당되는 값에는 적용되지 않는다. 동적으로 값이 변할 수 있는 경우 런타임 검증이 필요하다.

---

### 2-1. Readonly 유틸리티 타입으로 불변성 강화

`as const`는 선언 시점에만 적용되지만, `Readonly`는 타입 레벨에서 불변성을 강제한다.

```ts
// 기본 객체 - 프로퍼티 변경 가능
type User = { id: string; name: string };
const user: User = { id: '1', name: 'John' };
user.name = 'Jane'; // ✅ 변경 가능

// Readonly - 프로퍼티 변경 불가
type ImmutableUser = Readonly<User>;
const immutableUser: ImmutableUser = { id: '1', name: 'John' };
// immutableUser.name = 'Jane'; // ❌ 컴파일 에러!

// 배열도 불변으로
const numbers: readonly number[] = [1, 2, 3];
// numbers.push(4); // ❌ 컴파일 에러!
```

**as const vs Readonly:**

| 특성 | `as const` | `Readonly<T>` |
|------|------------|---------------|
| 리터럴 타입 | ✅ 보존 | ❌ 무시 |
| 중첩 불변성 | ✅ 전체 | ❌ 1단계만 |
| 유연성 | 선언 시점만 | 타입 레벨 적용 |

```ts
// 중첩 객체에 as const 적용 - 모든 레벨 readonly
const CONFIG = {
  api: 'https://api.example.com',
  features: { darkMode: true }
} as const;

// CONFIG.features.darkMode = false; // ❌ 컴파일 에러!
```

---

## 3. 우선순위 기반 초기화 (Cascading Fallback)

신뢰도 순서대로 값을 찾아가는 패턴. 서버와 클라이언트 간 상태 동기화에 유용.

```ts
function init(): void {
  // 1) SSR이 심어둔 data 속성 (가장 신뢰도 높음)
  const fromDom = parseAndValidate(document.documentElement.getAttribute(attrKey));
  if (fromDom !== null) {
    current = fromDom;
    setCookie(key, fromDom);  // 쿠키 만료일 연장
    return;
  }

  // 2) 쿠키 Fallback
  const fromCookie = parseAndValidate(getCookie(key));
  if (fromCookie !== null) {
    current = fromCookie;
    updateDomOnly(fromCookie);  // DOM만 동기화
    return;
  }

  // 3) 기본값 (최후의 수단)
  current = initial;
  updateDom(initial);
}
```

**핵심:**

- Early return으로 흐름이 명확함
- 각 단계에서 필요한 동기화만 수행 (불필요한 쿠키 재설정 방지)

---

## 4. 관심사 분리 (Separation of Concerns)

동일한 기능을 세분화하여 조합 가능하게 만드는 패턴.

```ts
/** DOM 속성만 업데이트 */
function updateDomOnly(value: T): void {
  document.documentElement.setAttribute(attrKey, String(value));
}

/** DOM + 쿠키 동시 업데이트 */
function updateDom(value: T): void {
  updateDomOnly(value);
  setCookie(key, value);
}
```

**이렇게 하면:**

- `init()`에서 쿠키 없이 DOM만 업데이트 가능
- 테스트 시 각 함수 독립적으로 검증 가능

---

## 5. 브라우저 가드 패턴

SSR 환경에서 DOM 접근 에러를 방지하는 필수 패턴.

```ts
import { browser } from '$app/environment';

function getCookie(name: string): string | null {
  if (!browser) return null;  // SSR에서는 즉시 반환
  // 브라우저에서만 실행되는 로직
  return document.cookie.match(/* ... */);
}
```

**DOM을 참조하는 모든 함수에 적용:**

```ts
function init(): void {
  if (!browser) return;  // SSR 가드 필수

  const fromDom = parseAndValidate(
    document.documentElement.getAttribute(attrKey)
  );
  // ...
}
```

> 💡 DOM을 참조하는 함수는 모두 `browser` 가드가 필요하거나, 호출하는 쪽에서 브라우저 환경임을 보장해야 한다.

---

## 6. 전략 패턴 (Strategy Pattern)

요청 유형에 따라 다른 처리 전략을 적용.

```ts
// service-worker.ts
sw.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 빌드 자산: 캐시 우선 (변하지 않으므로)
  if (isAssetRequest(url)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // 그 외: 네트워크 우선 (최신 데이터 필요)
  event.respondWith(networkFirst(event.request));
});
```

**전략 함수들 (캐시 갱신 포함):**

```ts
async function cacheFirst(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const res = await fetch(request);
  cache.put(request, res.clone());  // 캐시 갱신
  return res;
}

async function networkFirst(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE);

  try {
    const res = await fetch(request);
    cache.put(request, res.clone());  // 성공 시 캐시 갱신
    return res;
  } catch {
    return (await cache.match(request)) || getOfflineFallback();
  }
}
```

---

## 7. Set을 활용한 O(1) 조회

배열의 `.includes()`는 O(n)이지만, Set은 O(1).

```ts
const ASSET_SET = new Set([...build, ...files]);

function isAssetRequest(url: URL): boolean {
  return ASSET_SET.has(url.pathname);  // O(1) 조회
}
```

> 📝 이론적으로는 해시 충돌 등 구현에 따라 성능이 달라질 수 있지만, 일반적인 자바스크립트 엔진에서는 배열 탐색보다 Set 조회가 훨씬 일정하고 빠르게 동작한다.

---

## 8. 개발 모드 전용 디버깅

프로덕션 번들 크기에 영향 없이 개발 편의성 확보.

```ts
function set(value: T): void {
  if (!isValid(value)) {
    if (import.meta.env.DEV) {
      console.warn(`[persistedState] invalid value for "${key}":`, value);
    }
    return;
  }
  // ...
}
```

---

## 9. 타입 가드 (Type Guard)

`unknown`을 안전하게 특정 타입으로 좁히는 패턴.

```ts
const isValid = (val: unknown): val is T =>
  val != null && (allowedValues 
    ? (allowedValues as readonly unknown[]).includes(val) 
    : true);
```

**활용:**

```ts
if (isValid(parsed)) {
  // 여기서 parsed는 T 타입으로 추론됨
  current = parsed;
}
```

---

## 10. 안전망 패턴 (Ultimate Fallback)

절대 실패하지 않는 최후의 응답을 준비.

> ⚠️ **전제 조건**: `OFFLINE_PATH`에 해당하는 페이지는 프리렌더링되어 있고, `ASSETS`에도 포함되어 있어야 한다.

```ts
const OFFLINE_PATH = '/offline';
const ASSETS = [...build, ...files, ...prerendered];

async function getOfflineFallback(): Promise<Response> {
  const cached = await caches.match(OFFLINE_PATH);
  if (cached) return cached;

  // 캐시 실패 시 인라인 HTML 반환 (완전한 무응답 방지)
  return new Response(`<!DOCTYPE html><html>...</html>`, {
    status: 503,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
```

---

## 11. Discriminated Union + Exhaustiveness Check

타입을 통해 모든 케이스를 강제로 처리하도록 만드는 패턴.

```ts
type Action = 
  | { type: 'toggle' }
  | { type: 'set'; payload: Theme }
  | { type: 'reset' };

function themeReducer(state: Theme, action: Action): Theme {
  switch (action.type) {
    case 'toggle':
      return state === 'light' ? 'dark' : 'light';
    case 'set':
      return action.payload;
    case 'reset':
      return 'light';
    default:
      // 새 액션 추가 시 여기서 컴파일 에러 발생
      const _exhaustiveCheck: never = action;
      return state;
  }
}
```

**핵심:**

- 새로운 액션 타입 추가 시 처리 누락을 컴파일 타임에 감지
- `never` 타입으로 exhaustiveness 보장

---

## 12. satisfies 키워드 (TS 4.9+)

`as const`의 타입 안전성과 실제 값 추론을 동시에 유지.

```ts
// as const만 사용 시
const config1 = {
  theme: 'dark',
  lang: 'ko',
} as const;
// config1.theme은 'dark' 리터럴, but 타입 검증 없음

// satisfies 사용 시
const config2 = {
  theme: 'dark',
  lang: 'ko',
} satisfies Record<string, string>;
// 타입 검증 + 실제 값 추론 유지
```

**활용 예시:**

```ts
const ROUTES = {
  home: '/',
  about: '/about',
  blog: '/blog',
} satisfies Record<string, `/${string}`>;

// ROUTES.home은 '/' 리터럴 타입으로 추론됨
// 잘못된 경로 형식은 컴파일 에러
```

---

## 13. Branded Types (타입 브랜딩)

동일한 기본 타입이지만 의미적으로 다른 값들을 구분하여 실수 방지.

```ts
// 브랜드 타입 정의
type UserId = string & { __brand: 'UserId' };
type PostId = string & { __brand: 'PostId' };

// 생성 함수
function createUserId(id: string): UserId {
  return id as UserId;
}

function createPostId(id: string): PostId {
  return id as PostId;
}
```

**활용:**

```ts
function getUser(id: UserId) { /* ... */ }
function getPost(id: PostId) { /* ... */ }

const userId = createUserId('user-123');
const postId = createPostId('post-456');

getUser(userId);  // ✅ OK
getUser(postId);  // ❌ 컴파일 에러! PostId는 UserId가 아님
```

**핵심:**

- 런타임 비용 없음 (컴파일 타임에만 존재)
- 함수 인자 혼동으로 인한 버그 원천 차단

**🚨 주의사항:** Branded Type은 컴파일 타임에만 존재하며, 런타임에서는 일반 `string`과 구분되지 않는다. 외부 입력(API 응답 등)을 다룰 때는 런타임 검증이 필요하다.

---

### 13-1. TypeBox + Branded Type (런타임 + 컴파일타임 검증)

외부 입력은 런타임에 검증해야 한다. TypeBox를 활용하면 두 검증을 통합할 수 있다.

```ts
import { Type, type Static } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

// 1. TypeBox 스키마로 런타임 검증 규칙 정의
const UserIdSchema = Type.String({ format: 'uuid' });

// 2. Branded Type으로 컴파일타임 타입 정의
type UserId = Static<typeof UserIdSchema> & { readonly __brand: 'UserId' };

// 3. 생성 함수에서 둘을 결합
function createUserId(id: unknown): UserId {
  // TypeBox로 런타임 검증
  if (!Value.Check(UserIdSchema, id)) {
    throw new Error(`Invalid UserId: ${id}`);
  }
  // 검증된 값을 Branded Type으로 반환
  return id as UserId;
}
```

**활용:**

```ts
function fetchUser(id: UserId) { /* ... */ }

try {
  const rawId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; // API에서 온 값
  const safeId = createUserId(rawId);  // 런타임 검증 후 생성
  fetchUser(safeId);  // ✅ 안전

  fetchUser('not-validated');  // ❌ 컴파일 에러!
  createUserId(12345);  // ❌ 런타임 에러!
} catch (e) {
  console.error(e);
}
```

**왜 좋은가:**

- **완벽한 방어:** 컴파일 타임 실수와 런타임 예외를 동시에 차단
- **신뢰의 경계:** 외부 입력은 검증 후 내부로 진입 → 내부 코드는 항상 신뢰할 수 있는 데이터로 동작

---

## 14. Result Pattern (에러를 값으로 다루기)

try-catch 대신 에러를 값으로 반환하여 호출자가 반드시 처리하도록 강제.

```ts
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

function safeParse(json: string): Result<unknown> {
  try {
    return { success: true, data: JSON.parse(json) };
  } catch (e) {
    return { success: false, error: e as Error };
  }
}

// 사용 예시
const result = safeParse('invalid json');
if (!result.success) {
  console.error(result.error);  // 에러 처리 강제
  return;
}
console.log(result.data);  // 성공 시에만 data 접근 가능
```

**왜 좋은가:**

- 예외가 흐름을 제어하지 않음 (No Throw)
- 성공 여부 체크 없이는 데이터 접근 불가 (타입 레벨 차단)
- 함수 시그니처만 보고도 실패 가능성 인지

**🚨 주의사항:** Result 패턴은 연속된 작업에서 `if (!result.success)` 중첩이 깊어질 수 있다. 복잡한 체이닝이 필요하면 `flatMap` 헬퍼를 고려하라.

---

## 15. Template Literal Types (동적 문자열 타입)

정해진 패턴의 문자열만 허용하도록 타입을 좁히는 기법.

```ts
type EventName = 'click' | 'hover';
type ElementType = 'button' | 'input';

// 자동 생성: 'click:button' | 'click:input' | 'hover:button' | 'hover:input'
type HandlerName = `${EventName}:${ElementType}`; 

function handle(event: HandlerName) { /* ... */ }

handle('click:button');  // ✅ OK
handle('click:div');     // ❌ 컴파일 에러
```

**왜 좋은가:**

- 문자열 조합의 유효성을 컴파일 타임에 검증
- 오타 방지 및 자동완성 지원 강화

---

## 16. Asserts Keyword (단언 함수)

타입 가드와 달리, 함수 호출 이후 전체 스코프에서 타입 보장.

```ts
function assertIsNumber(val: unknown): asserts val is number {
  if (typeof val !== 'number') {
    throw new Error('Not a number!');
  }
}

function processValue(val: unknown) {
  assertIsNumber(val);
  // 이 줄부터 val은 무조건 number 타입
  console.log(val.toFixed(2));
}
```

**왜 좋은가:**

- 검증 로직과 비즈니스 로직을 깔끔하게 분리
- 조건문 중첩(들여쓰기 깊이) 감소

---

## 17. Prettify Utility (타입 툴팁 가독성)

복잡한 교차 타입을 IDE에서 깔끔하게 표시.

```ts
type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// 사용 예시
type User = { id: string; name: string };
type Admin = { role: string; permissions: string[] };

type Mixed = User & Admin;           // 툴팁: User & Admin (불친절)
type PrettyMixed = Prettify<Mixed>;  // 툴팁: 모든 속성 펼쳐서 표시
```

**왜 좋은가:**

- 개발자 경험(DX) 향상
- 복잡하게 꼬인 타입의 최종 형태를 한눈에 확인

---

## 18. 타입 안전 이벤트 이미터

이벤트 이름과 페이로드 타입을 컴파일 타임에 검증하는 이벤트 시스템.

```ts
type EventMap = {
  'theme:change': Theme;
  'user:login': User;
  'error': Error;
};

class TypedEventEmitter<Events extends Record<string, unknown>> {
  private listeners = new Map<keyof Events, Set<Function>>();

  on<K extends keyof Events>(
    event: K,
    callback: (data: Events[K]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // 구독 해제 함수 반환
    return () => this.listeners.get(event)?.delete(callback);
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }
}

// 사용
const emitter = new TypedEventEmitter<EventMap>();
emitter.on('theme:change', (theme) => console.log(theme)); // theme: Theme
emitter.emit('theme:change', 'dark');  // ✅ OK
emitter.emit('theme:change', 123);     // ❌ 컴파일 에러!
```

**왜 좋은가:**

- 이벤트 이름 오타 방지 + 자동완성 지원
- 페이로드 타입 불일치 컴파일 타임에 감지

---

## 19. Debounce 타입 안전 버전

취소 가능한 타입 안전 디바운스 함수.

```ts
function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  }) as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

// 사용
const search = debounce((query: string) => {
  console.log('Searching:', query);
}, 300);

search('hello');
search.cancel();  // 실행 취소
```

**왜 좋은가:**

- 원본 함수 시그니처 완전 보존
- `cancel` 메서드로 메모리 누수 방지

---

## 20. Fluent API (체이닝 패턴)

메서드 체이닝으로 직관적인 API 설계.

```ts
class QueryBuilder {
  private params = new URLSearchParams();

  where(key: string, value: string): this {
    this.params.append(key, value);
    return this;  // 체이닝 핵심
  }

  orderBy(field: string, dir: 'asc' | 'desc' = 'asc'): this {
    this.params.append('orderBy', `${field}:${dir}`);
    return this;
  }

  limit(n: number): this {
    this.params.append('limit', String(n));
    return this;
  }

  build(): string {
    return `?${this.params.toString()}`;
  }
}

// 사용
const query = new QueryBuilder()
  .where('status', 'active')
  .where('category', 'tech')
  .orderBy('createdAt', 'desc')
  .limit(10)
  .build();
// ?status=active&category=tech&orderBy=createdAt:desc&limit=10
```

**왜 좋은가:**

- 선언적이고 읽기 쉬운 API
- 각 메서드가 `this`를 반환하여 무한 체이닝 가능

---

## 21. DeepReadonly (깊은 불변성)

중첩 객체까지 모두 readonly로 만드는 유틸리티 타입.

```ts
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepReadonly<T[P]>
    : T[P];
};

// 사용
interface Config {
  api: {
    endpoint: string;
    timeout: number;
  };
  features: {
    darkMode: boolean;
  };
}

const config: DeepReadonly<Config> = {
  api: { endpoint: 'https://api.example.com', timeout: 5000 },
  features: { darkMode: true }
};

// config.api.endpoint = 'new';  // ❌ 컴파일 에러!
// config.features.darkMode = false;  // ❌ 컴파일 에러!
```

**왜 좋은가:**

- `Readonly<T>`는 1단계만 적용되지만, `DeepReadonly`는 전체 중첩 구조에 적용
- 설정 객체, API 응답 등 절대 변경하면 안 되는 데이터에 적합

---

## 22. isDef 타입 가드 (Nullish 체크)

간결하고 명시적인 null/undefined 체크.

```ts
function isDef<T>(val: T | null | undefined): val is T {
  return val !== null && val !== undefined;
}

// 사용
async function fetchUser(id: string) {
  const user = await api.getUser(id);  // User | null

  if (isDef(user)) {
    // user는 User 타입으로 확정
    console.log(user.name);
  }
}

// 배열 필터링에도 유용
const items = [1, null, 2, undefined, 3];
const defined = items.filter(isDef);  // number[]
```

**왜 좋은가:**

- `!= null`보다 의도가 명확함
- 배열 필터링 시 타입이 자동으로 좁혀짐

---

## 정리

| 패턴 | 핵심 가치 |
|------|----------|
| 팩토리 + Getter | 캡슐화 + 반응성 |
| Module-scoped Rune | 간결한 private 상태 관리 |
| as const | 타입 동기화 |
| Cascading Fallback | 신뢰도 기반 초기화 |
| 관심사 분리 | 조합 가능성 + 테스트 용이 |
| 브라우저 가드 | SSR 안전성 |
| 전략 패턴 | 유연한 분기 처리 |
| Set 조회 | 성능 최적화 |
| DEV 전용 로깅 | 디버깅 편의 |
| 타입 가드 | 타입 안전성 |
| 안전망 | 무중단 서비스 |
| Discriminated Union | exhaustive check + 상태 전이 명확화 |
| satisfies | 타입 검증 + 값 추론 동시 유지 |
| Branded Types | Id 혼동 방지 + 런타임 비용 없음 |
| TypeBox + Branded | 런타임 + 컴파일타임 이중 검증 |
| Result Pattern | 에러 강제 처리 + No Throw |
| Template Literal | 문자열 패턴 컴파일 타임 검증 |
| Asserts Keyword | 스코프 전체 타입 보장 |
| Prettify | 타입 툴팁 가독성 향상 |
| 타입 안전 이벤트 이미터 | 이벤트 페이로드 컴파일 타임 검증 |
| Debounce | 취소 가능 + 타입 보존 |
| Fluent API | 체이닝으로 선언적 API 설계 |
| DeepReadonly | 중첩 객체 전체 불변성 보장 |
| isDef | 명시적 nullish 체크 + 배열 필터링 |

> 좋은 코드는 "왜 이렇게 짰는지"가 명확하다.
