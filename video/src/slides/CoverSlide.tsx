import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import type { SlideData, ProjectConfig } from "../types";

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

export const CoverSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 프래그먼트별 등장 애니메이션
  const badgeOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 5 });
  const titleOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 15 });
  const titleY = interpolate(frame, [15, 35], [30, 0], { extrapolateRight: "clamp" });
  const subtitleOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 25 });
  const metaOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 35 });

  const content = slide.content as {
    presenter?: string;
    date?: string;
    organization?: string;
    badge?: string;
  };

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0F0E17 0%, #1A1A2E 60%, #2D2B55 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
        fontFamily: "Pretendard, sans-serif",
      }}
    >
      {/* 배지 */}
      {content.badge && (
        <div
          style={{
            opacity: badgeOpacity,
            fontSize: 20,
            color: "#6C63FF",
            border: "1px solid #6C63FF",
            borderRadius: 20,
            padding: "6px 20px",
            marginBottom: 30,
            letterSpacing: 2,
          }}
        >
          {content.badge}
        </div>
      )}

      {/* 제목 */}
      <h1
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: 72,
          fontWeight: 800,
          color: "#FFFFFE",
          textAlign: "center",
          lineHeight: 1.2,
          margin: 0,
        }}
      >
        {slide.title}
      </h1>

      {/* 부제목 */}
      {slide.subtitle && (
        <p
          style={{
            opacity: subtitleOpacity,
            fontSize: 32,
            color: "#A7A9BE",
            marginTop: 20,
            textAlign: "center",
          }}
        >
          {slide.subtitle}
        </p>
      )}

      {/* 메타 정보 */}
      <div
        style={{
          opacity: metaOpacity,
          display: "flex",
          gap: 30,
          marginTop: 60,
          fontSize: 20,
          color: "#A7A9BE",
        }}
      >
        {content.date && <span>{content.date}</span>}
        {content.presenter && <span>{content.presenter}</span>}
        {content.organization && <span>{content.organization}</span>}
      </div>
    </AbsoluteFill>
  );
};
