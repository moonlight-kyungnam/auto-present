import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, interpolate, useVideoConfig } from "remotion";
import type { SlideData, ProjectConfig } from "../types";

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

export const TimelineSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const content = slide.content as {
    items?: Array<{ date: string; label: string; desc?: string }>;
  };
  const items = content.items || [];

  const titleOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 5 });

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
          marginBottom: 50,
        }}
      >
        {slide.title}
      </h1>

      {/* 타임라인 */}
      <div style={{ position: "relative", flex: 1, paddingLeft: 40 }}>
        {/* 세로선 */}
        <div
          style={{
            position: "absolute",
            left: 18,
            top: 0,
            bottom: 0,
            width: 3,
            backgroundColor: "rgba(108, 99, 255, 0.3)",
          }}
        />

        {items.map((item, index) => {
          const delay = 15 + index * 10;
          const itemX = interpolate(frame, [delay, delay + 10], [-40, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const itemOpacity = spring({ frame, fps, config: { damping: 20 }, delay });

          return (
            <div
              key={index}
              style={{
                opacity: itemOpacity,
                transform: `translateX(${itemX}px)`,
                display: "flex",
                alignItems: "flex-start",
                gap: 24,
                marginBottom: 36,
                position: "relative",
              }}
            >
              {/* 도트 */}
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  backgroundColor: "#6C63FF",
                  border: "3px solid #1A1A2E",
                  flexShrink: 0,
                  marginTop: 6,
                  marginLeft: -7,
                }}
              />

              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#6C63FF",
                    marginBottom: 4,
                  }}
                >
                  {item.date}
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 600,
                    color: "#FFFFFE",
                    marginBottom: 6,
                  }}
                >
                  {item.label}
                </div>
                {item.desc && (
                  <div style={{ fontSize: 20, color: "#A7A9BE", lineHeight: 1.4 }}>
                    {item.desc}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
