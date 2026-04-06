import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";
import type { SlideData, ProjectConfig } from "../types";

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

// 거버넌스 슬라이드 — 조직도/계층 구조
export const GovernanceSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const content = slide.content as {
    levels?: Array<{
      title: string;
      members?: Array<{ name: string; role?: string }>;
      color?: string;
    }>;
    description?: string;
  };
  const levels = content.levels || [];

  const titleOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 5 });
  const descOpacity = spring({
    frame,
    fps,
    config: { damping: 20 },
    delay: 20 + levels.length * 8,
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0F0E17 0%, #1A1A2E 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "70px 100px",
        fontFamily: "Pretendard, sans-serif",
      }}
    >
      <h1
        style={{
          opacity: titleOpacity,
          fontSize: 46,
          fontWeight: 700,
          color: "#FFFFFE",
          marginBottom: 40,
          textAlign: "center",
        }}
      >
        {slide.title}
      </h1>

      {/* 계층 구조 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          flex: 1,
          justifyContent: "center",
          width: "100%",
        }}
      >
        {levels.map((level, index) => {
          const levelOpacity = spring({
            frame,
            fps,
            config: { damping: 16, mass: 0.8 },
            delay: 10 + index * 8,
          });
          const color = level.color || "#6C63FF";
          const members = level.members || [];

          // 상위 계층일수록 좁고, 하위일수록 넓게
          const widthPct = 40 + index * 15;

          return (
            <div
              key={index}
              style={{
                opacity: levelOpacity,
                width: `${Math.min(widthPct, 100)}%`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* 연결선 */}
              {index > 0 && (
                <div
                  style={{
                    width: 2,
                    height: 16,
                    backgroundColor: "rgba(108,99,255,0.3)",
                    marginBottom: -1,
                  }}
                />
              )}

              {/* 레벨 박스 */}
              <div
                style={{
                  width: "100%",
                  backgroundColor: `${color}12`,
                  border: `2px solid ${color}40`,
                  borderRadius: 16,
                  padding: "18px 28px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color,
                    marginBottom: members.length > 0 ? 12 : 0,
                    letterSpacing: 1,
                  }}
                >
                  {level.title}
                </div>
                {members.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    {members.map((member, mi) => (
                      <div
                        key={mi}
                        style={{
                          backgroundColor: "rgba(255,255,255,0.05)",
                          borderRadius: 10,
                          padding: "10px 18px",
                        }}
                      >
                        <div style={{ fontSize: 17, fontWeight: 600, color: "#FFFFFE" }}>
                          {member.name}
                        </div>
                        {member.role && (
                          <div style={{ fontSize: 13, color: "#A7A9BE", marginTop: 2 }}>
                            {member.role}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {content.description && (
        <p
          style={{
            opacity: descOpacity,
            fontSize: 19,
            color: "#A7A9BE",
            textAlign: "center",
            marginTop: 20,
            lineHeight: 1.5,
          }}
        >
          {content.description}
        </p>
      )}
    </AbsoluteFill>
  );
};
