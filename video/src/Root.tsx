import { Composition, staticFile } from "remotion";
import { Presentation } from "./Presentation";
import type { SlidesData, DurationsData, ProjectConfig } from "./types";

// JSON 데이터 로드 (빌드 시 정적 파일로 번들)
import slidesData from "./slides-data.json";
import durationsData from "./durations.json";

const config: ProjectConfig = require("../../project-config.json");

export const RemotionRoot: React.FC = () => {
  const fps = config.fps || 15;
  const totalFrames = (durationsData as DurationsData).totalFrames || fps * 60;

  return (
    <>
      <Composition
        id="Presentation"
        component={Presentation}
        durationInFrames={totalFrames}
        fps={fps}
        width={config.width || 1920}
        height={config.height || 1080}
        defaultProps={{
          slidesData: slidesData as unknown as SlidesData,
          durationsData: durationsData as DurationsData,
          config,
        }}
      />
    </>
  );
};
