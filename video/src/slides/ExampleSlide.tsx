import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  interpolate,
  useVideoConfig,
} from "remotion";
import { SlideData, ProjectConfig } from "../types";

// 예시 슬라이드 콘텐츠 타입
interface ExampleItem {
  title: string;
  description: string;
  result?: string;
}

interface ExampleContent {
  examples: ExampleItem[];
}

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

export const ExampleSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const content = slide.content as unknown as ExampleContent;
  const examples = content?.examples ?? [];

  // 제목 애니메이션
  const titleSpring = spring({ frame, fps, from: 0, to: 1, durationInFrames: 18 });
  const titleOpacity = titleSpring;
  const titleY = interpolate(titleSpring, [0, 1], [-30, 0]);

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
          marginBottom: 44,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        {slide.title}
      </div>

      {/* 예시 카드 목록 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          flex: 1,
        }}
      >
        {examples.map((ex, i) => {
          const delay = 8 + i * 7;
          const cardSpring = spring({
            frame: frame - delay,
            fps,
            from: 0,
            to: 1,
            durationInFrames: 18,
          });
          const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);
          const cardX = interpolate(cardSpring, [0, 1], [-40, 0]);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 20,
                background: "rgba(255,255,255,0.04)",
                borderRadius: 14,
                border: "1px solid rgba(108,99,255,0.2)",
                padding: "24px 28px",
                opacity: cardOpacity,
                transform: `translateX(${cardX}px)`,
              }}
            >
              {/* 번호 뱃지 */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "#6C63FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#FFFFFE",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>

              {/* 내용 */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#FFFFFE",
                    marginBottom: 8,
                  }}
                >
                  {ex.title}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: 1.5,
                  }}
                >
                  {ex.description}
                </div>

                {/* 결과 (선택) */}
                {ex.result && (
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 17,
                      color: "#43E97B",
                      fontWeight: 600,
                    }}
                  >
                    {ex.result}
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

export default ExampleSlide;
