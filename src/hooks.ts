/**
 * [hooks.ts] 유니버설 훅 (Server + Client)
 * 실행 환경: 서버와 브라우저 양쪽 모두
 * 핵심 역할: URL 라우팅 재정의, 데이터 직렬화 방식 설정
 *
 * [주요 활용 예시 7가지]
 * 1. [i18n 라우팅] 다국어 URL(/ko/about)을 내부 시스템 경로(/about)로 매핑 (Paraglide 등 사용 시)
 * 2. [데이터 전송] JSON이 처리 못하는 Map, Set, BigInt, Date 객체의 직렬화/역직렬화 규칙 정의
 * 3. [A/B 테스트] 동일 URL 접속 시 사용자 그룹에 따라 내부적으로 다른 경로의 페이지를 렌더링
 * 4. [서브도메인] user.site.com 요청을 내부적으로 /users/user 경로로 매핑하여 처리
 * 5. [레거시 호환] 사이트 개편 전의 옛날 주소로 접속 시 새로운 주소 체계로 내부 라우팅 연결
 * 6. 주소 끝의 슬래시(/) 제거나 불필요한 쿼리 파라미터 무시 등 주소 규칙 통일
 * 7. [마이크로 프론트엔드] 특정 경로 패턴(/app/*)을 인식하여 다른 앱이나 서비스로 라우팅 분기
 */

import type { Transport } from '@sveltejs/kit';
import { deLocalizeUrl } from '$lib/paraglide/runtime';

export const reroute = (request) => deLocalizeUrl(request.url).pathname;

export const transport: Transport = {};
