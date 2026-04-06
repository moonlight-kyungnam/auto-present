import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";
import type { SlideData, ProjectConfig } from "../types";

interface Props {
  slide: SlideData;
  config: ProjectConfig;
}

// TAM/SAM/SOM 슬라이드 — 동심원 (바깥이 가장 큰 TAM)
export const TamSamSomSlide: React.FC<Props> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const content = slide.content as {
    tam?: { value: string; description?: string };
    sam?: { value: string; description?: string };
    som?: { value: string; description?: string };
    source?: string;
    note?: string;
  };

  const titleOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 5 });
  const tamScale = spring({ frame, fps, config: { damping: 12, mass: 0.8 }, delay: 10 });
  const samScale = spring({ frame, fps, config: { damping: 12, mass: 0.8 }, delay: 18 });
  const somScale = spring({ frame, fps, config: { damping: 12, mass: 0.8 }, delay: 26 });
  const noteOpacity = spring({ frame, fps, config: { damping: 20 }, delay: 36 });

  const circles = [
    {
      label: "TAM",
      sublabel: "Total Addressable Market",
      data: content.tam,
      size: 520,
      color: "rgba(108, 99, 255, 0.15)",
      borderColor: "#6C63FF",
      scale: tamScale,
    },
    {
      label: "SAM",
      sublabel: "Serviceable Available Market",
      data: content.sam,
      size: 370,
      color: "rgba(114, 240, 136, 0.12)",
      borderColor: "#72F088",
      scale: samScale,
    },
    {
      label: "SOM",
      sublabel: "Serviceable Obtainable Market",
      data: content.som,
      size: 210,
      color: "rgba(240, 173, 78, 0.15)",
      borderColor: "#F0AD4E",
      scale: somScale,
    },
  ];

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0F0E17 0%, #1A1A2E 100%)",
        display: "flex",
        flexDirection: "column",
        padding: "60px 100px",
        fontFamily: "Pretendard, sans-serif",
      }}
    >
      <h1
        style={{
          opacity: titleOpacity,
          fontSize: 46,
          fontWeight: 700,
          color: "#FFFFFE",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        {slide.title}
      </h1>

      {/* 동심원 영역 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ position: "relative", width: 540, height: 540, display: "flex" }}>
          {/* 동심원 레이어 */}
          {circles.map((c) => (
            <div
              key={c.label}
              style={{
                position: "absolute",
                left: `calc(50% - ${c.size / 2}px)`,
                top: `calc(50% - ${c.size / 2}px)`,
                width: c.size,
                height: c.size,
                borderRadius: "50%",
                backgroundColor: c.color,
                border: `2px solid ${c.borderColor}50`,
                transform: `scale(${c.scale})`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: c.label === "TAM" ? "flex-start" : c.label === "SAM" ? "flex-start" : "center",
                paddingTop: c.label === "TAM" ? 30 : c.label === "SAM" ? 20 : 0,
              }}
            />
          ))}

          {/* 라벨 (별도 레이어로 분리하여 항상 위에 표시) */}
          {circles.map((c) => {
            const topOffset =
              c.label === "TAM" ? "6%" : c.label === "SAM" ? "20%" : "42%";
            return (
              <div
                key={`label-${c.label}`}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: topOffset,
                  transform: `translateX(-50%) scale(${c.scale})`,
                  textAlign: "center",
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 800, color: c.borderColor }}>
                  {c.label}
                </div>
                {c.data?.value && (
                  <div style={{ fontSize: 30, fontWeight: 800, color: "#FFFFFE", marginTop: 2 }}>
                    {c.data.value}
                  </div>
                )}
                {c.data?.description && (
                  <div style={{ fontSize: 14, color: "#A7A9BE", marginTop: 2, maxWidth: 180 }}>
                    {c.data.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 우측 범례 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            marginLeft: 60,
          }}
        >
          {circles.map((c) => (
            <div
              key={`legend-${c.label}`}
              style={{
                opacity: c.scale,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  backgroundColor: c.borderColor,
                }}
              />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: c.borderColor }}>
                  {c.label}
                </div>
                <div style={{ fontSize: 13, color: "#A7A9BE" }}>{c.sublabel}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 출처/노트 */}
      {(content.source || content.note) && (
        <p
          style={{
            opacity: noteOpacity,
            fontSize: 16,
            color: "#666",
            textAlign: "right",
            marginTop: 10,
          }}
        >
          {content.source ? `출처: ${content.source}` : content.note}
        </p>
      )}
    </AbsoluteFill>
  );
};
