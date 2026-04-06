import type { SlidesData, DurationsData, ThemeConfig } from "../types";

/**
 * JSON 데이터 파일 로드 유틸리티
 * Remotion은 빌드 시점에 JSON을 번들하므로 import로 사용하지만,
 * 런타임 동적 로드가 필요한 경우 이 유틸리티를 사용합니다.
 */

export function loadSlidesData(): SlidesData {
  return require("../slides-data.json") as SlidesData;
}

export function loadDurationsData(): DurationsData {
  return require("../durations.json") as DurationsData;
}

export function loadThemeConfig(): ThemeConfig {
  return require("../theme.ts").default as ThemeConfig;
}

/**
 * 총 프레임 수 계산
 * 모든 슬라이드의 duration + 버퍼를 합산
 */
export function calculateTotalFrames(
  durations: DurationsData,
  bufferSeconds: number
): number {
  const bufferFrames = Math.round(bufferSeconds * durations.fps);
  return durations.slides.reduce(
    (total, entry) => total + entry.durationFrames + bufferFrames,
    0
  );
}
