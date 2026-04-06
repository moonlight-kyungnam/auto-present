"""
AutoPresent Studio — 자막 Burn-in 스크립트
ffmpeg를 사용하여 SRT 자막을 영상에 직접 삽입합니다.
사용법: python burn-subtitle.py <input.mp4> <input.srt> [output.mp4]
"""

import subprocess
import sys
import os
import json


def burn_subtitle(video_path, srt_path, output_path=None, config_path=None):
    """ffmpeg를 사용하여 자막을 영상에 burn-in"""

    if not output_path:
        base, ext = os.path.splitext(video_path)
        output_path = f"{base}_subtitled{ext}"

    # 자막 스타일 설정
    style = _get_subtitle_style(config_path)

    # ffmpeg 자막 필터 구성
    # Windows 경로에서 : 과 \ 이스케이프
    srt_escaped = srt_path.replace("\\", "/").replace(":", "\\:")

    subtitle_filter = (
        f"subtitles='{srt_escaped}'"
        f":force_style='"
        f"FontSize={style['fontSize']},"
        f"FontName={style['fontFamily']},"
        f"PrimaryColour={_hex_to_ass(style['fontColor'])},"
        f"OutlineColour={_hex_to_ass(style['outlineColor'])},"
        f"Outline={style['outlineWidth']},"
        f"Alignment=2,"
        f"MarginV={style['marginBottom']}"
        f"'"
    )

    # 배경 박스 추가
    if style.get("bgEnabled"):
        subtitle_filter = subtitle_filter.replace(
            "Alignment=2",
            f"Alignment=2,BorderStyle=4,BackColour={_hex_to_ass(style['bgColor'])}"
        )

    cmd = [
        "ffmpeg",
        "-i", video_path,
        "-vf", subtitle_filter,
        "-c:a", "copy",
        "-c:v", "libx264",
        "-crf", "23",
        "-y",
        output_path,
    ]

    print(f"🔄 자막 burn-in 시작...")
    print(f"   입력: {video_path}")
    print(f"   자막: {srt_path}")
    print(f"   출력: {output_path}")

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        if result.returncode == 0:
            size_mb = os.path.getsize(output_path) / (1024 * 1024)
            print(f"✅ Burn-in 완료: {output_path} ({size_mb:.1f}MB)")
            return output_path
        else:
            print(f"❌ ffmpeg 오류: {result.stderr[:500]}")
            return None
    except FileNotFoundError:
        print("❌ ffmpeg가 설치되어 있지 않습니다.")
        print("   설치: https://ffmpeg.org/download.html")
        return None
    except subprocess.TimeoutExpired:
        print("❌ ffmpeg 시간 초과 (5분)")
        return None


def _get_subtitle_style(config_path=None):
    """project-config.json에서 자막 스타일 로드"""
    default_style = {
        "fontSize": 36,
        "fontFamily": "Noto Sans KR",
        "fontColor": "#FFFFFF",
        "outlineColor": "#000000",
        "outlineWidth": 2,
        "bgEnabled": True,
        "bgColor": "rgba(0,0,0,0.55)",
        "marginBottom": 60,
    }

    if config_path and os.path.exists(config_path):
        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)
        style = config.get("subtitle", {}).get("style", {})
        default_style.update({k: v for k, v in style.items() if v is not None})

    return default_style


def _hex_to_ass(hex_color):
    """HEX 색상 → ASS 자막 색상 형식 (&HBBGGRR&)"""
    hex_color = hex_color.lstrip("#")
    if len(hex_color) == 6:
        r, g, b = hex_color[0:2], hex_color[2:4], hex_color[4:6]
        return f"&H00{b}{g}{r}&"
    return "&H00FFFFFF&"


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("사용법: python burn-subtitle.py <input.mp4> <input.srt> [output.mp4]")
        sys.exit(1)

    video = sys.argv[1]
    srt = sys.argv[2]
    output = sys.argv[3] if len(sys.argv) > 3 else None

    config = "project-config.json" if os.path.exists("project-config.json") else None
    burn_subtitle(video, srt, output, config)
