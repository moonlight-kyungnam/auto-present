import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  interpolate,
  useVideoConfig,
} from "remotion";
import { SlideData, ProjectConfig } from "../types";

// 프레임워크 슬라이드 콘텐츠 타입 (2x2 그리드 또는 수평 플로우)
interface Quadrant {
  label: string;
  items: string[];
}

interface Step {
  label: string;
  description: string;
}

interface FrameworkContent {
  quadrants?: Quadrant[];
  steps?: Step[];
}

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

// 사분면/스텝 색상
const QUADRANT_COLORS = ["#6C63FF", "#FF6584", "#43E97B", "#F9A826"];

export const FrameworkSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const content = slide.content as unknown as FrameworkContent;

  const quadrants = content?.quadrants;
  const steps = content?.steps;
  const isQuadrantMode = !!quadrants && quadrants.length > 0;

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

      {/* 2x2 그리드 모드 */}
      {isQuadrantMode && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: 20,
            flex: 1,
          }}
        >
          {(quadrants ?? []).map((q, i) => {
            const delay = 8 + i * 6;
            const qSpring = spring({
              frame: frame - delay,
              fps,
              from: 0,
              to: 1,
              durationInFrames: 20,
            });
            const qOpacity = interpolate(qSpring, [0, 1], [0, 1]);
            const qScale = interpolate(qSpring, [0, 1], [0.85, 1]);
            const color = QUADRANT_COLORS[i % QUADRANT_COLORS.length];

            return (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 16,
                  border: `2px solid ${color}`,
                  padding: "28px 24px",
                  opacity: qOpacity,
                  transform: `scale(${qScale})`,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* 사분면 라벨 */}
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color,
                    marginBottom: 16,
                  }}
                >
                  {q.label}
                </div>

                {/* 항목 리스트 */}
                {q.items.map((item, j) => (
                  <div
                    key={j}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: color,
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        fontSize: 17,
                        color: "#FFFFFE",
                        lineHeight: 1.4,
                      }}
                    >
                      {item}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* 수평 플로우 모드 */}
      {!isQuadrantMode && (
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: 12,
            flex: 1,
          }}
        >
          {(steps ?? []).map((step, i) => {
            const delay = 8 + i * 7;
            const sSpring = spring({
              frame: frame - delay,
              fps,
              from: 0,
              to: 1,
              durationInFrames: 18,
            });
            const sOpacity = interpolate(sSpring, [0, 1], [0, 1]);
            const sY = interpolate(sSpring, [0, 1], [30, 0]);
            const color = QUADRANT_COLORS[i % QUADRANT_COLORS.length];

            return (
              <React.Fragment key={i}>
                {/* 스텝 카드 */}
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 14,
                    border: `1px solid ${color}`,
                    padding: "28px 20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    opacity: sOpacity,
                    transform: `translateY(${sY}px)`,
                  }}
                >
                  {/* 스텝 번호 */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      fontWeight: 800,
                      color: "#0F0E17",
                      marginBottom: 14,
                    }}
                  >
                    {i + 1}
                  </div>

                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#FFFFFE",
                      marginBottom: 10,
                    }}
                  >
                    {step.label}
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      color: "rgba(255,255,255,0.65)",
                      lineHeight: 1.5,
                    }}
                  >
                    {step.description}
                  </div>
                </div>

                {/* 화살표 커넥터 (마지막 제외) */}
                {i < (steps ?? []).length - 1 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: 28,
                      color: "rgba(255,255,255,0.3)",
                      opacity: sOpacity,
                    }}
                  >
                    {"\u2192"}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </AbsoluteFill>
  );
};

export default FrameworkSlide;
