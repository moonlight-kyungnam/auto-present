---
name: fragment-order-calculator
description: |
  각 슬라이드 타입의 구성 요소와 나레이션 글자수를 기반으로
  fragmentOrder 배열과 Remotion 프레임 타이밍을 자동 계산합니다.
  사용 시점: SlideAgent가 slides-data.json의 fragmentOrder를 결정할 때 호출합니다.
---

# fragment-order-calculator 스킬

## 기능 설명

슬라이드 타입별 기본 fragmentOrder 패턴을 적용하고,
나레이션 글자수 비율 기반으로 Remotion 프레임 등장 타이밍을 계산합니다.

## 슬라이드 타입별 기본 fragmentOrder 패턴

```javascript
const FRAGMENT_PATTERNS = {
  cover:     ["badge", "title", "subtitle", "description", "meta"],
  toc:       ["title", "items[0]", "items[1]", "items[2]", "items[3]"],
  stats:     ["title", "stats[0]", "stats[1]", "stats[2]", "callout", "source"],
  table:     ["title", "headers", "rows[0]", "rows[1]", "rows[2]", "callout"],
  concept:   ["title", "definition", "keywords[0]", "keywords[1]", "keywords[2]"],
  formula:   ["title", "formula", "variables[0]", "variables[1]", "variables[2]"],
  example:   ["title", "problem", "steps[0]", "steps[1]", "steps[2]", "answer"],
  swot:      ["title", "strengths", "weaknesses", "opportunities", "threats"],
  team:      ["title", "members[0]", "members[1]", "members[2]"],
  timeline:  ["title", "items[0]", "items[1]", "items[2]", "items[3]"],
  bullets:   ["title", "items[0]", "items[1]", "items[2]", "items[3]"],
  conclusion:["title", "summary", "checklist", "cta"]
};
```

## 프레임 타이밍 계산 공식

```
요소 X의 등장 프레임 = (X까지 누적 글자수 / 전체 글자수) × 슬라이드 총 프레임수
```

## 출력 형식

```json
{
  "fragmentOrder": ["title", "stats[0]", "stats[1]", "callout", "source"],
  "fragmentTimings": [
    { "key": "title", "startFrame": 0, "charRatio": 0.0 },
    { "key": "stats[0]", "startFrame": 45, "charRatio": 0.25 },
    { "key": "stats[1]", "startFrame": 90, "charRatio": 0.50 },
    { "key": "callout", "startFrame": 135, "charRatio": 0.75 },
    { "key": "source", "startFrame": 165, "charRatio": 0.92 }
  ]
}
```

## 사용 예제

예제 1: stats 슬라이드 (3개 수치) fragmentOrder
- 입력: type=stats, stats 3개, callout, source 존재
- 출력: ["title","stats[0]","stats[1]","stats[2]","callout","source"]

예제 2: 실제 데이터보다 긴 fragmentOrder 처리
- 입력: stats 배열에 2개만 있는데 fragmentOrder에 stats[2] 포함
- 출력: stats[2] 자동 제거 후 검증된 배열 반환

예제 3: 빈 fragmentOrder 기본값 적용
- 입력: fragmentOrder 미지정 슬라이드
- 출력: 슬라이드 타입 기본 패턴 자동 적용
