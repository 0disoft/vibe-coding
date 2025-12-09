/** @type {import('prettier').Config} */
export default {
	// 들여쓰기에 탭 사용 (접근성 친화적: 사용자가 탭 크기 조절 가능)
	useTabs: true,

	// 문자열에 작은따옴표 사용
	singleQuote: true,

	// 후행 쉼표 제거 (배열/객체 마지막 요소 뒤에 쉼표 없음)
	trailingComma: 'none',

	// 한 줄 최대 길이 (이 길이 초과 시 줄바꿈)
	printWidth: 100,

	// Svelte 파일 포맷팅을 위한 플러그인
	plugins: ['prettier-plugin-svelte'],

	// 파일별 옵션 오버라이드
	overrides: [
		{
			// Svelte 파일에 Svelte 파서 적용
			files: '*.svelte',
			options: {
				parser: 'svelte'
			}
		}
	]
};
