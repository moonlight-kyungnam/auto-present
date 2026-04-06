import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  interpolate,
  useVideoConfig,
} from "remotion";
import { SlideData, ProjectConfig } from "../types";

// 방법론 슬라이드 콘텐츠 타입
interface Phase {
  number: number;
  name: string;
  description: string;
  tools?: string[];
}

interface MethodologyContent {
  phases: Phase[];
}

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

// 페이즈별 색상
const PHASE_COLORS = ["#6C63FF", "#FF6584", "#43E97B", "#F9A826", "#00C9FF", "#A855F7"];

export const MethodologySlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const content = slide.content as unknown as MethodologyContent;
  const phases = content?.phases ?? [];

  // 제목 애니메이션
  const titleSpring = spring({ frame, fps, from: 0, to: 1, durationInFrames: 18 });
  const titleOpacity = titleSpring;
  const titleY = interpolate(titleSpring, [0, 1], [-30, 0]);

  // 2열 또는 1열 레이아웃
  const useGrid = phases.length >= 4;
  const cols = useGrid ? 2 : 1;

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

      {/* 페이즈 카드 그리드 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 20,
          flex: 1,
          position: "relative",
        }}
      >
        {phases.map((phase, i) => {
          const delay = 8 + i * 6;
          const phaseSpring = spring({
            frame: frame - delay,
            fps,
            from: 0,
            to: 1,
            durationInFrames: 20,
          });
          const phaseOpacity = interpolate(phaseSpring, [0, 1], [0, 1]);
          const phaseY = interpolate(phaseSpring, [0, 1], [30, 0]);
          const color = PHASE_COLORS[i % PHASE_COLORS.length];

          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 18,
                background: "rgba(255,255,255,0.04)",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "24px 22px",
                opacity: phaseOpacity,
                transform: `translateY(${phaseY}px)`,
                position: "relative",
              }}
            >
              {/* 번호 뱃지 */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#0F0E17",
                  flexShrink: 0,
                }}
              >
                {phase.number}
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
                  {phase.name}
                </div>
                <div
                  style={{
                    fontSize: 17,
                    color: "rgba(255,255,255,0.65)",
                    lineHeight: 1.5,
                    marginBottom: phase.tools && phase.tools.length > 0 ? 12 : 0,
                  }}
                >
                  {phase.description}
                </div>

                {/* 도구 태그 (선택) */}
                {phase.tools && phase.tools.length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {phase.tools.map((tool, j) => (
                      <div
                        key={j}
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color,
                          background: `${color}18`,
                          border: `1px solid ${color}44`,
                          borderRadius: 6,
                          padding: "3px 10px",
                        }}
                      >
                        {tool}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 커넥터 라인 (마지막 제외, 1열 모드에서만) */}
              {!useGrid && i < phases.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    left: 42,
                    bottom: -20,
                    width: 2,
                    height: 20,
                    background: `${color}66`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default MethodologySlide;
