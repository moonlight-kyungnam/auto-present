# AutoPresent Studio — 전체 개발 구현 계획 (Phase 1~5)

## Context

AutoPresent Studio는 10개 에이전트 + 15개 스킬로 구성된 멀티에이전트 프레젠테이션 자동화 시스템입니다.
현재 **설계 문서(에이전트/스킬 명세)와 디렉토리 구조만 완성**되어 있고, 실제 구현 코드는 Python 스크립트 2개(`generate-narration.py`, `build-theme.py`)만 존재합니다.

**목표**: 텍스트/PDF/PPTX/웹조사 입력 → HTML 슬라이드 → 나레이션 음성 → 최종 MP4 영상까지의 전체 파이프라인 구현

**현재 상태**:
- 10개 에이전트 .md 명세 ✅ 완성
- 15개 스킬 SKILL.md 명세 ✅ 완성
- Python 스크립트 2개 ✅ (generate-narration.py, build-theme.py)
- 디렉토리 구조 ✅ 생성됨
- 구현 코드 ❌ 미작성 (Remotion, 파서, HTML 템플릿 등)

---

## Phase 1: 프로젝트 기반 설정 (Foundation)

### 1-1. Git 초기화 + .gitignore
- `git init` + `.gitignore` 생성
- 제외 대상: node_modules/, __pycache__/, *.mp3, *.mp4, extracted/, .env
- **파일**: `.gitignore`

### 1-2. Python 의존성 관리
- `requirements.txt` 생성
- 패키지: `edge-tts`, `mutagen`, `PyMuPDF`, `python-pptx`, `Pillow`, `pysrt`
- **파일**: `requirements.txt`
- **검증**: `pip install -r requirements.txt` 성공

### 1-3. Remotion v4 프로젝트 초기화
- `video/` 디렉토리에 Remotion 프로젝트 구성
- **생성 파일**:
  - `video/package.json` — Remotion v4 + React 18 의존성
  - `video/tsconfig.json` — TypeScript 설정
  - `video/remotion.config.ts` — Remotion 설정
  - `video/src/index.ts` — 진입점 (registerRoot)
  - `video/src/Root.tsx` — 메인 Composition 정의
  - `video/src/types.ts` — 공용 타입 (SlideData, ThemeConfig, Duration 등)
- **검증**: `cd video && npm install && npx remotion preview` 성공

### 1-4. JSON 데이터 계약 스키마 정의
에이전트 간 데이터 교환의 정확성을 보장하는 스키마:
- **생성 파일**:
  - `schemas/content-brief.schema.json` — ContentIngestAgent 출력
  - `schemas/slides-data.schema.json` — SlideAgent 출력 (27종 타입 enum 포함)
  - `schemas/theme-config.schema.json` — ThemeAgent 출력
  - `schemas/narration-scripts.schema.json` — NarrationAgent 출력
  - `schemas/durations.schema.json` — TTSAgent 출력
  - `schemas/project-config.schema.json` — ProjectInitAgent 출력
- **검증**: 각 스키마에 대한 샘플 JSON 유효성 확인

### 1-5. 테스트 픽스처 (샘플 데이터)
- MVP 파이프라인 테스트용 샘플 JSON 세트
- **생성 파일**:
  - `fixtures/sample-slides-data.json`
  - `fixtures/sample-theme-config.json`
  - `fixtures/sample-narration-scripts.json`
  - `fixtures/sample-durations.json`

---

## Phase 2: 핵심 파이프라인 MVP

> **MVP 경로**: 텍스트 입력 → 슬라이드 구성 → 테마 → HTML 웹 → 나레이션 → TTS → MP4

### 2-1. Remotion 슬라이드 컴포넌트 (MVP 10종)
우선 구현할 10개 핵심 타입:

| # | 타입 | 파일 |
|---|---|---|
| 1 | cover | `video/src/slides/CoverSlide.tsx` |
| 2 | toc | `video/src/slides/TocSlide.tsx` |
| 3 | bullets | `video/src/slides/BulletsSlide.tsx` |
| 4 | stats | `video/src/slides/StatsSlide.tsx` |
| 5 | table | `video/src/slides/TableSlide.tsx` |
| 6 | timeline | `video/src/slides/TimelineSlide.tsx` |
| 7 | problem-solution | `video/src/slides/ProblemSolutionSlide.tsx` |
| 8 | quote | `video/src/slides/QuoteSlide.tsx` |
| 9 | team | `video/src/slides/TeamSlide.tsx` |
| 10 | conclusion | `video/src/slides/ConclusionSlide.tsx` |

