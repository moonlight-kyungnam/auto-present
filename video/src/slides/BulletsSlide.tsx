import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";
import type { SlideData, ProjectConfig } from "../types";

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

export const BulletsSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const content = slide.content as {
    items?: Array<{ text: string; highlight?: boolean }>;
  };
  // fragments에서 불릿 추출 또는 content.items 사용
  const bullets = content.items
    ? content.items
    : slide.fragments.map((f) => ({ text: f.content, highlight: false }));

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

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {bullets.map((bullet, index) => {
          const bulletOpacity = spring({
            frame,
            fps,
            config: { damping: 20 },
            delay: 15 + index * 8,
          });

          return (
            <div
              key={index}
              style={{
                opacity: bulletOpacity,
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
                padding: "16px 24px",
                borderRadius: 10,
                backgroundColor: bullet.highlight
                  ? "rgba(108, 99, 255, 0.15)"
                  : "rgba(255, 255, 255, 0.03)",
                borderLeft: bullet.highlight
                  ? "4px solid #6C63FF"
                  : "4px solid transparent",
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  color: "#6C63FF",
                  marginTop: 4,
                  flexShrink: 0,
                }}
              >
                ●
              </span>
              <span
                style={{
                  fontSize: 28,
                  color: bullet.highlight ? "#FFFFFE" : "#A7A9BE",
                  lineHeight: 1.5,
                }}
              >
                {bullet.text}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
