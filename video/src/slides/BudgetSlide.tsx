import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, interpolate, useVideoConfig } from "remotion";
import type { SlideData, ProjectConfig } from "../types";

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

// 예산 슬라이드 — 수평 바 또는 도넛형 표시
export const BudgetSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const content = slide.content as {
    totalBudget?: string;
    items?: Array<{
      category: string;
      amount: string;
      percentage: number;
      color?: string;
    }>;
    note?: string;
  };
  const items = content.items || [];

  const titleOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 5 });
  const totalOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 10 });
  const noteOpacity = spring({
    frame,
    fps,
    config: { damping: 20 },
    delay: 25 + items.length * 6,
  });

  const defaultColors = ["#6C63FF", "#72F088", "#FF6B6B", "#F0AD4E", "#4ECDC4", "#FF8C42", "#E040FB", "#00BCD4"];

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0F0E17 0%, #1A1A2E 100%)",
        display: "flex",
        flexDirection: "column",
        padding: "70px 110px",
        fontFamily: "Pretendard, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginBottom: 36 }}>
        <h1
          style={{
            opacity: titleOpacity,
            fontSize: 46,
            fontWeight: 700,
            color: "#FFFFFE",
          }}
        >
          {slide.title}
        </h1>
        {content.totalBudget && (
          <span
            style={{
              opacity: totalOpacity,
              fontSize: 28,
              fontWeight: 800,
              color: "#6C63FF",
            }}
          >
            총 {content.totalBudget}
          </span>
        )}
      </div>

      {/* 수평 바 항목 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
        {items.map((item, index) => {
          const barProgress = spring({
            frame,
            fps,
            config: { damping: 18, mass: 0.8 },
            delay: 14 + index * 6,
          });
          const barWidth = interpolate(barProgress, [0, 1], [0, item.percentage]);
          const color = item.color || defaultColors[index % defaultColors.length];

          return (
            <div key={index} style={{ opacity: barProgress }}>
              {/* 라벨 + 금액 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 20, fontWeight: 600, color: "#FFFFFE" }}>
                  {item.category}
                </span>
                <span style={{ fontSize: 20, fontWeight: 700, color }}>
                  {item.amount} ({item.percentage}%)
                </span>
              </div>
              {/* 바 */}
              <div
                style={{
                  width: "100%",
                  height: 32,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${barWidth}%`,
                    height: "100%",
                    backgroundColor: color,
                    borderRadius: 8,
                    boxShadow: `0 0 16px ${color}30`,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {content.note && (
        <p
          style={{
            opacity: noteOpacity,
            fontSize: 17,
            color: "#666",
            textAlign: "right",
            marginTop: 20,
            fontStyle: "italic",
          }}
        >
          {content.note}
        </p>
      )}
    </AbsoluteFill>
  );
};
