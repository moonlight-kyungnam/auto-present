import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  interpolate,
  useVideoConfig,
} from "remotion";
import { SlideData, ProjectConfig } from "../types";

// 공식 슬라이드 콘텐츠 타입
interface FormulaVariable {
  symbol: string;
  meaning: string;
}

interface FormulaContent {
  formula: string;
  description: string;
  variables: FormulaVariable[];
}

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

export const FormulaSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const content = slide.content as unknown as FormulaContent;

  const formula = content?.formula ?? "";
  const description = content?.description ?? "";
  const variables = content?.variables ?? [];

  // 제목 애니메이션
  const titleSpring = spring({ frame, fps, from: 0, to: 1, durationInFrames: 18 });
  const titleOpacity = titleSpring;
  const titleY = interpolate(titleSpring, [0, 1], [-30, 0]);

  // 공식 애니메이션
  const formulaSpring = spring({ frame: frame - 8, fps, from: 0, to: 1, durationInFrames: 24 });
  const formulaOpacity = formulaSpring;
  const formulaScale = interpolate(formulaSpring, [0, 1], [0.8, 1]);

  // 설명 애니메이션
  const descSpring = spring({ frame: frame - 16, fps, from: 0, to: 1, durationInFrames: 18 });
  const descOpacity = descSpring;

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
      {/* 제목 */}
      <div
        style={{
          fontSize: 40,
          fontWeight: 700,
          color: "#FFFFFE",
          marginBottom: 40,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        {slide.title}
      </div>

      {/* 공식 (대형 중앙 텍스트) */}
      <div
        style={{
          fontSize: 64,
          fontWeight: 800,
          color: "#6C63FF",
          textAlign: "center",
          marginBottom: 20,
          padding: "30px 50px",
          background: "rgba(108,99,255,0.08)",
          border: "2px solid rgba(108,99,255,0.3)",
          borderRadius: 20,
          opacity: formulaOpacity,
          transform: `scale(${formulaScale})`,
          letterSpacing: 2,
        }}
      >
        {formula}
      </div>

      {/* 설명 */}
      {description && (
        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.7)",
            textAlign: "center",
            lineHeight: 1.6,
            maxWidth: 800,
            marginBottom: 44,
            opacity: descOpacity,
          }}
        >
          {description}
        </div>
      )}

      {/* 변수 정의 목록 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          width: "100%",
          maxWidth: 700,
        }}
      >
        {variables.map((v, i) => {
          const delay = 22 + i * 5;
          const varSpring = spring({
            frame: frame - delay,
            fps,
            from: 0,
            to: 1,
            durationInFrames: 16,
          });
          const varOpacity = interpolate(varSpring, [0, 1], [0, 1]);
          const varX = interpolate(varSpring, [0, 1], [-20, 0]);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                opacity: varOpacity,
                transform: `translateX(${varX}px)`,
              }}
            >
              {/* 기호 */}
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#6C63FF",
                  minWidth: 60,
                  textAlign: "center",
                }}
              >
                {v.symbol}
              </div>

              {/* 구분선 */}
              <div
                style={{
                  width: 2,
                  height: 28,
                  background: "rgba(108,99,255,0.4)",
                }}
              />

              {/* 의미 */}
              <div
                style={{
                  fontSize: 20,
                  color: "#FFFFFE",
                  lineHeight: 1.4,
                }}
              >
                {v.meaning}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default FormulaSlide;
