import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";
import type { SlideData, ProjectConfig } from "../types";

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

export const QuoteSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const content = slide.content as {
    quote?: string;
    source?: string;
  };
  const quote = content.quote || slide.fragments[0]?.content || "";
  const source = content.source || "";

  const quoteOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 10 });
  const sourceOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 25 });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0F0E17 0%, #1A1A2E 60%, #2D2B55 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "100px 140px",
        fontFamily: "Pretendard, sans-serif",
      }}
    >
      {/* 인용 부호 */}
      <div
        style={{
          opacity: quoteOpacity * 0.3,
          fontSize: 200,
          color: "#6C63FF",
          lineHeight: 0.8,
          marginBottom: -40,
          alignSelf: "flex-start",
        }}
      >
        "
      </div>

      {/* 인용문 */}
      <p
        style={{
          opacity: quoteOpacity,
          fontSize: 40,
          fontWeight: 500,
          color: "#FFFFFE",
          lineHeight: 1.6,
          textAlign: "center",
          fontStyle: "italic",
        }}
      >
        {quote}
      </p>

      {/* 출처 */}
      {source && (
        <p
          style={{
            opacity: sourceOpacity,
            fontSize: 24,
            color: "#A7A9BE",
            marginTop: 40,
          }}
        >
          — {source}
        </p>
      )}
    </AbsoluteFill>
  );
};
