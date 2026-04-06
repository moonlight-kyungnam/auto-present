# AutoPresent Studio — Orchestrator (CLAUDE.md)

## 시스템 개요

**AutoPresent Studio**는 다양한 입력 자료(웹 조사, PDF, PPTX, DOCX, 텍스트)에서
주제를 이해하고 슬라이드를 설계하여 웹 프레젠테이션(.html) + 나레이션 음성(.mp3)
+ 발표영상(.mp4)까지 반자동화로 생성하는 멀티에이전트 시스템입니다.

- **개발 환경**: Antigravity IDE + Claude Code
- **실행 환경**: Windows 로컬 PC + 브라우저 미리보기
- **기술 스택**: React + TypeScript, Remotion v4, edge-tts, ffmpeg(자막 burn-in 옵션)

---

## 전체 에이전트 구성 (10개)

| 에이전트 | 역할 | 단계 | 모델 |
|---|---|---|---|
| `project-init-agent` | 프로젝트 초기화 + 자막·음성 설정 수집 | STEP 0 | haiku |
| `content-ingest-agent` | 입력 자료 분석·정규화 (웹/PDF/PPTX/DOCX/텍스트) | STEP 1 | opus |
| `slide-agent` | 슬라이드 구성 설계 + slides-data.json 생성 | STEP 2 | opus |
| `theme-agent` | 색상 추출 + theme-config.json 생성 | STEP 3 | sonnet |
| `web-agent` | HTML 웹 프레젠테이션 생성 (27종 슬라이드) | STEP 4 | opus |
| `narration-agent` | 나레이션 대본 작성 | STEP 5 | opus |
| `tts-agent` | TTS 음성 파일 생성 (edge-tts) | STEP 6 | sonnet |
| `subtitle-agent` | 자막 SRT/VTT 생성 + burn-in 처리 (선택) | STEP 6.5 | sonnet |
| `video-agent` | Remotion 영상 렌더링 → 최종 MP4 | STEP 7 | sonnet |
| `quality-agent` | 전 단계 산출물 품질 검증 + 오류 복구 | 각 STEP 후 | sonnet |

---

## 스킬 목록 (15개)

| 스킬 | 담당 에이전트 | 신규 |
|---|---|---|
| `parse-pdf-content` | ContentIngestAgent | ★ |
| `parse-pptx-content` | ContentIngestAgent | ★ |
| `parse-web-research` | ContentIngestAgent | ★ |
| `normalize-content-structure` | ContentIngestAgent | ★ |
| `analyze-presentation-type` | SlideAgent | |
| `generate-slides-structure` | SlideAgent | |
| `fragment-order-calculator` | SlideAgent | |
| `extract-color-theme` | ThemeAgent | |
| `generate-html-slide` | WebAgent | |
| `write-narration-script` | NarrationAgent | |
| `generate-tts-audio` | TTSAgent | |
| `generate-subtitle-srt` | SubtitleAgent | ★ |
| `burn-subtitle-video` | SubtitleAgent | ★ |
| `render-video` | VideoAgent | |
| `validate-json-schema` | QualityAgent + 각 에이전트 | |

---

## 전체 파이프라인 (9단계)

```
STEP 0: 프로젝트 초기화 ─────────────── ProjectInitAgent
   └→ project-config.json (subtitle 블록 포함)

STEP 1: 입력 자료 분석 ──────────────── ContentIngestAgent  ★신규
   ├── 웹 리서치 요청 → parse-web-research
   ├── PDF 업로드     → parse-pdf-content
   ├── PPTX 업로드    → parse-pptx-content
   ├── DOCX/텍스트    → pandoc 직접 파싱
   └→ content-brief.json
      [사용자 확인 체크포인트 ①]

STEP 2: 슬라이드 구성 협의 ──────────── SlideAgent
   └→ content-brief.json 읽기 → slides-data.json 초안
      [사용자 협의 체크포인트 ②] → 확정

STEP 3: 컬러 테마 설정 ──────────────── ThemeAgent  (STEP 2와 병렬 가능)
   └→ theme-config.json + video/src/theme.ts

STEP 4: 웹 프레젠테이션 생성 ────────── WebAgent
   └→ web/slides/[name].html

STEP 5: 나레이션 대본 협의 ──────────── NarrationAgent
   └→ narration-scripts.json 초안
      [사용자 협의 체크포인트 ③] → 확정

STEP 6: TTS 음성 생성 ───────────────── TTSAgent
   └→ slide-XX.mp3 + durations.json

STEP 6.5: 자막 생성 (선택) ──────────── SubtitleAgent  ★신규
   ├── disabled  → 건너뜀
   ├── soft      → .srt + .vtt 생성
   ├── remotion  → SubtitleOverlay.tsx + subtitles-data.ts
   └── burn-in   → .srt 생성 (burn-in은 STEP 7 이후 처리)

STEP 7: 발표영상 렌더링 ─────────────── VideoAgent
   └→ output.mp4 (1920x1080)
      [burn-in 모드] → SubtitleAgent에 ffmpeg burn-in 요청

각 STEP 후 ──────────────────────────── QualityAgent (자동 호출)
```

