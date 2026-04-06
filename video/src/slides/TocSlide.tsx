import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";
import type { SlideData, ProjectConfig } from "../types";

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

export const TocSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const content = slide.content as { items?: string[] };
  const items = content.items || slide.fragments.map((f) => f.content);

  const titleOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 5 });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0F0E17 0%, #1A1A2E 100%)",
        display: "flex",
        flexDirection: "column",
        padding: "80px 120px",
        fontFamily: "Pretendard, sans-serif",
      }}
    >
      {/* 제목 */}
      <h1
        style={{
          opacity: titleOpacity,
          fontSize: 52,
          fontWeight: 700,
          color: "#FFFFFE",
          marginBottom: 50,
        }}
      >
        {slide.title || "목차"}
      </h1>

      {/* 목차 아이템 — 2열 그리드 */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          flex: 1,
        }}
      >
        {items.map((item, index) => {
          const itemOpacity = spring({
            frame,
            fps,
            config: { damping: 20 },
            delay: 15 + index * 5,
          });

          return (
            <div
              key={index}
              style={{
                opacity: itemOpacity,
                width: "calc(50% - 12px)",
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "20px 24px",
                borderRadius: 12,
                backgroundColor: "rgba(108, 99, 255, 0.08)",
                borderLeft: "3px solid #6C63FF",
              }}
            >
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#6C63FF",
                  minWidth: 36,
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span style={{ fontSize: 24, color: "#FFFFFE" }}>{item}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
