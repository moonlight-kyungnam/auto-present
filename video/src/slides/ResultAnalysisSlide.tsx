import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  interpolate,
  useVideoConfig,
} from "remotion";
import { SlideData, ProjectConfig } from "../types";

// 결과 분석 슬라이드 콘텐츠 타입
interface Finding {
  label: string;
  value: string;
  interpretation: string;
}

interface ResultAnalysisContent {
  findings: Finding[];
  summary?: string;
}

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

// 카드 색상
const FINDING_COLORS = ["#6C63FF", "#FF6584", "#43E97B", "#F9A826", "#00C9FF", "#A855F7"];

export const ResultAnalysisSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const content = slide.content as unknown as ResultAnalysisContent;

  const findings = content?.findings ?? [];
  const summary = content?.summary;

  // 제목 애니메이션
  const titleSpring = spring({ frame, fps, from: 0, to: 1, durationInFrames: 18 });
  const titleOpacity = titleSpring;
  const titleY = interpolate(titleSpring, [0, 1], [-30, 0]);

  // 요약 애니메이션
  const summaryDelay = 14 + findings.length * 6;
  const summarySpring = spring({
    frame: frame - summaryDelay,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 20,
  });
  const summaryOpacity = summarySpring;
  const summaryY = interpolate(summarySpring, [0, 1], [20, 0]);

  // 그리드 열 수
  const cols = findings.length <= 2 ? findings.length || 1 : findings.length <= 4 ? 2 : 3;

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
          marginBottom: 40,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        {slide.title}
      </div>

      {/* 핵심 발견사항 카드 그리드 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 20,
          flex: 1,
        }}
      >
        {findings.map((f, i) => {
          const delay = 8 + i * 6;
          const cardSpring = spring({
            frame: frame - delay,
            fps,
            from: 0,
            to: 1,
            durationInFrames: 20,
          });
          const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);
          const cardScale = interpolate(cardSpring, [0, 1], [0.85, 1]);
          const color = FINDING_COLORS[i % FINDING_COLORS.length];

          return (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.1)",
                borderTop: `3px solid ${color}`,
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                opacity: cardOpacity,
                transform: `scale(${cardScale})`,
              }}
            >
              {/* 라벨 */}
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: 12,
                  textTransform: "uppercase" as const,
                  letterSpacing: 1,
                }}
              >
                {f.label}
              </div>

              {/* 값 */}
              <div
                style={{
                  fontSize: 38,
                  fontWeight: 800,
                  color,
                  marginBottom: 14,
                }}
              >
                {f.value}
              </div>

              {/* 해석 */}
              <div
                style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.65)",
                  lineHeight: 1.5,
                  flex: 1,
                }}
              >
                {f.interpretation}
              </div>
            </div>
          );
        })}
      </div>

      {/* 요약 바 */}
      {summary && (
        <div
          style={{
            background: "rgba(108,99,255,0.08)",
            border: "1px solid rgba(108,99,255,0.25)",
            borderRadius: 12,
            padding: "20px 28px",
            marginTop: 24,
            opacity: summaryOpacity,
            transform: `translateY(${summaryY}px)`,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#6C63FF",
              marginBottom: 6,
              letterSpacing: 1,
            }}
          >
            SUMMARY
          </div>
          <div
            style={{
              fontSize: 20,
              color: "#FFFFFE",
              lineHeight: 1.5,
            }}
          >
            {summary}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default ResultAnalysisSlide;
