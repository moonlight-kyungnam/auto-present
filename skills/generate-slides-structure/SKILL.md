---
name: generate-slides-structure
description: |
  발표 유형과 주제를 입력받아 slides-data.json 전체 초안을 자동 생성합니다.
  27종 슬라이드 타입의 필수 필드를 채우고 speakerNote를 포함한 완전한 JSON을 반환합니다.
  사용 시점: SlideAgent가 슬라이드 구조 초안을 생성할 때 호출합니다.
---

# generate-slides-structure 스킬

## 기능 설명

analyze-presentation-type의 결과와 사용자 주제를 기반으로
각 슬라이드의 모든 필수 필드가 채워진 완전한 slides-data.json 초안을 생성합니다.

## 슬라이드 타입별 기본 필드 규칙

cover: title(발표 제목), subtitle(부제목), badge(유형뱃지), meta(날짜·기관)
toc: title("목차"), items(슬라이드 제목 목록, 2열 그리드)
stats: title, stats[](value+label, 3~4개), callout(핵심 메시지), source(출처)
table: title, headers[], rows[][], callout
market: title, stats[], chartData[](label+value), callout
crisis: title, stats[](문제 수치), callout(위기 메시지)
concept: title, definition(정의 1~2문장), keywords[](term+desc, 3~5개)
formula: title, formula(수식 텍스트), variables[](symbol+desc)
example: title, problem, steps[](단계별 풀이), answer
framework: title, nodes[](id+label), edges[](from+to)
hypothesis: title, hypotheses[](id+text+direction)
methodology: title, steps[](label+desc, 4~6단계)
result-analysis: title, tableData{headers,rows}, interpretation, visualization
gantt: title, phases[](name+start+end+color)
budget: title, items[](category+amount+ratio)
swot: title, strengths[], weaknesses[], opportunities[], threats[]
kpi-dashboard: title, kpis[](name+value+trend+unit)
governance: title, orgChart{name, children[]}
problem-solution: title, problem{title,points[]}, solution{title,points[]}
tam-sam-som: title, tam{value,desc}, sam{value,desc}, som{value,desc}
team: title, members[](name+role+career)
hero: title, copy(대형 카피), subtext, cta(버튼 텍스트)
persona: title, name, age, job, needs[], painpoints[]
timeline: title, items[](date+label+desc)
bullets: title, items[](text+highlight?)
quote: title, quote, source
conclusion: title, summary[], checklist[], cta

## speakerNote 작성 기준

- 각 슬라이드의 핵심 메시지를 2~3문장으로 요약
- 발표 시 강조할 포인트 포함
- NarrationAgent의 대본 초안 작성 기준이 됨

## 사용 예제

예제 1: TYPE B 정부과제 cover 슬라이드 생성
- 입력: {"type":"cover", "topic":"스마트 소방설비 기술개발 과제", "presentationType":"B"}
- 출력: {"id":1,"label":"표지","type":"cover","title":"스마트 소방설비 기술개발 사업화 방안","subtitle":"중기부 기술개발과제 최종발표","badge":"TYPE B","meta":"2026년 3월 | 연구소 명칭","speakerNote":"...","fragmentOrder":["badge","title","subtitle","meta"]}

예제 2: TYPE C tam-sam-som 슬라이드 생성
- 입력: {"type":"tam-sam-som", "market":"국내 소방설비 시장"}
- 출력: tam{value:"2.3조원",desc:"국내 소방설비 전체 시장"}, sam{value:"8,500억",desc:"스마트 소방 적용 가능 시장"}, som{value:"420억",desc:"3년내 목표 시장"}

예제 3: TYPE A concept 슬라이드 생성
- 입력: {"type":"concept", "topic":"건물 에너지 성능 지수 ZCBI"}
- 출력: definition+keywords 5개 포함 완전한 슬라이드 JSON
