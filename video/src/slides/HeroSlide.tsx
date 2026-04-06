import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, interpolate, useVideoConfig, Img } from "remotion";
import type { SlideData, ProjectConfig } from "../types";

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

// 히어로 이미지 슬라이드 — 큰 비주얼 + 텍스트 오버레이
export const HeroSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const content = slide.content as {
    imageUrl?: string;
    headline?: string;
    subheadline?: string;
    ctaText?: string;
    overlay?: "dark" | "light" | "gradient";
    textPosition?: "center" | "left" | "bottom";
  };

  const overlay = content.overlay || "dark";
  const textPosition = content.textPosition || "center";

  const titleOpacity = spring({ frame, fps, config: { damping: 18 }, delay: 8 });
  const titleY = interpolate(
    spring({ frame, fps, config: { damping: 18 }, delay: 8 }),
    [0, 1],
    [30, 0]
  );
  const subOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 18 });
  const ctaOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 28 });
  const imgScale = interpolate(frame, [0, 90], [1.05, 1], { extrapolateRight: "clamp" });

  const overlayStyles: Record<string, React.CSSProperties> = {
    dark: { backgroundColor: "rgba(15, 14, 23, 0.65)" },
    light: { backgroundColor: "rgba(255, 255, 255, 0.15)" },
    gradient: {
      background: "linear-gradient(180deg, rgba(15,14,23,0.2) 0%, rgba(15,14,23,0.85) 100%)",
    },
  };

  const positionStyles: Record<string, React.CSSProperties> = {
    center: { alignItems: "center", justifyContent: "center", textAlign: "center" },
    left: { alignItems: "flex-start", justifyContent: "center", textAlign: "left", paddingLeft: 120 },
    bottom: { alignItems: "center", justifyContent: "flex-end", textAlign: "center", paddingBottom: 120 },
  };

  return (
    <AbsoluteFill style={{ fontFamily: "Pretendard, sans-serif" }}>
      {/* 배경 이미지 또는 그라디언트 */}
      {content.imageUrl ? (
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <Img
            src={content.imageUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${imgScale})`,
            }}
          />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill
          style={{
            background: "linear-gradient(135deg, #0F0E17 0%, #1A1A2E 50%, #2D1B69 100%)",
          }}
        />
      )}

      {/* 오버레이 */}
      <AbsoluteFill style={overlayStyles[overlay] || overlayStyles.dark} />

      {/* 텍스트 오버레이 */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "80px 120px",
          ...positionStyles[textPosition],
        } as React.CSSProperties}
      >
        {/* 헤드라인 */}
        <h1
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            fontSize: 64,
            fontWeight: 800,
            color: "#FFFFFE",
            marginBottom: 20,
            maxWidth: 1000,
            lineHeight: 1.2,
            textShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}
        >
          {content.headline || slide.title}
        </h1>

        {/* 서브 헤드라인 */}
        {(content.subheadline || slide.subtitle) && (
          <p
            style={{
              opacity: subOpacity,
              fontSize: 28,
              color: "rgba(255,255,254,0.85)",
              maxWidth: 800,
              lineHeight: 1.5,
              textShadow: "0 2px 12px rgba(0,0,0,0.4)",
            }}
          >
            {content.subheadline || slide.subtitle}
          </p>
        )}

        {/* CTA 버튼 */}
        {content.ctaText && (
          <div
            style={{
              opacity: ctaOpacity,
              marginTop: 36,
              padding: "16px 48px",
              background: "linear-gradient(135deg, #6C63FF 0%, #8B83FF 100%)",
              borderRadius: 30,
              fontSize: 22,
              fontWeight: 700,
              color: "#FFFFFE",
              boxShadow: "0 4px 24px rgba(108,99,255,0.4)",
            }}
          >
            {content.ctaText}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
