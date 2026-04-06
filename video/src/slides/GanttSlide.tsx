import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, interpolate, useVideoConfig } from "remotion";
import type { SlideData, ProjectConfig } from "../types";

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

// 간트 차트 슬라이드 — 수평 바 타임라인
export const GanttSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const content = slide.content as {
    tasks?: Array<{
      name: string;
      start: number;
      end: number;
      color?: string;
      milestone?: boolean;
    }>;
    totalPeriods?: number;
    periodLabel?: string;
    legend?: string;
  };
  const tasks = content.tasks || [];
  const totalPeriods = content.totalPeriods || 12;

  const titleOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 5 });
  const legendOpacity = spring({
    frame,
    fps,
    config: { damping: 20 },
    delay: 20 + tasks.length * 6,
  });

  const defaultColors = ["#6C63FF", "#72F088", "#FF6B6B", "#F0AD4E", "#4ECDC4", "#FF8C42"];

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
      <h1
        style={{
          opacity: titleOpacity,
          fontSize: 46,
          fontWeight: 700,
          color: "#FFFFFE",
          marginBottom: 40,
        }}
      >
        {slide.title}
      </h1>

      {/* 기간 헤더 */}
      <div style={{ display: "flex", marginBottom: 12, paddingLeft: 200 }}>
        {Array.from({ length: totalPeriods }, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              fontSize: 12,
              color: "#666",
              textAlign: "center",
            }}
          >
            {content.periodLabel || "M"}
            {i + 1}
          </div>
        ))}
      </div>

      {/* 간트 바 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        {tasks.map((task, index) => {
          const barProgress = spring({
            frame,
            fps,
            config: { damping: 18, mass: 0.8 },
            delay: 10 + index * 6,
          });
          const barWidth = interpolate(barProgress, [0, 1], [0, 100]);
          const color = task.color || defaultColors[index % defaultColors.length];

          const leftPct = (task.start / totalPeriods) * 100;
          const widthPct = ((task.end - task.start) / totalPeriods) * 100;

          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              {/* 작업 이름 */}
              <div
                style={{
                  width: 184,
                  fontSize: 18,
                  color: "#FFFFFE",
                  fontWeight: 600,
                  textAlign: "right",
                  flexShrink: 0,
                  opacity: barProgress,
                }}
              >
                {task.name}
              </div>

              {/* 바 영역 */}
              <div
                style={{
                  flex: 1,
                  height: 36,
                  position: "relative",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderRadius: 6,
                }}
              >
                {/* 격자선 */}
                {Array.from({ length: totalPeriods }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: `${((i + 1) / totalPeriods) * 100}%`,
                      top: 0,
                      bottom: 0,
                      width: 1,
                      backgroundColor: "rgba(255,255,255,0.05)",
                    }}
                  />
                ))}

                {/* 실제 바 */}
                {task.milestone ? (
                  <div
                    style={{
                      position: "absolute",
                      left: `${leftPct}%`,
                      top: "50%",
                      transform: `translateY(-50%) scale(${barProgress})`,
                      width: 18,
                      height: 18,
                      backgroundColor: color,
                      borderRadius: 3,
                      rotate: "45deg",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      left: `${leftPct}%`,
                      top: 4,
                      bottom: 4,
                      width: `${widthPct * (barWidth / 100)}%`,
                      backgroundColor: color,
                      borderRadius: 4,
                      boxShadow: `0 0 12px ${color}40`,
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {content.legend && (
        <p
          style={{
            opacity: legendOpacity,
            fontSize: 16,
            color: "#666",
            textAlign: "center",
            marginTop: 20,
          }}
        >
          {content.legend}
        </p>
      )}
    </AbsoluteFill>
  );
};
