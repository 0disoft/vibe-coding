# Markdownlint 규칙 가이드

이 문서는 모든 규칙과 체크하는 내용, 그리고 규칙을 위반하는 문서 예시와 수정된 예시를 설명합니다.

## `MD001` - 헤더 레벨은 한 단계씩만 증가해야 함

태그: `headings`
별칭: `heading-increment`
파라미터:

- `front_matter_title`: 프론트 매터의 제목을 일치시키는 정규식 (`string`, 기본값 `^\s*title\s*[:=]`)

문서 내에서 헤더 레벨을 건너뛸 때 발생합니다. 예:

```markdown
# 헤더 1

### 헤더 3

이 문서에서는 2단계 헤더를 건너뛰었습니다.
```

여러 단계의 헤더를 사용할 때는 중첩된 헤더가 한 번에 한 단계씩만 증가해야 합니다.

```markdown
# 헤더 1

## 헤더 2

### 헤더 3

#### 헤더 4

## 또 다른 헤더 2

### 또 다른 헤더 3
```

[YAML](https://en.wikipedia.org/wiki/YAML) 프론트 매터가 있고 `title` 속성이 포함된 경우(블로그 포스트 등에서 흔함), 이 규칙은 해당 제목을 최상위 헤더로 취급하며 실제 첫 번째 헤더가 레벨 2 헤더가 아니면 위반으로 간주합니다. 프론트 매터에서 다른 속성 이름을 사용하려면 `front_matter_title` 파라미터에 정규식 텍스트를 지정하세요. 이 규칙에서 프론트 매터 사용을 비활성화하려면 `front_matter_title`에 `""`를 지정하세요. 프론트 매터가 없으면 첫 번째 헤더는 어떤 레벨이든 될 수 있습니다.

근거: 헤더는 문서의 구조를 나타내며, 단계를 건너뛰면 특히 접근성 시나리오에서 혼란을 줄 수 있습니다. 더 많은 정보: <https://www.w3.org/WAI/tutorials/page-structure/headings/>.

## `MD003` - 헤더 스타일

태그: `headings`
별칭: `heading-style`
파라미터:

- `style`: 헤더 스타일 (`string`, 기본값 `consistent`, 값: `atx` / `atx_closed` / `consistent` / `setext` / `setext_with_atx` / `setext_with_atx_closed`)

문서 내에서 서로 다른 헤더 스타일이 사용될 때 발생합니다.

```markdown
# ATX 스타일 H1

## 닫힌 ATX 스타일 H2 ##

Setext 스타일 H1
===============
```

문제를 해결하려면 문서 전체에서 일관된 헤더 스타일을 사용하세요.

```markdown
# ATX 스타일 H1

## ATX 스타일 H2
```

`setext_with_atx` 및 `setext_with_atx_closed` 설정은 Setext 스타일 헤더(레벨 1과 2만 지원)가 있는 문서에서 레벨 3 이상의 ATX 스타일 헤더를 허용합니다.

```markdown
Setext 스타일 H1
===============

Setext 스타일 H2
---------------

### ATX 스타일 H3
```

참고: 설정된 헤더 스타일은 특정 스타일(`atx`, `atx_closed`, `setext`, `setext_with_atx`, `setext_with_atx_closed`)을 요구하거나, `consistent`를 통해 모든 헤더 스타일이 첫 번째 헤더 스타일과 일치하도록 요구할 수 있습니다.

참고: 텍스트 한 줄 바로 아래에 수평선을 배치하면 해당 텍스트가 레벨 2 Setext 스타일 헤더가 되어 이 규칙을 위발할 수 있습니다.

```markdown
수평선이 뒤따르는 텍스트 한 줄은 헤더가 됩니다
---
```

근거: 일관된 서식은 문서를 이해하기 쉽게 만듭니다.

## `MD004` - 순서 없는 목록 스타일

태그: `bullet`, `ul`
별칭: `ul-style`
파라미터:

- `style`: 목록 스타일 (`string`, 기본값 `consistent`, 값: `asterisk` / `consistent` / `dash` / `plus` / `sublist`)
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

문서에서 순서 없는 목록 항목에 사용된 기호가 설정된 스타일과 일치하지 않을 때 발생합니다.

```markdown
* 항목 1
+ 항목 2
- 항목 3
```

이 문제를 해결하려면 문서 전체에서 목록 항목에 대해 설정된 스타일을 사용하세요.

```markdown
* 항목 1
* 항목 2
* 항목 3
```

설정된 목록 스타일은 모든 목록 스타일을 특정 기호(`asterisk`, `plus`, `dash`)로 통일하거나, 각 하위 목록이 부모 목록과 다른 일관된 기호를 갖도록(`sublist`) 하거나, 모든 목록 스타일이 첫 번째 목록 스타일과 일치하도록(`consistent`) 할 수 있습니다.

예를 들어, 다음은 `sublist` 스타일에 유효합니다. 가장 바깥쪽 들여쓰기는 별표, 중간 들여쓰기는 더하기, 가장 안쪽 들여쓰기는 대시를 사용하기 때문입니다.

```markdown
* 항목 1
  + 항목 2
    - 항목 3
  + 항목 4
* 항목 4
  + 항목 5
```

근거: 일관된 서식은 문서를 이해하기 쉽게 만듭니다.

## `MD005` - 같은 레벨의 목록 항목 들여쓰기 불일치

태그: `bullet`, `indentation`, `ul`
별칭: `list-indent`
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

목록 항목이 같은 레벨로 파싱되지만 들여쓰기가 같지 않을 때 발생합니다.

```markdown
* 항목 1
  * 중첩 항목 1
  * 중첩 항목 2
   * 잘못 정렬된 항목
```

보통 이 규칙은 오타 때문에 발생합니다. 목록의 들여쓰기를 수정하여 해결하세요.

```markdown
* 항목 1
  * 중첩 항목 1
  * 중첩 항목 2
  * 중첩 항목 3
```

순서가 있는 목록 마커는 보통 모든 항목이 같은 시작 열을 갖도록 왼쪽 정렬됩니다.

```markdown
...
8. 항목
9. 항목
10. 항목
11. 항목
...
```

이 규칙은 또한 모든 항목이 같은 끝 열을 갖도록 목록 마커의 오른쪽 정렬도 지원합니다.

```markdown
...
 8. 항목
 9. 항목
10. 항목
11. 항목
...
```

근거: 이 규칙을 위반하면 콘텐츠가 부적절하게 렌더링될 수 있습니다.

## `MD007` - 순서 없는 목록 들여쓰기

태그: `bullet`, `indentation`, `ul`
별칭: `ul-indent`
파라미터:

- `indent`: 들여쓰기 공백 수 (`integer`, 기본값 `2`)
- `start_indent`: 첫 번째 레벨 들여쓰기 공백 수 (`start_indented`가 설정된 경우) (`integer`, 기본값 `2`)
- `start_indented`: 목록의 첫 번째 레벨을 들여쓸지 여부 (`boolean`, 기본값 `false`)
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

목록 항목이 설정된 공백 수(기본값: 2)만큼 들여쓰기 되지 않았을 때 발생합니다.

예시:

```markdown
* 목록 항목
   * 3칸 들여쓰기된 중첩 목록 항목
```

수정된 예시:

```markdown
* 목록 항목
  * 2칸 들여쓰기된 중첩 목록 항목
```

참고: 이 규칙은 부모 목록들도 모두 순서 없는 목록인 경우에만 하위 목록에 적용됩니다 (그렇지 않으면 순서 있는 목록의 추가 들여쓰기가 규칙을 방해합니다).

`start_indented` 파라미터는 목록의 첫 번째 레벨을 0에서 시작하는 대신 설정된 공백 수만큼 들여쓰도록 허용합니다. `start_indent` 파라미터는 첫 번째 레벨 목록을 나머지와 다른 공백 수만큼 들여쓰도록 허용합니다 (`start_indented`가 설정되지 않으면 무시됨).

근거: 2칸 들여쓰기를 사용하면 목록 마커 뒤에 한 칸의 공백을 사용할 때 중첩 목록의 콘텐츠가 부모 목록의 콘텐츠 시작 부분과 라인을 맞출 수 있습니다. 4칸 들여쓰기는 코드 블록과 일관성이 있고 에디터에서 구현하기 더 간단합니다. 또한, 이는 4칸 들여쓰기를 요구하는 다른 Markdown 파서들과의 호환성 문제가 될 수 있습니다. 더 많은 정보: [Markdown Style Guide][markdown-style-guide].

참고: 호환성 정보는 [Prettier.md](Prettier.md)를 참조하세요.

[markdown-style-guide]: https://cirosantilli.com/markdown-style-guide#indentation-of-content-inside-lists

## `MD009` - 후행 공백 (Trailing spaces)

태그: `whitespace`
별칭: `no-trailing-spaces`
파라미터:

- `br_spaces`: 줄바꿈을 위한 공백 수 (`integer`, 기본값 `2`)
- `code_blocks`: 코드 블록 포함 여부 (`boolean`, 기본값 `false`)
- `list_item_empty_lines`: 목록 항목 내 빈 줄에 공백 허용 여부 (`boolean`, 기본값 `false`)
- `strict`: 불필요한 줄바꿈 포함 여부 (`boolean`, 기본값 `false`)
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

라인이 예상치 못한 공백으로 끝날 때 발생합니다. 이를 수정하려면 라인 끝의 후행 공백을 제거하세요.

`br_spaces` 파라미터는 명시적인 줄바꿈을 위해 사용되는 특정 수의 후행 공백에 대해 이 규칙의 예외를 허용합니다. 기본값은 2개의 공백을 하드 브레이크(\<br> 요소)로 허용합니다. (이 파라미터가 적용되려면 `br_spaces` 값을 2 이상으로 설정해야 합니다. `br_spaces`를 1로 설정하면 0과 동일하게 작동하여 모든 후행 공백을 허용하지 않습니다.)

기본적으로 들여쓰기된 코드 블록과 펜스 코드 블록에서는 일부 프로그래밍 언어가 요구하기 때문에 후행 공백이 허용됩니다. 이러한 경우를 보고하려면 `code_blocks` 파라미터를 `true`로 설정하세요.

기본적으로 이 규칙은 허용된 수의 공백이 사용된 경우(예: 문단 끝) 하드 브레이크를 생성하지 않더라도 트리거되지 않습니다. 이러한 경우를 보고하려면 `strict` 파라미터를 `true`로 설정하세요.

```markdown
Text text text
text[2 spaces]
```

목록 항목 내부의 빈 줄을 들여쓰기 위해 공백을 사용하는 것은 보통 필요하지 않지만, 일부 파서는 이를 요구합니다. 이를 허용하려면 `list_item_empty_lines` 파라미터를 `true`로 설정하세요 (`strict`가 `true`일 때도 허용됨):

```markdown
- 목록 항목 텍스트
  [2 spaces]
  목록 항목 텍스트
```

근거: 줄바꿈을 만드는 데 사용되는 경우를 제외하고, 후행 공백은 목적이 없으며 콘텐츠 렌더링에 영향을 주지 않습니다.

## `MD010` - 하드 탭 (Hard tabs)

태그: `hard_tab`, `whitespace`
별칭: `no-hard-tabs`
파라미터:

- `code_blocks`: 코드 블록 포함 여부 (`boolean`, 기본값 `true`)
- `ignore_code_languages`: 무시할 펜스 코드 언어 목록 (`string[]`, 기본값 `[]`)
- `spaces_per_tab`: 각 하드 탭 당 공백 수 (`integer`, 기본값 `1`)
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

들여쓰기에 공백 대신 하드 탭 문자가 포함된 라인이 있을 때 발생합니다. 이를 수정하려면 하드 탭 문자를 공백으로 교체하세요.

예시:

<!-- markdownlint-disable no-hard-tabs -->

```markdown
Some text

	* hard tab character used to indent the list item
```

<!-- markdownlint-restore -->

수정된 예시:

```markdown
Some text

    * Spaces used to indent the list item instead
```

코드 블록과 스팬에 대해 이 규칙을 제외하려면 `code_blocks` 파라미터를 `false`로 설정하세요. 코드 블록과 스팬은 기본적으로 포함되는데, Markdown 도구들의 탭 처리 방식이 일관되지 않기 때문입니다 (예: 4칸 vs 8칸).

코드 블록을 스캔할 때(기본값 또는 `code_blocks`가 `true`일 때), `ignore_code_languages` 파라미터에 무시할 언어 목록을 설정할 수 있습니다 (즉, 하드 탭이 허용되지만 필수는 아님). 이렇게 하면 하드 탭이 필요한 언어의 코드를 문서에 포함하기 더 쉬워집니다.

기본적으로 이 규칙의 위반 사항은 탭을 1개의 공백 문자로 교체하여 수정됩니다. 다른 공백 수를 사용하려면 `spaces_per_tab` 파라미터를 원하는 값으로 설정하세요.

근거: 하드 탭은 에디터마다 일관되지 않게 렌더링되는 경우가 많으며 공백보다 다루기 어려울 수 있습니다.

더 많은 정보:

- <https://agiletribe.wordpress.com/2011/10/27/18-dont-use-tab-characters/>
- <https://www.jwz.org/doc/tabs-vs-spaces.html>
- <https://adamspiers.org/computing/why_no_tabs.html>

## `MD011` - 반전된 링크 구문

태그: `links`
별칭: `no-reversed-links`
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

링크처럼 보이는 텍스트가 발견되었지만 구문이 반대로 된 경우(`[]`와 `()`가 바뀜) 발생합니다:

```markdown
(Incorrect link syntax)[https://www.example.com/]
```

이를 수정하려면 `[]`와 `()`의 위치를 바꾸세요:

```markdown
[Correct link syntax](https://www.example.com/)
```

참고: [Markdown Extra](https://en.wikipedia.org/wiki/Markdown_Extra) 스타일의 주석은 이 규칙을 트리거하지 않습니다:

```markdown
For (example)[^1]
```

근거: 반전된 링크는 사용 가능한 링크로 렌더링되지 않습니다.

## `MD012` - 연속된 여러 빈 줄

태그: `blank_lines`, `whitespace`
별칭: `no-multiple-blanks`
파라미터:

- `maximum`: 연속된 빈 줄의 최대 수 (`integer`, 기본값 `1`)
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

문서에 연속된 빈 줄이 여러 개 있을 때 발생합니다:

```markdown
Some text here


Some more text here
```

이를 수정하려면 문제가 되는 줄을 삭제하세요:

```markdown
Some text here

Some more text here
```

참고: 코드 블록 내부에 여러 연속된 빈 줄이 있는 경우에는 이 규칙이 트리거되지 않습니다.

참고: `maximum` 파라미터를 사용하여 연속된 빈 줄의 최대 허용 수를 설정할 수 있습니다.

근거: 코드 블록 내부를 제외하고, 빈 줄은 목적이 없으며 콘텐츠 렌더링에 영향을 주지 않습니다.

## `MD013` - 줄 길이 제한

태그: `line_length`
별칭: `line-length`
파라미터:

- `code_block_line_length`: 코드 블록의 최대 글자 수 (`integer`, 기본값 `80`)
- `code_blocks`: 코드 블록 포함 여부 (`boolean`, 기본값 `true`)
- `heading_line_length`: 헤더의 최대 글자 수 (`integer`, 기본값 `80`)
- `headings`: 헤더 포함 여부 (`boolean`, 기본값 `true`)
- `line_length`: 최대 글자 수 (`integer`, 기본값 `80`)
- `stern`: Stern 길이 검사 (`boolean`, 기본값 `false`)
- `strict`: 엄격한 길이 검사 (`boolean`, 기본값 `false`)
- `tables`: 표 포함 여부 (`boolean`, 기본값 `true`)

라인이 설정된 `line_length`(기본값: 80자)보다 길 때 발생합니다. 이를 수정하려면 라인을 여러 줄로 나누세요. 헤더에 대해 다른 최대 길이를 설정하려면 `heading_line_length`를, 코드 블록에 대해 다른 최대 길이를 설정하려면 `code_block_line_length`를 사용하세요.

이 규칙은 설정된 라인 길이를 초과하는 부분에 공백이 없는 경우 예외를 둡니다. 이는 긴 URL 등을 중간에 강제로 끊지 않고 포함할 수 있게 해줍니다. 이 예외를 비활성화하려면 `strict` 파라미터를 `true`로 설정하세요. 그러면 너무 긴 라인이 있을 때 항상 이슈가 보고됩니다. 너무 긴 라인을 경고하되 공백이 없는 긴 라인은 허용하고 싶다면 `stern` 파라미터를 `true`로 설정하세요.

예를 들어 (일반 동작 가정):

```markdown
IF THIS LINE IS THE MAXIMUM LENGTH
This line is okay because there are-no-spaces-beyond-that-length
This line is a violation because there are spaces beyond that length
This-line-is-okay-because-there-are-no-spaces-anywhere-within
```

`strict` 모드에서는 위 예시의 마지막 세 줄이 모두 위반입니다. `stern` 모드에서는 가운데 두 줄은 위반이지만, 마지막 줄은 괜찮습니다.

코드 블록, 표, 또는 헤더에 대해 이 규칙을 제외할 수 있습니다. 그렇게 하려면 `code_blocks`, `tables`, 또는 `headings` 파라미터를 `false`로 설정하세요.

코드 블록은 문서 가독성을 위해 종종 길이를 제한해야 하므로 기본적으로 포함되지만, 일부 언어는 짧은 줄로 작성하기 어려울 수 있습니다.

링크/이미지 참조 정의가 있는 라인, 그리고 링크/이미지만 포함하고(강조 표시 포함 가능) 단독으로 존재하는 라인(문단의 일부가 아님)은 URL을 깨지 않고는 나눌 방법이 없는 경우가 많으므로 이 규칙에서 항상 제외됩니다(`strict` 모드에서도).

근거: 매우 긴 라인은 일부 에디터에서 작업하기 어려울 수 있습니다. 더 많은 정보: <https://cirosantilli.com/markdown-style-guide#line-wrapping>.

## `MD014` - 출력 없이 명령어 앞에 달러 표시($) 사용

태그: `code`
별칭: `commands-show-output`
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

쉘 명령어를 보여주는 코드 블록이 있고, *모든* 쉘 명령어 앞에 달러 표시($)가 있을 때 발생합니다:

<!-- markdownlint-disable commands-show-output -->

```markdown
$ ls
$ cat foo
$ less bar
```

<!-- markdownlint-restore -->

이런 상황에서는 달러 표시가 불필요하므로 포함하지 않아야 합니다:

```markdown
ls
cat foo
less bar
```

달러 표시 뒤에 명령어가 오고 그 결과가 함께 표시되는 경우에는 이 규칙이 트리거되지 않습니다:

```markdown
$ ls
foo bar
$ cat foo
Hello world
$ cat bar
baz
```

일부 명령어는 출력이 없을 수 있으므로, *일부* 명령어가 출력이 없더라도 위반은 아닙니다:

```markdown
$ mkdir test
mkdir: created directory 'test'
$ ls test
```

근거: 불필요할 때 달러 표시를 생략하면 복사/붙여넣기가 더 쉽고 덜 산만합니다. 더 많은 정보는 <https://cirosantilli.com/markdown-style-guide#dollar-signs-in-shell-code>를 참조하세요.

## `MD018` - ATX 스타일 헤더의 해시(#) 뒤에 공백 없음

태그: `atx`, `headings`, `spaces`
별칭: `no-missing-space-atx`
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

ATX 스타일 헤더에서 해시 문자 뒤에 공백이 없을 때 발생합니다:

```markdown
#Heading 1

##Heading 2
```

이를 수정하려면 헤더 텍스트와 해시 문자 사이에 공백 한 칸을 두세요:

```markdown
# Heading 1

## Heading 2
```

근거: 이 규칙을 위반하면 콘텐츠가 부적절하게 렌더링될 수 있습니다.

## `MD019` - ATX 스타일 헤더의 해시(#) 뒤에 여러 공백

태그: `atx`, `headings`, `spaces`
별칭: `no-multiple-space-atx`
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

ATX 스타일 헤더에서 해시 문자와 헤더 텍스트 사이에 둘 이상의 공백이 사용될 때 발생합니다:

```markdown
#  Heading 1

##  Heading 2
```

이를 수정하려면 헤더 텍스트와 해시 문자 사이에 공백 한 칸을 두세요:

```markdown
# Heading 1

## Heading 2
```

근거: 불필요한 공백은 목적이 없으며 콘텐츠 렌더링에 영향을 주지 않습니다.

## `MD020` - 닫힌 ATX 스타일 헤더의 해시(#) 내부에 공백 없음

태그: `atx_closed`, `headings`, `spaces`
별칭: `no-missing-space-closed-atx`
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

닫힌 ATX 스타일 헤더에서 해시 문자 내부에 공백이 없을 때 발생합니다:

```markdown
#Heading 1#

##Heading 2##
```

이를 수정하려면 헤더 텍스트와 해시 문자 사이에 공백 한 칸을 두세요:

```markdown
# Heading 1 #

## Heading 2 ##
```

참고: 헤더의 어느 한쪽이라도 공백이 없으면 이 규칙이 발생합니다.

근거: 이 규칙을 위반하면 콘텐츠가 부적절하게 렌더링될 수 있습니다.

## `MD021` - 닫힌 ATX 스타일 헤더의 해시(#) 내부에 여러 공백

태그: `atx_closed`, `headings`, `spaces`
별칭: `no-multiple-space-closed-atx`
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

닫힌 ATX 스타일 헤더에서 해시 문자와 헤더 텍스트 사이에 둘 이상의 공백이 사용될 때 발생합니다:

```markdown
#  Heading 1  #

##  Heading 2  ##
```

이를 수정하려면 헤더 텍스트와 해시 문자 사이에 공백 한 칸을 두세요:

```markdown
# Heading 1 #

## Heading 2 ##
```

참고: 이 규칙은 헤더의 어느 한쪽이라도 여러 공백이 포함되면 발생합니다.

근거: 불필요한 공백은 목적이 없으며 콘텐츠 렌더링에 영향을 주지 않습니다.

## `MD022` - 헤더 주변에 빈 줄이 있어야 함

태그: `blank_lines`, `headings`
별칭: `blanks-around-headings`
파라미터:

- `lines_above`: 헤더 위의 빈 줄 수 (`integer|integer[]`, 기본값 `1`)
- `lines_below`: 헤더 아래의 빈 줄 수 (`integer|integer[]`, 기본값 `1`)
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

헤더(모든 스타일)의 앞이나 뒤에 최소 하나의 빈 줄이 없을 때 발생합니다:

```markdown
# Heading 1
Some text

Some more text
## Heading 2
```

이를 수정하려면 모든 헤더의 앞뒤에 빈 줄이 있도록 하세요 (문서의 시작이나 끝에 있는 헤더 제외):

```markdown
# Heading 1

Some text

Some more text

## Heading 2
```

`lines_above`와 `lines_below` 파라미터를 사용하여 각 헤더 위나 아래에 다른 수의 빈 줄(0 포함)을 지정할 수 있습니다. 어느 한 쪽에 `-1` 값을 사용하면 빈 줄의 수에 제한을 두지 않습니다. 각 헤더 레벨(1-6) 별로 위나 아래의 줄 수를 개별적으로 사용자 정의하려면 `number[]`를 지정하세요 (순서대로).

참고: `lines_above` 또는 `lines_below`가 1개 이상의 빈 줄을 요구하도록 설정된 경우, [MD012/no-multiple-blanks](md012.md)도 함께 사용자 정의해야 합니다. 이 규칙은 지정된 수 *만큼의* 빈 줄이 있는지 확인하며, 추가적인 빈 줄은 무시됩니다.

근거: 미적인 이유 외에도, `kramdown`을 포함한 일부 파서는 앞에 빈 줄이 없는 헤더를 파싱하지 않고 일반 텍스트로 처리합니다.

## `MD023` - 헤더는 라인 시작 부분에서 시작해야 함

태그: `headings`, `spaces`
별칭: `heading-start-left`
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

헤더가 하나 이상의 공백으로 들여쓰기 되었을 때 발생합니다:

```markdown
Some text

  # Indented heading
```

이를 수정하려면 모든 헤더가 라인의 시작 부분에서 시작되도록 하세요:

```markdown
Some text

# Heading
```

인용문 블록과 같이 라인 시작이 "들여쓰기" 되는 시나리오는 올바른 것으로 간주됩니다:

```markdown
> # Heading in Block Quote
```

근거: 라인 시작 부분에서 시작하지 않는 헤더는 헤더로 파싱되지 않고 일반 텍스트로 표시됩니다.

## `MD024` - 동일한 내용을 가진 여러 헤더

태그: `headings`
별칭: `no-duplicate-heading`
파라미터:

- `siblings_only`: 형제 헤더만 확인 (`boolean`, 기본값 `false`)

문서 내에 동일한 텍스트를 가진 헤더가 여러 개 있을 때 발생합니다:

```markdown
# Some text

## Some text
```

이를 수정하려면 각 헤더의 내용이 서로 다르도록 하세요:

```markdown
# Some text

## Some more text
```

`siblings_only` 파라미터를 `true`로 설정하면, 서로 다른 부모를 가진 헤더에 대해서는 중복이 허용됩니다 (변경 로그에서 흔히 사용됨):

```markdown
# Change log

## 1.0.0

### Features

## 2.0.0

### Features
```

근거: 일부 Markdown 파서는 헤더 이름을 기반으로 앵커를 생성하는데, 동일한 내용을 가진 헤더는 이 과정에서 문제를 일으킬 수 있습니다.

## `MD025` - 같은 문서에 여러 최상위 헤더

태그: `headings`
별칭: `single-h1`, `single-title`
파라미터:

- `front_matter_title`: 프론트 매터의 제목을 일치시키는 정규식 (`string`, 기본값 `^\s*title\s*[:=]`)
- `level`: 헤더 레벨 (`integer`, 기본값 `1`)

최상위 헤더(파일 첫 줄의 h1 헤더)가 사용 중인데, 문서 내에 h1 헤더가 하나 이상 있을 때 발생합니다:

```markdown
# Top level heading

# Another top-level heading
```

이를 수정하려면 문서의 제목 역할을 하는 단일 h1 헤더만 있도록 문서를 구조화하세요. 그 이후의 헤더는 하위 레벨 헤더(h2, h3 등)여야 합니다:

```markdown
# Title

## Heading

## Another heading
```

참고: `level` 파라미터는 h1이 외부적으로 추가되는 경우 최상위 레벨을 변경(예: h2로)하는 데 사용할 수 있습니다.

[YAML](https://en.wikipedia.org/wiki/YAML) 프론트 매터가 있고 `title` 속성이 포함된 경우(블로그 포스트 등에서 흔함), 이 규칙은 해당 제목을 최상위 헤더로 취급하며 이후의 모든 최상위 헤더에 대해 위반으로 보고합니다. 프론트 매터에서 다른 속성 이름을 사용하려면 `front_matter_title` 파라미터에 정규식 텍스트를 지정하세요. 이 규칙에서 프론트 매터 사용을 비활성화하려면 `front_matter_title`에 `""`를 지정하세요.

근거: 최상위 헤더는 파일의 첫 번째 줄에 있는 h1이며 문서의 제목 역할을 합니다. 이 관례를 사용한다면 문서에 제목이 하나만 있어야 하며, 전체 문서는 이 헤더 안에 포함되어야 합니다.

## `MD026` - 헤더에 후행 구두점 사용

태그: `headings`
별칭: `no-trailing-punctuation`
파라미터:

- `punctuation`: 구두점 문자 (`string`, 기본값 `.,;:!。，；：！`)
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

지정된 일반 또는 전각 구두점 문자가 라인의 마지막 문자로 오는 헤더에서 발생합니다:

```markdown
# This is a heading.
```

이를 수정하려면 후행 구두점을 제거하세요:

```markdown
# This is a heading
```

참고: `punctuation` 파라미터를 사용하여 헤더 끝에서 구두점으로 간주할 문자를 지정할 수 있습니다. 예를 들어, `.,;:`로 변경하면 느낌표로 끝나는 헤더를 허용합니다. `?`는 FAQ 스타일 문서의 헤더에서 흔히 사용되므로 기본적으로 허용됩니다. `punctuation` 파라미터를 `""`로 설정하면 모든 문자를 허용하며, 이는 규칙을 비활성화하는 것과 같습니다.

참고: `&copy;`, `&#169;`, `&#x000A9;`와 같은 [HTML 엔티티 참조][html-entity-references]의 후행 세미콜론은 이 규칙에서 무시됩니다.

근거: 헤더는 완전한 문장이 아니어야 합니다. 더 많은 정보: [Punctuation at the end of headers][end-punctuation].

[end-punctuation]: https://cirosantilli.com/markdown-style-guide#punctuation-at-the-end-of-headers
[html-entity-references]: https://en.wikipedia.org/wiki/List_of_XML_and_HTML_character_entity_references

## `MD027` - 인용문 기호 뒤에 여러 공백

태그: `blockquote`, `indentation`, `whitespace`
별칭: `no-multiple-space-blockquote`
파라미터:

- `list_items`: 목록 항목 포함 여부 (`boolean`, 기본값 `true`)
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

인용문 블록에서 인용 부호(`>`) 뒤에 공백이 하나보다 많을 때 발생합니다:

```markdown
>  This is a blockquote with bad indentation
>  there should only be one.
```

이를 수정하려면 불필요한 공백을 제거하세요:

```markdown
> This is a blockquote with correct
> indentation.
```

인용문 내부의 의도된 목록 들여쓰기를 추론하는 것은 어려울 수 있습니다. `list_items` 파라미터를 `false`로 설정하면 순서 있는 목록과 순서 없는 목록 항목에 대해 이 규칙을 비활성화합니다.

근거: 일관된 서식은 문서를 이해하기 쉽게 만듭니다.

## `MD028` - 인용문 내부의 빈 줄

태그: `blockquote`, `whitespace`
별칭: `no-blanks-blockquote`

두 개의 인용문 블록이 빈 줄로만 분리되어 있을 때 발생합니다:

```markdown
> This is a blockquote
> which is immediately followed by

> this blockquote. Unfortunately
> In some parsers, these are treated as the same blockquote.
```

이를 수정하려면 인접한 두 인용문 블록 사이에 텍스트가 있도록 하세요:

```markdown
> This is a blockquote.

And Jimmy also said:

> This too is a blockquote.
```

또는, 만약 두 블록이 같은 인용문이어야 한다면 빈 줄의 시작 부분에 인용 부호를 추가하세요:

```markdown
> This is a blockquote.
>
> This is the same blockquote.
```

근거: 일부 Markdown 파서는 하나 이상의 빈 줄로 분리된 두 인용문 블록을 같은 인용문으로 처리하는 반면, 다른 파서는 별개의 인용문으로 처리합니다.

## `MD029` - 순서 있는 목록 항목 접두사

태그: `ol`
별칭: `ol-prefix`
파라미터:

- `style`: 목록 스타일 (`string`, 기본값 `one_or_ordered`, 값: `one` / `one_or_ordered` / `ordered` / `zero`)
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

순서 있는 목록이 '1.'로 시작하지 않거나, 설정된 스타일에 따라 접두사가 순차적으로 증가하지 않을 때 발생합니다. 덜 일반적이지만 '0.'을 첫 번째 접두사나 모든 접두사로 사용하는 패턴도 지원됩니다.

스타일이 'one'으로 설정된 경우 유효한 목록 예시:

```markdown
1. Do this.
1. Do that.
1. Done.
```

스타일이 'ordered'로 설정된 경우 유효한 목록 예시:

```markdown
1. Do this.
2. Do that.
3. Done.
```

```markdown
0. Do this.
1. Do that.
2. Done.
```

스타일이 'one_or_ordered'로 설정된 경우 위 세 가지 예시 모두 유효합니다.

스타일이 'zero'로 설정된 경우 유효한 목록 예시:

```markdown
0. Do this.
0. Do that.
0. Done.
```

모든 스타일에서 유효하지 않은 목록 예시:

```markdown
1. Do this.
3. Done.
```

이 규칙은 균일한 들여쓰기를 위해 순서 있는 목록 항목에 0 접두사를 붙이는 것을 지원합니다:

```markdown
...
08. Item
09. Item
10. Item
11. Item
...
```

참고: 들여쓰기가 잘못된 코드 블록(또는 유사한 요소)이 두 목록 항목 사이에 나타나 목록을 둘로 "나누는" 경우, 다음과 같이 위반이 보고될 수 있습니다:

<!-- markdownlint-disable code-fence-style -->

~~~markdown
1. First list

```text
Code block
```

1. Second list
~~~

이 문제를 해결하려면 코드 블록을 의도한 대로 이전 목록 항목의 일부가 되도록 들여쓰기하세요:

~~~markdown
1. First list

   ```text
   Code block
   ```

2. Still first list
~~~

<!-- markdownlint-restore -->

근거: 일관된 서식은 문서를 이해하기 쉽게 만듭니다.

## `MD030` - 목록 마커 뒤의 공백

태그: `ol`, `ul`, `whitespace`
별칭: `list-marker-space`
파라미터:

- `ol_multi`: 여러 줄로 된 순서 있는 목록 항목의 공백 수 (`integer`, 기본값 `1`)
- `ol_single`: 한 줄로 된 순서 있는 목록 항목의 공백 수 (`integer`, 기본값 `1`)
- `ul_multi`: 여러 줄로 된 순서 없는 목록 항목의 공백 수 (`integer`, 기본값 `1`)
- `ul_single`: 한 줄로 된 순서 없는 목록 항목의 공백 수 (`integer`, 기본값 `1`)
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

이 규칙은 목록 마커(예: '`-`', '`*`', '`+`' 또는 '`1.`')와 목록 항목 텍스트 사이의 공백 수를 확인합니다.

확인하는 공백 수는 사용 중인 문서 스타일에 따라 다르지만, 기본값은 모든 목록 마커 뒤에 1개의 공백입니다:

```markdown
* Foo
* Bar
* Baz

1. Foo
1. Bar
1. Baz

1. Foo
   * Bar
1. Baz
```

문서 스타일은 순서 없는 목록 항목과 순서 있는 목록 항목 뒤의 공백 수를 독립적으로 변경할 수 있으며, 목록의 모든 항목이 단일 문단으로 구성되었는지 또는 여러 문단(하위 목록 및 코드 블록 포함)으로 구성되었는지에 따라 다르게 설정할 수도 있습니다.

예를 들어, <https://cirosantilli.com/markdown-style-guide#spaces-after-list-marker>의 스타일 가이드는 목록의 모든 항목이 단일 문단 내에 들어가는 경우 목록 마커 뒤에 1개의 공백을 사용하지만, 목록 내에 여러 문단의 내용이 있는 경우에는 2개(순서 있는 목록) 또는 3개(순서 없는 목록)의 공백을 사용하도록 지정합니다:

```markdown
* Foo
* Bar
* Baz
```

상대

```markdown
*   Foo

    Second paragraph

*   Bar
```

또는

```markdown
1.  Foo

    Second paragraph

1.  Bar
```

이를 수정하려면 선택한 문서 스타일에 맞는 올바른 수의 공백이 목록 마커 뒤에 사용되었는지 확인하세요.

근거: 이 규칙을 위반하면 콘텐츠가 부적절하게 렌더링될 수 있습니다.

참고: 호환성 정보는 [Prettier.md](Prettier.md)를 참조하세요.

## `MD031` - 펜스 코드 블록 주변에 빈 줄이 있어야 함

태그: `blank_lines`, `code`
별칭: `blanks-around-fences`
파라미터:

- `list_items`: 목록 항목 포함 여부 (`boolean`, 기본값 `true`)
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

펜스 코드 블록의 앞이나 뒤에 빈 줄이 없으면 발생합니다:

````markdown
Some text
```
Code block
```

```
Another code block
```
Some more text
````

이를 수정하려면 모든 펜스 코드 블록의 앞과 뒤에 빈 줄이 있는지 확인하세요(문서의 시작이나 끝에 있는 경우 제외):

````markdown
Some text

```
Code block
```

```
Another code block
```

Some more text
````

`list_items` 파라미터를 `false`로 설정하여 목록 항목에 대해 이 규칙을 비활성화할 수 있습니다. 펜스 코드를 포함하는 [tight](https://spec.commonmark.org/0.29/#tight) 목록을 생성해야 하는 경우 목록에 대해 이 동작을 비활성화하는 것이 유용할 수 있습니다.

근거: 미적인 이유 외에도, kramdown을 포함한 일부 파서는 앞뒤에 빈 줄이 없는 펜스 코드 블록을 파싱하지 않습니다.

## `MD032` - 목록 주변에 빈 줄이 있어야 함

태그: `blank_lines`, `bullet`, `ol`, `ul`
별칭: `blanks-around-lists`
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

목록(모든 종류)의 앞이나 뒤에 빈 줄이 없으면 발생합니다:

```markdown
Some text
* List item
* List item

1. List item
2. List item
***
```

위의 첫 번째 경우에는 텍스트가 순서 없는 목록 바로 앞에 옵니다. 두 번째 경우에는 테마 구분선(수평선)이 순서 있는 목록 바로 뒤에 옵니다. 이 규칙의 위반을 수정하려면 모든 목록의 앞과 뒤에 빈 줄이 있는지 확인하세요(목록이 문서의 맨 처음이나 맨 끝에 있는 경우 제외):

```markdown
Some text

* List item
* List item

1. List item
2. List item

***
```

다음의 경우는 이 규칙의 위반이 **아님**을 참고하세요:

```markdown
1. List item
   More item 1
2. List item
More item 2
```

들여쓰기되지는 않았지만, "More item 2"라는 텍스트는 [lazy continuation line][lazy-continuation]으로 지칭되며 두 번째 목록 항목의 일부로 간주됩니다.

근거: 미적인 이유 외에도, kramdown을 포함한 일부 파서는 앞뒤에 빈 줄이 없는 목록을 파싱하지 않습니다.

[lazy-continuation]: https://spec.commonmark.org/0.30/#lazy-continuation-line

## `MD033` - 인라인 HTML

태그: `html`
별칭: `no-inline-html`
파라미터:

- `allowed_elements`: 허용된 요소 (`string[]`, 기본값 `[]`)
- `table_allowed_elements`: 표 내에서 허용된 요소 (`string[]`, 기본값 `[]`)

Markdown 문서에 원시 HTML이 사용될 때마다 발생합니다:

```markdown
<h1>Inline HTML heading</h1>
```

이를 수정하려면 원시 HTML을 포함하는 대신 '순수' Markdown을 사용하세요:

```markdown
# Markdown heading
```

특정 HTML 요소를 Markdown 콘텐츠 어디서나 허용하려면 `allowed_elements` 파라미터에 HTML 요소 이름 목록을 설정하세요. Markdown 표 내에서 특정 HTML 요소 집합을 허용하려면 `table_allowed_elements` 파라미터에 HTML 요소 이름 목록을 설정하세요. 이는 Markdown 표 내에서만 `<br>` 스타일의 줄바꿈을 허용하는 데 사용할 수 있습니다.

근거: Markdown에서는 원시 HTML이 허용되지만, 문서에 "순수" Markdown만 포함하고 싶거나 Markdown 문서를 HTML이 아닌 다른 것으로 렌더링하려는 경우를 위해 이 규칙이 포함되었습니다.

## `MD034` - 단순 URL 사용

태그: `links`, `url`
별칭: `no-bare-urls`
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

URL이나 이메일 주소가 꺾쇠 괄호 없이 나타날 때마다 발생합니다:

```markdown
For more info, visit https://www.example.com/ or email user@example.com.
```

이를 수정하려면 URL이나 이메일 주소 주위에 꺾쇠 괄호를 추가하세요:

```markdown
For more info, visit <https://www.example.com/> or email <user@example.com>.
```

URL이나 이메일 주소에 ASCII가 아닌 문자가 포함된 경우, 꺾쇠 괄호가 있더라도 의도한 대로 처리되지 않을 수 있습니다. 이러한 경우 URL 및 이메일에 필요한 구문을 준수하기 위해 [퍼센트 인코딩](https://en.m.wikipedia.org/wiki/Percent-encoding)을 사용할 수 있습니다.

참고: 단순 URL이나 이메일을 링크로 변환하지 않고 포함하려면 코드 스팬으로 감싸세요:

```markdown
Not a clickable link: `https://www.example.com`
```

참고: 다음 시나리오는 단축 링크일 수 있으므로 이 규칙을 트리거하지 않습니다:

```markdown
[https://www.example.com]
```

참고: 다음 구문은 중첩된 링크가 단축 링크일 수 있으므로(우선순위가 높음) 이 규칙을 트리거합니다:

```markdown
[text [shortcut] text](https://example.com)
```

이를 피하려면 내부 괄호를 모두 이스케이프하세요:

```markdown
[link \[text\] link](https://example.com)
```

근거: 꺾쇠 괄호가 없으면 단순 URL이나 이메일은 일부 Markdown 파서에서 링크로 변환되지 않습니다.

## `MD035` - 수평선 스타일

태그: `hr`
별칭: `hr-style`
파라미터:

- `style`: 수평선 스타일 (`string`, 기본값 `consistent`)

문서에서 일관되지 않은 스타일의 수평선이 사용될 때 발생합니다:

```markdown
---

- - -

***

* * *

****
```

이를 수정하려면 모든 곳에서 동일한 수평선을 사용하세요:

```markdown
---

---
```

구성된 스타일은 모든 수평선이 특정 문자열을 사용하도록 하거나, 모든 수평선이 첫 번째 수평선과 일치하도록(`consistent`) 보장할 수 있습니다.

근거: 일관된 서식은 문서를 이해하기 쉽게 만듭니다.

## `MD036` - 헤더 대신 강조 사용

태그: `emphasis`, `headings`
별칭: `no-emphasis-as-heading`
파라미터:

- `punctuation`: 구두점 문자 (`string`, 기본값 `.,;:!?。，；：！？`)

이 검사는 섹션을 구분하는 데 헤더를 사용해야 할 곳에 강조된(즉, 굵게 또는 이탤릭체) 텍스트가 사용된 경우를 찾습니다:

```markdown
**My document**

Lorem ipsum dolor sit amet...

_Another section_

Consectetur adipiscing elit, sed do eiusmod.
```

이를 수정하려면 강조된 텍스트 대신 Markdown 헤더를 사용하여 섹션을 표시하세요:

```markdown
# My document

Lorem ipsum dolor sit amet...

## Another section

Consectetur adipiscing elit, sed do eiusmod.
```

참고: 이 규칙은 전체가 강조된 텍스트로 구성된 한 줄짜리 문단을 찾습니다. 일반 텍스트 내에 사용된 강조, 여러 줄로 강조된 문단, 또는 구두점(일반 또는 전각)으로 끝나는 문단에서는 발생하지 않습니다. 규칙 MD026과 유사하게, 구두점으로 인식되는 문자를 구성할 수 있습니다.

근거: 헤더 대신 강조를 사용하면 도구가 문서의 구조를 추론하는 것을 방해합니다. 더 많은 정보: <https://cirosantilli.com/markdown-style-guide#emphasis-vs-headers>.

## `MD037` - 강조 표시 내부의 공백

태그: `emphasis`, `whitespace`
별칭: `no-space-in-emphasis`
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

강조 마커(굵게, 이탤릭체)가 사용되었지만 마커와 텍스트 사이에 공백이 있을 때 발생합니다:

```markdown
Here is some ** bold ** text.

Here is some * italic * text.

Here is some more __ bold __ text.

Here is some more _ italic _ text.
```

이를 수정하려면 강조 마커 주변의 공백을 제거하세요:

```markdown
Here is some **bold** text.

Here is some *italic* text.

Here is some more __bold__ text.

Here is some more _italic_ text.
```

근거: 별표/밑줄이 공백으로 둘러싸여 있지 않을 때만 강조 표시로 파싱됩니다. 이 규칙은 공백으로 둘러싸여 있지만 작성자가 강조된 텍스트를 의도한 것으로 보이는 곳을 감지하려고 시도합니다.

## `MD038` - 코드 스팬 요소 내부의 공백

태그: `code`, `whitespace`
별칭: `no-space-in-code`
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

코드 스팬의 시작 또는 끝 백틱 옆에 불필요한 공백이 포함된 콘텐츠가 있을 때 발생합니다:

```markdown
`some text `

` some text`

`   some text   `
```

이를 수정하려면 시작과 끝의 추가 공백 문자를 제거하세요:

```markdown
`some text`
```

참고: 백틱으로 시작하거나 끝나는 코드 스팬을 지원하기 위해 사양에서는 단일 선행 *및* 후행 공백이 허용되며 파서에 의해 다듬어집니다:

```markdown
`` `backticks` ``

`` backtick` ``
```

참고: 입력에 단일 공백 패딩이 있는 경우 (불필요하더라도) 보존됩니다:

```markdown
` code `
```

참고: 공백만 포함된 코드 스팬은 사양에서 허용되며 역시 보존됩니다:

```markdown
` `

`   `
```

근거: 이 규칙의 위반은 보통 의도하지 않은 것이며 콘텐츠가 부적절하게 렌더링될 수 있습니다.

## `MD039` - 링크 텍스트 내부의 공백

태그: `links`, `whitespace`
별칭: `no-space-in-links`
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

링크 텍스트를 감싸는 공백이 있는 링크에서 발생합니다:

```markdown
[ a link ](https://www.example.com/)
```

이를 수정하려면 링크 텍스트를 감싸는 공백을 제거하세요:

```markdown
[a link](https://www.example.com/)
```

근거: 일관된 서식은 문서를 이해하기 쉽게 만듭니다.

## `MD040` - 펜스 코드 블록에 언어를 지정해야 함

태그: `code`, `language`
별칭: `fenced-code-language`
파라미터:

- `allowed_languages`: 언어 목록 (`string[]`, 기본값 `[]`)
- `language_only`: 언어만 요구 (`boolean`, 기본값 `false`)

펜스 코드 블록이 사용되었지만 언어가 지정되지 않았을 때 발생합니다:

````markdown
```
#!/bin/bash
echo Hello world
```
````

이를 수정하려면 코드 블록에 언어 식별자를 추가하세요:

````markdown
```bash
#!/bin/bash
echo Hello world
```
````

구문 강조 없이 코드 블록을 표시하려면 다음을 사용하세요:

````markdown
```text
Plain text in a code block
```
````

`allowed_languages` 파라미터를 설정하여 코드 블록에서 사용할 수 있는 언어 목록을 지정할 수 있습니다. 언어는 대소문자를 구분합니다. 기본값은 `[]`이며, 이는 모든 언어 식별자가 유효함을 의미합니다.

펜스 코드 블록의 정보 문자열에 추가 데이터가 있는 것을 방지할 수 있습니다. 그렇게 하려면 `language_only` 파라미터를 `true`로 설정하세요.

<!-- markdownlint-disable-next-line no-space-in-code -->
선행/후행 공백이 있는 정보 문자열(예: `js `)이나 다른 내용(예: `ruby startline=3`)은 이 규칙을 트리거합니다.

근거: 언어를 지정하면 코드에 올바른 구문 강조를 사용하여 콘텐츠 렌더링이 향상됩니다. 더 많은 정보: <https://cirosantilli.com/markdown-style-guide#option-code-fenced>.

## `MD041` - 파일의 첫 번째 줄은 최상위 헤더여야 함

태그: `headings`
별칭: `first-line-h1`, `first-line-heading`
파라미터:

- `allow_preamble`: 첫 번째 헤더 앞에 내용 허용 (`boolean`, 기본값 `false`)
- `front_matter_title`: 프론트 매터의 제목을 일치시키는 정규식 (`string`, 기본값 `^\s*title\s*[:=]`)
- `level`: 헤더 레벨 (`integer`, 기본값 `1`)

이 규칙은 문서에 제목이 있는지 확인하기 위한 것이며, 문서의 첫 번째 줄이 최상위 ([HTML][HTML] `h1`) 헤더가 아닐 때 발생합니다:

```markdown
This is a document without a heading
```

이를 수정하려면 문서의 시작 부분에 최상위 헤더를 추가하세요:

```markdown
# Document Heading

This is a document with a top-level heading
```

GitHub의 프로젝트에서는 `README.md`의 헤더로 이미지를 사용하는 것이 일반적이며 Markdown에서 그 패턴이 잘 지원되지 않으므로, HTML 헤더도 이 규칙에서 허용됩니다. 예를 들어:

```markdown
<h1 align="center"><img src="https://placekitten.com/300/150"/></h1>

This is a document with a top-level HTML heading
```

어떤 경우에는 목차와 같은 텍스트가 문서의 제목 헤더 앞에 올 수 있습니다. 이는 접근성에 좋지 않지만, `allow_preamble` 파라미터를 `true`로 설정하여 허용할 수 있습니다.

```markdown
This is a document with preamble text

# Document Heading
```

[YAML][YAML] 프론트 매터가 있고 `title` 속성이 포함된 경우(블로그 포스트 등에서 흔함), 이 규칙은 위반을 보고하지 않습니다. 프론트 매터에서 다른 속성 이름을 사용하려면 `front_matter_title` 파라미터를 통해 [정규식][RegExp] 텍스트를 지정하세요. 이 규칙에서 프론트 매터 사용을 비활성화하려면 `front_matter_title`에 `""`를 지정하세요.

`level` 파라미터는 `h1`이 외부적으로 추가되는 경우 최상위 헤더를 변경(예: `h2`로)하는 데 사용할 수 있습니다.

근거: 최상위 헤더는 종종 문서의 제목 역할을 합니다. 더 많은 정보: <https://cirosantilli.com/markdown-style-guide#top-level-header>.

[HTML]: https://en.wikipedia.org/wiki/HTML
[RegExp]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions
[YAML]: https://en.wikipedia.org/wiki/YAML

## `MD042` - 빈 링크 없음

태그: `links`
별칭: `no-empty-links`

빈 링크가 발견되면 발생합니다:

```markdown
[an empty link]()
```

위반을 수정하려면 링크의 목적지를 제공하세요:

```markdown
[a valid link](https://example.com/)
```

빈 프래그먼트는 이 규칙을 트리거합니다:

```markdown
[an empty fragment](#)
```

하지만 비어 있지 않은 프래그먼트는 트리거하지 않습니다:

```markdown
[a valid fragment](#fragment)
```

근거: 빈 링크는 어디로도 연결되지 않으므로 링크로서 제기능을 하지 못합니다.

## `MD043` - 필수 헤더 구조

태그: `headings`
별칭: `required-headings`
파라미터:

- `headings`: 헤더 목록 (`string[]`, 기본값 `[]`)
- `match_case`: 헤더의 대소문자 일치 (`boolean`, 기본값 `false`)

파일의 헤더가 규칙에 전달된 헤더 배열과 일치하지 않을 때 발생합니다. 일련의 파일에 대해 표준 헤더 구조를 강제하는 데 사용할 수 있습니다.

다음 구조를 정확히 요구하려면:

```markdown
# Heading
## Item
### Detail
```

`headings` 파라미터를 다음과 같이 설정하세요:

```json
[
    "# Heading",
    "## Item",
    "### Detail"
]
```

다음 구조와 같이 선택적 헤더를 허용하려면:

```markdown
# Heading
## Item
### Detail (optional)
## Foot
### Notes (optional)
```

"0개 이상의 지정되지 않은 헤더"를 의미하는 특수 값 `"*"` 또는 "1개 이상의 지정되지 않은 헤더"를 의미하는 특수 값 `"+"`를 사용하고 `headings` 파라미터를 다음과 같이 설정하세요:

```json
[
    "# Heading",
    "## Item",
    "*",
    "## Foot",
    "*"
]
```

프로젝트 이름과 같이 하나의 필수 헤더가 변경되는 것을 허용하려면:

```markdown
# Project Name
## Description
## Examples
```

"정확히 하나의 지정되지 않은 헤더"를 의미하는 특수 값 `"?"`를 사용하세요:

```json
[
    "?",
    "## Description",
    "## Examples"
]
```

오류가 감지되면 이 규칙은 첫 번째 문제가 되는 헤더의 줄 번호를 출력합니다 (그렇지 않으면 파일의 마지막 줄 번호를 출력합니다).

`headings` 파라미터는 단순함을 위해 "## Text" ATX 헤더 스타일을 사용하지만, 파일은 지원되는 모든 헤더 스타일을 사용할 수 있습니다.

기본적으로 문서의 헤더 대소문자는 `headings`의 대소문자와 일치할 필요가 없습니다. 대소문자가 정확히 일치하도록 요구하려면 `match_case` 파라미터를 `true`로 설정하세요.

근거: 프로젝트는 유사한 콘텐츠 세트 전반에 걸쳐 일관된 문서 구조를 강제하고 싶을 수 있습니다.

## `MD044` - 고유 명사의 대문자 표기가 올바르게 되어야 함

태그: `spelling`
별칭: `proper-names`
파라미터:

- `code_blocks`: 코드 블록 포함 (`boolean`, 기본값 `true`)
- `html_elements`: HTML 요소 포함 (`boolean`, 기본값 `true`)
- `names`: 고유 명사 목록 (`string[]`, 기본값 `[]`)
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

`names` 배열의 문자열 중 지정된 대문자 표기를 따르지 않는 것이 있을 때 발생합니다. 프로젝트나 제품 이름의 표준 대소문자 표기를 강제하는 데 사용할 수 있습니다.

예를 들어, "JavaScript" 언어는 보통 'J'와 'S'를 모두 대문자로 씁니다 - 때로는 's'나 'j'가 소문자로 나타나기도 합니다. 올바른 대문자 표기를 강제하려면 `names` 배열에 원하는 대소문자 표기를 지정하세요:

```json
[
    "JavaScript"
]
```

때로는 고유 명사가 특정 문맥에서 다르게 대문자로 표기되기도 합니다. 그런 경우 `names` 배열에 두 가지 형태를 모두 추가하세요:

```json
[
    "GitHub",
    "github.com"
]
```

코드 블록과 스팬에 대해 이 규칙을 비활성화하려면 `code_blocks` 파라미터를 `false`로 설정하세요. HTML 요소 및 속성(`a`/`href` 또는 `img`/`src`의 경로 일부로 고유 명사를 사용하는 경우 등)에 대해 이 규칙을 비활성화하려면 `html_elements` 파라미터를 `false`로 설정하세요.

근거: 고유 명사의 잘못된 대문자 표기는 보통 실수입니다.

## `MD045` - 이미지에는 대체 텍스트(alt text)가 있어야 함

태그: `accessibility`, `images`
별칭: `no-alt-text`

이미지에 대체 텍스트(alt text) 정보가 누락되었을 때 발생합니다.

대체 텍스트는 보통 다음과 같이 인라인으로 지정됩니다:

```markdown
![Alternate text](image.jpg)
```

또는 참조 구문으로:

```markdown
![Alternate text][ref]

...

[ref]: image.jpg "Optional title"
```

또는 HTML로:

```html
<img src="image.jpg" alt="Alternate text" />
```

참고: [HTML `aria-hidden` 속성][aria-hidden]을 사용하여 보조 기술에서 이미지를 숨기는 경우, 이 규칙은 위반을 보고하지 않습니다:

```html
<img src="image.jpg" aria-hidden="true" />
```

대체 텍스트 작성에 대한 지침은 [W3C][w3c], [Wikipedia][wikipedia], 그리고 [다른 곳][phase2technology]에서 확인할 수 있습니다.

근거: 대체 텍스트는 접근성에 중요하며 이미지를 볼 수 없는 사람들에게 이미지의 내용을 설명합니다.

[aria-hidden]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-hidden
[phase2technology]: https://www.phase2technology.com/blog/no-more-excuses
[w3c]: https://www.w3.org/WAI/alt/
[wikipedia]: https://en.wikipedia.org/wiki/Alt_attribute

## `MD046` - 코드 블록 스타일

태그: `code`
별칭: `code-block-style`
파라미터:

- `style`: 블록 스타일 (`string`, 기본값 `consistent`, 값: `consistent` / `fenced` / `indented`)

문서 내에서 원치 않거나 서로 다른 코드 블록 스타일이 사용될 때 발생합니다.

기본 설정에서 이 규칙은 다음 문서에 대해 위반을 보고합니다:

<!-- markdownlint-disable code-block-style -->

    Some text.

        # Indented code

    More text.

    ```ruby
    # Fenced code
    ```

    More text.

<!-- markdownlint-restore -->

이 규칙의 위반을 수정하려면 일관된 스타일(들여쓰기 또는 코드 펜스)을 사용하세요.

구성된 코드 블록 스타일은 구체적(`fenced`, `indented`)이거나 모든 코드 블록이 첫 번째 코드 블록과 일치하도록(`consistent`) 요구할 수 있습니다.

근거: 일관된 서식은 문서를 이해하기 쉽게 만듭니다.

## `MD047` - 파일은 하나의 개행 문자로 끝나야 함

태그: `blank_lines`
별칭: `single-trailing-newline`
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

파일 끝에 하나의 개행 문자가 없을 때 발생합니다.

규칙을 트리거하는 예시:

```markdown
# Heading

This file ends without a newline.[EOF]
```

위반을 수정하려면 파일 끝에 개행 문자를 추가하세요:

```markdown
# Heading

This file ends with a newline.
[EOF]
```

근거: 일부 프로그램은 개행 문자로 끝나지 않는 파일을 처리하는 데 문제가 있습니다.

더 많은 정보: [파일 끝에 새로운 줄을 추가하는 이유는 무엇인가요?][stack-exchange]

[stack-exchange]: https://unix.stackexchange.com/questions/18743/whats-the-point-in-adding-a-new-line-to-the-end-of-a-file

## `MD048` - 코드 펜스 스타일

태그: `code`
별칭: `code-fence-style`
파라미터:

- `style`: 코드 펜스 스타일 (`string`, 기본값 `consistent`, 값: `backtick` / `consistent` / `tilde`)

문서에서 펜스 코드 블록에 사용된 기호가 구성된 코드 펜스 스타일과 일치하지 않을 때 발생합니다:

````markdown
```ruby
# Fenced code
```

~~~ruby
# Fenced code
~~~
````

이 문제를 해결하려면 문서 전체에서 구성된 코드 펜스 스타일을 사용하세요:

````markdown
```ruby
# Fenced code
```

```ruby
# Fenced code
```
````

구성된 코드 펜스 스타일은 특정 기호(`backtick`, `tilde`)를 사용하거나 모든 코드 펜스가 첫 번째 코드 펜스와 일치하도록(`consistent`) 요구할 수 있습니다.

근거: 일관된 서식은 문서를 이해하기 쉽게 만듭니다.

## `MD049` - 강조 스타일

태그: `emphasis`
별칭: `emphasis-style`
파라미터:

- `style`: 강조 스타일 (`string`, 기본값 `consistent`, 값: `asterisk` / `consistent` / `underscore`)
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

문서에서 강조 표시에 사용된 기호가 구성된 강조 스타일과 일치하지 않을 때 발생합니다:

```markdown
*Text*
_Text_
```

이 문제를 해결하려면 문서 전체에서 구성된 강조 스타일을 사용하세요:

```markdown
*Text*
*Text*
```

구성된 강조 스타일은 특정 기호(`asterisk`, `underscore`)를 사용하거나 모든 강조가 첫 번째 강조와 일치하도록(`consistent`) 요구할 수 있습니다.

참고: 단어 내부의 강조는 `underscore`가 포함된 단어(예: like_this_one)에 원치 않는 강조가 적용되는 것을 피하기 위해 `asterisk`로 제한됩니다.

근거: 일관된 서식은 문서를 이해하기 쉽게 만듭니다.

## `MD050` - 굵게(Strong) 스타일

태그: `emphasis`
별칭: `strong-style`
파라미터:

- `style`: 굵게 스타일 (`string`, 기본값 `consistent`, 값: `asterisk` / `consistent` / `underscore`)
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

문서에서 굵게 표시에 사용된 기호가 구성된 스타일과 일치하지 않을 때 발생합니다:

```markdown
**Text**
__Text__
```

이 문제를 해결하려면 문서 전체에서 구성된 굵게 스타일을 사용하세요:

```markdown
**Text**
**Text**
```

구성된 굵게 스타일은 특정 기호(`asterisk`, `underscore`)를 사용하거나 모든 굵게 표시가 첫 번째 굵게 표시와 일치하도록(`consistent`) 요구할 수 있습니다.

참고: 단어 내부의 강조는 `underscore`가 포함된 단어(예: like__this__one)에 원치 않는 강조가 적용되는 것을 피하기 위해 `asterisk`로 제한됩니다.

근거: 일관된 서식은 문서를 이해하기 쉽게 만듭니다.

## `MD051` - 링크 프래그먼트는 유효해야 함

태그: `links`
별칭: `link-fragments`
파라미터:

- `ignore_case`: 프래그먼트 대소문자 무시 (`boolean`, 기본값 `false`)
- `ignored_pattern`: 추가 프래그먼트를 무시하기 위한 패턴 (`string`, 기본값 ``)
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

링크 프래그먼트가 문서의 헤더에 대해 자동으로 생성된 프래그먼트와 일치하지 않을 때 발생합니다:

```markdown
# Heading Name

[Link](#fragment)
```

이 문제를 해결하려면 링크 프래그먼트를 기존 헤더의 생성된 이름(아래 참조)을 참조하도록 변경하세요:

```markdown
# Heading Name

[Link](#heading-name)
```

일관성을 위해 이 규칙은 프래그먼트가 문자를 소문자로 변환하는 [GitHub 헤더 알고리즘][github-heading-algorithm]과 정확히 일치할 것을 요구합니다. 따라서 다음 예시는 위반으로 보고됩니다:

```markdown
# Heading Name

[Link](#Heading-Name)
```

헤더 이름과 프래그먼트를 비교할 때 대소문자를 무시하려면 `ignore_case` 파라미터를 `true`로 설정할 수 있습니다. 이 구성에서는 이전 예시가 위반으로 보고되지 않습니다.

또는, 일부 플랫폼에서는 헤더 내에서 `{#named-anchor}` 구문을 사용하여 특정 이름(소문자, 숫자, `-`, `_`로만 구성)을 제공할 수 있습니다:

```markdown
# Heading Name {#custom-name}

[Link](#custom-name)
```

또는, `id` 속성이 있는 HTML 태그나 `name` 속성이 있는 `a` 태그를 사용하여 프래그먼트를 정의할 수 있습니다:

```markdown
<a id="bookmark"></a>

[Link](#bookmark)
```

`a` 태그는 헤더가 적절하지 않거나 프래그먼트 식별자의 텍스트를 제어해야 하는 시나리오에서 유용할 수 있습니다.

[HTML 링크 `#top`은 문서의 맨 위로 스크롤합니다][html-top-fragment]. 이 규칙은 해당 구문을 허용합니다 (일관성을 위해 소문자 사용):

```markdown
[Link](#top)
```

이 규칙은 또한 GitHub에서 [문서의 특정 콘텐츠][github-linking-to-content]를 강조하기 위해 사용하는 사용자 지정 프래그먼트 구문을 인식합니다.

예를 들어, 20번째 줄로 연결되는 링크:

```markdown
[Link](#L20)
```

그리고 19번째 줄에서 시작하여 21번째 줄로 이어지는 콘텐츠로 연결되는 링크:

```markdown
[Link](#L19C5-L21C11)
```

일부 Markdown 생성기는 문서를 빌드할 때, 예를 들어 `figure-`와 같은 고정 접두사와 증가하는 숫자 카운터를 결합하여 헤더를 동적으로 생성하고 삽입합니다. 이러한 생성된 프래그먼트를 무시하려면 `ignored_pattern` [정규식][RegEx] 파라미터를 일치하는 패턴(예: `^figure-`)으로 설정하세요.

근거: [GitHub 섹션 링크][github-section-links]는 Markdown 콘텐츠가 GitHub에 표시될 때 모든 헤더에 대해 자동으로 생성됩니다. 이를 통해 문서 내의 다른 섹션으로 직접 링크하기가 쉽습니다. 그러나 헤더의 이름이 변경되거나 제거되면 섹션 링크가 변경됩니다. 이 규칙은 문서 내의 깨진 섹션 링크를 식별하는 데 도움이 됩니다.

참고: 섹션 링크는 CommonMark 사양의 일부가 **아닙니다**. 이 규칙은 [GitHub 헤더 알고리즘][github-heading-algorithm]을 강제합니다:

1. 텍스트를 소문자로 변환
2. 구두점 문자 제거
3. 공백을 대시로 변환
4. 증가하는 정수 추가 (고유성을 위해 필요한 경우)
5. 결과 [URI 인코딩][encodeURIComponent]

[encodeURIComponent]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
[github-section-links]: https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#section-links
[github-heading-algorithm]: https://github.com/gjtorikian/html-pipeline/blob/f13a1534cb650ba17af400d1acd3a22c28004c09/lib/html/pipeline/toc_filter.rb
[github-linking-to-content]: https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-a-permanent-link-to-a-code-snippet#linking-to-markdown
[html-top-fragment]: https://html.spec.whatwg.org/multipage/browsing-the-web.html#scrolling-to-a-fragment
[RegEx]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions

## `MD052` - 참조 링크와 이미지는 정의된 레이블을 사용해야 함

태그: `images`, `links`
별칭: `reference-links-images`
파라미터:

- `ignored_labels`: 무시된 링크 레이블 (`string[]`, 기본값 `["x"]`)
- `shortcut_syntax`: 단축 구문 포함 (`boolean`, 기본값 `false`)

Markdown의 링크와 이미지는 사용 시점에 링크 목적지나 이미지 소스를 제공하거나, 다른 곳에 정의하고 레이블을 사용하여 참조할 수 있습니다. 참조 형식은 문단 텍스트를 깔끔하게 유지하고 같은 URL을 여러 곳에서 재사용하기 쉽게 해줍니다.

참조 링크와 이미지에는 세 가지 종류가 있습니다:

```markdown
Full: [text][label]
Collapsed: [label][]
Shortcut: [label]

Full: ![text][image]
Collapsed: ![image][]
Shortcut: ![image]

[label]: https://example.com/label
[image]: https://example.com/image
```

링크나 이미지는 해당 레이블이 정의되어 있을 때 올바르게 렌더링되지만, 레이블이 없으면 괄호가 포함된 텍스트로 표시됩니다. 기본적으로 이 규칙은 "full" 및 "collapsed" 참조 구문에 대해 정의되지 않은 레이블을 경고하지만, "shortcut" 구문은 모호하기 때문에 경고하지 않습니다.

텍스트 `[example]`은 단축 링크일 수도 있고 괄호 안의 텍스트 "example"일 수도 있으므로, "shortcut" 구문은 기본적으로 무시됩니다. "shortcut" 구문을 포함하려면 `include_shortcut` 파라미터를 `true`로 설정하세요. 그렇게 하면 문서 내에서 단축 링크가 *될 수 있는* *모든* 텍스트에 대해 경고가 생성됩니다. 괄호로 묶인 텍스트가 의도된 경우, `\` 문자로 괄호를 이스케이프할 수 있습니다: `\[example\]`.

의도적으로 참조되지 않은 링크 레이블이 있는 경우, `ignored_labels` 파라미터에 무시할 문자열 목록을 설정하여 무시할 수 있습니다. 이 파라미터의 기본값은 [GitHub Flavored Markdown 작업 목록 항목][gfm-tasklist]에서 사용되는 체크박스 구문을 무시합니다:

```markdown
- [x] Checked task list item
```

[gfm-tasklist]: https://github.github.com/gfm/#task-list-items-extension-

## `MD053` - 링크 및 이미지 참조 정의는 필요해야 함

태그: `images`, `links`
별칭: `link-image-reference-definitions`
파라미터:

- `ignored_definitions`: 무시된 정의 (`string[]`, 기본값 `["//"]`)
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

Markdown의 링크와 이미지는 사용 시점에 링크 목적지나 이미지 소스를 제공하거나, 문서의 다른 곳에 있는 정의를 참조하는 레이블을 사용할 수 있습니다. 후자의 참조 형식은 문단 텍스트를 깔끔하게 유지하고 같은 URL을 여러 곳에서 재사용하기 쉽게 해줍니다.

링크 및 이미지 참조 정의는 사용되는 곳과 별도로 위치하므로, 정의가 불필요한 두 가지 시나리오가 있습니다:

1. 레이블이 문서의 어떤 링크이나 이미지에서도 참조되지 않는 경우, 해당 정의는 사용되지 않으므로 삭제할 수 있습니다.
2. 레이블이 문서 내에서 여러 번 정의된 경우, 첫 번째 정의가 사용되며 나머지는 삭제할 수 있습니다.

이 규칙은 링크나 이미지 참조가 해당 레이블을 가지고 있을 때 참조 정의가 사용된 것으로 간주합니다. "full", "collapsed", 및 "shortcut" 형식이 모두 지원됩니다.

의도적으로 참조되지 않은 참조 정의가 있는 경우, `ignored_definitions` 파라미터에 무시할 문자열 목록을 설정하여 무시할 수 있습니다. 이 파라미터의 기본값은 Markdown에 비 HTML 주석을 추가하기 위한 다음 관례를 무시합니다:

```markdown
[//]: # (This behaves like a comment)
```

## `MD054` - 링크 및 이미지 스타일

태그: `images`, `links`
별칭: `link-image-style`
파라미터:

- `autolink`: 자동 링크 허용 (`boolean`, 기본값 `true`)
- `collapsed`: 축소된 참조 링크 및 이미지 허용 (`boolean`, 기본값 `true`)
- `full`: 전체 참조 링크 및 이미지 허용 (`boolean`, 기본값 `true`)
- `inline`: 인라인 링크 및 이미지 허용 (`boolean`, 기본값 `true`)
- `shortcut`: 단축 참조 링크 및 이미지 허용 (`boolean`, 기본값 `true`)
- `url_inline`: 인라인 링크로서의 URL 허용 (`boolean`, 기본값 `true`)
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

Markdown의 링크와 이미지는 사용 시점에 링크 목적지나 이미지 소스를 제공하거나, 문서의 다른 곳에 있는 정의를 참조하는 레이블을 사용할 수 있습니다. 세 가지 참조 형식은 문단 텍스트를 깔끔하게 유지하고 같은 URL을 여러 곳에서 재사용하기 쉽게 해줍니다.

기본적으로 이 규칙은 모든 링크/이미지 스타일을 허용합니다.

`autolink` 파라미터를 `false`로 설정하면 자동 링크를 비활성화합니다:

```markdown
<https://example.com>
```

`inline` 파라미터를 `false`로 설정하면 인라인 링크와 이미지를 비활성화합니다:

```markdown
[link](https://example.com)

![image](https://example.com)
```

`full` 파라미터를 `false`로 설정하면 전체 참조 링크와 이미지를 비활성화합니다:

```markdown
[link][url]

![image][url]

[url]: https://example.com
```

`collapsed` 파라미터를 `false`로 설정하면 축소된 참조 링크와 이미지를 비활성화합니다:

```markdown
[url][]

![url][]

[url]: https://example.com
```

`shortcut` 파라미터를 `false`로 설정하면 단축 참조 링크와 이미지를 비활성화합니다:

```markdown
[url]

![url]

[url]: https://example.com
```

이 규칙의 위반을 수정하려면 링크나 이미지를 허용된 스타일을 사용하도록 변경하세요. 이 규칙은 링크나 이미지가 `inline` 스타일(선호됨)로 변환될 수 있거나, 링크가 `autolink` 스타일(이미지를 지원하지 않으며 절대 URL이어야 함)로 변환될 수 있을 때 위반을 자동으로 수정할 수 있습니다. 이 규칙기는 `full`, `collapsed`, 또는 `shortcut` 참조 스타일로 링크나 이미지를 변환해야 하는 시나리오는 수정하지 *않습니다*. 이는 참조의 이름을 지정하고 문서 내 어디에 삽입할지 결정해야 하기 때문입니다.

`url_inline` 파라미터를 `false`로 설정하면 제목 없이 동일한 절대 URL 텍스트/목적지를 가진 인라인 링크의 사용을 방지합니다. 이러한 링크는 자동 링크로 변환될 수 있기 때문입니다:

```markdown
[https://example.com](https://example.com)
```

`url_inline` 위반을 수정하려면 대신 더 간단한 자동 링크 구문을 사용하세요:

```markdown
<https://example.com>
```

근거: 일관된 서식은 문서를 이해하기 쉽게 만듭니다. 자동 링크는 간결하지만 URL로 표시되어 길고 혼란스러울 수 있습니다. 인라인 링크와 이미지는 설명 텍스트를 포함할 수 있지만 Markdown 형식에서 더 많은 공간을 차지합니다. 참조 링크와 이미지는 Markdown 형식에서 읽고 조작하기 더 쉬울 수 있지만 별도의 링크 참조 정의가 필요합니다.

## `MD055` - 표 파이프 스타일

태그: `table`
별칭: `table-pipe-style`
파라미터:

- `style`: 표 파이프 스타일 (`string`, 기본값 `consistent`, 값: `consistent` / `leading_and_trailing` / `leading_only` / `no_leading_or_trailing` / `trailing_only`)

[GitHub Flavored Markdown 표][gfm-table-055]가 선행 및 후행 파이프 문자(`|`) 사용에 있어 일관성이 없을 때 발생합니다.

기본적으로(`consistent` 스타일), 문서의 첫 번째 표의 헤더 행이 문서 내 모든 표에 적용되는 스타일을 결정하는 데 사용됩니다. 대신 특정 스타일(`leading_and_trailing`, `leading_only`, `no_leading_or_trailing`, `trailing_only`)을 사용할 수도 있습니다.

다음 표의 헤더 행에는 선행 및 후행 파이프가 있지만, 구분 행에는 후행 파이프가 없고 셀의 첫 번째 행에는 선행 파이프가 없습니다:

```markdown
| Header | Header |
| ------ | ------
  Cell   | Cell   |
```

이 문제를 해결하려면 모든 행의 시작과 끝에 파이프 문자가 있는지 확인하세요:

```markdown
| Header | Header |
| ------ | ------ |
| Cell   | Cell   |
```

표 바로 뒤에 오는 텍스트(즉, 빈 줄로 분리되지 않은 텍스트)는 (사양에 따라) 표의 일부로 취급되어 이 규칙을 트리거할 수도 있습니다:

```markdown
| Header | Header |
| ------ | ------ |
| Cell   | Cell   |
This text is part of the table
```

근거: 일부 파서는 선행 또는 후행 파이프 문자가 누락된 표를 처리하는 데 어려움이 있습니다. 선행/후행 파이프를 사용하면 시각적 명확성을 제공하는 데 도움이 될 수 있습니다.

[gfm-table-055]: https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/organizing-information-with-tables

## `MD056` - 표 열 개수

태그: `table`
별칭: `table-column-count`

[GitHub Flavored Markdown 표][gfm-table-056]의 모든 행에 동일한 수의 셀이 없을 때 발생합니다.

다음 표의 두 번째 데이터 행은 셀 개수가 너무 적고, 세 번째 데이터 행은 셀 개수가 너무 많습니다:

```markdown
| Header | Header |
| ------ | ------ |
| Cell   | Cell   |
| Cell   |
| Cell   | Cell   | Cell   |
```

이 문제를 해결하려면 모든 행의 셀 개수가 동일한지 확인하세요:

```markdown
| Header | Header |
| ------ | ------ |
| Cell   | Cell   |
| Cell   | Cell   |
| Cell   | Cell   |
```

표의 헤더 행과 구분 행은 셀 개수가 같아야 하며, 그렇지 않으면 (사양에 따라) 표로 인식되지 않습니다.

근거: 행에 잉여 셀이 있으면 보통 표시되지 않아 데이터가 손실됩니다. 행에 셀이 부족하면 표에 구멍이 생기고 누락이 있음을 시사합니다.

[gfm-table-056]: https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/organizing-information-with-tables

## `MD058` - 표는 빈 줄로 둘러싸여야 함

태그: `table`
별칭: `blanks-around-tables`
수정 가능 여부: 일부 위반 사항은 도구로 수정 가능

표 앞이나 뒤에 빈 줄이 없을 때 발생합니다:

```markdown
Some text
| Header | Header |
| ------ | ------ |
| Cell   | Cell   |
> Blockquote
```

이 규칙의 위반을 수정하려면 모든 표의 앞뒤에 빈 줄이 있는지 확인하세요(표가 문서의 맨 처음이나 맨 끝에 있는 경우 제외):

```markdown
Some text

| Header | Header |
| ------ | ------ |
| Cell   | Cell   |

> Blockquote
```

표 바로 뒤에 오는 텍스트(즉, 빈 줄로 분리되지 않은 텍스트)는 (사양에 따라) 표의 일부로 취급되어 이 규칙을 트리거하지 않습니다:

```markdown
| Header | Header |
| ------ | ------ |
| Cell   | Cell   |
This text is part of the table and the next line is blank

Some text
```

근거: 미적인 이유 외에도, 일부 파서는 앞뒤에 빈 줄이 없는 표를 올바르지 않게 파싱합니다.

## `MD059` - 링크 텍스트는 설명적이어야 함

태그: `accessibility`, `links`
별칭: `descriptive-link-text`
파라미터:

- `prohibited_texts`: 금지된 링크 텍스트 (`string[]`, 기본값 `["click here","here","link","more"]`)

링크에 `[click here](...)`나 `[link](...)`와 같은 일반적인 텍스트가 있을 때 발생합니다.

링크 텍스트는 설명적이어야 하며 링크의 목적을 전달해야 합니다(예: `[Download the budget document](...)` 또는 `[CommonMark Specification](...)`). 이는 맥락 없이 링크를 제공하는 화면 낭독기 사용자에게 특히 중요합니다.

기본적으로 이 규칙은 소수의 일반적인 영어 단어/구문의 사용을 금지합니다. 단어/구문 목록을 사용자 지정하려면 `prohibited_texts` 파라미터를 `string`의 `Array`로 설정하세요.

참고: 영어가 아닌 언어의 경우 `prohibited_texts` 파라미터를 사용하여 해당 언어에 대한 목록을 사용자 지정하세요. 이 규칙이 모든 언어에 대한 번역을 갖는 것은 목표가 *아닙니다*.

참고: 이 규칙은 Markdown 링크를 확인하며, HTML 링크는 무시됩니다.

더 많은 정보:

- <https://webaim.org/techniques/hypertext/>
- <https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-link-only.html>

## `MD060` - 표 열 스타일

태그: `table`
별칭: `table-column-style`
파라미터:

- `aligned_delimiter`: 구분선 열 정렬 (`boolean`, 기본값 `false`)
- `style`: 표 열 스타일 (`string`, 기본값 `any`, 값: `aligned` / `any` / `compact` / `tight`)

[GitHub Flavored Markdown 표][gfm-table-060]의 열 구분 파이프 문자(`|`)가 일관되지 않게 사용될 때 발생합니다.

이 규칙은 널리 사용되는 세 가지 표 열 스타일을 인식합니다.

`aligned` 스타일은 파이프 문자가 수직으로 정렬되도록 합니다:

```markdown
| Character | Meaning |
| --------- | ------- |
| Y         | Yes     |
| N         | No      |
```

`aligned` 스타일은 셀 내용을 무시하므로 다음도 유효합니다:

```markdown
| Character | Meaning |
|-----------|---------|
|     Y     |     Yes |
|     N     |      No |
```

`compact` 스타일은 셀 내용 주위에 단일 공백만 사용하여 추가 패딩을 피합니다:

```markdown
| Character | Meaning |
| --- | --- |
| Y | Yes |
| N | No |
```

`tight` 스타일은 셀 내용에 패딩을 전혀 사용하지 않습니다:

```markdown
|Character|Meaning|
|---|---|
|Y|Yes|
|N|No|
```

이 규칙의 `style` 파라미터가 `aligned`, `compact`, 또는 `tight`로 설정되면, 모든 표가 해당 패턴과 일치해야 하며 위반 사항이 보고됩니다. 기본값으로, 또는 `any` 스타일이 사용되면, 각 표가 지원되는 스타일 중 하나를 충족하는지 분석합니다. 그렇다면 위반 사항이 보고되지 않습니다. 그렇지 않으면 *가장 적은* 이슈를 발생시키는 스타일(즉, 가장 가까운 일치 스타일)에 대해 위반 사항이 보고됩니다.

`aligned_delimiter` 파라미터를 `true`로 설정하면 구분 행의 파이프 문자가 헤더 행의 파이프 문자와 정렬되어야 합니다. 이는 `compact` 및 `tight` 표와 함께 사용하여 헤더 텍스트를 더 명확하게 만드는 데 사용할 수 있습니다. (`aligned` 스타일 표의 경우 이미 필수입니다.)

`aligned_delimiter`가 있는 `compact` 스타일:

```markdown
| Character | Meaning |
| --------- | ------- |
| Y | Yes |
| N | No |
```

`aligned_delimiter`가 있는 `tight` 스타일:

```markdown
|Character|Meaning|
|---------|-------|
|Y|Yes|
|N|No|
```

**참고**: 이 규칙은 선행/후행 파이프 문자를 요구하지 않으므로, 다음도 `compact` 스타일에 유효한 표입니다:

```markdown
Character | Meaning
--- | ---
Y | Yes
N | No
```

**참고**: `aligned` 스타일에 대한 파이프 정렬은 문자 수가 아닌 시각적 모양을 기반으로 합니다. 편집기는 일반적으로 [이모티콘][emoji]과 [CJK 문자][cjk-characters]를 [라틴 문자][latin-script] 너비의 *두 배*로 렌더링하므로, 이 규칙은 `aligned` 스타일을 사용하는 표에 대해 이를 고려합니다. 다음 표는 올바르게 서식이 지정되었으며 대부분의 편집기와 고정폭 글꼴에서 정렬된 상태로 나타납니다:

<!-- markdownlint-capture -->
<!-- markdownlint-disable extended-ascii -->

```markdown
| Response | Emoji |
| -------- | ----- |
| Yes      | ✅    |
| No       | ❎    |
```

<!-- markdownlint-restore -->

근거: 일관된 서식은 문서를 이해하기 쉽게 만듭니다.

[cjk-characters]: https://en.wikipedia.org/wiki/CJK_characters
[emoji]: https://en.wikipedia.org/wiki/Emoji
[gfm-table-060]: https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/organizing-information-with-tables
[latin-script]: https://en.wikipedia.org/wiki/Latin_script
