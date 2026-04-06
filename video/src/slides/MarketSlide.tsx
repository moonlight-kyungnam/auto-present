import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  interpolate,
  useVideoConfig,
} from "remotion";
import { SlideData, ProjectConfig } from "../types";

// 마켓 세그먼트 데이터 타입
interface MarketSegment {
  name: string;
  value: string;
  share: string;
}

interface MarketContent {
  segments: MarketSegment[];
}

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

// 세그먼트별 테두리 색상
const SEGMENT_COLORS = [
  "#6C63FF",
  "#FF6584",
  "#43E97B",
  "#F9A826",
  "#00C9FF",
  "#A855F7",
  "#FF4444",
  "#2DD4BF",
];

export const MarketSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const content = slide.content as unknown as MarketContent;
  const segments = content?.segments ?? [];

  // 제목 애니메이션
  const titleSpring = spring({ frame, fps, from: 0, to: 1, durationInFrames: 20 });
  const titleY = interpolate(titleSpring, [0, 1], [-40, 0]);
  const titleOpacity = titleSpring;

  // 그리드 열 수 계산
  const cols = segments.length <= 4 ? 2 : segments.length <= 6 ? 3 : 4;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0F0E17 0%, #1A1A2E 100%)",
        fontFamily: "Pretendard, sans-serif",
        padding: "60px 80px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 제목 */}
      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: "#FFFFFE",
          marginBottom: 50,
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
        }}
      >
        {slide.title}
      </div>

      {/* 세그먼트 그리드 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 24,
          flex: 1,
        }}
      >
        {segments.map((seg, i) => {
          const delay = 8 + i * 6;
          const cardSpring = spring({
            frame: frame - delay,
            fps,
            from: 0,
            to: 1,
            durationInFrames: 18,
          });
          const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);
          const cardScale = interpolate(cardSpring, [0, 1], [0.85, 1]);
          const borderColor = SEGMENT_COLORS[i % SEGMENT_COLORS.length];

          return (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: 16,
                border: `2px solid ${borderColor}`,
                padding: "32px 28px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                opacity: cardOpacity,
                transform: `scale(${cardScale})`,
              }}
            >
              {/* 세그먼트 이름 */}
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: "#FFFFFE",
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                {seg.name}
              </div>

              {/* 값 */}
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 800,
                  color: borderColor,
                  marginBottom: 8,
                }}
              >
                {seg.value}
              </div>

              {/* 점유율 */}
              <div
                style={{
                  fontSize: 18,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {seg.share}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default MarketSlide;
