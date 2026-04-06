import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";
import type { SlideData, ProjectConfig } from "../types";

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

export const ConclusionSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const content = slide.content as {
    summary?: string[];
    checklist?: string[];
    cta?: string;
  };
  const summary = content.summary || [];
  const checklist = content.checklist || [];
  const cta = content.cta;

  const titleOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 5 });
  const subtitleOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 15 });
  const ctaScale = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.8 },
    delay: 30 + (summary.length + checklist.length) * 5,
  });

  const hasSections = summary.length > 0 || checklist.length > 0;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0F0E17 0%, #1A1A2E 60%, #2D2B55 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: hasSections ? "flex-start" : "center",
        alignItems: "center",
        padding: hasSections ? "80px 120px" : "80px 140px",
        fontFamily: "Pretendard, sans-serif",
      }}
    >
      {/* 제목 */}
      <h1
        style={{
          opacity: titleOpacity,
          fontSize: hasSections ? 48 : 64,
          fontWeight: 800,
          color: "#FFFFFE",
          textAlign: "center",
          marginBottom: hasSections ? 20 : 16,
        }}
      >
        {slide.title}
      </h1>

      {/* 부제목 */}
      {slide.subtitle && (
        <p
          style={{
            opacity: subtitleOpacity,
            fontSize: 28,
            color: "#A7A9BE",
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          {slide.subtitle}
        </p>
      )}

      {/* 요약 포인트 */}
      {summary.length > 0 && (
        <div style={{ width: "100%", marginBottom: 30 }}>
          {summary.map((item, i) => {
            const itemOpacity = spring({
              frame, fps,
              config: { damping: 20 },
              delay: 20 + i * 5,
            });
            return (
              <div
                key={i}
                style={{
                  opacity: itemOpacity,
                  display: "flex",
                  gap: 12,
                  marginBottom: 12,
                  fontSize: 24,
                  color: "#FFFFFE",
                }}
              >
                <span style={{ color: "#6C63FF" }}>✦</span>
                <span>{item}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* 체크리스트 */}
      {checklist.length > 0 && (
        <div style={{ width: "100%", marginBottom: 30 }}>
          {checklist.map((item, i) => {
            const checkOpacity = spring({
              frame, fps,
              config: { damping: 20 },
              delay: 20 + summary.length * 5 + i * 5,
            });
            return (
              <div
                key={i}
                style={{
                  opacity: checkOpacity,
                  display: "flex",
                  gap: 12,
                  marginBottom: 10,
                  fontSize: 22,
                  color: "#A7A9BE",
                }}
              >
                <span style={{ color: "#4ECB71" }}>☑</span>
                <span>{item}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA 버튼 */}
      {cta && (
        <div
          style={{
            transform: `scale(${ctaScale})`,
            marginTop: 20,
            padding: "16px 48px",
            backgroundColor: "#6C63FF",
            borderRadius: 30,
            fontSize: 24,
            fontWeight: 700,
            color: "#FFFFFE",
          }}
        >
          {cta}
        </div>
      )}
    </AbsoluteFill>
  );
};
