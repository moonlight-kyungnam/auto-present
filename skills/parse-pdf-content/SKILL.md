---
name: parse-pdf-content
description: |
  PDF 파일을 페이지별로 분석하여 텍스트, 표, 이미지, 차트를 개별 추출합니다.
  텍스트 위주 PDF, 이미지·표 혼합 PDF, 스캔 PDF 3가지 유형을 자동 감지하여
  각각 최적의 추출 방법을 적용합니다.
  사용 시점: ContentIngestAgent가 PDF 파일을 처리할 때 호출합니다.
---

# parse-pdf-content 스킬

## 기능 설명

PDF의 내용 유형을 자동 감지하고 유형별 최적 파싱 전략을 적용하여
슬라이드 제작에 바로 활용 가능한 구조화된 데이터를 반환합니다.

---

## PDF 유형 자동 감지

```python
import fitz  # PyMuPDF
import os

def detect_pdf_type(pdf_path):
    """
    반환값: 'text-heavy' | 'mixed' | 'scanned'
    """
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    
    text_chars = 0
    image_count = 0
    
    for page in doc:
        text_chars += len(page.get_text())
        image_list = page.get_images()
        image_count += len(image_list)
    
    avg_text_per_page = text_chars / max(total_pages, 1)
    avg_images_per_page = image_count / max(total_pages, 1)
    
    if avg_text_per_page < 100 and avg_images_per_page > 0.5:
        return 'scanned'
    elif avg_images_per_page > 1.0 or avg_text_per_page < 300:
        return 'mixed'
    else:
        return 'text-heavy'
```

---

## 유형별 파싱 전략

### A. 텍스트 위주 PDF

```python
def parse_text_heavy(pdf_path, output_dir):
    doc = fitz.open(pdf_path)
    sections = []
    
    for page_num, page in enumerate(doc, 1):
        blocks = page.get_text("dict")["blocks"]
        
        for block in blocks:
            if block["type"] == 0:  # 텍스트 블록
                for line in block["lines"]:
                    for span in line["spans"]:
                        text = span["text"].strip()
                        font_size = span["size"]
                        is_bold = "bold" in span["font"].lower()
                        
                        if not text:
                            continue
                        
                        # 헤딩 감지 (폰트 크기 + 굵기 기준)
                        if font_size >= 16 or (font_size >= 13 and is_bold):
                            level = 1 if font_size >= 18 else 2
                        else:
                            level = 0  # 본문
                        
                        sections.append({
                            "page": page_num,
                            "level": level,
                            "text": text,
                            "fontSize": font_size,
                            "isBold": is_bold
                        })
    
    return sections
```

### B. 이미지·표 혼합 PDF

```python
def parse_mixed(pdf_path, output_dir):
    doc = fitz.open(pdf_path)
    os.makedirs(output_dir, exist_ok=True)
    results = []
    
    for page_num, page in enumerate(doc, 1):
        page_result = {
            "page": page_num,
            "textBlocks": [],
            "tables": [],
            "images": [],
            "charts": []
        }
        
        # 1. 텍스트 추출
        text = page.get_text("blocks")
        for block in text:
            if block[6] == 0:  # 텍스트 타입
                page_result["textBlocks"].append({
                    "text": block[4].strip(),
                    "bbox": block[:4]
                })
        
        # 2. 이미지 추출
        image_list = page.get_images(full=True)
        for img_idx, img in enumerate(image_list):
            xref = img[0]
            base_image = doc.extract_image(xref)
            img_bytes = base_image["image"]
            img_ext = base_image["ext"]
            
            img_filename = f"page{page_num:03d}_img{img_idx+1:02d}.{img_ext}"
            img_path = os.path.join(output_dir, img_filename)
            
            with open(img_path, "wb") as f:
                f.write(img_bytes)
            
            page_result["images"].append({
                "path": img_path,
                "filename": img_filename,
                "width": base_image.get("width"),
                "height": base_image.get("height"),
                "visualDescription": None  # ContentIngestAgent가 Claude Vision으로 채움
            })
        
        # 3. 표 감지 (선 패턴 분석)
        # PyMuPDF의 find_tables() 사용 (PyMuPDF 1.23.0+)
        try:
            tabs = page.find_tables()
            for tab_idx, tab in enumerate(tabs.tables):
                table_data = tab.extract()
                if table_data:
                    page_result["tables"].append({
                        "tableIndex": tab_idx,
                        "page": page_num,
                        "headers": table_data[0] if table_data else [],
                        "rows": table_data[1:] if len(table_data) > 1 else [],
                        "rawData": table_data
                    })
        except AttributeError:
            pass  # 구버전 PyMuPDF 호환
        
        results.append(page_result)
    
    return results
```

