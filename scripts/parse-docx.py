"""
AutoPresent Studio — DOCX 파서
pandoc을 통한 마크다운 변환 → 섹션 분해
pandoc이 없으면 python-docx 폴백 사용
사용법: python parse-docx.py <input.docx> [output_dir]
"""

import json
import os
import sys
import subprocess
import re


def parse_docx(docx_path, output_dir="extracted"):
    """DOCX를 파싱하여 content-brief.json 형식으로 반환"""
    os.makedirs(output_dir, exist_ok=True)

    # pandoc 사용 시도
    markdown = _convert_with_pandoc(docx_path)
    if not markdown:
        markdown = _convert_with_python_docx(docx_path)

    # 마크다운을 섹션으로 분해
    sections = _split_sections(markdown)

    brief = {
        "sourceType": "docx",
        "title": sections[0]["heading"] if sections else "DOCX 문서",
        "summary": f"DOCX에서 추출한 {len(sections)}개 섹션",
        "sections": sections,
        "metadata": {
            "totalPages": len(sections),
            "language": "ko",
            "extractedImages": 0,
            "processingNotes": ["DOCX → 마크다운 변환 후 섹션 분해"],
        },
    }
    return brief


def _convert_with_pandoc(docx_path):
    """pandoc으로 DOCX → 마크다운 변환"""
    try:
        result = subprocess.run(
            ["pandoc", docx_path, "-t", "markdown", "--wrap=none"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=30,
        )
        if result.returncode == 0:
            return result.stdout
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass
    return None


def _convert_with_python_docx(docx_path):
    """python-docx 폴백 (pandoc 없을 때)"""
    try:
        from docx import Document

        doc = Document(docx_path)
        lines = []
        for para in doc.paragraphs:
            text = para.text.strip()
            if not text:
                continue
            # 헤딩 스타일 감지
            style_name = para.style.name.lower() if para.style else ""
            if "heading 1" in style_name:
                lines.append(f"# {text}")
            elif "heading 2" in style_name:
                lines.append(f"## {text}")
            elif "heading 3" in style_name:
                lines.append(f"### {text}")
            elif "list" in style_name:
                lines.append(f"- {text}")
            else:
                lines.append(text)
        return "\n\n".join(lines)
    except ImportError:
        return "# 문서 파싱 실패\n\npandoc과 python-docx 모두 사용할 수 없습니다."


def _split_sections(markdown):
    """마크다운을 헤딩 기준으로 섹션 분해"""
    sections = []
    current_heading = None
    current_body = []
    current_points = []

    for line in markdown.split("\n"):
        line = line.strip()
        if not line:
            continue

        # 헤딩 감지
        heading_match = re.match(r"^#{1,3}\s+(.+)$", line)
        if heading_match:
            # 이전 섹션 저장
            if current_heading is not None:
                sections.append(_make_section(
                    len(sections) + 1, current_heading, current_body, current_points
                ))
            current_heading = heading_match.group(1)
            current_body = []
            current_points = []
        elif line.startswith(("-", "*", "•")):
            current_points.append(line.lstrip("-*• "))
        else:
            current_body.append(line)

    # 마지막 섹션
    if current_heading:
        sections.append(_make_section(
            len(sections) + 1, current_heading, current_body, current_points
        ))
    elif current_body:
        sections.append(_make_section(1, "문서 내용", current_body, current_points))

    return sections


def _make_section(index, heading, body_lines, points):
    """섹션 딕셔너리 생성"""
    return {
        "sectionIndex": index,
        "heading": heading,
        "content": " ".join(body_lines)[:2000],
        "keyPoints": points[:10],
        "dataPoints": [],
        "images": [],
        "suggestedSlideType": "bullets" if points else "bullets",
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("사용법: python parse-docx.py <input.docx> [output_dir]")
        sys.exit(1)

    docx_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "extracted"

    result = parse_docx(docx_path, output_dir)

    output_path = os.path.join(os.path.dirname(docx_path), "content-brief.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"✅ DOCX 파싱 완료: {len(result['sections'])}개 섹션")
    print(f"📁 결과: {output_path}")
