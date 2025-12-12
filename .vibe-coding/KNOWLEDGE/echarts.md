# ECharts v6.0.0 주요 아키텍처 변화 및 마이그레이션 가이드

ECharts는 2024년 12월의 **v5.6.0 (v5 최종 기능 릴리스)**&#8203;과 2025년 7월의 **v6.0.0 (메이저 버전)** 출시를 통해, **'레이아웃 자동 보정'**과 **'시각 스타일의 현대화'**를 핵심 목표로 아키텍처를 재정비했습니다. v6.0.0으로의 마이그레이션은 차트의 기본 테마, 위치, 스타일 상속 방식을 근본적으로 변경하여 기존 옵션에 기대던 프로젝트에 직접적인 브레이킹 체인지를 유발합니다.

---

## 1. Executive Summary: 핵심 아키텍처 변화 (v6.0.0)

| 영역                  | 핵심 변경 (Critical Change)                                                         | 영향도 | 대체 전략                                                                                       |
| :-------------------- | :---------------------------------------------------------------------------------- | :----- | :---------------------------------------------------------------------------------------------- |
| **Theme & Layout**    | **새로운 기본 테마 및 자동 레이아웃 활성화** (`legend` 위치, 축 이름 겹침 방지 등). | 높음   | `theme: 'v5'`를 명시하거나, `grid.outerBoundsMode: 'none'`으로 이전 동작 복원.                  |
| **Coordinate System** | **`matrix` 좌표계, `chord` 시리즈, `axis break`** 등 새 시각화 개념 도입.           | 중간   | 복잡한 대시보드(Small-Multiples) 설계 시 새로운 `matrix` 좌표계를 활용.                         |
| **Positioning**       | **`center` 퍼센트 기준 변경** (Geo/Map/Graph/Tree).                                 | 높음   | `legacyViewCoordSysCenterBase: true`로 이전 동작 복원 후, 새 기준에 맞게 값 재조정.             |
| **Rich Label**        | **rich 스타일 상속 방식 변경** (기본 라벨 스타일 상속).                             | 중간   | rich 스타일을 사용할 때 폰트 속성을 명시적으로 덮어쓰거나, `richInheritPlainLabel: false` 설정. |
| **API Deprecation**   | `BarSeriesOption.startValue` TS 타입에서 제거.                                      | 중간   | 해당 옵션 사용 중단. 축 범위(`min/max`) 또는 데이터 값 자체 조정으로 대체.                      |

---

## 2. Critical Action Items: v5 → v6 마이그레이션 필수 항목

### 2-1. 레이아웃 및 스타일 복원 전략 (필수)

v6.0.0으로 업그레이드 시, 기존 v5에서 명시적인 설정을 하지 않은 차트의 **디자인이 변경**될 수 있습니다.

- **테마 및 위치 복원:** v5의 시각 스타일을 유지하려면 차트 초기화 시 **`echarts.init(dom, 'v5')`** 또는 옵션 루트에서 **`theme: 'v5'`**를 명시해야 합니다.
- **중심점 재조정 (Geo/Map):** 지도나 그래프의 `center` 퍼센트값이 v6에서 다른 기준으로 동작합니다. 기존에 픽셀 단위로 위치를 튜닝했다면, **옵션 루트에 `legacyViewCoordSysCenterBase: true`를 임시로 설정**하고 새 기준에 맞춰 `center` 값을 재조정해야 합니다.

### 2-2. Rich Label 및 API 변경

- **Rich Style 상속:** 라벨의 Rich Text 스타일(`textStyle`, `font*`)은 이제 일반 라벨 스타일을 상속합니다. 의도치 않게 스타일이 겹치는 경우, `richInheritPlainLabel: false`를 설정하여 명시적 상속을 끊거나, rich 스타일 블록 내에서 폰트 속성을 직접 재정의해야 합니다.
- **Bar 시리즈 수정:** `BarSeriesOption.startValue`를 사용하던 코드는 TypeScript 컴파일 에러를 유발합니다. 이 옵션을 제거하고 `xAxis/yAxis.min` 또는 데이터 값 조정으로 기능을 대체하십시오.

### 2-3. GeoJSON 스타일 레이어링 (v5.6.0)

GeoJSON 데이터를 활용하는 경우, v5.6.0부터 GeoJSON 파일 자체에 `features[].properties.echartsStyle`을 추가하여 기본 스타일을 정의할 수 있습니다. **시리즈 옵션은 이 GeoJSON 스타일을 덮어쓰는(override) 상위 레이어**로 동작합니다. GeoJSON 파일과 ECharts 옵션 간의 스타일 정의를 레이어링하여 관리 효율성을 높이십시오.

---

## 3. Strategic Adoption: 도입해야 할 신규 패턴

- **Matrix 좌표계:** 다양한 데이터셋의 비교 대시보드(Small-Multiples)를 만들 때, 새로운 `matrix` 좌표계를 활용하여 여러 작은 차트들을 표 형태의 레이아웃에 효율적으로 배치할 수 있습니다.
- **고급 제어:** 마커(`markPoint/markLine/markArea`)에 `z`, `z2` 옵션을 사용하여 렌더링 깊이를 세밀하게 제어하거나, `tooltip.displayTransition` 옵션으로 툴팁 UX를 미세 조정할 수 있습니다.
- **데이터 스토리텔링:** 축 중간을 끊어서 보여주는 `axis break`나 카테고리형 산점도의 겹침을 줄이는 `scatter.jitter` 옵션을 활용하여 데이터 시각화의 정확성과 가독성을 높이십시오.

---

## 4. Conclusion

ECharts v6.0.0은 **자동 레이아웃**과 **새로운 테마**를 통해 차트의 품질을 향상시켰습니다. **기존 스타일 복원(v5 테마 사용)**&#8203;을 마이그레이션의 첫 단계로 설정하고, **matrix 좌표계** 및 **새로운 rich 스타일 상속 방식**에 맞춰 코드를 업데이트하는 것이 중요합니다.
