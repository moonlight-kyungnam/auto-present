---
name: parse-pptx-content
description: |
  PPTX 파일을 슬라이드별로 분석하여 제목, 본문 텍스트, 표, 차트, 이미지,
  도형, 발표자 노트를 완전하게 추출하고 AutoPresent Studio의 27종 슬라이드
  타입으로의 매핑을 추천합니다.
  사용 시점: ContentIngestAgent가 PPTX 파일을 처리할 때 호출합니다.
---

# parse-pptx-content 스킬

## 기능 설명

python-pptx를 사용하여 PPTX의 모든 콘텐츠를 구조적으로 추출합니다.
기존 강의자료의 흐름과 내용을 최대한 보존하면서
AutoPresent Studio 슬라이드 타입 매핑을 자동 추천합니다.

---

## 전체 파싱 코드

```python
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.shapes import MSO_SHAPE_TYPE
from pptx.enum.text import PP_ALIGN
import json
import os
import re

def parse_pptx(pptx_path, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    prs = Presentation(pptx_path)
    
    results = []
    
    for slide_num, slide in enumerate(prs.slides, 1):
        slide_data = {
            "slideNumber": slide_num,
            "layout": slide.slide_layout.name if slide.slide_layout else "unknown",
            "title": None,
            "bodyTexts": [],
            "bulletLists": [],
            "tables": [],
            "charts": [],
            "images": [],
            "shapes": [],
            "speakerNote": None,
            "suggestedType": None,
            "dominantContent": None
        }
        
        # 1. 발표자 노트 추출
        if slide.has_notes_slide:
            notes = slide.notes_slide.notes_text_frame
            if notes:
                slide_data["speakerNote"] = notes.text.strip()
        
        # 2. 각 도형 분석
        for shape in slide.shapes:
            shape_info = _parse_shape(shape, slide_num, output_dir, prs)
            
            if shape_info["role"] == "title":
                slide_data["title"] = shape_info["text"]
            elif shape_info["role"] == "body_text":
                slide_data["bodyTexts"].append(shape_info["text"])
            elif shape_info["role"] == "bullet_list":
                slide_data["bulletLists"].append(shape_info["bullets"])
            elif shape_info["role"] == "table":
                slide_data["tables"].append(shape_info["tableData"])
            elif shape_info["role"] == "chart":
                slide_data["charts"].append(shape_info["chartData"])
            elif shape_info["role"] == "image":
                slide_data["images"].append(shape_info["imageData"])
        
        # 3. 슬라이드 우세 콘텐츠 타입 판별
        slide_data["dominantContent"] = _detect_dominant_content(slide_data)
        
        # 4. AutoPresent 슬라이드 타입 매핑
        slide_data["suggestedType"] = _map_to_autopresent_type(slide_data)
        
        results.append(slide_data)
    
    return {
        "sourceFile": os.path.basename(pptx_path),
        "totalSlides": len(results),
        "slides": results,
        "slideSize": {
            "width": prs.slide_width,
            "height": prs.slide_height
        }
    }


def _parse_shape(shape, slide_num, output_dir, prs):
    """도형 유형 판별 및 내용 추출"""
    
    # 표 처리
    if shape.has_table:
        table = shape.table
        headers = [cell.text_frame.text.strip() for cell in table.rows[0].cells]
        rows = []
        for row in list(table.rows)[1:]:
            rows.append([cell.text_frame.text.strip() for cell in row.cells])
        return {
            "role": "table",
            "tableData": {"headers": headers, "rows": rows}
        }
    
    # 차트 처리
    if shape.has_chart:
        chart = shape.chart
        chart_data = {
            "chartType": str(chart.chart_type),
            "title": chart.chart_title.text_frame.text if chart.has_title else None,
            "series": []
        }
        try:
            for series in chart.series:
                series_data = {
                    "name": series.name,
                    "values": list(series.values)
                }
                chart_data["series"].append(series_data)
        except Exception:
            pass
        return {"role": "chart", "chartData": chart_data}
    
    # 이미지 처리
    if shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
        image = shape.image
        img_ext = image.content_type.split("/")[-1]
        img_filename = f"slide{slide_num:03d}_img_{shape.shape_id}.{img_ext}"
        img_path = os.path.join(output_dir, img_filename)
        with open(img_path, "wb") as f:
            f.write(image.blob)
        return {
            "role": "image",
            "imageData": {
                "path": img_path,
                "filename": img_filename,
                "altText": shape.name,
                "width": shape.width,
                "height": shape.height,
                "visualDescription": None  # ContentIngestAgent가 Vision으로 채움
            }
        }
    
    # 텍스트 도형 처리
    if shape.has_text_frame:
        tf = shape.text_frame
        full_text = tf.text.strip()
        
        if not full_text:
            return {"role": "empty", "text": ""}
        
        # 제목 플레이스홀더 감지
        is_title = (
            hasattr(shape, 'placeholder_format') and
            shape.placeholder_format is not None and
            shape.placeholder_format.idx in (0, 1)
        )
        
        if is_title:
            return {"role": "title", "text": full_text}
        
        # 불릿 리스트 감지
        bullets = []
        has_bullets = False
        for para in tf.paragraphs:
            para_text = para.text.strip()
            if not para_text:
                continue
            level = para.level
            bullets.append({"level": level, "text": para_text})
            if len(tf.paragraphs) > 2:
                has_bullets = True
        
        if has_bullets:
            return {"role": "bullet_list", "bullets": bullets}
        else:
            return {"role": "body_text", "text": full_text}
    
    return {"role": "shape", "text": ""}


def _detect_dominant_content(slide_data):
    """슬라이드의 우세 콘텐츠 타입 판별"""
    scores = {
        "text": len(slide_data["bodyTexts"]) + len(slide_data["bulletLists"]) * 2,
        "table": len(slide_data["tables"]) * 3,
        "chart": len(slide_data["charts"]) * 3,
        "image": len(slide_data["images"]) * 2,
        "empty": 0
    }
    
    if all(v == 0 for v in scores.values()):
        return "title_only"
    
    return max(scores, key=scores.get)


def _map_to_autopresent_type(slide_data):
    """AutoPresent Studio 27종 타입으로 자동 매핑"""
    title = slide_data.get("title", "") or ""
    dominant = slide_data.get("dominantContent", "")
    bullets = slide_data.get("bulletLists", [])
    tables = slide_data.get("tables", [])
    charts = slide_data.get("charts", [])
    images = slide_data.get("images", [])
    body = slide_data.get("bodyTexts", [])
    
    # 1. 표지 감지
    if slide_data["slideNumber"] == 1 and dominant == "title_only":
        return "cover"
    
    # 2. 목차 감지
    toc_keywords = ["목차", "agenda", "contents", "outline", "index"]
    if any(kw in title.lower() for kw in toc_keywords):
        return "toc"
    
    # 3. 표 우세
    if dominant == "table":
        headers = tables[0].get("headers", []) if tables else []
        if any(kw in title.lower() for kw in ["비교", "현황", "분석", "결과"]):
            return "table"
        return "table"
    
    # 4. 차트 우세
    if dominant == "chart":
        if any(kw in title.lower() for kw in ["시장", "market", "규모"]):
            return "market"
        if any(kw in title.lower() for kw in ["kpi", "지표", "성과", "현황"]):
            return "kpi-dashboard"
        return "stats"
    
    # 5. 숫자 통계 슬라이드
    body_all = " ".join(body)
    number_count = len(re.findall(r'\d+[%억만원]', body_all))
    if number_count >= 3 and len(body) <= 4:
        return "stats"
    
    # 6. 방법론 / 프로세스
    if any(kw in title.lower() for kw in ["방법", "절차", "프로세스", "단계", "flow"]):
        return "methodology"
    
    # 7. 마무리 슬라이드
    closing_kw = ["결론", "마무리", "결과", "요약", "conclusion", "summary", "q&a"]
    if any(kw in title.lower() for kw in closing_kw):
        return "conclusion"
    
    # 8. 타임라인 / 로드맵
    if any(kw in title.lower() for kw in ["일정", "로드맵", "timeline", "schedule"]):
        return "timeline"
    
    # 9. 기본: 불릿 리스트
    if bullets:
        return "bullets"
    
    # 10. 개념 설명
    if body and len(body[0]) > 100:
        return "concept"
    
    return "bullets"  # 기본값
```

