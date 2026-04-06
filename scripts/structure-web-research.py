"""
AutoPresent Studio — 웹 리서치 구조화기
웹 검색 결과를 수집하여 content-brief.json 형식으로 구조화합니다.
Claude Code의 WebSearch/WebFetch와 연동하여 사용합니다.
사용법: python structure-web-research.py <topic> <type> [output_path]
  topic: 검색 주제
  type: 발표 유형 (A=학술, B=비즈니스, C=투자, D=마케팅)
"""

import json
import os
import sys
import re


def generate_search_queries(topic, presentation_type="B"):
    """발표 유형별 검색 쿼리 자동 생성"""
    base_queries = [
        f"{topic} 개요",
        f"{topic} 현황 통계 2024 2025",
        f"{topic} 주요 사례",
    ]

    type_queries = {
        "A": [  # 학술/교육
            f"{topic} 학술 연구 논문",
            f"{topic} 이론 프레임워크",
            f"{topic} 교육 자료",
        ],
        "B": [  # 비즈니스
            f"{topic} 시장 규모 전망",
            f"{topic} 경쟁 현황 분석",
            f"{topic} 비즈니스 모델",
            f"{topic} ROI 성과 지표",
        ],
        "C": [  # 투자
            f"{topic} 투자 시장 규모 TAM SAM SOM",
            f"{topic} 경쟁사 비교",
            f"{topic} 투자 유치 사례",
            f"{topic} 성장률 전망",
        ],
        "D": [  # 마케팅
            f"{topic} 타겟 고객 페르소나",
            f"{topic} 마케팅 전략 사례",
            f"{topic} 트렌드 소비자 인사이트",
        ],
    }

    return base_queries + type_queries.get(presentation_type, type_queries["B"])


def structure_research_results(topic, search_results, presentation_type="B"):
    """
    검색 결과를 content-brief.json 형식으로 구조화
    search_results: [{"query": str, "results": [{"title": str, "snippet": str, "url": str}]}]
    """
    sections = []
    all_data_points = []

    for i, result_group in enumerate(search_results, 1):
        query = result_group.get("query", "")
        results = result_group.get("results", [])

        key_points = []
        data_points = []

        for r in results:
            snippet = r.get("snippet", "")
            if snippet:
                key_points.append(snippet[:200])

            # 수치 데이터 추출
            numbers = re.findall(
                r"(\d[\d,.]*)\s*(억|만|%|원|달러|건|명|개|조)", snippet
            )
            for value, unit in numbers:
                data_points.append({
                    "label": query,
                    "value": f"{value}{unit}",
                    "source": r.get("url", "웹 검색"),
                })

        # 섹션 생성
        section = {
            "sectionIndex": i,
            "heading": _query_to_heading(query, topic),
            "content": " ".join(key_points),
            "keyPoints": key_points[:5],
            "dataPoints": data_points[:5],
            "images": [],
            "suggestedSlideType": _suggest_type_for_query(query, data_points, i, len(search_results)),
        }
        sections.append(section)
        all_data_points.extend(data_points)

    brief = {
        "sourceType": "web-research",
        "title": f"{topic} — 웹 리서치 결과",
        "summary": f"'{topic}' 주제에 대한 {len(search_results)}건의 웹 리서치 결과",
        "sections": sections,
        "metadata": {
            "totalPages": len(sections),
            "language": "ko",
            "extractedImages": 0,
            "processingNotes": [
                f"발표 유형: {presentation_type}",
                f"검색 쿼리 {len(search_results)}건 실행",
                f"데이터 포인트 {len(all_data_points)}건 추출",
            ],
        },
    }

    return brief


def _query_to_heading(query, topic):
    """검색 쿼리를 섹션 제목으로 변환"""
    heading = query.replace(topic, "").strip()
    heading = re.sub(r"\d{4}\s*\d{0,4}", "", heading).strip()
    return heading if heading else query


def _suggest_type_for_query(query, data_points, index, total):
    """쿼리 기반 슬라이드 타입 추천"""
    if index == 1:
        return "cover"
    if index == total:
        return "conclusion"
    if len(data_points) >= 3:
        return "stats"

    keywords = query.lower()
    if any(k in keywords for k in ["시장", "규모", "tam", "sam"]):
        return "tam-sam-som"
    if any(k in keywords for k in ["경쟁", "비교"]):
        return "table"
    if any(k in keywords for k in ["사례", "예시"]):
        return "example"
    if any(k in keywords for k in ["통계", "수치", "지표"]):
        return "stats"
    if any(k in keywords for k in ["전략", "계획"]):
        return "framework"
    if any(k in keywords for k in ["팀", "인력"]):
        return "team"

    return "bullets"


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("사용법: python structure-web-research.py <topic> [type] [output_path]")
        print("  type: A(학술), B(비즈니스), C(투자), D(마케팅)")
        sys.exit(1)

    topic = sys.argv[1]
    ptype = sys.argv[2] if len(sys.argv) > 2 else "B"
    output_path = sys.argv[3] if len(sys.argv) > 3 else "content-brief.json"

    # 검색 쿼리 생성
    queries = generate_search_queries(topic, ptype)
    print(f"📋 생성된 검색 쿼리 ({len(queries)}건):")
    for q in queries:
        print(f"   - {q}")

    print(f"\n💡 이 쿼리들을 웹 검색 도구로 실행한 후,")
    print(f"   결과를 JSON으로 저장하여 structure_research_results()에 전달하세요.")
    print(f"\n예시 JSON 형식:")
    example = [{"query": queries[0], "results": [{"title": "...", "snippet": "...", "url": "..."}]}]
    print(json.dumps(example, ensure_ascii=False, indent=2))
