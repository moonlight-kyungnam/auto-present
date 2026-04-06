---
name: validate-json-schema
description: |
  AutoPresent Studio의 모든 JSON 파일(slides-data, narration-scripts, theme-config,
  durations, project-config, subtitle 관련)의 스키마 유효성을 검증합니다.
  사용 시점: 각 에이전트가 JSON 파일을 생성한 직후 저장 전 검증 단계에서 호출합니다.
---

# validate-json-schema 스킬

## 기능 설명

jsonschema 라이브러리를 사용하여 AutoPresent Studio의 핵심 JSON 파일들을
사전 정의된 스키마에 따라 검증합니다.

## 검증 대상 및 핵심 규칙

**slides-data.json:**
- id: 양의 정수, 중복 없음
- type: 27종 타입 중 하나
- fragmentOrder의 모든 키가 실제 필드에 존재하는지 확인
- speakerNote: 모든 슬라이드에 필수

**narration-scripts.json:**
- id가 slides-data.json의 id와 1:1 대응
- script: 비어있지 않은 문자열
- totalCharCount: fragmentScripts의 charCount 합산과 일치

**theme-config.json:**
- cssVariables에 6개 필수 CSS 변수 모두 포함
- 색상값: #RRGGBB 또는 rgba() 형식

**durations.json:**
- durationFrames = round(durationSeconds × fps) 검증
- slides 배열 길이 = slides-data.json 슬라이드 수

**project-config.json의 subtitle 블록:**
- mode: "soft" | "burn-in" | "remotion" | "disabled"
- position: "bottom" | "top" | "bottom-left" | "bottom-right"
- fontSize: 양의 정수 (12~72 범위 권장)

## 출력 형식

```json
{
  "valid": true,
  "errors": [],
  "warnings": [
    { "field": "slides[3].speakerNote", "message": "매우 짧은 speakerNote (10자 미만)" }
  ]
}
```

## 사용 예제

예제 1: 정상 slides-data.json 검증
- 입력: 10개 슬라이드, 모든 필드 완전
- 출력: valid:true, errors:[], warnings:[]

예제 2: fragmentOrder 오류 감지
- 입력: fragmentOrder에 "stats[5]" 포함 (stats 배열 길이 3)
- 출력: valid:false, errors:[{field:"slides[2].fragmentOrder[5]", message:"존재하지 않는 키"}]

예제 3: subtitle 스키마 검증
- 입력: subtitle.mode = "hardcode" (유효하지 않은 값)
- 출력: valid:false, errors:[{field:"subtitle.mode", message:"허용 값: soft|burn-in|remotion|disabled"}]