---

## 의존 라이브러리 설치

```bash
pip install python-pptx Pillow --break-system-packages
```

---

## 출력 형식

```json
{
  "sourceFile": "강의자료.pptx",
  "totalSlides": 32,
  "slides": [
    {
      "slideNumber": 1,
      "layout": "Title Slide",
      "title": "건물 에너지 효율 최적화",
      "bodyTexts": ["2026년 1학기 건축환경공학"],
      "bulletLists": [],
      "tables": [],
      "charts": [],
      "images": [],
      "speakerNote": "오늘 강의는...",
      "dominantContent": "title_only",
      "suggestedType": "cover"
    },
    {
      "slideNumber": 5,
      "title": "에너지 성능 지수 비교",
      "tables": [
        {
          "headers": ["건물유형", "기존", "개선후", "절감률"],
          "rows": [["공동주택", "180kWh", "95kWh", "47%"]]
        }
      ],
      "dominantContent": "table",
      "suggestedType": "table"
    }
  ]
}
```

---

## 사용 예제

예제 1: 32장짜리 강의용 PPT 파싱
- 입력: 텍스트+표+차트+이미지 혼합 PPTX
- 출력: 32개 슬라이드 구조 + 각 AutoPresent 타입 매핑 + 이미지 18개 추출

예제 2: 발표자 노트 포함 PPT
- 입력: 각 슬라이드에 발표자 노트가 작성된 PPTX
- 출력: speakerNote 필드 모두 채워진 결과 → NarrationAgent의 초안 자료로 활용

예제 3: 도형(SmartArt) 슬라이드
- 입력: SmartArt 프로세스 다이어그램
- 출력: 텍스트 추출 가능 부분은 추출, 불가 부분은 이미지로 저장 + 플래그
