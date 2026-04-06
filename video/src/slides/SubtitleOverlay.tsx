import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

// 자막 데이터 타입
interface SubtitleEntry {
  startFrame: number;
  endFrame: number;
  text: string;
}

interface SubtitleOverlayProps {
  subtitles: SubtitleEntry[];
  style?: {
    fontSize?: number;
    fontFamily?: string;
    fontColor?: string;
    bgColor?: string;
    bgEnabled?: boolean;
    position?: "top" | "bottom";
    marginBottom?: number;
  };
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  subtitles,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 현재 프레임에 해당하는 자막 찾기
  const currentSubtitle = subtitles.find(
    (sub) => frame >= sub.startFrame && frame <= sub.endFrame
  );

  if (!currentSubtitle) return null;

  // 페이드 인/아웃 효과
  const fadeIn = interpolate(
    frame,
    [currentSubtitle.startFrame, currentSubtitle.startFrame + Math.round(fps * 0.2)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const fadeOut = interpolate(
    frame,
    [currentSubtitle.endFrame - Math.round(fps * 0.2), currentSubtitle.endFrame],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const opacity = Math.min(fadeIn, fadeOut);

  const {
    fontSize = 36,
    fontFamily = "Pretendard, Noto Sans KR, sans-serif",
    fontColor = "#FFFFFF",
    bgColor = "rgba(0, 0, 0, 0.55)",
    bgEnabled = true,
    position = "bottom",
    marginBottom = 60,
  } = style;

  return (
    <AbsoluteFill
      style={{
        justifyContent: position === "top" ? "flex-start" : "flex-end",
        alignItems: "center",
        padding: position === "top" ? `${marginBottom}px 0 0 0` : `0 0 ${marginBottom}px 0`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          opacity,
          backgroundColor: bgEnabled ? bgColor : "transparent",
          padding: bgEnabled ? "8px 24px" : "0",
          borderRadius: bgEnabled ? 8 : 0,
          maxWidth: "80%",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize,
            fontFamily,
            color: fontColor,
            fontWeight: 500,
            textShadow: bgEnabled
              ? "none"
              : "2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.5)",
            lineHeight: 1.4,
          }}
        >
          {currentSubtitle.text}
        </span>
      </div>
    </AbsoluteFill>
  );
};
