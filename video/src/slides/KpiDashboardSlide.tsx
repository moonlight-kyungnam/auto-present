import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";
import type { SlideData, ProjectConfig } from "../types";

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

// KPI 대시보드 슬라이드 — 메트릭 카드 그리드
export const KpiDashboardSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const content = slide.content as {
    metrics?: Array<{
      label: string;
      value: string;
      target?: string;
      change?: string;
      positive?: boolean;
      icon?: string;
    }>;
    period?: string;
    note?: string;
  };
  const metrics = content.metrics || [];

  const titleOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 5 });
  const noteOpacity = spring({
    frame,
    fps,
    config: { damping: 20 },
    delay: 20 + metrics.length * 5,
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0F0E17 0%, #1A1A2E 100%)",
        display: "flex",
        flexDirection: "column",
        padding: "70px 100px",
        fontFamily: "Pretendard, sans-serif",
      }}
    >
      {/* 제목 + 기간 */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 40 }}>
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
        {content.period && (
          <span
            style={{
              opacity: titleOpacity,
              fontSize: 18,
              color: "#A7A9BE",
              backgroundColor: "rgba(255,255,255,0.06)",
              padding: "6px 14px",
              borderRadius: 10,
            }}
          >
            {content.period}
          </span>
        )}
      </div>

      {/* KPI 카드 그리드 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            metrics.length <= 3
              ? `repeat(${metrics.length}, 1fr)`
              : metrics.length <= 6
                ? "repeat(3, 1fr)"
                : "repeat(4, 1fr)",
          gap: 22,
          flex: 1,
          alignContent: "center",
        }}
      >
        {metrics.map((metric, index) => {
          const cardScale = spring({
            frame,
            fps,
            config: { damping: 14, mass: 0.7 },
            delay: 10 + index * 5,
          });
          const changeColor = metric.positive !== false ? "#72F088" : "#FF6B6B";

          return (
            <div
              key={index}
              style={{
                transform: `scale(${cardScale})`,
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(108,99,255,0.2)",
                borderRadius: 16,
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              {metric.icon && (
                <div style={{ fontSize: 28, marginBottom: 10 }}>{metric.icon}</div>
              )}
              <div style={{ fontSize: 15, color: "#A7A9BE", marginBottom: 10, fontWeight: 500 }}>
                {metric.label}
              </div>
              <div style={{ fontSize: 40, fontWeight: 800, color: "#FFFFFE", marginBottom: 8 }}>
                {metric.value}
              </div>
              {metric.target && (
                <div style={{ fontSize: 14, color: "#666", marginBottom: 6 }}>
                  목표: {metric.target}
                </div>
              )}
              {metric.change && (
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: changeColor,
                    backgroundColor: `${changeColor}15`,
                    padding: "4px 12px",
                    borderRadius: 10,
                  }}
                >
                  {metric.change}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {content.note && (
        <p
          style={{
            opacity: noteOpacity,
            fontSize: 16,
            color: "#666",
            textAlign: "right",
            marginTop: 16,
          }}
        >
          {content.note}
        </p>
      )}
    </AbsoluteFill>
  );
};
