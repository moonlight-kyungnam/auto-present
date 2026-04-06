import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";
import type { SlideData, ProjectConfig } from "../types";

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

export const TableSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const content = slide.content as {
    headers?: string[];
    rows?: string[][];
    callout?: string;
  };
  const headers = content.headers || [];
  const rows = content.rows || [];

  const titleOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 5 });
  const headerOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 12 });

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

      {/* 테이블 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            opacity: headerOpacity,
            display: "flex",
            backgroundColor: "rgba(108, 99, 255, 0.2)",
          }}
        >
          {headers.map((header, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                padding: "16px 20px",
                fontSize: 22,
                fontWeight: 700,
                color: "#FFFFFE",
                borderRight: i < headers.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none",
              }}
            >
              {header}
            </div>
          ))}
        </div>

        {/* 행 */}
        {rows.map((row, rowIndex) => {
          const rowOpacity = spring({
            frame,
            fps,
            config: { damping: 20 },
            delay: 20 + rowIndex * 5,
          });

          return (
            <div
              key={rowIndex}
              style={{
                opacity: rowOpacity,
                display: "flex",
                backgroundColor:
                  rowIndex % 2 === 0
                    ? "rgba(255,255,255,0.02)"
                    : "rgba(255,255,255,0.05)",
              }}
            >
              {row.map((cell, cellIndex) => (
                <div
                  key={cellIndex}
                  style={{
                    flex: 1,
                    padding: "14px 20px",
                    fontSize: 20,
                    color: "#A7A9BE",
                    borderRight:
                      cellIndex < row.length - 1
                        ? "1px solid rgba(255,255,255,0.05)"
                        : "none",
                  }}
                >
                  {cell}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* 콜아웃 */}
      {content.callout && (
        <p
          style={{
            opacity: spring({ frame, fps, delay: 30 + rows.length * 5 }),
            fontSize: 20,
            color: "#A7A9BE",
            marginTop: 20,
            fontStyle: "italic",
          }}
        >
          {content.callout}
        </p>
      )}
    </AbsoluteFill>
  );
};
