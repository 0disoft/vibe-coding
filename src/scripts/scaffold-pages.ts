import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { pages } from '../lib/constants/pages';

type Scaffolded = {
	created: number;
	skipped: number;
	createdPaths: string[];
};

function toRouteSegments(pagePath: string): string[] {
	const normalized = pagePath.trim();
	if (!normalized.startsWith('/')) return [];
	return normalized.split('/').filter(Boolean);
}

function pageTemplate(opts: { title: string; description?: string; path: string }): string {
	const title = opts.title.replaceAll('`', '');
	const description =
		opts.description?.replaceAll('`', '') ||
		'이 페이지는 템플릿 스캐폴딩 단계에서 자동 생성된 스텁입니다.';

	return `<script lang="ts">
  import { DsCard, DsLinkButton } from "$lib/components/design-system";
  import { site } from "$lib/constants";

  // NOTE: 스텁 페이지이므로, 실제 구현 시 컴포넌트/데이터 로딩을 추가하세요.
</script>

<svelte:head>
  <title>${title} | {site.name}</title>
  <meta name="description" content="${title} - {site.name}" />
</svelte:head>

<div class="container px-4 py-12 md:px-6">
  <div class="mx-auto max-w-4xl space-y-6">
    <div class="space-y-2">
      <p class="text-label text-muted-foreground">Page Stub</p>
      <h1 class="text-h1 font-semibold">${title}</h1>
      <p class="text-body-secondary text-muted-foreground">${description}</p>
      <div class="flex flex-wrap gap-2 pt-2">
        <DsLinkButton href="/design-system" variant="outline" intent="secondary">
          Design System
        </DsLinkButton>
      </div>
    </div>

    <DsCard class="space-y-3 p-6 md:p-8">
      <div class="text-label text-muted-foreground">Route</div>
      <div class="text-body">
        <code class="text-code">${opts.path}</code>
      </div>

      <div class="text-label text-muted-foreground pt-4">Next</div>
      <ul class="list-disc ps-6 space-y-1 text-body">
        <li>페이지 목적/콘텐츠 구조 확정</li>
        <li>필요한 DS/Docs 컴포넌트 조합 적용</li>
        <li>데이터 로딩/폼/검증/에러 상태 추가</li>
      </ul>
    </DsCard>
  </div>
</div>
`;
}

function main(): Scaffolded {
	const scriptDir = path.dirname(fileURLToPath(import.meta.url));
	const repoRoot = path.resolve(scriptDir, '..', '..');
	const routesRoot = path.join(repoRoot, 'src', 'routes', '[[lang]]');

	const result: Scaffolded = { created: 0, skipped: 0, createdPaths: [] };

	for (const p of pages) {
		if (p.path === '/' || p.path.startsWith('/design-system')) {
			result.skipped += 1;
			continue;
		}

		const segments = toRouteSegments(p.path);
		if (segments.length === 0) {
			result.skipped += 1;
			continue;
		}

		const dir = path.join(routesRoot, ...segments);
		const pageFile = path.join(dir, '+page.svelte');

		if (fs.existsSync(pageFile)) {
			result.skipped += 1;
			continue;
		}

		fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(
			pageFile,
			pageTemplate({ title: p.title, description: p.description, path: p.path }),
			'utf8'
		);
		result.created += 1;
		result.createdPaths.push(path.relative(repoRoot, pageFile));
	}

	return result;
}

const out = main();
console.log(
	`scaffold-pages: created=${out.created} skipped=${out.skipped}\n` +
		out.createdPaths.map((p) => `- ${p}`).join('\n')
);
