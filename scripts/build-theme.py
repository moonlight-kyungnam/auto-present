#!/usr/bin/env python3
"""
AutoPresent Studio - theme-config.json → video/src/theme.ts 변환 스크립트
사용법: python scripts/build-theme.py
"""
import json
import os
import re

def hex_to_rgba(hex_color, alpha=1.0):
    hex_color = hex_color.lstrip("#")
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)
    return f"rgba({r},{g},{b},{alpha})"

def generate_theme_ts(theme_config):
    css = theme_config.get("cssVariables", {})
    fonts = theme_config.get("fonts", {})

    lines = [
        "// 자동 생성 파일 — build-theme.py로 재생성 가능",
        "// theme-config.json 수정 후 python scripts/build-theme.py 실행",
        "",
        "export const theme = {",
        f"  bgDeep:        \"{css.get('--bg-deep', '#0D1321')}\",",
        f"  bgCard:        \"{css.get('--bg-card', '#1D2D44')}\",",
        f"  accent:        \"{css.get('--accent', '#3E5C76')}\",",
        f"  accentDim:     \"{css.get('--accent-dim', '#284D6B')}\",",
        f"  accentGlow:    \"{css.get('--accent-glow', 'rgba(62,92,118,0.15)')}\",",
        f"  border:        \"{css.get('--border', 'rgba(62,92,118,0.2)')}\",",
        f"  textPrimary:   \"{css.get('--text-primary', '#F0EBD8')}\",",
        f"  textSecondary: \"{css.get('--text-secondary', '#748CAB')}\",",
        f"  textMuted:     \"{css.get('--text-muted', '#415A77')}\",",
        "  fonts: {",
        f"    heading: \"{fonts.get('heading', 'Noto Sans KR')}\",",
        f"    body:    \"{fonts.get('body', 'Noto Sans KR')}\",",
        f"    mono:    \"{fonts.get('mono', 'JetBrains Mono')}\"",
        "  }",
        "} as const;",
        "",
        "export type Theme = typeof theme;",
    ]
    return "\n".join(lines)

def main():
    base_dir      = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    config_file   = os.path.join(base_dir, "theme-config.json")
    output_file   = os.path.join(base_dir, "video", "src", "theme.ts")

    if not os.path.exists(config_file):
        print(f"오류: theme-config.json 파일이 없습니다: {config_file}")
        return

    with open(config_file, encoding="utf-8") as f:
        theme_config = json.load(f)

    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    ts_content = generate_theme_ts(theme_config)

    with open(output_file, "w", encoding="utf-8") as f:
        f.write(ts_content)

    theme_name = theme_config.get("themeName", "Unknown")
    print(f"theme.ts 생성 완료: {output_file}")
    print(f"적용된 테마: {theme_name}")

if __name__ == "__main__":
    main()
