// AutoPresent Studio — 공용 타입 정의

// 27종 슬라이드 타입
export type SlideType =
  | "cover"
  | "toc"
  | "bullets"
  | "stats"
  | "table"
  | "timeline"
  | "problem-solution"
  | "quote"
  | "team"
  | "conclusion"
  | "market"
  | "crisis"
  | "concept"
  | "formula"
  | "example"
  | "framework"
  | "hypothesis"
  | "methodology"
  | "result-analysis"
  | "gantt"
  | "budget"
  | "swot"
  | "kpi-dashboard"
  | "governance"
  | "tam-sam-som"
  | "hero"
  | "persona";

// 프래그먼트 (슬라이드 내 등장 요소)
export interface Fragment {
  id: string;
  order: number;
  content: string;
  type: "text" | "image" | "chart" | "table" | "bullet" | "number";
  animation?: "fade" | "slide-up" | "slide-left" | "zoom" | "none";
}

// 개별 슬라이드 데이터
export interface SlideData {
  slideIndex: number;
  type: SlideType;
  title: string;
  subtitle?: string;
  content: Record<string, unknown>;
  fragments: Fragment[];
  notes?: string;
  backgroundImage?: string;
}

// slides-data.json 전체 구조
export interface SlidesData {
  presentationTitle: string;
  presentationType: "A" | "B" | "C" | "D";
  totalSlides: number;
  slides: SlideData[];
}

// 테마 설정
export interface ThemeConfig {
  themeId: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  fonts: {
    heading: string;
    body: string;
    code?: string;
  };
  gradients?: {
    primary: string;
    background: string;
  };
}

// 슬라이드별 재생 시간
export interface DurationEntry {
  slideIndex: number;
  fileName: string;
  durationMs: number;
  durationFrames: number;
}

// durations.json 전체 구조
export interface DurationsData {
  fps: number;
  totalDurationMs: number;
  totalFrames: number;
  slides: DurationEntry[];
}

// 나레이션 스크립트
export interface NarrationEntry {
  slideIndex: number;
  script: string;
  emphasis?: string[];
  pauseAfterMs?: number;
}

export interface NarrationScripts {
  voice: string;
  voiceRate: string;
  scripts: NarrationEntry[];
}

// 프로젝트 설정
export interface ProjectConfig {
  projectName: string;
  presentationType: "A" | "B" | "C" | "D";
  compositionId: string;
  outputFile: string;
  fps: number;
  width: number;
  height: number;
  bufferSeconds: number;
  voice: string;
  voiceRate: string;
  themeId: string;
  subtitle: {
    enabled: boolean;
    mode: "soft" | "burn-in" | "remotion" | "disabled";
    language: string;
    style: {
      fontSize: number;
      fontFamily: string;
      fontColor: string;
      outlineColor: string;
      outlineWidth: number;
      bgEnabled: boolean;
      bgColor: string;
      bgPadding: string;
      position: "top" | "bottom";
      marginBottom: number;
    };
    burnIn: boolean;
  };
}
