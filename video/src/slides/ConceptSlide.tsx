import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  interpolate,
  useVideoConfig,
} from "remotion";
import { SlideData, ProjectConfig } from "../types";

// 컨셉 슬라이드 콘텐츠 타입
interface ConceptElement {
  label: string;
  description: string;
}

interface ConceptContent {
  concept: string;
  description: string;
  elements: ConceptElement[];
}

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

export const ConceptSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const content = slide.content as unknown as ConceptContent;

  const concept = content?.concept ?? slide.title;
  const description = content?.description ?? "";
  const elements = content?.elements ?? [];

  // 컨셉 이름 애니메이션
  const conceptSpring = spring({ frame, fps, from: 0, to: 1, durationInFrames: 24 });
  const conceptScale = interpolate(conceptSpring, [0, 1], [0.7, 1]);
  const conceptOpacity = conceptSpring;

  // 설명 애니메이션
  const descSpring = spring({ frame: frame - 10, fps, from: 0, to: 1, durationInFrames: 18 });
  const descOpacity = descSpring;
  const descY = interpolate(descSpring, [0, 1], [20, 0]);

  // 그리드 열 수 계산
  const cols = elements.length <= 3 ? elements.length || 1 : elements.length <= 4 ? 2 : 3;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0F0E17 0%, #1A1A2E 100%)",
        fontFamily: "Pretendard, sans-serif",
        padding: "60px 80px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* 컨셉 이름 (대형 중앙 텍스트) */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: "#6C63FF",
          textAlign: "center",
          marginBottom: 20,
          opacity: conceptOpacity,
          transform: `scale(${conceptScale})`,
        }}
      >
        {concept}
      </div>

      {/* 설명 */}
      <div
        style={{
          fontSize: 24,
          color: "rgba(255,255,255,0.75)",
          textAlign: "center",
          lineHeight: 1.6,
          maxWidth: 900,
          marginBottom: 50,
          opacity: descOpacity,
          transform: `translateY(${descY}px)`,
        }}
      >
        {description}
      </div>

      {/* 요소 카드 그리드 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 20,
          width: "100%",
          maxWidth: 1100,
        }}
      >
        {elements.map((el, i) => {
          const delay = 18 + i * 6;
          const cardSpring = spring({
            frame: frame - delay,
            fps,
            from: 0,
            to: 1,
            durationInFrames: 18,
          });
          const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);
          const cardY = interpolate(cardSpring, [0, 1], [30, 0]);

          return (
            <div
              key={i}
              style={{
                background: "rgba(108,99,255,0.08)",
                border: "1px solid rgba(108,99,255,0.3)",
                borderRadius: 14,
                padding: "24px 22px",
                opacity: cardOpacity,
                transform: `translateY(${cardY}px)`,
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#6C63FF",
                  marginBottom: 10,
                }}
              >
                {el.label}
              </div>
              <div
                style={{
                  fontSize: 17,
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1.5,
                }}
              >
                {el.description}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default ConceptSlide;
