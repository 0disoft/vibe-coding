import { expect, test } from '@playwright/test';

/**
 * 마크다운 렌더링 품질 테스트
 *
 * 마크다운 볼드 표식(**)이 본문에 그대로 노출되는 현상 감지
 * - 코드 블록(pre, code)은 제외
 * - article 요소 스코프로 헤더/푸터 잡음 방지
 * - TreeWalker로 텍스트 노드 직접 수집 (clone.innerText 리스크 방지)
 */

// 마크다운 콘텐츠가 렌더링되는 페이지들
const MARKDOWN_PAGES = [
	'/ko/privacy',
	'/ko/terms',
	'/ko/cookie',
	'/ko/gdpr',
	'/ko/bug-bounty',
	'/ko/security'
];

// 볼드 표식 문자 (코드 가독성을 위해 유니코드 이스케이프)
const ASTERISK = '\u002a';
const DOUBLE_ASTERISK = `${ASTERISK}${ASTERISK}`;

test.describe('마크다운 렌더링 품질', () => {
	for (const pagePath of MARKDOWN_PAGES) {
		test(`${pagePath} - 볼드 표식 잔존 없음`, async ({ page }, testInfo) => {
			await page.goto(pagePath, { waitUntil: 'domcontentloaded' });

			// article 요소가 보일 때까지 대기
			const article = page.locator('article').first();
			await article.waitFor({ state: 'visible' });

			// 본문이 실제로 렌더링될 때까지 대기 (빈 상태에서 검사 방지)
			await expect(article).toContainText(/\S/);

			// TreeWalker로 pre/code 제외한 텍스트 노드 수집 (article.evaluate로 스코프 통일)
			const hits = await article.evaluate((root, aa) => {
				const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
					acceptNode(node) {
						const p = node.parentElement;
						if (!p) return NodeFilter.FILTER_REJECT;
						if (p.closest('pre, code, script, style, noscript')) return NodeFilter.FILTER_REJECT;
						return NodeFilter.FILTER_ACCEPT;
					}
				});

				let text = '';
				while (walker.nextNode()) {
					text += `${walker.currentNode.nodeValue ?? ''}\n`;
				}

				// ** 표식이 나타나는 모든 위치 수집
				const indices: number[] = [];
				let from = 0;
				while (true) {
					const idx = text.indexOf(aa, from);
					if (idx === -1) break;
					indices.push(idx);
					from = idx + aa.length;
				}

				// 문맥 스니펫 생성 (최대 8개, 앞뒤 문자 포함)
				return indices.slice(0, 8).map((i) => {
					const start = Math.max(0, i - 50);
					const end = Math.min(text.length, i + 140);
					return text.slice(start, end).replace(/\s+/g, ' ').trim();
				});
			}, DOUBLE_ASTERISK);

			// 발견된 표식이 있으면 테스트 리포트에 첨부
			if (hits.length) {
				await testInfo.attach('bold-marker-snippets', {
					body: hits.join('\n\n'),
					contentType: 'text/plain'
				});
			}

			expect(
				hits,
				`볼드 표식(${DOUBLE_ASTERISK})이 본문에 그대로 노출됨. fix-bold-issues.ts 실행 필요`
			).toHaveLength(0);
		});
	}

	test('볼드가 어느 페이지든 하나 이상 존재하는지 확인', async ({ page }) => {
		let totalStrongCount = 0;

		for (const pagePath of MARKDOWN_PAGES) {
			await page.goto(pagePath, { waitUntil: 'domcontentloaded' });

			const article = page.locator('article').first();
			await article.waitFor({ state: 'visible' });

			const count = await article.locator('strong, b').count();
			totalStrongCount += count;

			// 하나라도 찾으면 조기 종료 (효율성)
			if (totalStrongCount > 0) break;
		}

		// 전체 페이지 중 하나라도 볼드가 있으면 렌더링이 정상 동작하는 것
		expect(totalStrongCount).toBeGreaterThan(0);
	});
});
