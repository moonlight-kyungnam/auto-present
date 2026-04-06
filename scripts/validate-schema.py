"""
AutoPresent Studio — JSON 스키마 검증기
각 파이프라인 단계의 산출물이 스키마에 맞는지 검증합니다.
사용법: python validate-schema.py [project_dir]
"""

import json
import os
import sys
import io
from jsonschema import validate, ValidationError

# Windows cp949 인코딩 문제 방지
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


# 검증 대상 파일 → 스키마 매핑
VALIDATION_MAP = {
    "project-config.json": "schemas/project-config.schema.json",
    "content-brief.json": "schemas/content-brief.schema.json",
    "slides-data.json": "schemas/slides-data.schema.json",
    "theme-config.json": "schemas/theme-config.schema.json",
    "narration-scripts.json": "schemas/narration-scripts.schema.json",
    "video/src/durations.json": "schemas/durations.schema.json",
}


def validate_all(project_dir="."):
    """프로젝트 내 모든 JSON 산출물 검증"""
    results = []

    for data_file, schema_file in VALIDATION_MAP.items():
        data_path = os.path.join(project_dir, data_file)
        schema_path = os.path.join(project_dir, schema_file)

        result = {
            "file": data_file,
            "status": "skip",
            "errors": [],
        }

        # 파일 존재 여부 확인
        if not os.path.exists(data_path):
            result["status"] = "missing"
            results.append(result)
            continue

        if not os.path.exists(schema_path):
            result["status"] = "no_schema"
            result["errors"].append(f"스키마 파일 없음: {schema_file}")
            results.append(result)
            continue

        # JSON 파싱
        try:
            with open(data_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            result["status"] = "invalid_json"
            result["errors"].append(f"JSON 파싱 오류: {str(e)}")
            results.append(result)
            continue

        # 스키마 로드
        try:
            with open(schema_path, "r", encoding="utf-8") as f:
                schema = json.load(f)
        except json.JSONDecodeError as e:
            result["status"] = "invalid_schema"
            result["errors"].append(f"스키마 파싱 오류: {str(e)}")
            results.append(result)
            continue

        # 검증 실행
        try:
            validate(instance=data, schema=schema)
            result["status"] = "valid"
        except ValidationError as e:
            result["status"] = "invalid"
            result["errors"].append(f"검증 실패: {e.message}")
            if e.path:
                result["errors"].append(f"위치: {'.'.join(str(p) for p in e.path)}")

        results.append(result)

    return results


def validate_single(data_path, schema_path):
    """단일 파일 검증"""
    with open(data_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    with open(schema_path, "r", encoding="utf-8") as f:
        schema = json.load(f)

    try:
        validate(instance=data, schema=schema)
        return True, []
    except ValidationError as e:
        return False, [e.message]


def print_report(results):
    """검증 결과 리포트 출력"""
    print("\n" + "=" * 60)
    print("  AutoPresent Studio — 품질 검증 리포트")
    print("=" * 60)

    status_icons = {
        "valid": "✅",
        "invalid": "❌",
        "missing": "⬜",
        "invalid_json": "🔴",
        "invalid_schema": "🟡",
        "no_schema": "🟡",
        "skip": "⏭️",
    }

    valid_count = 0
    error_count = 0
    missing_count = 0

    for r in results:
        icon = status_icons.get(r["status"], "❓")
        print(f"\n  {icon} {r['file']}")

        if r["status"] == "valid":
            print(f"     → 스키마 검증 통과")
            valid_count += 1
        elif r["status"] == "missing":
            print(f"     → 파일 없음 (해당 단계 미실행)")
            missing_count += 1
        elif r["status"] == "invalid":
            error_count += 1
            for err in r["errors"]:
                print(f"     → {err}")
        else:
            error_count += 1
            for err in r["errors"]:
                print(f"     → {err}")

    print(f"\n{'=' * 60}")
    print(f"  결과: ✅ {valid_count}개 통과 / ❌ {error_count}개 오류 / ⬜ {missing_count}개 미생성")
    print(f"{'=' * 60}\n")

    return error_count == 0


if __name__ == "__main__":
    project_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    results = validate_all(project_dir)
    success = print_report(results)
    sys.exit(0 if success else 1)