- **추가 파일**: `video/src/slides/SlideRenderer.tsx` — 타입별 동적 디스패처
- **의존성**: Phase 1-3 완료 필요

### 2-2. Remotion Composition 통합
- `slides-data.json` + `durations.json` 읽기 → `<Series>` + `<Audio>` 조합
- fragment-order-calculator 로직 구현
- **수정 파일**: `video/src/Root.tsx`
- **생성 파일**:
  - `video/src/utils/fragmentCalculator.ts` — 프래그먼트 순서 계산
  - `video/src/utils/loadData.ts` — JSON 데이터 로더

### 2-3. HTML 웹 프레젠테이션 템플릿
- 단일 HTML 파일 생성 시스템 (generate-html-slide 스킬 구현체)
- **기능**: 슬라이드 네비게이션, 키보드/터치 조작, 풀스크린, 진행바, 반응형
- **생성 파일**: `web/template/base-template.html` — 프레젠테이션 엔진
- **검증**: 샘플 데이터로 HTML 생성 → 브라우저에서 확인

### 2-4. 엔드투엔드 MVP 테스트
1. 샘플 `slides-data.json` → HTML 생성 → 브라우저 확인 ✓
2. 샘플 `narration-scripts.json` → `generate-narration.py` → MP3 생성 ✓
3. `slides-data.json` + `durations.json` → `npx remotion render` → MP4 확인 ✓

---

## Phase 3: 콘텐츠 수집 (Content Ingestion)

> 모든 태스크 **병렬 진행 가능**

### 3-1. PPTX 파서
- `python-pptx` 활용, 슬라이드별 콘텐츠 추출
- 제목/본문/불릿/표/차트/이미지/발표자노트 추출
- 27종 AutoPresent 타입 자동 매핑
- **파일**: `scripts/parse-pptx.py`
- **출력**: `content-brief.json`

### 3-2. PDF 파서
- PyMuPDF(fitz) 기반 텍스트 + 이미지 + 표 추출
- 스캔 PDF 대비 OCR (Tesseract, 선택적)
- **파일**: `scripts/parse-pdf.py`

### 3-3. 콘텐츠 정규화기
- 모든 입력 형식 → 통일된 `content-brief.json` 변환
- 섹션 분해, 중복 감지, 충돌 플래그
- **파일**: `scripts/normalize-content.py`

### 3-4. DOCX 파서
- pandoc 기반 마크다운 변환 → 섹션 분해
- **파일**: `scripts/parse-docx.py`

### 3-5. 웹 리서치 구조화기
- 발표 유형별 검색 쿼리 자동 생성 → 웹 검색 → 태깅/클러스터링
- **파일**: `scripts/structure-web-research.py`

---

## Phase 4: 고급 기능

### 4-1. 자막 시스템 (SubtitleAgent 4가지 모드)

| 모드 | 구현 내용 | 파일 |
|---|---|---|
| disabled | 건너뜀 | — |
| soft | SRT/VTT 생성 | `scripts/generate-subtitle.py` |
| burn-in | ffmpeg 자막 삽입 | `scripts/burn-subtitle.py` |
| remotion | React 자막 오버레이 | `video/src/slides/SubtitleOverlay.tsx` + `video/src/subtitles-data.ts` |

### 4-2. 나머지 17종 슬라이드 타입 완성
- `market`, `crisis`, `concept`, `formula`, `example`, `framework`, `hypothesis`
- `methodology`, `result-analysis`, `gantt`, `budget`, `swot`, `kpi-dashboard`
- `governance`, `tam-sam-som`, `hero`, `persona`
- **파일**: `video/src/slides/` 아래 각 타입별 .tsx (17개)

