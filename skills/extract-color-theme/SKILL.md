---
name: extract-color-theme
description: |
  업로드된 이미지 또는 PDF에서 주요 색상을 추출하여 theme-config.json을 자동 생성합니다.
  사용 시점: ThemeAgent가 이미지/PDF 색상표를 분석하여 커스텀 테마를 생성할 때 호출합니다.
---

# extract-color-theme 스킬

## 기능 설명

이미지/PDF에서 K-Means 클러스터링으로 주요 색상 5가지를 추출하고
AutoPresent Studio의 CSS 변수 체계에 맞게 자동 매핑합니다.

## 추출 알고리즘

```python
from PIL import Image
import numpy as np
from sklearn.cluster import KMeans

def extract_colors(image_path, n_colors=5):
    img = Image.open(image_path).convert('RGB')
    img = img.resize((200, 200))  # 성능을 위해 리사이즈
    pixels = np.array(img).reshape(-1, 3)
    
    kmeans = KMeans(n_clusters=n_colors, random_state=42, n_init=10)
    kmeans.fit(pixels)
    
    colors = kmeans.cluster_centers_.astype(int)
    # 밝기 순으로 정렬 (어두운 색 → 밝은 색)
    brightness = [0.299*r + 0.587*g + 0.114*b for r, g, b in colors]
    sorted_colors = [colors[i] for i in np.argsort(brightness)]
    
    return [f"#{r:02X}{g:02X}{b:02X}" for r, g, b in sorted_colors]
```

## CSS 변수 자동 매핑

추출된 5색상을 어두운 순서로 정렬 후:
- 색상1 (가장 어두움) → --bg-deep
- 색상2 → --bg-card
- 색상3 (중간) → --accent
- 색상4 → --text-secondary
- 색상5 (가장 밝음) → --text-primary

## 사용 예제

예제 1: 기업 로고 이미지에서 색상 추출
- 입력: logo.png (네이비+화이트 계열)
- 출력: navy-custom 테마 theme-config.json 자동 생성

예제 2: 색상표 PDF 업로드
- 입력: brand-colors.pdf (페이지 1의 색상 팔레트)
- 출력: PDF를 이미지로 변환 후 색상 추출

예제 3: 추출 실패 시 폴백
- 입력: 너무 단순한 흑백 이미지
- 출력: deep-space 기본 테마 적용 + 사용자에게 직접 테마 선택 요청
