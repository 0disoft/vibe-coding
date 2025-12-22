<script lang="ts">
	import { localizeUrl } from "$lib/paraglide/runtime.js";

	import {
		DocsAnchoredHeading,
		DocsPrevNext,
		DocsProse,
	} from "$lib/components/docs";

	import { site } from "$lib/constants";
</script>

<svelte:head>
	<title>문서 가이드 | {site.name}</title>
	<meta name="description" content="문서 가이드 - {site.name}" />
</svelte:head>

<DocsProse>
	{#snippet children()}
		<DocsAnchoredHeading id="docs-intro" text="Intro" />
		<p>
			데스크톱에서는 좌측 메뉴와 우측 목차가 고정 컬럼으로 노출되고, 화면이
			좁아지면 상단 버튼으로 Sheet를 열어 접근합니다.
		</p>

		<DocsAnchoredHeading id="docs-layout" text="Layout" />
		<p>
			<code>DocsLayout</code> 은 내부적으로 3컬럼 그리드를 사용합니다. 본문 컬럼이
			가장 넓게 유지되도록 데스크톱 컬럼 비율을 조정했습니다.
		</p>

		<DocsAnchoredHeading id="docs-next" text="Next" />
		<ul>
			<li>Overview / Getting started / Guides 페이지 구조 정리</li>
			<li>각 페이지에서 tocItems 자동 생성(또는 단일 소스화)</li>
			<li>activeId 기반 ToC 하이라이트(IntersectionObserver) 추가</li>
		</ul>

		<!-- Mock Data for Testing Scrolling Behavior -->
		<hr class="my-8" />
		<DocsAnchoredHeading id="mock-section-1" text="Testing Section 1" />
		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
			tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
			veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
			commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
			velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
			cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
			est laborum.
		</p>
		<p>
			Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
			doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo
			inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
			Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut
			fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem
			sequi nesciunt.
		</p>

		<hr class="my-8" />
		<DocsAnchoredHeading id="mock-section-2" text="Testing Section 2" />
		<p>
			At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis
			praesentium voluptatum deleniti atque corrupti quos dolores et quas
			molestias excepturi sint occaecati cupiditate non provident, similique
			sunt in culpa qui officia deserunt mollitia animi, id est laborum et
			dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.
		</p>
		<ul>
			<li>
				Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil
				impedit quo minus id quod maxime placeat facere possimus.
			</li>
			<li>
				Omnis voluptas assumenda est, omnis dolor repellendus. temporibus autem
				quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet
				ut et voluptates repudiandae sint et molestiae non recusandae.
			</li>
			<li>
				Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis
				voluptatibus maiores alias consequatur aut perferendis doloribus
				asperiores repellat.
			</li>
		</ul>

		<hr class="my-8" />
		<DocsAnchoredHeading id="mock-section-3" text="Testing Section 3" />
		<p>
			On the other hand, we denounce with righteous indignation and dislike men
			who are so beguiled and demoralized by the charms of pleasure of the
			moment, so blinded by desire, that they cannot foresee the pain and
			trouble that are bound to ensue; and equal blame belongs to those who fail
			in their duty through weakness of will, which is the same as saying
			through shrinking from toil and pain.
		</p>
		<p>
			These cases are perfectly simple and easy to distinguish. In a free hour,
			when our power of choice is untrammelled and when nothing prevents our
			being able to do what we like best, every pleasure is to be welcomed and
			every pain avoided. But in certain circumstances and owing to the claims
			of duty or the obligations of business it will frequently occur that
			pleasures have to be repudiated and annoyances accepted.
		</p>

		<hr class="my-8" />
		<DocsAnchoredHeading id="mock-section-4" text="Testing Section 4" />
		<p>
			Repeat of earlier point: デスク톱에서는 좌측 메뉴와 우측 목차가 고정
			컬럼으로 노출되고, 화면이 좁아지면 상단 버튼으로 Sheet를 열어 접근합니다.
		</p>
		<p>
			The wise man therefore always holds in these matters to this principle of
			selection: he rejects pleasures to secure other greater pleasures, or else
			he endures pains to avoid worse pains.
		</p>

		<hr class="my-8" />
		<DocsAnchoredHeading id="mock-section-5" text="Testing Section 5" />
		<p>
			Last section for sticky testing.
			<code>DocsLayout</code> needs to stick properly even when content is very long.
			Check if the 'Show Sidebar' buttons stay fixed relative to the viewport top
			(under header).
		</p>
		<p>End of mock data.</p>
	{/snippet}
</DocsProse>

<div class="pt-6">
	<DocsPrevNext
		next={{
			href: localizeUrl("/docs/getting-started").pathname,
			label: "Getting started",
			description: "설치/실행/기본 개념",
		}}
	/>
</div>