---

## 사용자 명령 라우팅 규칙

| 사용자 입력 패턴 | 라우팅 결정 |
|---|---|
| "새 프로젝트 시작" | ProjectInitAgent |
| 파일 업로드 (PDF/PPTX/DOCX/이미지) | ContentIngestAgent 먼저 실행 |
| "~조사해서 슬라이드 만들어줘" | ContentIngestAgent 먼저 실행 |
| "슬라이드 만들어줘" + 주제 텍스트 | ContentIngestAgent(간단 분석) → SlideAgent |
| "테마 설정" / 색상 이미지 업로드 | ThemeAgent |
| "웹 프레젠테이션 생성해줘" | WebAgent |
| "나레이션 써줘" | NarrationAgent |
| "TTS 생성" / "음성 만들어줘" | TTSAgent |
| "자막 추가해줘" / "자막 설정" | SubtitleAgent |
| "영상 렌더링" / "MP4 만들어줘" | VideoAgent |
| "검증해줘" / "오류 확인" | QualityAgent |
| "처음부터 전체 실행" | 전체 파이프라인 순차 실행 |

---

## 입력 자료 유형 감지 및 처리 흐름

```
입력 감지 (ContentIngestAgent)
│
├─ 웹 리서치 요청 ("~조사해줘", "~정리해줘")
│    └→ parse-web-research
│         ├── 발표 유형별 검색 쿼리 3~7개 자동 생성
│         ├── 웹 검색 실행
│         └── 수치/인용/출처 태깅 + 클러스터링
│
├─ PDF 파일 (.pdf)
│    ├── 텍스트 위주 → pdftotext + 헤딩 구조 분석
│    ├── 이미지·표 혼합 → PyMuPDF + Claude Vision + 표 추출
│    └── 스캔 PDF → Tesseract OCR + 신뢰도 평가
│
├─ PPTX 파일 (.pptx / .ppt)
│    └→ parse-pptx-content
│         ├── 슬라이드별 제목/본문/불릿/표/차트/이미지 추출
│         ├── 발표자 노트 추출
│         └── AutoPresent 27종 타입 자동 매핑
│
├─ DOCX 파일 (.docx / .doc)
│    └→ pandoc → 마크다운 변환 → 섹션 분해
│
├─ 텍스트/마크다운 (.txt / .md / 붙여넣기)
│    └→ 구조 파싱 → 섹션 분해
│
├─ 이미지 (.jpg / .png 등)
│    └→ Claude Vision 분석 + OCR
│
└─ 멀티파일 (여러 파일 동시)
     ├── 각 파일 개별 처리
     ├── 중복 내용 감지 및 병합
     └── 충돌 내용 플래그 → 사용자 선택 요청

공통 최종 처리 → normalize-content-structure → content-brief.json
```

---

## 자막 설정 옵션

| 모드 | 설명 | 필요 도구 |
|---|---|---|
| `disabled` | 자막 없음 | — |
| `soft` | SRT/VTT 파일 별도 생성 | edge-tts, mutagen |
| `burn-in` | 영상에 자막 직접 삽입 | + **ffmpeg** |
| `remotion` | Remotion 자막 오버레이 | SubtitleOverlay.tsx |

---

## 프로젝트 폴더 구조 (완전판)

