import { browser } from '$app/environment';

// Note: 이 파일은 Svelte runes($state)을 사용하므로 .svelte.ts 확장자를 유지하세요.

// ─────────────────────────────────────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────────────────────────────────────

/** 쿠키 기본 만료일 (일) */
const DEFAULT_COOKIE_DAYS = 365;

/** 하루를 밀리초로 변환 */
const DAY_IN_MS = 24 * 60 * 60 * 1000;

// ─────────────────────────────────────────────────────────────────────────────
// 유틸리티 함수
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 쿠키 값 조회
 * @param name 쿠키 이름
 * @returns 쿠키 값 또는 null
 */
function getCookie(name: string): string | null {
	if (!browser) return null;
	const match = document.cookie.match(new RegExp(`(?:^|; )${escapeRegex(name)}=([^;]*)`));
	return match ? decodeURIComponent(match[1]) : null;
}

/**
 * 정규식 특수문자 이스케이프
 */
function escapeRegex(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 쿠키 설정
 * @param name 쿠키 이름
 * @param value 쿠키 값
 * @param days 만료일 (기본: 365일)
 */
function setCookie(name: string, value: string | number, days = DEFAULT_COOKIE_DAYS): void {
	if (!browser) return;

	const date = new Date(); // eslint-disable-line svelte/prefer-svelte-reactivity -- 단순 쿠키 만료 계산용
	date.setTime(date.getTime() + days * DAY_IN_MS);
	const expires = `; expires=${date.toUTCString()}`;
	const secure = location.protocol === 'https:' ? '; Secure' : '';

	// biome-ignore lint/suspicious/noDocumentCookie: 쿠키 기반 상태 영속화에 필수
	document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax${secure}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 메인 함수
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 쿠키와 DOM data-* 속성에 동기화되는 영속 스토어를 생성합니다.
 *
 * @param key 쿠키/DOM 속성 이름 (예: 'theme', 'fontSize')
 * @param initial 기본값
 * @param allowedValues 허용되는 값 목록. 지정하면 유효성 검증에 사용됨.
 * @param domUpdater DOM 업데이트 커스터마이저 (기본: html data-{key} 속성 설정)
 */
export function createPersistedState<T extends string | number>(
	key: string,
	initial: T,
	allowedValues?: readonly T[],
	domUpdater?: (value: T) => void
) {
	let current = $state<T>(initial);

	/** 값 유효성 검증 */
	const isValid = (val: unknown): val is T =>
		val != null && (allowedValues ? (allowedValues as readonly unknown[]).includes(val) : true);

	/** camelCase → kebab-case 변환된 data 속성 키 */
	const attrKey = `data-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;

	/**
	 * 값 파싱 및 검증 헬퍼
	 * @param rawValue 원본 문자열 값
	 * @returns 유효한 값 또는 null
	 */
	function parseAndValidate(rawValue: string | null): T | null {
		if (rawValue === null || rawValue === '') return null;

		let parsed: unknown = rawValue;

		if (typeof initial === 'number') {
			const num = Number(rawValue);
			// NaN 체크: Number("")=0, Number("abc")=NaN 방지
			if (Number.isNaN(num)) return null;
			parsed = num;
		}

		return isValid(parsed) ? (parsed as T) : null;
	}

	/** DOM 속성만 업데이트 (쿠키 제외) */
	function updateDomOnly(value: T): void {
		if (!browser) return;

		if (domUpdater) {
			domUpdater(value);
		} else {
			document.documentElement.setAttribute(attrKey, String(value));
		}
	}

	/** DOM 및 쿠키 동기화 */
	function updateDom(value: T): void {
		updateDomOnly(value);
		setCookie(key, value);
	}

	/** 초기값 로드 (SSR data-* → 쿠키 → 기본값 순) */
	function init(): void {
		if (!browser) return;

		// 1) SSR이 심어둔 data-* 우선 (가장 신뢰도 높음)
		const fromDom = parseAndValidate(document.documentElement.getAttribute(attrKey));
		if (fromDom !== null) {
			current = fromDom;
			// 쿠키 만료일 연장 (Keep-alive)
			setCookie(key, fromDom);
			return;
		}

		// 2) 쿠키 Fallback
		const fromCookie = parseAndValidate(getCookie(key));
		if (fromCookie !== null) {
			current = fromCookie;
			// DOM에만 동기화 (쿠키는 이미 존재)
			updateDomOnly(fromCookie);
			return;
		}

		// 3) 기본값 (아무것도 없을 때)
		current = initial;
		updateDom(initial);
	}

	/** 값 설정 */
	function set(value: T): void {
		if (!isValid(value)) return;
		current = value;
		updateDom(value);
	}

	return {
		get current() {
			return current;
		},
		init,
		set
	};
}

