import React from "react";
import { AbsoluteFill, Audio, Series, staticFile } from "remotion";
import { SlideRenderer } from "./slides/SlideRenderer";
import type { SlidesData, DurationsData, ProjectConfig } from "./types";

interface PresentationProps {
  slidesData: SlidesData;
  durationsData: DurationsData;
  config: ProjectConfig;
}

export const Presentation: React.FC<PresentationProps> = ({
  slidesData,
  durationsData,
  config,
}) => {
  const fps = config.fps || 15;
  const bufferFrames = Math.round((config.bufferSeconds || 2) * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Series>
        {slidesData.slides.map((slide, index) => {
          // 해당 슬라이드의 재생 시간 (프레임 단위)
          const durationEntry = durationsData.slides.find(
            (d) => d.slideIndex === slide.slideIndex
          );
          const durationFrames = durationEntry
            ? durationEntry.durationFrames + bufferFrames
            : fps * 5; // 기본 5초

          return (
            <Series.Sequence
              key={slide.slideIndex}
              durationInFrames={durationFrames}
            >
              {/* 슬라이드 컴포넌트 */}
              <SlideRenderer slide={slide} config={config} />

              {/* 오디오 나레이션 */}
              {durationEntry && (
                <Audio
                  src={staticFile(
                    `audio/slide-${String(slide.slideIndex).padStart(2, "0")}.mp3`
                  )}
                />
              )}
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};
