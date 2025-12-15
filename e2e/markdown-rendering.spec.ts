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

// 볼드 마커 발견 시 포함할 부모 정보 타입
interface BoldMarkerHit {
	snippet: string;
	parentInfo: {
		tagName: string;
		id: string | null;
		dataAttrs: Record<string, string>;
		parentText: string; // 부모 요소의 텍스트 일부 (디버깅 용이성)
	};
}

test.describe('마크다운 렌더링 품질', () => {
	for (const pagePath of MARKDOWN_PAGES) {
		test(`${pagePath} - 볼드 표식 잔존 없음`, async ({ page }, testInfo) => {
			await test.step(`${pagePath} 페이지 로드`, async () => {
				await page.goto(pagePath, { waitUntil: 'domcontentloaded' });
			});

			const article = page.locator('article').first();

			await test.step('article 요소 대기', async () => {
				await article.waitFor({ state: 'visible' });
				// 본문이 실제로 렌더링될 때까지 대기 (빈 상태에서 검사 방지)
				await expect(article).toContainText(/\S/);
			});

			// TreeWalker로 pre/code 제외한 텍스트 노드 수집 (article.evaluate로 스코프 통일)
			const hits: BoldMarkerHit[] = await article.evaluate((root, aa) => {
				const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
					acceptNode(node) {
						const p = node.parentElement;
						if (!p) return NodeFilter.FILTER_REJECT;
						if (p.closest('pre, code, script, style, noscript')) return NodeFilter.FILTER_REJECT;
						return NodeFilter.FILTER_ACCEPT;
					}
				});

				const results: BoldMarkerHit[] = [];
				while (walker.nextNode()) {
					const text = walker.currentNode.nodeValue ?? '';
					let from = 0;
					while (true) {
						const idx = text.indexOf(aa, from);
						if (idx === -1) break;

						const parentEl = walker.currentNode.parentElement;
						const start = Math.max(0, idx - 50);
						const end = Math.min(text.length, idx + 140);
						const snippet = text.slice(start, end).replace(/\s+/g, ' ').trim();

						// 부모 요소 정보 수집 (디버깅 용이성 향상)
						const dataAttrs: Record<string, string> = {};
						if (parentEl) {
							Array.from(parentEl.attributes).forEach((attr) => {
								if (attr.name.startsWith('data-')) {
									dataAttrs[attr.name] = attr.value;
								}
							});
						}

						// 부모 요소의 텍스트 일부 (첫 100자, clone.innerText 위험 회피)
						const parentText =
							parentEl?.textContent?.slice(0, 100).replace(/\s+/g, ' ').trim() ?? '';

						results.push({
							snippet,
							parentInfo: {
								tagName: parentEl?.tagName ?? 'UNKNOWN',
								id: parentEl?.id ?? null,
								dataAttrs,
								parentText
							}
						});

						from = idx + aa.length;

						// 최대 8개까지만 수집
						if (results.length >= 8) break;
					}
					if (results.length >= 8) break;
				}

				return results;
			}, DOUBLE_ASTERISK);

			// 발견된 표식이 있으면 테스트 리포트에 상세 정보와 함께 첨부
			if (hits.length) {
				const report = hits
					.map((h, i) => {
						const parent = h.parentInfo;
						const idPart = parent.id ? `#${parent.id}` : '';
						const dataStr = Object.entries(parent.dataAttrs)
							.map(([k, v]) => `${k}="${v}"`)
							.join(' ');
						return `[${i + 1}] <${parent.tagName}${idPart}${dataStr ? ` ${dataStr}` : ''}>\n    Snippet: ${h.snippet}\n    Parent text: ${parent.parentText}...`;
					})
					.join('\n\n');

				// 실패 리포트에 URL 포함
				await testInfo.attach('bold-marker-snippets', {
					body: `URL: ${page.url()}\n\n${report}`,
					contentType: 'text/plain'
				});

				// 실패 시 스크린샷 첨부 (디버깅 효율성)
				await testInfo.attach('failure-screenshot', {
					body: await page.screenshot({ fullPage: true }),
					contentType: 'image/png'
				});
			}

			expect(
				hits,
				`볼드 표식(${DOUBLE_ASTERISK})이 본문에 그대로 노출됨. URL: ${pagePath}. fix-bold-issues.ts 실행 필요`
			).toHaveLength(0);
		});
	}

	/**
	 * 볼드가 어느 페이지든 하나 이상 존재하는지 확인
	 *
	 * ⚠️ 주의: 이 테스트는 콘텐츠에 의존합니다. 콘텐츠가 변경되면 실패할 수 있습니다.
	 * 장기적으로 더 안정적인 방법:
	 * 1. 테스트 전용 샘플 페이지를 만들어 볼드 렌더링 검증
	 * 2. 각 페이지에 "이 문구는 반드시 볼드" 같은 고정 앵커 사용
	 */
	test('볼드가 어느 페이지든 하나 이상 존재하는지 확인', async ({ page }) => {
		let totalStrongCount = 0;
		const pageStats: { path: string; count: number }[] = [];

		for (const pagePath of MARKDOWN_PAGES) {
			await test.step(`${pagePath} 볼드 요소 확인`, async () => {
				await page.goto(pagePath, { waitUntil: 'domcontentloaded' });

				const article = page.locator('article').first();
				await article.waitFor({ state: 'visible' });

				const count = await article.locator('strong, b').count();
				totalStrongCount += count;
				pageStats.push({ path: pagePath, count });
			});

			// 하나라도 찾으면 조기 종료 (효율성)
			if (totalStrongCount > 0) break;
		}

		// 실패 시 각 페이지별 카운트를 메시지에 포함 (원인 구분 용이)
		const statsLog = pageStats.map((s) => `${s.path}: ${s.count}`).join(', ');
		expect(
			totalStrongCount,
			`마크다운 볼드 렌더링이 동작하지 않음 (strong/b 요소 없음). 페이지별 카운트: ${statsLog}`
		).toBeGreaterThan(0);
	});
});
