---
name: render-video
description: |
  Remotion을 사용하여 모든 산출물을 통합하고 최종 MP4 영상을 렌더링합니다.
  subtitleEnabled 설정에 따라 SubtitleOverlay 컴포넌트 포함 여부를 제어합니다.
  사용 시점: VideoAgent가 최종 MP4 렌더링을 실행할 때 호출합니다.
---

# render-video 스킬

## 기능 설명

Remotion CLI를 사용하여 video/ 프로젝트를 MP4로 렌더링합니다.

## 렌더링 전 체크

```bash
# Node.js 버전 확인
node --version  # 18+ 필요

# Remotion 설치 확인
cd video && npx remotion --version
```

## 렌더링 명령

```bash
cd video
npx remotion render src/index.ts Presentation ../output.mp4 \
  --codec=h264 \
  --image-format=jpeg \
  --jpeg-quality=80 \
  --concurrency=4
```

## Remotion SubtitleOverlay 포함 렌더링

subtitleEnabled: true + mode: remotion인 경우
video/src/Root.tsx에 SubtitleOverlay 컴포넌트 자동 추가:

```typescript
// video/src/Root.tsx 수정 패턴
import { SubtitleOverlay } from './slides/SubtitleOverlay';

export const Presentation: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* 슬라이드 컴포넌트들 */}
      <SubtitleOverlay fps={fps} />  {/* subtitleEnabled: true일 때만 포함 */}
    </AbsoluteFill>
  );
};
```

## 사용 예제

예제 1: 기본 렌더링 (자막 없음)
- 입력: subtitleEnabled: false
- 출력: video/output.mp4

예제 2: Remotion 자막 포함 렌더링
- 입력: subtitleEnabled: true, mode: remotion
- 출력: SubtitleOverlay 포함된 video/output.mp4

예제 3: 렌더링 오류 처리
- 입력: node_modules 미설치
- 출력: "cd video && npm install 실행 후 재시도" 안내
