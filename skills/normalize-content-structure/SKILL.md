---
name: normalize-content-structure
description: |
  parse-pdf-content, parse-pptx-content, parse-web-research 등 다양한 파싱 결과를
  SlideAgent가 바로 사용할 수 있는 표준 content-brief.json 포맷으로 통합 변환합니다.
  멀티파일 입력 시 중복 제거, 내용 충돌 감지, 통합 내러티브 흐름 재구성을 수행합니다.
  사용 시점: ContentIngestAgent가 모든 파싱 완료 후 최종 정규화 단계에서 호출합니다.
---

# normalize-content-structure 스킬

## 기능 설명

이질적인 파싱 결과들을 content-brief.json 표준 포맷으로 통합합니다.
슬라이드 흐름 최적화, 중복 콘텐츠 병합, 섹션 우선순위 배정을 수행합니다.

---

## 정규화 처리 단계

### Step 1: 섹션 유형 분류

모든 추출 콘텐츠를 아래 7가지 섹션 유형으로 분류:

| 유형 코드 | 설명 | 추천 슬라이드 타입 |
|---|---|---|
| `intro` | 도입부, 배경, 개요 | cover, toc, concept |
| `definition` | 정의, 개념, 용어 설명 | concept, bullets |
| `data` | 수치, 통계, 지표 | stats, kpi-dashboard |
| `analysis` | 비교, 분석, 결과 해석 | table, result-analysis, swot |
| `process` | 절차, 단계, 방법론 | methodology, timeline, gantt |
| `case` | 사례, 예시, 적용 | example, bullets |
| `conclusion` | 결론, 요약, 마무리 | conclusion, quote |

### Step 2: 섹션 중요도 평가

각 섹션에 priority 배정 (high / medium / low):
- 핵심 수치 포함 → high
- 발표 유형의 필수 흐름 요소 → high
- 보조 자료, 참고 정보 → medium
- 중복 내용, 부록 → low

### Step 3: 최적 슬라이드 흐름 재구성

발표 유형별 필수 흐름에 맞춰 섹션 순서 재배열:
- TYPE A: intro → definition(들) → data/analysis → process/case → conclusion
- TYPE B: intro → data(문제) → analysis → process(방법론) → data(결과) → conclusion
- TYPE C: intro(문제) → definition(해결책) → data(시장) → analysis(경쟁) → process(팀/로드맵) → conclusion
- TYPE D: intro(브랜드) → definition(메시지) → data(효과) → case → conclusion(CTA)

### Step 4: 슬라이드 분할 최적화

섹션 내용량이 슬라이드 1장 기준을 초과할 경우 자동 분할:
- 불릿 항목 7개 초과 → 2장으로 분할
- 표 행 8개 초과 → 핵심 행만 선택 + 나머지 appendix 처리
- 이미지 3개 이상 → 대표 이미지 1개 선택 + 나머지 기록

---

## content-brief.json 전체 스키마

```json
{
  "schemaVersion": "1.0",
  "projectTitle": "자동 추정된 발표 제목",
  "inferredType": "B",
  "inferredTheme": "navy-depth",
  "sourceFiles": [
    {
      "filename": "강의자료.pptx",
      "type": "pptx",
      "slideCount": 32,
      "parsedAt": "2026-03-28T10:00:00"
    }
  ],
  "contentSections": [
    {
      "sectionId": 1,
      "sectionTitle": "섹션 제목",
      "sectionType": "data",
      "suggestedSlideType": "stats",
      "priority": "high",
      "content": {
        "mainText": "핵심 내용 텍스트",
        "subItems": ["항목1", "항목2", "항목3"],
        "tables": [
          {
            "headers": ["열1", "열2", "열3"],
            "rows": [["값1", "값2", "값3"]]
          }
        ],
        "figures": [],
        "keyNumbers": [
          {
            "value": "42%",
            "label": "성장률",
            "source": "통계청 2025",
            "reliability": "high"
          }
        ],
        "quotes": [],
        "speakerNoteHint": "이 슬라이드에서 강조할 포인트"
      },
      "extractedAssets": [
        {
          "type": "image",
          "sourcePath": "extracted/page005_img01.png",
          "caption": "그림 1. 시스템 구성도"
        }
      ],
      "sourceRef": {
        "file": "강의자료.pptx",
        "slideNumber": 5,
        "page": null
      },
      "confidence": 0.95,
      "flags": []
    }
  ],
  "suggestedSlideCount": 14,
  "suggestedFlow": [
    "cover", "toc", "stats", "crisis",
    "methodology", "gantt", "budget", "conclusion"
  ],
  "uncertainItems": [
    {
      "sectionId": 3,
      "reason": "OCR 불확실 구간 포함",
      "userActionNeeded": true,
      "suggestion": "원본 3페이지 직접 확인 후 수정 요청"
    }
  ],
  "extractedKeywords": ["스마트 소방", "IoT", "화재 감지", "예방 유지보수"],
  "totalCharCount": 8420,
  "contentQualityScore": 0.88,
  "processingNotes": [
    "PPTX 5페이지의 SmartArt는 텍스트만 추출됨 (도형 디자인 미보존)",
    "PDF 8페이지 이미지의 차트 수치는 재확인 권장"
  ]
}
```

---

## 멀티파일 중복 처리 규칙

동일 내용이 여러 파일에 중복될 경우:
1. 내용 유사도 80% 이상 → 더 상세한 버전 채택, 나머지 병합
2. 수치 데이터 상충 → 두 값 모두 보존 + "충돌" 플래그 + 사용자 선택 요청
3. 동일 주제의 다른 관점 → 별도 섹션으로 유지 (보완 관계)

---

## 사용 예제

예제 1: PDF + PPTX 멀티파일 통합
- 입력: 40페이지 PDF(연구보고서) + 20장 PPTX(발표자료)
- 출력: 중복 5개 섹션 병합, 15개 고유 섹션 → 18장 슬라이드 제안

예제 2: 웹리서치 결과 + 사용자 직접 입력 통합
- 입력: 웹리서치 8개 클러스터 + 사용자 텍스트 메모
- 출력: 사용자 메모를 우선 반영, 웹리서치로 수치 보강

예제 3: 단일 PPTX (32장 → 최적화)
- 입력: 강의용 PPT 32장 (일부 중복, 일부 보조자료)
- 출력: 핵심 15장 + 보조 5장(appendix) 분리 제안