### C. 스캔 PDF (OCR)

```python
def parse_scanned(pdf_path, output_dir):
    """pytesseract + pdf2image 필요"""
    try:
        import pytesseract
        from pdf2image import convert_from_path
        from PIL import Image
    except ImportError:
        return {"error": "pip install pytesseract pdf2image pillow 필요"}
    
    os.makedirs(output_dir, exist_ok=True)
    pages = convert_from_path(pdf_path, dpi=200)
    results = []
    
    for page_num, page_img in enumerate(pages, 1):
        # 한국어 + 영어 OCR
        ocr_config = '--oem 3 --psm 6 -l kor+eng'
        
        ocr_data = pytesseract.image_to_data(
            page_img, config=ocr_config, output_type=pytesseract.Output.DICT
        )
        
        # 신뢰도 60 이상인 텍스트만 수집
        confident_text = []
        low_confidence_zones = []
        
        for i, conf in enumerate(ocr_data['conf']):
            if conf == -1:
                continue
            word = ocr_data['text'][i].strip()
            if not word:
                continue
            if int(conf) >= 60:
                confident_text.append(word)
            else:
                low_confidence_zones.append({
                    "word": word,
                    "confidence": conf,
                    "position": (ocr_data['left'][i], ocr_data['top'][i])
                })
        
        results.append({
            "page": page_num,
            "text": " ".join(confident_text),
            "lowConfidenceZones": low_confidence_zones,
            "hasUncertainContent": len(low_confidence_zones) > 0
        })
    
    return results
```

---

## 의존 라이브러리 설치

```bash
pip install PyMuPDF pytesseract pdf2image Pillow --break-system-packages
# Tesseract 한국어 데이터 설치 (Windows)
# https://github.com/UB-Mannheim/tesseract/wiki 에서 설치
# 언어팩: kor.traineddata 추가
```

---

## 출력 형식

```json
{
  "sourceFile": "강의자료.pdf",
  "pdfType": "mixed",
  "totalPages": 24,
  "sections": [
    {
      "page": 1,
      "type": "text",
      "level": 1,
      "text": "섹션 제목",
      "isBold": true
    },
    {
      "page": 3,
      "type": "table",
      "headers": ["항목", "2023", "2024", "증감"],
      "rows": [["매출액", "120억", "158억", "+32%"]]
    },
    {
      "page": 5,
      "type": "image",
      "path": "extracted/page005_img01.png",
      "visualDescription": null
    }
  ],
  "extractedAssets": ["extracted/page005_img01.png"],
  "uncertainPages": [8, 12],
  "processingNotes": ["8페이지: 저해상도 이미지로 텍스트 추출 불가"]
}
```

---

## 사용 예제

예제 1: 정부과제 보고서 PDF (텍스트 위주)
- 입력: 50페이지 정책 보고서
- 출력: 헤딩 구조 기반 18개 섹션 추출, 표 7개 변환

예제 2: 교재 PDF (이미지+표 혼합)
- 입력: 그림·수식·표가 포함된 24페이지 교재
- 출력: 텍스트 블록 + 이미지 12개 추출 + 표 5개 JSON 변환

예제 3: 스캔 강의 노트
- 입력: 손으로 작성한 노트 스캔본
- 출력: OCR 텍스트 + 신뢰도 낮은 구간 15개 플래그
