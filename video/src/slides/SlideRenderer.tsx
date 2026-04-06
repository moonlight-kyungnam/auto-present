import React from "react";
import { AbsoluteFill } from "remotion";
import type { SlideData, ProjectConfig } from "../types";

// 27종 슬라이드 임포트
import { CoverSlide } from "./CoverSlide";
import { TocSlide } from "./TocSlide";
import { BulletsSlide } from "./BulletsSlide";
import { StatsSlide } from "./StatsSlide";
import { TableSlide } from "./TableSlide";
import { TimelineSlide } from "./TimelineSlide";
import { ProblemSolutionSlide } from "./ProblemSolutionSlide";
import { QuoteSlide } from "./QuoteSlide";
import { TeamSlide } from "./TeamSlide";
import { ConclusionSlide } from "./ConclusionSlide";
import { MarketSlide } from "./MarketSlide";
import { CrisisSlide } from "./CrisisSlide";
import { ConceptSlide } from "./ConceptSlide";
import { FormulaSlide } from "./FormulaSlide";
import { ExampleSlide } from "./ExampleSlide";
import { FrameworkSlide } from "./FrameworkSlide";
import { HypothesisSlide } from "./HypothesisSlide";
import { MethodologySlide } from "./MethodologySlide";
import { ResultAnalysisSlide } from "./ResultAnalysisSlide";
import { GanttSlide } from "./GanttSlide";
import { BudgetSlide } from "./BudgetSlide";
import { SwotSlide } from "./SwotSlide";
import { KpiDashboardSlide } from "./KpiDashboardSlide";
import { GovernanceSlide } from "./GovernanceSlide";
import { TamSamSomSlide } from "./TamSamSomSlide";
import { HeroSlide } from "./HeroSlide";
import { PersonaSlide } from "./PersonaSlide";

interface SlideRendererProps {
  slide: SlideData;
  config: ProjectConfig;
}

// 타입 → 컴포넌트 매핑
const SLIDE_COMPONENTS: Record<string, React.FC<{ slide: SlideData; config: ProjectConfig }>> = {
  cover: CoverSlide,
  toc: TocSlide,
  bullets: BulletsSlide,
  stats: StatsSlide,
  table: TableSlide,
  timeline: TimelineSlide,
  "problem-solution": ProblemSolutionSlide,
  quote: QuoteSlide,
  team: TeamSlide,
  conclusion: ConclusionSlide,
  market: MarketSlide,
  crisis: CrisisSlide,
  concept: ConceptSlide,
  formula: FormulaSlide,
  example: ExampleSlide,
  framework: FrameworkSlide,
  hypothesis: HypothesisSlide,
  methodology: MethodologySlide,
  "result-analysis": ResultAnalysisSlide,
  gantt: GanttSlide,
  budget: BudgetSlide,
  swot: SwotSlide,
  "kpi-dashboard": KpiDashboardSlide,
  governance: GovernanceSlide,
  "tam-sam-som": TamSamSomSlide,
  hero: HeroSlide,
  persona: PersonaSlide,
};

export const SlideRenderer: React.FC<SlideRendererProps> = ({ slide, config }) => {
  const Component = SLIDE_COMPONENTS[slide.type];

  if (!Component) {
    // 미구현 타입은 폴백 슬라이드로 표시
    return (
      <AbsoluteFill
        style={{
          backgroundColor: "#1a1a2e",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <h1 style={{ fontSize: 48 }}>{slide.title}</h1>
        <p style={{ fontSize: 24, opacity: 0.6 }}>
          [{slide.type}] 타입 — 추후 구현 예정
        </p>
      </AbsoluteFill>
    );
  }

  return <Component slide={slide} config={config} />;
};
