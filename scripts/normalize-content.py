"""
AutoPresent Studio — 콘텐츠 정규화기
모든 입력 형식(PDF/PPTX/DOCX/텍스트/웹)의 파싱 결과를
통일된 content-brief.json 형식으로 정규화합니다.
사용법: python normalize-content.py <input_json> [output_path]
"""

import json
import os
import sys
import re


def normalize(raw_brief):
    """파싱 결과를 정규화하여 content-brief.json 표준 형식으로 변환"""

    # 1. 기본 필드 보장
    brief = {
        "sourceType": raw_brief.get("sourceType", "text"),
        "title": raw_brief.get("title", "제목 없음"),
        "summary": raw_brief.get("summary", ""),
        "sections": [],
        "metadata": raw_brief.get("metadata", {}),
    }

    # 2. 섹션 정규화
    for i, section in enumerate(raw_brief.get("sections", []), 1):
        normalized = {
            "sectionIndex": i,
            "heading": _clean_text(section.get("heading", f"섹션 {i}")),
            "content": _clean_text(section.get("content", "")),
            "keyPoints": [_clean_text(p) for p in section.get("keyPoints", []) if p.strip()],
            "dataPoints": _normalize_data_points(section.get("dataPoints", [])),
            "images": _normalize_images(section.get("images", [])),
            "suggestedSlideType": section.get("suggestedSlideType", "bullets"),
        }

        # 빈 섹션 건너뛰기
        if not normalized["content"] and not normalized["keyPoints"]:
            continue

        brief["sections"].append(normalized)

    # 3. 섹션 인덱스 재번호 매기기
    for i, section in enumerate(brief["sections"], 1):
        section["sectionIndex"] = i

    # 4. 중복 섹션 제거
    brief["sections"] = _remove_duplicates(brief["sections"])

    # 5. 타이틀 자동 생성 (없으면 첫 섹션 헤딩 사용)
    if brief["title"] == "제목 없음" and brief["sections"]:
        brief["title"] = brief["sections"][0]["heading"]

    # 6. 요약 자동 생성 (없으면)
    if not brief["summary"] and brief["sections"]:
        points = []
        for s in brief["sections"][:3]:
            if s["keyPoints"]:
                points.append(s["keyPoints"][0])
            elif s["content"]:
                points.append(s["content"][:80])
        brief["summary"] = ". ".join(points)

    # 7. 메타데이터 정규화
    brief["metadata"] = {
        "totalPages": brief["metadata"].get("totalPages", len(brief["sections"])),
        "language": brief["metadata"].get("language", "ko"),
        "extractedImages": brief["metadata"].get("extractedImages", 0),
        "processingNotes": brief["metadata"].get("processingNotes", []) + ["normalize-content 정규화 완료"],
    }

    return brief


def _clean_text(text):
    """텍스트 정리: 여러 공백 제거, 앞뒤 공백 제거"""
    if not text:
        return ""
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _normalize_data_points(data_points):
    """데이터 포인트 정규화"""
    normalized = []
    for dp in data_points:
        if not dp.get("value"):
            continue
        normalized.append({
            "label": str(dp.get("label", "")),
            "value": str(dp.get("value", "")),
            "source": str(dp.get("source", "")),
        })
    return normalized[:10]  # 최대 10개


def _normalize_images(images):
    """이미지 정보 정규화"""
    normalized = []
    for img in images:
        path = img.get("path", "")
        if not path:
            continue
        normalized.append({
            "path": path,
            "caption": img.get("caption", ""),
            "ocrText": img.get("ocrText", ""),
            "confidence": float(img.get("confidence", 0.0)),
        })
    return normalized


def _remove_duplicates(sections):
    """유사 제목/내용의 중복 섹션 제거"""
    seen_headings = set()
    unique = []
    for section in sections:
        heading_key = section["heading"].lower().strip()
        if heading_key in seen_headings:
            # 중복 제목이면 내용을 병합
            for existing in unique:
                if existing["heading"].lower().strip() == heading_key:
                    existing["keyPoints"].extend(section["keyPoints"])
                    existing["dataPoints"].extend(section["dataPoints"])
                    break
        else:
            seen_headings.add(heading_key)
            unique.append(section)
    return unique


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("사용법: python normalize-content.py <input.json> [output_path]")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else "content-brief.json"

    with open(input_path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    result = normalize(raw)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"✅ 정규화 완료: {len(result['sections'])}개 섹션")
    print(f"📁 결과: {output_path}")
