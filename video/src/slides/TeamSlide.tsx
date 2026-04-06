import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";
import type { SlideData, ProjectConfig } from "../types";

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

export const TeamSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const content = slide.content as {
    members?: Array<{ name: string; role: string; career?: string; image?: string }>;
  };
  const members = content.members || [];

  const titleOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 5 });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0F0E17 0%, #1A1A2E 100%)",
        display: "flex",
        flexDirection: "column",
        padding: "80px 100px",
        fontFamily: "Pretendard, sans-serif",
      }}
    >
      <h1
        style={{
          opacity: titleOpacity,
          fontSize: 48,
          fontWeight: 700,
          color: "#FFFFFE",
          marginBottom: 50,
        }}
      >
        {slide.title}
      </h1>

      {/* 멤버 카드 그리드 */}
      <div
        style={{
          display: "flex",
          gap: 24,
          justifyContent: "center",
          flexWrap: "wrap",
          flex: 1,
          alignItems: "center",
        }}
      >
        {members.map((member, index) => {
          const cardScale = spring({
            frame,
            fps,
            config: { damping: 15, mass: 0.8 },
            delay: 15 + index * 8,
          });

          return (
            <div
              key={index}
              style={{
                transform: `scale(${cardScale})`,
                width: 260,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: 16,
                padding: "32px 24px",
                textAlign: "center",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* 아바타 플레이스홀더 */}
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  backgroundColor: "#6C63FF",
                  margin: "0 auto 20px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#FFFFFE",
                }}
              >
                {member.name.charAt(0)}
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#FFFFFE",
                  marginBottom: 8,
                }}
              >
                {member.name}
              </div>
              <div
                style={{
                  fontSize: 18,
                  color: "#6C63FF",
                  marginBottom: 12,
                }}
              >
                {member.role}
              </div>
              {member.career && (
                <div
                  style={{
                    fontSize: 16,
                    color: "#A7A9BE",
                    lineHeight: 1.4,
                  }}
                >
                  {member.career}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
