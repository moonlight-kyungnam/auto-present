---
name: generate-html-slide
description: |
  슬라이드 타입별 HTML/CSS 렌더러를 생성합니다. 27종 슬라이드 타입 각각의
  HTML 마크업 구조와 CSS 스타일을 반환하며, fragmentOrder 기반 순차 등장
  애니메이션 클래스를 자동으로 적용합니다.
  사용 시점: WebAgent가 각 슬라이드의 HTML을 생성할 때 호출합니다.
---

# generate-html-slide 스킬

## 기능 설명

slides-data.json의 각 슬라이드 객체를 HTML 문자열로 변환합니다.
theme-config.json의 CSS 변수를 적용하고 fragmentOrder에 따라
data-fragment 속성을 부여합니다.

## 애니메이션 클래스 적용 규칙

슬라이드 타입별 기본 애니메이션:
- 페이드인(fade): concept, formula, result-analysis, bullets, kpi-dashboard, market, stats
- 슬라이드인(slide): example, methodology, gantt, timeline, governance
- 팝업(popup): hypothesis, swot, team, conclusion, tam-sam-som, problem-solution

## ★ 반응형 레이아웃 규칙 (필수)

슬라이드는 **모든 화면 크기에서 디스플레이를 꽉 채워야** 합니다.
다음 규칙을 반드시 준수합니다.

### 1. 기본 슬라이드 컨테이너 CSS
```css
/* 슬라이드: 화면 전체 차지 */
.slide {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 28px; /* nav-bar 높이만큼 */
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: center;
  padding: 0.5vh 1.5vw;
  overflow-y: auto;
}

/* 콘텐츠 영역: 남은 세로 공간 전부 채움 */
.ct, .slide-inner {
  width: 100%;
  max-width: 98vw;
  display: flex;
  flex-direction: column;
  gap: 1vh;
  align-items: center;
  flex: 1 1 0;
  min-height: 0;
}

/* 그리드: 세로 공간 채움 */
.g2, .g3, .g4 {
  flex: 1 1 0;
  min-height: 0;
}

/* 이미지: 부모 셀 채우기 */
.img-hero {
  height: 100% !important;
  min-height: 0;
}
.img-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### 2. 크기 단위 규칙 (금지/필수)

| 속성 | 금지 | 필수 | 예시 |
|------|------|------|------|
| 높이(height) | `px` | `vh` 또는 `%` | `height:30vh`, `height:100%` |
| 너비(width) | `px` (고정 너비) | `vw`, `%`, `flex` | `width:48vw`, `flex:1` |
| 폰트 크기 | 고정 `rem` 단독 | `clamp(min, 선호, max)` + `vh` | `font-size:clamp(1rem,3vh,2rem)` |
| 패딩/마진 | `px` (>8px) | `vh`, `vw` | `padding:1.5vh 2vw` |
| 갭(gap) | `px` (>8px) | `vh` | `gap:1.5vh` |

**예외**: `border-width`, `border-radius`, `box-shadow` 등 장식적 속성은 `px` 허용

### 3. 인라인 style 제한

- 슬라이드 콘텐츠 요소에 `style="height:XXXpx"` 인라인 **절대 금지**
- 이미지 크기는 CSS 클래스로 제어 (인라인 style 사용 시 반드시 `vh`/`%` 단위)
- 예: `style="height:25vh"` ✅ / `style="height:260px"` ❌

### 4. 반응형 미디어쿼리 (필수 포함)

```css
@media(max-width:768px) {
  .g2,.g3,.g4 { grid-template-columns: 1fr !important; }
}
```

## HTML 렌더러 패턴 예시

stats 타입 HTML:
```html
<section class="slide slide-stats" data-slide-id="3">
  <div class="slide-inner">
    <h2 class="slide-title fragment fragment-fade" data-fragment="0">슬라이드 제목</h2>
    <div class="stats-grid">
      <div class="stat-box fragment fragment-fade" data-fragment="1">
        <span class="stat-value">42만㎡</span>
        <span class="stat-label">부지 규모</span>
      </div>
      <div class="stat-box highlight fragment fragment-fade" data-fragment="2">
        <span class="stat-value">9회</span>
        <span class="stat-label">입찰 유찰</span>
      </div>
    </div>
    <div class="callout fragment fragment-fade" data-fragment="3">핵심 메시지</div>
    <div class="source fragment fragment-fade" data-fragment="4">출처: 기관명</div>
  </div>
</section>
```

## JavaScript fragment 제어 로직

```javascript
// data-fragment 속성값(숫자) 순서대로 visible 클래스 추가
let currentFragment = -1;  // -1: 슬라이드 진입 시 첫 요소도 미표시

function advanceFragment() {
  const fragments = document.querySelectorAll(
    `.slide-active [data-fragment="${currentFragment + 1}"]`
  );
  if (fragments.length === 0) return false;  // 더 이상 fragment 없음
  fragments.forEach(el => el.classList.add('visible'));
  currentFragment++;
  return true;
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    if (!advanceFragment()) nextSlide();  // fragment 소진 시 다음 슬라이드
  }
});
```

## 사용 예제

예제 1: cover 슬라이드 HTML 생성
- 입력: {type:"cover", title:"발표 제목", subtitle:"부제목", fragmentOrder:["title","subtitle"]}
- 출력: 제목과 부제목이 순차 페이드인되는 HTML

예제 2: swot 슬라이드 HTML 생성
- 입력: {type:"swot", strengths:[], weaknesses:[], opportunities:[], threats:[]}
- 출력: 2×2 매트릭스, 각 사분면이 팝업 애니메이션으로 순차 등장

예제 3: 빈 fragmentOrder 처리
- 입력: fragmentOrder 미지정
- 출력: 모든 요소가 슬라이드 진입 시 즉시 표시 (fragment 없이 렌더링)
