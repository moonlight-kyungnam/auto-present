import type { Fragment } from "../types";

/**
 * 프래그먼트 등장 순서를 계산합니다.
 * 각 프래그먼트의 order 필드 기준으로 정렬 후,
 * 프레임 기반 타이밍을 부여합니다.
 */
export interface FragmentTiming {
  fragment: Fragment;
  startFrame: number;
  endFrame: number;
}

export function calculateFragmentTimings(
  fragments: Fragment[],
  totalDurationFrames: number,
  fps: number
): FragmentTiming[] {
  if (fragments.length === 0) return [];

  // order 기준 정렬
  const sorted = [...fragments].sort((a, b) => a.order - b.order);

  // 첫 프래그먼트: 0.5초 후 등장, 이후 균등 배분
  const delayFrames = Math.round(fps * 0.5);
  const availableFrames = totalDurationFrames - delayFrames;
  const intervalFrames = Math.max(
    Math.round(fps * 0.3), // 최소 0.3초 간격
    Math.floor(availableFrames / sorted.length)
  );

  return sorted.map((fragment, index) => ({
    fragment,
    startFrame: delayFrames + index * intervalFrames,
    endFrame: totalDurationFrames,
  }));
}
