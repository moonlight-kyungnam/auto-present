import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";
import type { SlideData, ProjectConfig } from "../types";

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

export const ProblemSolutionSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const content = slide.content as {
    problem?: { title: string; points: string[] };
    solution?: { title: string; points: string[] };
  };
  const problem = content.problem || { title: "문제", points: [] };
  const solution = content.solution || { title: "해결", points: [] };

  const titleOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 5 });
  const problemScale = spring({ frame, fps, config: { damping: 15, mass: 0.8 }, delay: 15 });
  const solutionScale = spring({ frame, fps, config: { damping: 15, mass: 0.8 }, delay: 30 });

  const renderSection = (
    section: { title: string; points: string[] },
    color: string,
    bgColor: string,
    scale: number,
    baseDelay: number
  ) => (
    <div
      style={{
        transform: `scale(${scale})`,
        flex: 1,
        backgroundColor: bgColor,
        borderRadius: 16,
        padding: "36px 40px",
        border: `1px solid ${color}33`,
      }}
    >
      <h2
        style={{
          fontSize: 28,
          fontWeight: 700,
          color,
          marginBottom: 24,
        }}
      >
        {section.title}
      </h2>
      {section.points.map((point, i) => {
        const pointOpacity = spring({
          frame, fps,
          config: { damping: 20 },
          delay: baseDelay + 8 + i * 5,
        });
        return (
          <div
            key={i}
            style={{
              opacity: pointOpacity,
              display: "flex",
              gap: 12,
              marginBottom: 14,
              fontSize: 22,
              color: "#FFFFFE",
              lineHeight: 1.4,
            }}
          >
            <span style={{ color, flexShrink: 0 }}>●</span>
            <span>{point}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0F0E17 0%, #1A1A2E 100%)",
        display: "flex",
        flexDirection: "column",
        padding: "80px 100px",
        fontFamily: "Pretendard, sans-serif",
      }}
    >
      <h1
        style={{
          opacity: titleOpacity,
          fontSize: 48,
          fontWeight: 700,
          color: "#FFFFFE",
          marginBottom: 40,
        }}
      >
        {slide.title}
      </h1>

      <div style={{ display: "flex", gap: 30, flex: 1 }}>
        {renderSection(problem, "#FF6584", "rgba(255, 101, 132, 0.08)", problemScale, 15)}

        {/* 화살표 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 40,
            color: "#A7A9BE",
            opacity: solutionScale,
          }}
        >
          →
        </div>

        {renderSection(solution, "#4ECB71", "rgba(78, 203, 113, 0.08)", solutionScale, 30)}
      </div>
    </AbsoluteFill>
  );
};
