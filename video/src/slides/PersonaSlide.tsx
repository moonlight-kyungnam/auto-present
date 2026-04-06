import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";
import type { SlideData, ProjectConfig } from "../types";

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

// 사용자 페르소나 슬라이드 — 인구통계, 목표, 페인포인트
export const PersonaSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const content = slide.content as {
    name?: string;
    age?: string;
    occupation?: string;
    avatar?: string;
    quote?: string;
    demographics?: Array<{ label: string; value: string }>;
    goals?: string[];
    painPoints?: string[];
    behaviors?: string[];
  };

  const demographics = content.demographics || [];
  const goals = content.goals || [];
  const painPoints = content.painPoints || [];
  const behaviors = content.behaviors || [];

  const titleOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 5 });
  const profileScale = spring({ frame, fps, config: { damping: 14, mass: 0.8 }, delay: 10 });
  const quoteOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 20 });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0F0E17 0%, #1A1A2E 100%)",
        display: "flex",
        flexDirection: "column",
        padding: "60px 90px",
        fontFamily: "Pretendard, sans-serif",
      }}
    >
      <h1
        style={{
          opacity: titleOpacity,
          fontSize: 44,
          fontWeight: 700,
          color: "#FFFFFE",
          marginBottom: 28,
        }}
      >
        {slide.title}
      </h1>

      <div style={{ display: "flex", gap: 30, flex: 1 }}>
        {/* 좌측: 프로필 카드 */}
        <div
          style={{
            transform: `scale(${profileScale})`,
            width: 340,
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(108,99,255,0.2)",
            borderRadius: 20,
            padding: "32px 28px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {/* 아바타 원 */}
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6C63FF 0%, #8B83FF 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              color: "#FFFFFE",
              marginBottom: 16,
            }}
          >
            {content.avatar || (content.name ? content.name[0] : "P")}
          </div>

          <div style={{ fontSize: 26, fontWeight: 700, color: "#FFFFFE", marginBottom: 4 }}>
            {content.name || "Persona"}
          </div>
          {content.occupation && (
            <div style={{ fontSize: 16, color: "#6C63FF", marginBottom: 4 }}>
              {content.occupation}
            </div>
          )}
          {content.age && (
            <div style={{ fontSize: 15, color: "#A7A9BE", marginBottom: 16 }}>
              {content.age}
            </div>
          )}

          {/* 인구통계 */}
          {demographics.length > 0 && (
            <div
              style={{
                width: "100%",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                paddingTop: 16,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {demographics.map((d, i) => (
                <div
                  key={i}
                  style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}
                >
                  <span style={{ color: "#A7A9BE" }}>{d.label}</span>
                  <span style={{ color: "#FFFFFE", fontWeight: 600 }}>{d.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* 인용문 */}
          {content.quote && (
            <div
              style={{
                opacity: quoteOpacity,
                marginTop: 18,
                padding: "12px 16px",
                backgroundColor: "rgba(108,99,255,0.1)",
                borderRadius: 10,
                borderLeft: "3px solid #6C63FF",
                fontSize: 14,
                color: "#A7A9BE",
                fontStyle: "italic",
                lineHeight: 1.5,
              }}
            >
              "{content.quote}"
            </div>
          )}
        </div>

        {/* 우측: 목표, 페인포인트, 행동 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
          {/* 목표 */}
          {goals.length > 0 && (
            <Section
              frame={frame}
              fps={fps}
              label="목표 (Goals)"
              color="#72F088"
              items={goals}
              baseDelay={16}
            />
          )}

          {/* 페인포인트 */}
          {painPoints.length > 0 && (
            <Section
              frame={frame}
              fps={fps}
              label="페인포인트 (Pain Points)"
              color="#FF6B6B"
              items={painPoints}
              baseDelay={24}
            />
          )}

          {/* 행동 패턴 */}
          {behaviors.length > 0 && (
            <Section
              frame={frame}
              fps={fps}
              label="행동 패턴 (Behaviors)"
              color="#F0AD4E"
              items={behaviors}
              baseDelay={32}
            />
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 섹션 서브 컴포넌트
const Section: React.FC<{
  frame: number;
  fps: number;
  label: string;
  color: string;
  items: string[];
  baseDelay: number;
}> = ({ frame, fps, label, color, items, baseDelay }) => {
  const sectionOpacity = spring({
    frame,
    fps,
    config: { damping: 20 },
    delay: baseDelay,
  });

  return (
    <div style={{ opacity: sectionOpacity }}>
      <div
        style={{
          fontSize: 16,
          fontWeight: 800,
          color,
          marginBottom: 10,
          letterSpacing: 1,
        }}
      >
        {label}
      </div>
      <div
        style={{
          backgroundColor: `${color}08`,
          border: `1px solid ${color}25`,
          borderRadius: 12,
          padding: "14px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {items.map((item, i) => {
          const itemOpacity = spring({
            frame,
            fps,
            config: { damping: 20 },
            delay: baseDelay + 4 + i * 4,
          });
          return (
            <div
              key={i}
              style={{
                opacity: itemOpacity,
                fontSize: 17,
                color: "#A7A9BE",
                lineHeight: 1.4,
                paddingLeft: 14,
                borderLeft: `3px solid ${color}50`,
              }}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
};
