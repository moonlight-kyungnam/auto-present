---
name: burn-subtitle-video
description: |
  ffmpeg를 사용하여 MP4 영상에 SRT 자막을 하드 burn-in 방식으로 삽입합니다.
  자막 스타일(폰트, 크기, 색상, 위치, 배경)을 project-config.json의 subtitle.style에서
  자동으로 읽어 적용합니다.
  사용 시점: SubtitleAgent가 burn-in 모드에서 자막 삽입을 요청할 때 호출합니다.
---

# burn-subtitle-video 스킬

## 기능 설명

ffmpeg subtitles 필터를 사용하여 렌더링된 MP4에 SRT 자막을 직접 삽입합니다.
원본 영상(output.mp4)을 유지하고 자막 삽입본(output-subtitled.mp4)을 별도 생성합니다.

## ffmpeg 명령 생성 로직

```python
import json
import subprocess
import os

def burn_subtitles(video_path, srt_path, output_path, subtitle_style):
    """
    subtitle_style: project-config.json의 subtitle.style 딕셔너리
    """
    font_name = subtitle_style.get('fontFamily', 'Noto Sans KR').replace(' ', '_')
    font_size = subtitle_style.get('fontSize', 36)
    font_color = subtitle_style.get('fontColor', '#FFFFFF').lstrip('#')
    outline_color = subtitle_style.get('outlineColor', '#000000').lstrip('#')
    outline_width = subtitle_style.get('outlineWidth', 2)
    margin_v = subtitle_style.get('marginBottom', 60)
    bg_enabled = subtitle_style.get('bgEnabled', True)
    
    # ASS 색상 형식: &HBBGGRR (ffmpeg는 BGR 순서)
    def hex_to_ass(hex_color):
        r = hex_color[0:2]
        g = hex_color[2:4]
        b = hex_color[4:6]
        return f"&H{b}{g}{r}"
    
    primary_color = hex_to_ass(font_color)
    outline_color_ass = hex_to_ass(outline_color)
    
    # 배경 박스 설정
    back_colour = "&H80000000" if bg_enabled else "&H00000000"  # 반투명 검정 or 투명
    
    force_style = (
        f"FontName={font_name},"
        f"FontSize={font_size},"
        f"PrimaryColour={primary_color},"
        f"OutlineColour={outline_color_ass},"
        f"Outline={outline_width},"
        f"BackColour={back_colour},"
        f"BorderStyle={'3' if bg_enabled else '1'},"  # 3=배경박스, 1=테두리만
        f"MarginV={margin_v},"
        f"Alignment=2"  # 2=하단 중앙
    )
    
    # SRT 경로의 Windows 백슬래시를 ffmpeg가 처리할 수 있는 형식으로 변환
    srt_escaped = srt_path.replace('\\', '/').replace(':', '\\:')
    
    cmd = [
        'ffmpeg', '-y',
        '-i', video_path,
        '-vf', f"subtitles='{srt_escaped}':force_style='{force_style}'",
        '-c:a', 'copy',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '18',
        output_path
    ]
    
    print("ffmpeg 자막 삽입 실행 중...")
    print(f"명령: {' '.join(cmd)}")
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"오류:\n{result.stderr}")
        return False
    
    file_size = os.path.getsize(output_path) / (1024 * 1024)
    print(f"자막 삽입 완료: {output_path} ({file_size:.1f} MB)")
    return True
```

## ffmpeg 설치 확인

```python
def check_ffmpeg():
    result = subprocess.run(['ffmpeg', '-version'], capture_output=True, text=True)
    if result.returncode != 0:
        print("❌ ffmpeg가 설치되어 있지 않습니다.")
        print("Windows 설치 방법:")
        print("1. https://ffmpeg.org/download.html 에서 Windows 빌드 다운로드")
        print("2. 압축 해제 후 bin 폴더를 PATH 환경변수에 추가")
        print("또는: winget install ffmpeg")
        return False
    return True
```

## 입력 형식

- video/output.mp4 (VideoAgent 렌더링 결과)
- video/subtitles/[프로젝트명].srt (generate-subtitle-srt 출력)
- project-config.json의 subtitle.style 설정

## 출력 형식

- video/output-subtitled.mp4 (자막 삽입 완성 영상)

## 사용 예제

예제 1: 기본 하단 자막 삽입
- 입력: output.mp4 + project.srt + 기본 스타일
- 출력: output-subtitled.mp4 (흰색 자막, 반투명 검정 배경 박스)

예제 2: 커스텀 스타일 자막
- 입력: fontSize:42, fontColor:#FFFF00 (노란색), bgEnabled:false
- 출력: 노란색 테두리 자막, 배경 박스 없음

예제 3: ffmpeg 미설치 시 처리
- 입력: ffmpeg 미설치 환경
- 출력: 설치 안내 메시지 출력, SRT 파일은 유지 (soft 자막으로 대체 제안)
