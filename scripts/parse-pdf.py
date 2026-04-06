"""
AutoPresent Studio — PDF 파서
PyMuPDF(fitz)를 사용하여 PDF의 텍스트, 표, 이미지를 추출합니다.
텍스트 위주 / 혼합 / 스캔 PDF 유형을 자동 감지합니다.
사용법: python parse-pdf.py <input.pdf> [output_dir]
"""

import json
import os
import sys
import re
import fitz  # PyMuPDF


def detect_pdf_type(pdf_path):
    """PDF 유형 자동 감지: 'text-heavy' | 'mixed' | 'scanned'"""
    doc = fitz.open(pdf_path)
    total_pages = len(doc)

    text_chars = 0
    image_count = 0

    for page in doc:
        text_chars += len(page.get_text())
        image_count += len(page.get_images())

    avg_text = text_chars / max(total_pages, 1)
    avg_images = image_count / max(total_pages, 1)

    if avg_text < 100 and avg_images > 0.5:
        return "scanned"
    elif avg_images > 1.0 or avg_text < 300:
        return "mixed"
    else:
        return "text-heavy"


def parse_pdf(pdf_path, output_dir="extracted"):
    """PDF를 파싱하여 content-brief.json 형식으로 반환"""
    os.makedirs(output_dir, exist_ok=True)
    doc = fitz.open(pdf_path)
    pdf_type = detect_pdf_type(pdf_path)

    sections = []
    extracted_images = 0

    for page_num, page in enumerate(doc, 1):
        # 텍스트 추출 (구조적)
        blocks = page.get_text("dict")["blocks"]

        heading = None
        body_lines = []
        key_points = []
        images = []

        for block in blocks:
            if block["type"] == 0:  # 텍스트 블록
                for line in block["lines"]:
                    for span in line["spans"]:
                        text = span["text"].strip()
                        if not text:
                            continue

                        font_size = span["size"]
                        is_bold = "bold" in span["font"].lower()

                        # 헤딩 감지
                        if (font_size >= 16 or (font_size >= 13 and is_bold)) and not heading:
                            heading = text
                        elif text.startswith(("•", "-", "–", "※", "·")):
                            key_points.append(text.lstrip("•-–※· "))
                        else:
                            body_lines.append(text)

        # 이미지 추출
        for img_index, img in enumerate(page.get_images()):
            try:
                xref = img[0]
                base_image = doc.extract_image(xref)
                ext = base_image["ext"]
                filename = f"page{page_num:03d}_img{img_index:02d}.{ext}"
                filepath = os.path.join(output_dir, filename)
                with open(filepath, "wb") as f:
                    f.write(base_image["image"])
                images.append({
                    "path": filepath,
                    "caption": "",
                    "ocrText": "",
                    "confidence": 0.0,
                })
                extracted_images += 1
            except Exception:
                pass

        # 섹션 생성
        content_text = " ".join(body_lines)

        # 숫자 데이터 추출
        data_points = []
        numbers = re.findall(r"(\d[\d,.]+)\s*(%|만|억|원|달러|건|명|개)", content_text)
        for value, unit in numbers[:5]:
            data_points.append({
                "label": "",
                "value": f"{value}{unit}",
                "source": f"PDF p.{page_num}",
            })

        # 슬라이드 타입 추천
        suggested = _suggest_type(page_num, len(doc), heading, key_points, images, data_points)

        section = {
            "sectionIndex": page_num,
            "heading": heading or f"페이지 {page_num}",
            "content": content_text[:2000],  # 최대 2000자
            "keyPoints": key_points[:10],
            "dataPoints": data_points,
            "images": images,
            "suggestedSlideType": suggested,
        }
        sections.append(section)

    brief = {
        "sourceType": "pdf",
        "title": sections[0]["heading"] if sections else "PDF 문서",
        "summary": f"PDF({pdf_type})에서 추출한 {len(sections)}페이지 콘텐츠",
        "sections": sections,
        "metadata": {
            "totalPages": len(doc),
            "language": "ko",
            "extractedImages": extracted_images,
            "processingNotes": [
                f"PDF 유형: {pdf_type}",
                f"PyMuPDF로 파싱, {len(doc)}페이지 처리",
            ],
        },
    }

    return brief


def _suggest_type(page_num, total, heading, points, images, data_points):
    """슬라이드 타입 추천"""
    if page_num == 1:
        return "cover"
    if page_num == total:
        return "conclusion"
    if len(data_points) >= 3:
        return "stats"
    if len(images) >= 2:
        return "hero"
    if len(points) >= 3:
        return "bullets"
    return "bullets"


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("사용법: python parse-pdf.py <input.pdf> [output_dir]")
        sys.exit(1)

    pdf_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "extracted"

    result = parse_pdf(pdf_path, output_dir)

    output_path = os.path.join(os.path.dirname(pdf_path), "content-brief.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"✅ PDF 파싱 완료: {len(result['sections'])}페이지")
    print(f"📁 결과: {output_path}")
    print(f"🖼️  추출 이미지: {result['metadata']['extractedImages']}개")
    print(f"📝 PDF 유형: {result['metadata']['processingNotes'][0]}")
