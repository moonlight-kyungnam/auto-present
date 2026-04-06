import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  interpolate,
  useVideoConfig,
} from "remotion";
import { SlideData, ProjectConfig } from "../types";

// 가설 슬라이드 콘텐츠 타입
interface HypothesisContent {
  hypothesis: string;
  evidence: string[];
  conclusion?: string;
}

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

export const HypothesisSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const content = slide.content as unknown as HypothesisContent;

  const hypothesis = content?.hypothesis ?? "";
  const evidence = content?.evidence ?? [];
  const conclusion = content?.conclusion;

  // 제목 애니메이션
  const titleSpring = spring({ frame, fps, from: 0, to: 1, durationInFrames: 18 });
  const titleOpacity = titleSpring;
  const titleY = interpolate(titleSpring, [0, 1], [-30, 0]);

  // 가설 애니메이션
  const hypSpring = spring({ frame: frame - 8, fps, from: 0, to: 1, durationInFrames: 22 });
  const hypOpacity = hypSpring;
  const hypScale = interpolate(hypSpring, [0, 1], [0.9, 1]);

  // 결론 애니메이션
  const conclusionDelay = 18 + evidence.length * 5;
  const concSpring = spring({
    frame: frame - conclusionDelay,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 20,
  });
  const concOpacity = concSpring;
  const concY = interpolate(concSpring, [0, 1], [20, 0]);

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
          marginBottom: 36,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        {slide.title}
      </div>

      {/* 가설 (If-Then 스타일) */}
      <div
        style={{
          background: "rgba(108,99,255,0.1)",
          border: "2px solid rgba(108,99,255,0.4)",
          borderRadius: 16,
          padding: "28px 32px",
          marginBottom: 36,
          opacity: hypOpacity,
          transform: `scale(${hypScale})`,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#6C63FF",
            letterSpacing: 2,
            marginBottom: 10,
            textTransform: "uppercase" as const,
          }}
        >
          HYPOTHESIS
        </div>
        <div
          style={{
            fontSize: 26,
            color: "#FFFFFE",
            lineHeight: 1.6,
            fontStyle: "italic",
          }}
        >
          {hypothesis}
        </div>
      </div>

      {/* 근거 목록 */}
      <div style={{ marginBottom: 32, flex: 1 }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#6C63FF",
            marginBottom: 18,
            opacity: hypOpacity,
          }}
        >
          근거 (Evidence)
        </div>

        {evidence.map((ev, i) => {
          const delay = 18 + i * 5;
          const evSpring = spring({
            frame: frame - delay,
            fps,
            from: 0,
            to: 1,
            durationInFrames: 16,
          });
          const evOpacity = interpolate(evSpring, [0, 1], [0, 1]);
          const evX = interpolate(evSpring, [0, 1], [-30, 0]);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                marginBottom: 14,
                opacity: evOpacity,
                transform: `translateX(${evX}px)`,
              }}
            >
              {/* 체크 아이콘 */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "rgba(67,233,123,0.15)",
                  border: "1px solid #43E97B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  color: "#43E97B",
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {"\u2713"}
              </div>
              <div style={{ fontSize: 20, color: "#FFFFFE", lineHeight: 1.5 }}>
                {ev}
              </div>
            </div>
          );
        })}
      </div>

      {/* 결론 (선택) */}
      {conclusion && (
        <div
          style={{
            background: "rgba(67,233,123,0.08)",
            border: "1px solid rgba(67,233,123,0.3)",
            borderRadius: 12,
            padding: "22px 28px",
            opacity: concOpacity,
            transform: `translateY(${concY}px)`,
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#43E97B",
              marginBottom: 8,
              letterSpacing: 1,
            }}
          >
            CONCLUSION
          </div>
          <div style={{ fontSize: 21, color: "#FFFFFE", lineHeight: 1.6 }}>
            {conclusion}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default HypothesisSlide;
