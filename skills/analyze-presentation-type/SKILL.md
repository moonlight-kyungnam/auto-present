---
name: analyze-presentation-type
description: |
  사용자의 주제와 입력 텍스트를 분석하여 최적의 발표 유형(TYPE A/B/C/D)을 판별하고
  해당 유형에 맞는 슬라이드 타입 조합을 추천합니다.
  사용 시점: SlideAgent가 주제를 입력받아 슬라이드 구조 설계를 시작할 때 호출합니다.
---

# analyze-presentation-type 스킬

## 기능 설명

주제 키워드, 대상 청중, 발표 목적을 분석하여 4개 TYPE 중 최적을 판별하고
해당 TYPE의 권장 슬라이드 타입 조합을 반환합니다.

## 분류 기준

TYPE A (학술/교육) 키워드: 강의, 수업, 논문, 학술, 세미나, 교육, 학습, 개념, 이론, 수식
TYPE B (연구/사업기획) 키워드: 정부과제, R&D, 사업계획, 제안서, 연구, 정책, 예산, 로드맵
TYPE C (투자피칭) 키워드: IR, 피칭, 투자, 스타트업, 시장, 팀, Ask, 비즈니스모델
TYPE D (홍보/마케팅) 키워드: 브랜드, 홍보, 마케팅, 제품, 캠페인, 소셜, 론칭

## 출력 형식

```json
{
  "recommendedType": "B",
  "confidence": 0.92,
  "reasoning": "정부 R&D 과제 제안서 키워드(정부지원, 기술개발, 사업화) 감지",
  "recommendedSlideTypes": ["cover", "toc", "stats", "crisis", "hypothesis", "methodology", "gantt", "budget", "swot", "kpi-dashboard", "conclusion"],
  "recommendedTheme": "navy-depth",
  "slideCount": { "min": 12, "max": 18 }
}
```

## 사용 예제

예제 1: 학술 논문 발표
- 입력: "석사 논문 발표, 건물 에너지 효율 연구"
- 출력: TYPE A, deep-space 테마, 10~14 슬라이드

예제 2: 정부과제 제안서
- 입력: "중기부 R&D 과제 사업화 제안서"
- 출력: TYPE B, navy-depth 테마, 14~18 슬라이드

예제 3: 스타트업 IR 피칭
- 입력: "시리즈A 투자 유치 IR 발표"
- 출력: TYPE C, space-indigo 테마, 10~14 슬라이드
