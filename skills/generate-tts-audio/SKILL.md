---
name: generate-tts-audio
description: |
  narration-scripts.json의 대본을 edge-tts로 MP3 파일로 변환하고
  mutagen으로 재생 시간을 측정하여 durations.json을 갱신합니다.
  사용 시점: TTSAgent가 각 슬라이드의 나레이션 음성 파일을 생성할 때 호출합니다.
---

# generate-tts-audio 스킬

## 기능 설명

scripts/generate-narration.py를 통해 edge-tts를 실행하고 MP3 파일을 생성합니다.

## generate-narration.py 전체 코드

```python
#!/usr/bin/env python3
"""
AutoPresent Studio - TTS 음성 생성 스크립트
edge-tts로 나레이션 MP3 생성 + mutagen으로 재생 시간 측정
"""
import asyncio
import json
import os
import sys
import edge_tts
from mutagen.mp3 import MP3

async def generate_audio(text, voice, rate, output_path):
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    await communicate.save(output_path)

def get_duration(mp3_path):
    audio = MP3(mp3_path)
    return audio.info.length

def main():
    # 경로 설정
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    narration_file = os.path.join(base_dir, 'narration-scripts.json')
    config_file = os.path.join(base_dir, 'project-config.json')
    audio_dir = os.path.join(base_dir, 'video', 'public', 'audio')
    durations_file = os.path.join(base_dir, 'video', 'src', 'durations.json')
    
    os.makedirs(audio_dir, exist_ok=True)
    
    with open(narration_file, encoding='utf-8') as f:
        scripts = json.load(f)
    with open(config_file, encoding='utf-8') as f:
        config = json.load(f)
    
    fps = config.get('fps', 15)
    default_voice = config.get('voice', 'ko-KR-InJoonNeural')
    default_rate = config.get('voiceRate', '-5%')
    
    durations = []
    
    for script in scripts:
        sid = script['id']
        text = script['script']
        voice = script.get('voice', default_voice)
        rate = script.get('voiceRate', default_rate)
        
        mp3_path = os.path.join(audio_dir, f'slide-{sid:02d}.mp3')
        
        print(f"[{sid:02d}] {script.get('label','슬라이드')} 생성 중...", end=' ')
        
        asyncio.run(generate_audio(text, voice, rate, mp3_path))
        duration_sec = get_duration(mp3_path)
        duration_frames = round(duration_sec * fps)
        
        durations.append({
            "id": sid,
            "label": script.get('label', f'슬라이드{sid}'),
            "durationSeconds": round(duration_sec, 3),
            "durationFrames": duration_frames
        })
        
        print(f"{duration_sec:.1f}초 ({duration_frames}프레임)")
    
    total_sec = sum(d['durationSeconds'] for d in durations)
    total_frames = sum(d['durationFrames'] for d in durations)
    
    durations_data = {
        "slides": durations,
        "fps": fps,
        "totalDurationSeconds": round(total_sec, 3),
        "totalDurationFrames": total_frames
    }
    
    with open(durations_file, 'w', encoding='utf-8') as f:
        json.dump(durations_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n완료: 총 {len(scripts)}개 슬라이드, {total_sec:.1f}초 ({total_frames}프레임)")
    print(f"durations.json 저장: {durations_file}")

if __name__ == '__main__':
    main()
```

## 실행 명령

```bash
python scripts/generate-narration.py
```

## 사용 예제

예제 1: 전체 슬라이드 TTS 생성
- 입력: 10개 슬라이드 narration-scripts.json
- 출력: slide-01.mp3 ~ slide-10.mp3 + durations.json

예제 2: 특정 슬라이드만 재생성
- 입력: scripts 배열에서 id=3인 항목만 처리
- 출력: slide-03.mp3만 재생성, durations.json 해당 항목 갱신

예제 3: 혼성 음성 처리
- 입력: 슬라이드별 voice 필드 다름 (InJoon/SunHi 혼합)
- 출력: 각 슬라이드에 지정된 음성으로 개별 생성