### 4-3. QualityAgent 자동 검증
- 각 STEP 산출물 JSON 스키마 검증 자동화
- **파일**: `scripts/validate-schema.py`
- 에이전트 간 의존 데이터 무결성 확인

---

## Phase 5: 완성도 향상 (Polish)

### 5-1. 진행 상태 추적 자동화
- 각 STEP 완료 시 `progress-tracker.md` 자동 업데이트
- 타임스탬프 + 에러 로깅

### 5-2. 에러 복구 스크립트
- 각 STEP 실패 시 재시도 / 롤백 로직
- 부분 실행 재개 지원 (중간 단계부터 다시 시작)

### 5-3. 테마 미리보기
- theme-config.json → 미리보기 HTML 생성
- **파일**: `web/theme-preview.html`

### 5-4. 프로젝트 템플릿 시스템
- 발표 유형별(A/B/C/D) 기본 설정 프리셋
- 빠른 시작 지원

---

## 검증 계획 (Verification)

| 단계 | 검증 방법 |
|---|---|
| Phase 1 완료 | `npx remotion preview` 성공, JSON 스키마 유효성 확인 |
| Phase 2 완료 | 샘플 데이터로 HTML 슬라이드 + MP3 + MP4 생성 확인 |
| Phase 3 완료 | 실제 PDF/PPTX 파일 → content-brief.json 변환 확인 |
| Phase 4 완료 | 자막 포함 영상 렌더링, 27종 슬라이드 모두 렌더 확인 |
| Phase 5 완료 | 전체 파이프라인 처음부터 끝까지 자동 실행 성공 |

---

## 핵심 파일 목록 (Critical Files)

### 신규 생성 (주요)
| 파일 | 역할 |
|---|---|
| `video/package.json` | Remotion 프로젝트 의존성 |
| `video/src/Root.tsx` | Remotion 메인 Composition |
| `video/src/types.ts` | 공용 TypeScript 타입 |
| `video/src/slides/SlideRenderer.tsx` | 27종 슬라이드 동적 디스패처 |
| `video/src/slides/*.tsx` (27개) | 각 슬라이드 타입 컴포넌트 |
| `video/src/utils/fragmentCalculator.ts` | 프래그먼트 순서 계산 |
| `web/template/base-template.html` | HTML 웹 프레젠테이션 엔진 |
| `schemas/*.schema.json` (6개) | JSON 데이터 계약 |
| `requirements.txt` | Python 의존성 |
| `scripts/parse-*.py` (4개) | 콘텐츠 파서 |
| `scripts/normalize-content.py` | 콘텐츠 정규화 |
| `scripts/validate-schema.py` | 스키마 검증 |
| `.gitignore` | Git 제외 규칙 |

### 기존 유지/수정
| 파일 | 역할 |
|---|---|
| `scripts/generate-narration.py` | TTS 음성 생성 (기존) |
| `scripts/build-theme.py` | 테마 변환 (기존) |
| `project-config.json` | 프로젝트 설정 (기존) |
| `progress-tracker.md` | 진행 추적 (Phase 5에서 자동화) |

---

## 구현 의존성 그래프

```
Phase 1-1 (.gitignore) ─────────────────────────────────────┐
Phase 1-2 (requirements.txt) ───────────────────────────────┤
Phase 1-3 (Remotion 초기화) ──┬──→ Phase 2-1 (슬라이드 10종) ┤
Phase 1-4 (JSON 스키마) ──────┤     ↓                        │
Phase 1-5 (픽스처) ───────────┘  Phase 2-2 (Composition)     │
                                    ↓                        │
                              Phase 2-3 (HTML 템플릿)        │
                                    ↓                        │
                              Phase 2-4 (E2E 테스트) ────────┤
                                                             │
Phase 3-1~3-5 (파서들, 병렬) ────────────────────────────────┤
                                                             │
Phase 4-1 (자막) ────────────────────────────────────────────┤
Phase 4-2 (슬라이드 17종 추가) ──────────────────────────────┤
Phase 4-3 (QA 자동화) ──────────────────────────────────────┤
                                                             │
Phase 5-1~5-4 (완성도) ─────────────────────────────────────┘
```

---

*생성일: 2026-03-28*
*상태: 확정 — Phase 1부터 순차 진행*
