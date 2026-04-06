---
name: parse-web-research
description: |
  주제 텍스트를 받아 핵심 검색 쿼리를 자동 생성하고, 웹 검색으로 수집한 정보를
  슬라이드 제작에 적합한 구조화된 데이터로 정리합니다.
  출처, 수치, 사실, 인용구를 구분하여 태깅하고 내용 신뢰도를 평가합니다.
  사용 시점: ContentIngestAgent가 웹 리서치 요청을 처리할 때 호출합니다.
---

# parse-web-research 스킬

## 기능 설명

사용자가 주제만 제공하거나 "조사해줘" 요청 시, 주제를 다각도로 분해하여
효과적인 검색 쿼리를 생성하고 수집된 정보를 슬라이드 제작용으로 구조화합니다.

---

## Phase 1: 주제 분해 및 검색 쿼리 생성

발표 유형(TYPE)에 따른 쿼리 전략:

**TYPE A (학술/교육):**
```
쿼리 세트:
1. "[주제] 정의 개념"
2. "[주제] 원리 메커니즘"
3. "[주제] 연구 동향 최신"
4. "[주제] 사례 예시"
5. "[주제] 공식 수식"
```

**TYPE B (연구/사업기획):**
```
쿼리 세트:
1. "[주제] 시장 현황 통계"
2. "[주제] 정부 정책 지원"
3. "[주제] 문제점 한계"
4. "[주제] 해외 사례"
5. "[주제] 경제적 효과 전망"
6. "[주제] 기술 개발 동향"
```

**TYPE C (투자피칭):**
```
쿼리 세트:
1. "[주제] 시장 규모 TAM"
2. "[주제] 경쟁사 현황"
3. "[주제] 투자 트렌드"
4. "[주제] 성공 사례"
5. "[주제] 규제 법제도"
```

**TYPE D (홍보/마케팅):**
```
쿼리 세트:
1. "[주제] 소비자 트렌드"
2. "[주제] 브랜드 사례"
3. "[주제] SNS 바이럴"
4. "[주제] 타겟 고객층"
```

---

## Phase 2: 수집 정보 구조화

```python
def structure_research_results(search_results, topic, presentation_type):
    """
    search_results: 웹 검색 결과 리스트
    반환: 구조화된 research-data 딕셔너리
    """
    structured = {
        "topic": topic,
        "presentationType": presentation_type,
        "collectedAt": "2026-03-28",
        "clusters": [],
        "keyNumbers": [],
        "keyQuotes": [],
        "sources": []
    }
    
    # 토픽 클러스터링
    cluster_map = {
        "definition": ["정의", "개념", "의미", "이란", "definition"],
        "statistics": ["통계", "%", "조원", "만명", "증가", "감소", "시장규모"],
        "problems": ["문제", "한계", "과제", "이슈", "위기"],
        "solutions": ["해결", "방안", "전략", "개선", "혁신"],
        "cases": ["사례", "case", "예시", "성공", "적용"],
        "trends": ["트렌드", "동향", "전망", "추세", "미래"],
        "policy": ["정책", "법", "제도", "규제", "정부", "지원"]
    }
    
    for result in search_results:
        # 수치 데이터 추출
        import re
        numbers = re.findall(
            r'(\d+(?:\.\d+)?(?:조|억|만|천)?(?:원|명|%|건|개)?)',
            result.get("snippet", "")
        )
        for num in numbers:
            structured["keyNumbers"].append({
                "value": num,
                "context": result.get("snippet", "")[:100],
                "source": result.get("url", ""),
                "reliability": "medium"
            })
        
        # 인용구 후보 추출 (따옴표 안 내용)
        quotes = re.findall(r'["\'""]([^"\'""\n]{20,100})["\'""]',
                           result.get("snippet", ""))
        for q in quotes:
            structured["keyQuotes"].append({
                "text": q,
                "source": result.get("title", ""),
                "url": result.get("url", "")
            })
        
        # 출처 등록
        structured["sources"].append({
            "title": result.get("title", ""),
            "url": result.get("url", ""),
            "snippet": result.get("snippet", ""),
            "domain": result.get("url", "").split("/")[2] if result.get("url") else ""
        })
    
    return structured
```

---

## Phase 3: 슬라이드 구성 제안

수집된 정보 클러스터를 슬라이드 섹션으로 매핑:

```
수집된 정보 클러스터:
- 정의/개념 (3개 소스) → concept 슬라이드
- 통계/수치 (7개 수치 데이터) → stats 슬라이드
- 문제점 (5개 소스) → crisis 슬라이드
- 해결방안 (4개 소스) → bullets 또는 methodology 슬라이드
- 사례 (3개 소스) → example 또는 bullets 슬라이드
- 전망 (2개 소스) → timeline 또는 conclusion 슬라이드
```

---

## 출력 형식

```json
{
  "topic": "스마트 소방설비 시장 현황",
  "presentationType": "B",
  "searchQueriesUsed": [
    "스마트 소방설비 시장 규모 통계",
    "소방설비 정부 정책 지원 2025",
    "소방설비 기술 개발 동향"
  ],
  "clusters": [
    {
      "clusterId": "statistics",
      "clusterName": "시장 통계",
      "items": [
        {
          "text": "국내 소방설비 시장 규모 2조 3천억원 (2024년 기준)",
          "source": "소방청 통계연보 2024",
          "url": "https://...",
          "reliability": "high"
        }
      ],
      "suggestedSlideType": "stats"
    }
  ],
  "keyNumbers": [
    {"value": "2조3천억원", "label": "국내 소방설비 시장규모", "source": "소방청 2024", "reliability": "high"}
  ],
  "keyQuotes": [],
  "totalSources": 12,
  "suggestedSections": 8,
  "researchQuality": "good",
  "gaps": ["해외 시장 비교 자료 부족 → 추가 검색 권장"]
}
```

---

## 사용 예제

예제 1: TYPE B 정책 리서치
- 입력: "스마트 소방설비 정부 R&D 지원 현황"
- 출력: 7개 클러스터, 수치 15개, 출처 18개 수집 → 12~15장 슬라이드 제안

예제 2: TYPE A 학술 개념 조사
- 입력: "건물 에너지 효율 지수 ZCBI 개념"
- 출력: 정의/원리/수식/사례 4개 클러스터 → 8~10장 슬라이드 제안

예제 3: 검색 결과 부족 처리
- 입력: 너무 구체적인 내부 데이터 요청
- 출력: 수집 가능한 공개 정보만 구조화 + "내부 자료 직접 입력 필요" 플래그