> **★★★ 프로젝트 격리 원칙 (전역 적용) ★★★**
> AutoPresent Studio로 작업하는 **모든 프로젝트의 산출물은 반드시 프로젝트 전용 하위폴더** 안에만 저장한다.
> 루트 디렉토리(`auto-present-studio/`)에 프로젝트 산출물 파일을 직접 생성하는 것은 **절대 금지**.
>
> - **하위폴더 명명**: `프로젝트ID` 또는 `프로젝트명` 그대로 사용 (예: `moon_고교/`, `my-project/`)
> - **새 프로젝트 시작 시**: ProjectInitAgent가 가장 먼저 `auto-present-studio/{프로젝트폴더}/` 를 생성하고,
>   이후 모든 에이전트는 해당 폴더를 루트로 삼아 파일을 생성
> - **포함 대상**: project-config.json, theme-config.json, content-brief.json, slides-data.json,
>   narration-scripts.json, ingest-log.json, progress-tracker.md, web/, audio/, subtitles/,
>   output/, assets/, extracted/, scripts/ 등 프로젝트가 생성하는 모든 파일
> - **루트에 남는 것**: CLAUDE.md, agents/, skills/, schemas/, templates/, fixtures/,
>   requirements.txt, video/(Remotion 공유 엔진) 등 시스템·공유 파일만 허용

```
auto-present-studio/                       ← 시스템 루트 (산출물 직접 생성 금지)
├── CLAUDE.md                              ← Orchestrator
├── agents/                                ← 10개 에이전트 명세 (공유)
├── skills/                                ← 15개 스킬 명세 (공유)
├── schemas/                               ← JSON 스키마 (공유)
├── templates/                             ← HTML 템플릿 (공유)
├── fixtures/                              ← 테스트 픽스처 (공유)
├── requirements.txt                       ← Python 패키지 목록 (공유)
├── video/                                 ← Remotion 렌더링 엔진 (공유)
│   ├── src/
│   └── public/
│
└── {프로젝트폴더}/                         ← ★ 프로젝트별 전용 폴더 (격리)
    ├── project-config.json
    ├── theme-config.json
    ├── content-brief.json
    ├── slides-data.json
    ├── narration-scripts.json
    ├── ingest-log.json
    ├── progress-tracker.md
    ├── web/
    │   └── slides/[name].html
    ├── audio/
    │   └── slide-XX.mp3
    ├── subtitles/
    │   ├── [name].srt
    │   └── [name].vtt
    ├── output/
    │   └── output.mp4
    ├── assets/
    ├── extracted/                         ← PDF/PPTX 추출 에셋
    └── scripts/                           ← 프로젝트 전용 스크립트
```

**현재 프로젝트 예시**: `moon_고교/` (고교 건축특강 — 까치집과 제비집)

---

## 핵심 제약사항

1. **ContentIngestAgent 우선 원칙**: 파일 업로드 또는 조사 요청이 있으면 SlideAgent 전에 ContentIngestAgent를 반드시 먼저 실행
2. **에이전트 직접 호출 금지**: 서브에이전트 간 직접 호출 금지, 모든 호출은 Orchestrator 경유
3. **협의 체크포인트 3회 준수**: ① content-brief 확인 ② slides-data 협의 ③ 나레이션 협의
4. **QualityAgent 자동 검증**: 각 JSON 산출물 생성 후 자동 실행
5. **Windows 경로 처리**: 모든 파일 경로 Windows 형식 준수
6. **한국어 응답 원칙**: 사용자와의 모든 소통은 한국어로 진행
7. **저작권 보호**: 추출 이미지 슬라이드 삽입은 사용자 확인 후 진행
8. **OCR 불확실 구간 플래그**: 신뢰도 낮은 텍스트는 임의 판단 없이 사용자 확인 요청
9. **★ 반응형 레이아웃 필수**: 슬라이드는 디스플레이 화면(좌우+상하)을 꽉 채워야 함. 인라인 `height:XXXpx` 절대 금지 → `vh` 또는 `%` 사용. 상세 규칙은 `generate-html-slide/SKILL.md` 참조
10. **★ px 금지 단위 규칙**: 슬라이드 콘텐츠의 height, width, padding, margin, gap, font-size에 `px` 고정값 사용 금지. `vh`, `vw`, `%`, `clamp()` 사용 필수 (border, border-radius, box-shadow 등 장식 속성은 px 허용)
11. **★★ 프로젝트 격리 원칙 (전역)**: 모든 프로젝트 산출물은 반드시 `auto-present-studio/{프로젝트폴더}/` 하위에만 저장. 루트에 프로젝트 파일 직접 생성 절대 금지. 새 프로젝트 시작 시 ProjectInitAgent가 가장 먼저 전용 하위폴더를 생성한 뒤 작업 시작.
