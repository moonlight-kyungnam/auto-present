import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";
import type { SlideData, ProjectConfig } from "../types";

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

// SWOT 분석 슬라이드 — 2x2 그리드 (S=초록, W=빨강, O=파랑, T=주황)
export const SwotSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const content = slide.content as {
    strengths?: string[];
    weaknesses?: string[];
    opportunities?: string[];
    threats?: string[];
    summary?: string;
  };

  const titleOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 5 });
  const summaryOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 40 });

  const quadrants = [
    { label: "Strengths", items: content.strengths || [], color: "#72F088", abbr: "S" },
    { label: "Weaknesses", items: content.weaknesses || [], color: "#FF6B6B", abbr: "W" },
    { label: "Opportunities", items: content.opportunities || [], color: "#6C63FF", abbr: "O" },
    { label: "Threats", items: content.threats || [], color: "#F0AD4E", abbr: "T" },
  ];

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0F0E17 0%, #1A1A2E 100%)",
        display: "flex",
        flexDirection: "column",
        padding: "60px 90px",
        fontFamily: "Pretendard, sans-serif",
      }}
    >
      <h1
        style={{
          opacity: titleOpacity,
          fontSize: 46,
          fontWeight: 700,
          color: "#FFFFFE",
          marginBottom: 30,
          textAlign: "center",
        }}
      >
        {slide.title}
      </h1>

      {/* 2x2 SWOT 그리드 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: 20,
          flex: 1,
        }}
      >
        {quadrants.map((q, index) => {
          const qScale = spring({
            frame,
            fps,
            config: { damping: 14, mass: 0.8 },
            delay: 10 + index * 7,
          });

          return (
            <div
              key={q.abbr}
              style={{
                transform: `scale(${qScale})`,
                backgroundColor: `${q.color}10`,
                border: `2px solid ${q.color}40`,
                borderRadius: 18,
                padding: "24px 28px",
                overflow: "hidden",
              }}
            >
              {/* 라벨 헤더 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: q.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#0F0E17",
                  }}
                >
                  {q.abbr}
                </div>
                <span style={{ fontSize: 20, fontWeight: 700, color: q.color }}>
                  {q.label}
                </span>
              </div>

              {/* 항목 */}
              {q.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 17,
                    color: "#A7A9BE",
                    lineHeight: 1.5,
                    marginBottom: 6,
                    paddingLeft: 14,
                    borderLeft: `3px solid ${q.color}50`,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {content.summary && (
        <p
          style={{
            opacity: summaryOpacity,
            fontSize: 20,
            color: "#FFFFFE",
            textAlign: "center",
            marginTop: 16,
            padding: "12px 24px",
            backgroundColor: "rgba(108,99,255,0.1)",
            borderRadius: 10,
          }}
        >
          {content.summary}
        </p>
      )}
    </AbsoluteFill>
  );
};
