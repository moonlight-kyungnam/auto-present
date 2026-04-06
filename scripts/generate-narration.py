#!/usr/bin/env python3
"""
AutoPresent Studio - TTS 음성 생성 스크립트
edge-tts로 나레이션 MP3 생성 + mutagen으로 재생 시간 측정
사용법: python scripts/generate-narration.py
"""
import asyncio
import json
import os
import sys

def check_dependencies():
    missing = []
    try:
        import edge_tts
    except ImportError:
        missing.append("edge-tts")
    try:
        from mutagen.mp3 import MP3
    except ImportError:
        missing.append("mutagen")
    if missing:
        print(f"필요한 라이브러리가 없습니다: {', '.join(missing)}")
        print(f"설치 명령: pip install {' '.join(missing)}")
        sys.exit(1)

async def generate_audio(text, voice, rate, output_path):
    import edge_tts
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    await communicate.save(output_path)

def get_duration(mp3_path):
    from mutagen.mp3 import MP3
    audio = MP3(mp3_path)
    return audio.info.length

def main():
    check_dependencies()

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    narration_file = os.path.join(base_dir, "narration-scripts.json")
    config_file    = os.path.join(base_dir, "project-config.json")
    audio_dir      = os.path.join(base_dir, "video", "public", "audio")
    durations_file = os.path.join(base_dir, "video", "src", "durations.json")

    if not os.path.exists(narration_file):
        print(f"오류: narration-scripts.json 파일이 없습니다: {narration_file}")
        sys.exit(1)

    os.makedirs(audio_dir, exist_ok=True)
    os.makedirs(os.path.dirname(durations_file), exist_ok=True)

    with open(narration_file, encoding="utf-8") as f:
        scripts = json.load(f)
    with open(config_file, encoding="utf-8") as f:
        config = json.load(f)

    fps           = config.get("fps", 15)
    default_voice = config.get("voice", "ko-KR-InJoonNeural")
    default_rate  = config.get("voiceRate", "-5%")

    print(f"총 {len(scripts)}개 슬라이드 음성 생성 시작...")
    print(f"기본 음성: {default_voice} / 속도: {default_rate} / FPS: {fps}\n")

    durations = []

    for script in scripts:
        sid   = script["id"]
        text  = script["script"]
        voice = script.get("voice", default_voice)
        rate  = script.get("voiceRate", default_rate)
        label = script.get("label", f"슬라이드{sid}")

        mp3_path = os.path.join(audio_dir, f"slide-{sid:02d}.mp3")

        print(f"[{sid:02d}/{len(scripts):02d}] {label} ... ", end="", flush=True)

        try:
            asyncio.run(generate_audio(text, voice, rate, mp3_path))
            duration_sec    = get_duration(mp3_path)
            duration_frames = round(duration_sec * fps)

            durations.append({
                "id": sid,
                "label": label,
                "durationSeconds": round(duration_sec, 3),
                "durationFrames": duration_frames
            })

            print(f"{duration_sec:.1f}초 ({duration_frames}프레임) ✓")

        except Exception as e:
            print(f"오류: {e}")
            durations.append({
                "id": sid,
                "label": label,
                "durationSeconds": 5.0,
                "durationFrames": round(5.0 * fps),
                "error": str(e)
            })

    total_sec    = sum(d["durationSeconds"] for d in durations)
    total_frames = sum(d["durationFrames"]  for d in durations)

    durations_data = {
        "slides": durations,
        "fps": fps,
        "totalDurationSeconds": round(total_sec, 3),
        "totalDurationFrames": total_frames
    }

    with open(durations_file, "w", encoding="utf-8") as f:
        json.dump(durations_data, f, ensure_ascii=False, indent=2)

    print(f"\n완료: 총 {len(scripts)}개 슬라이드")
    print(f"총 재생 시간: {int(total_sec//60)}분 {total_sec%60:.1f}초 ({total_frames}프레임)")
    print(f"durations.json 저장: {durations_file}")

if __name__ == "__main__":
    main()
