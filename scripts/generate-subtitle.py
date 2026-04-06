"""
AutoPresent Studio — 자막 SRT/VTT 생성기
나레이션 대본과 TTS 타이밍 정보를 기반으로 자막 파일을 생성합니다.
사용법: python generate-subtitle.py [project_dir]
"""

import json
import os
import sys
import re


def generate_subtitles(project_dir="."):
    """나레이션 대본 + 타이밍 → SRT/VTT 자막 생성"""

    # 입력 파일 로드
    narration_path = os.path.join(project_dir, "narration-scripts.json")
    durations_path = os.path.join(project_dir, "video", "src", "durations.json")
    config_path = os.path.join(project_dir, "project-config.json")

    with open(narration_path, "r", encoding="utf-8") as f:
        narration = json.load(f)
    with open(durations_path, "r", encoding="utf-8") as f:
        durations = json.load(f)
    with open(config_path, "r", encoding="utf-8") as f:
        config = json.load(f)

    subtitle_config = config.get("subtitle", {})
    if not subtitle_config.get("enabled", False):
        print("⏭️  자막 비활성화 — 건너뜁니다.")
        return None

    # 자막 엔트리 생성
    entries = []
    cumulative_ms = 0

    for script_entry in narration["scripts"]:
        slide_idx = script_entry["slideIndex"]
        text = script_entry["script"]

        # 해당 슬라이드의 재생 시간 찾기
        duration_entry = next(
            (d for d in durations["slides"] if d["slideIndex"] == slide_idx), None
        )
        if not duration_entry:
            continue

        duration_ms = duration_entry["durationMs"]

        # 긴 문장을 자막 단위로 분할 (약 3-5초 단위)
        sentences = _split_into_subtitle_chunks(text, duration_ms)

        chunk_duration = duration_ms / max(len(sentences), 1)

        for i, sentence in enumerate(sentences):
            start_ms = cumulative_ms + int(i * chunk_duration)
            end_ms = cumulative_ms + int((i + 1) * chunk_duration)

            entries.append({
                "index": len(entries) + 1,
                "start_ms": start_ms,
                "end_ms": end_ms,
                "text": sentence,
            })

        cumulative_ms += duration_ms
        # pause 추가
        pause = script_entry.get("pauseAfterMs", 0)
        cumulative_ms += pause

    # 출력 디렉토리 생성
    subtitle_dir = os.path.join(project_dir, "video", "subtitles")
    os.makedirs(subtitle_dir, exist_ok=True)

    project_name = config.get("projectName", "presentation")

    # SRT 생성
    srt_path = os.path.join(subtitle_dir, f"{project_name}.srt")
    _write_srt(entries, srt_path)

    # VTT 생성
    vtt_path = os.path.join(subtitle_dir, f"{project_name}.vtt")
    _write_vtt(entries, vtt_path)

    print(f"✅ 자막 생성 완료: {len(entries)}개 엔트리")
    print(f"📁 SRT: {srt_path}")
    print(f"📁 VTT: {vtt_path}")

    return {"srt": srt_path, "vtt": vtt_path, "entries": len(entries)}


def _split_into_subtitle_chunks(text, total_duration_ms, max_chars=40):
    """긴 텍스트를 자막 청크로 분할 (약 40자 단위)"""
    # 문장 분리
    sentences = re.split(r"(?<=[.!?。]) ", text)

    chunks = []
    current = ""

    for sentence in sentences:
        if len(current) + len(sentence) <= max_chars:
            current += (" " if current else "") + sentence
        else:
            if current:
                chunks.append(current)
            # 긴 문장은 다시 분할
            if len(sentence) > max_chars:
                words = sentence.split()
                sub = ""
                for word in words:
                    if len(sub) + len(word) + 1 <= max_chars:
                        sub += (" " if sub else "") + word
                    else:
                        if sub:
                            chunks.append(sub)
                        sub = word
                if sub:
                    chunks.append(sub)
                current = ""
            else:
                current = sentence

    if current:
        chunks.append(current)

    return chunks if chunks else [text]


def _ms_to_srt_time(ms):
    """밀리초 → SRT 시간 형식 (HH:MM:SS,mmm)"""
    hours = ms // 3_600_000
    minutes = (ms % 3_600_000) // 60_000
    seconds = (ms % 60_000) // 1_000
    millis = ms % 1_000
    return f"{hours:02d}:{minutes:02d}:{seconds:02d},{millis:03d}"


def _ms_to_vtt_time(ms):
    """밀리초 → VTT 시간 형식 (HH:MM:SS.mmm)"""
    hours = ms // 3_600_000
    minutes = (ms % 3_600_000) // 60_000
    seconds = (ms % 60_000) // 1_000
    millis = ms % 1_000
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}.{millis:03d}"


def _write_srt(entries, output_path):
    """SRT 파일 생성"""
    lines = []
    for entry in entries:
        lines.append(str(entry["index"]))
        lines.append(f"{_ms_to_srt_time(entry['start_ms'])} --> {_ms_to_srt_time(entry['end_ms'])}")
        lines.append(entry["text"])
        lines.append("")

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


def _write_vtt(entries, output_path):
    """WebVTT 파일 생성"""
    lines = ["WEBVTT", ""]
    for entry in entries:
        lines.append(str(entry["index"]))
        lines.append(f"{_ms_to_vtt_time(entry['start_ms'])} --> {_ms_to_vtt_time(entry['end_ms'])}")
        lines.append(entry["text"])
        lines.append("")

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


if __name__ == "__main__":
    project_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    generate_subtitles(project_dir)
