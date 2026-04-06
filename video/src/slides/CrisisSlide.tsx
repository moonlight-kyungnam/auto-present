import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  interpolate,
  useVideoConfig,
} from "remotion";
import { SlideData, ProjectConfig } from "../types";

// 위기 슬라이드 콘텐츠 타입
interface CrisisContent {
  severity: "high" | "medium" | "low";
  description: string;
  impacts: string[];
  response: string;
}

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

// 심각도별 색상 및 라벨
const SEVERITY_MAP: Record<string, { color: string; label: string }> = {
  high: { color: "#FF4444", label: "HIGH" },
  medium: { color: "#F9A826", label: "MEDIUM" },
  low: { color: "#43E97B", label: "LOW" },
};

export const CrisisSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const content = slide.content as unknown as CrisisContent;

  const severity = content?.severity ?? "medium";
  const description = content?.description ?? "";
  const impacts = content?.impacts ?? [];
  const response = content?.response ?? "";

  const severityInfo = SEVERITY_MAP[severity] ?? SEVERITY_MAP.medium;

  // 헤더 애니메이션
  const headerSpring = spring({ frame, fps, from: 0, to: 1, durationInFrames: 18 });
  const headerOpacity = headerSpring;
  const headerY = interpolate(headerSpring, [0, 1], [-30, 0]);

  // 설명 애니메이션
  const descSpring = spring({ frame: frame - 8, fps, from: 0, to: 1, durationInFrames: 18 });
  const descOpacity = descSpring;

  // 대응 섹션 애니메이션
  const responseDelay = 12 + impacts.length * 5;
  const responseSpring = spring({
    frame: frame - responseDelay,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 20,
  });
  const responseOpacity = responseSpring;
  const responseY = interpolate(responseSpring, [0, 1], [20, 0]);

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
      {/* 헤더: 제목 + 심각도 배지 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 24,
          opacity: headerOpacity,
          transform: `translateY(${headerY}px)`,
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#FF4444",
          }}
        >
          {slide.title}
        </div>

        {/* 심각도 배지 */}
        <div
          style={{
            background: severityInfo.color,
            color: "#FFFFFE",
            fontSize: 16,
            fontWeight: 700,
            padding: "6px 18px",
            borderRadius: 20,
            letterSpacing: 1.5,
          }}
        >
          {severityInfo.label}
        </div>
      </div>

      {/* 설명 */}
      <div
        style={{
          fontSize: 22,
          color: "rgba(255,255,255,0.8)",
          lineHeight: 1.6,
          marginBottom: 36,
          opacity: descOpacity,
        }}
      >
        {description}
      </div>

      {/* 영향 목록 */}
      <div style={{ marginBottom: 40, flex: 1 }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#FF4444",
            marginBottom: 16,
            opacity: descOpacity,
          }}
        >
          영향 (Impacts)
        </div>
        {impacts.map((impact, i) => {
          const delay = 12 + i * 5;
          const itemSpring = spring({
            frame: frame - delay,
            fps,
            from: 0,
            to: 1,
            durationInFrames: 16,
          });
          const itemOpacity = interpolate(itemSpring, [0, 1], [0, 1]);
          const itemX = interpolate(itemSpring, [0, 1], [-30, 0]);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
                opacity: itemOpacity,
                transform: `translateX(${itemX}px)`,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#FF4444",
                  flexShrink: 0,
                }}
              />
              <div style={{ fontSize: 20, color: "#FFFFFE", lineHeight: 1.5 }}>
                {impact}
              </div>
            </div>
          );
        })}
      </div>

      {/* 대응 방안 */}
      {response && (
        <div
          style={{
            background: "rgba(255,68,68,0.1)",
            border: "1px solid rgba(255,68,68,0.3)",
            borderRadius: 12,
            padding: "24px 28px",
            opacity: responseOpacity,
            transform: `translateY(${responseY}px)`,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#FF4444",
              marginBottom: 8,
            }}
          >
            대응 방안
          </div>
          <div style={{ fontSize: 20, color: "#FFFFFE", lineHeight: 1.6 }}>
            {response}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default CrisisSlide;
