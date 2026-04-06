import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";
import type { SlideData, ProjectConfig } from "../types";

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

export const StatsSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const content = slide.content as {
    stats?: Array<{ value: string; label: string; highlight?: boolean }>;
    callout?: string;
    source?: string;
  };
  const stats = content.stats || [];

  const titleOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 5 });
  const calloutOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 30 + stats.length * 6 });
  const sourceOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 40 + stats.length * 6 });

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
          marginBottom: 50,
        }}
      >
        {slide.title}
      </h1>

      {/* 통계 그리드 */}
      <div
        style={{
          display: "flex",
          gap: 30,
          justifyContent: "center",
          flexWrap: "wrap",
          flex: 1,
          alignItems: "center",
        }}
      >
        {stats.map((stat, index) => {
          const statScale = spring({
            frame,
            fps,
            config: { damping: 15, mass: 0.8 },
            delay: 15 + index * 6,
          });

          return (
            <div
              key={index}
              style={{
                transform: `scale(${statScale})`,
                backgroundColor: stat.highlight
                  ? "rgba(108, 99, 255, 0.2)"
                  : "rgba(255, 255, 255, 0.05)",
                border: stat.highlight
                  ? "2px solid #6C63FF"
                  : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                padding: "40px 50px",
                textAlign: "center",
                minWidth: 200,
              }}
            >
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 800,
                  color: stat.highlight ? "#6C63FF" : "#FFFFFE",
                  marginBottom: 10,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 20, color: "#A7A9BE" }}>{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* 콜아웃 */}
      {content.callout && (
        <p
          style={{
            opacity: calloutOpacity,
            fontSize: 24,
            color: "#FFFFFE",
            textAlign: "center",
            marginTop: 30,
            padding: "16px 32px",
            backgroundColor: "rgba(108, 99, 255, 0.1)",
            borderRadius: 10,
          }}
        >
          {content.callout}
        </p>
      )}

      {/* 출처 */}
      {content.source && (
        <p
          style={{
            opacity: sourceOpacity,
            fontSize: 16,
            color: "#666",
            textAlign: "right",
            marginTop: 16,
          }}
        >
          출처: {content.source}
        </p>
      )}
    </AbsoluteFill>
  );
};
