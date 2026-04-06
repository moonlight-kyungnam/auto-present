---
name: generate-subtitle-srt
description: |
  narration-scripts.json과 durations.json을 읽어 SRT 및 VTT 자막 파일을 생성합니다.
  각 슬라이드의 TTS 재생 시간과 fragmentScripts의 글자수 비율을 기반으로
  자막 타이밍을 자동 계산합니다.
  사용 시점: SubtitleAgent가 SRT/VTT 파일 생성을 요청할 때 호출합니다.
---

# generate-subtitle-srt 스킬

## 기능 설명

narration-scripts.json + durations.json → SRT + VTT 자막 파일 자동 생성.

## 타이밍 계산 알고리즘

```python
import json
import re

def ms_to_srt_time(ms):
    h = ms // 3600000
    m = (ms % 3600000) // 60000
    s = (ms % 60000) // 1000
    ms_r = ms % 1000
    return f"{h:02d}:{m:02d}:{s:02d},{ms_r:03d}"

def ms_to_vtt_time(ms):
    return ms_to_srt_time(ms).replace(',', '.')

def split_text_to_lines(text, max_chars=40):
    """40자 초과 시 자동 줄바꿈"""
    words = text.split()
    lines, current = [], ""
    for word in words:
        if len(current) + len(word) + 1 <= max_chars:
            current += (" " + word if current else word)
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return "\n".join(lines)

def generate_srt(narration_file, durations_file, output_srt, output_vtt):
    with open(narration_file, encoding='utf-8') as f:
        scripts = json.load(f)
    with open(durations_file, encoding='utf-8') as f:
        durations = json.load(f)
    
    # 슬라이드별 시작 시각(ms) 계산
    slide_start_ms = {}
    cumulative_ms = 0
    for slide in durations['slides']:
        slide_start_ms[slide['id']] = cumulative_ms
        cumulative_ms += int(slide['durationSeconds'] * 1000)
    
    srt_blocks = []
    vtt_blocks = ["WEBVTT\n"]
    counter = 1
    
    for script in scripts:
        sid = script['id']
        start_ms = slide_start_ms.get(sid, 0)
        total_ms = int(next(
            (s['durationSeconds'] for s in durations['slides'] if s['id'] == sid), 5
        ) * 1000)
        
        fragments = script.get('fragmentScripts', [])
        if not fragments:
            # fragment 없으면 전체 대본을 하나의 자막으로
            text = split_text_to_lines(script['script'])
            end_ms = start_ms + total_ms
            srt_blocks.append(
                f"{counter}\n{ms_to_srt_time(start_ms)} --> {ms_to_srt_time(end_ms)}\n{text}\n"
            )
            vtt_blocks.append(
                f"{ms_to_vtt_time(start_ms)} --> {ms_to_vtt_time(end_ms)}\n{text}\n"
            )
            counter += 1
            continue
        
        total_chars = sum(f.get('charCount', len(f.get('text', ''))) for f in fragments)
        current_ms = start_ms
        
        for frag in fragments:
            frag_chars = frag.get('charCount', len(frag.get('text', '')))
            frag_ms = max(1500, int((frag_chars / max(total_chars, 1)) * total_ms))
            end_frag_ms = current_ms + frag_ms
            
            text = split_text_to_lines(frag.get('text', ''))
            if not text.strip():
                current_ms = end_frag_ms
                continue
            
            srt_blocks.append(
                f"{counter}\n{ms_to_srt_time(current_ms)} --> {ms_to_srt_time(end_frag_ms)}\n{text}\n"
            )
            vtt_blocks.append(
                f"{ms_to_vtt_time(current_ms)} --> {ms_to_vtt_time(end_frag_ms)}\n{text}\n"
            )
            counter += 1
            current_ms = end_frag_ms
    
    with open(output_srt, 'w', encoding='utf-8') as f:
        f.write("\n".join(srt_blocks))
    
    with open(output_vtt, 'w', encoding='utf-8') as f:
        f.write("\n".join(vtt_blocks))
    
    print(f"SRT 생성 완료: {output_srt} ({counter-1}개 구간)")
    print(f"VTT 생성 완료: {output_vtt}")
```

## 입력 형식

- narration-scripts.json (NarrationAgent 출력)
- durations.json (TTSAgent 출력)

## 출력 형식

- video/subtitles/[프로젝트명].srt
- video/subtitles/[프로젝트명].vtt

## 사용 예제

예제 1: 일반 대본 SRT 생성
- 입력: narration-scripts.json (10개 슬라이드), durations.json (총 180초)
- 출력: 45개 자막 구간 SRT 파일

예제 2: fragment 없는 슬라이드 처리
- 입력: fragmentScripts 배열이 빈 슬라이드
- 출력: 슬라이드 전체 재생 시간 동안 전체 대본을 하나의 자막 블록으로 생성

예제 3: 긴 텍스트 자동 줄바꿈
- 입력: "안녕하세요 오늘은 AutoPresent Studio의 핵심 기능에 대해 설명드리겠습니다" (45자)
- 출력: "안녕하세요 오늘은 AutoPresent Studio의\n핵심 기능에 대해 설명드리겠습니다"
