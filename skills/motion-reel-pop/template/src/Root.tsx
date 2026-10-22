import React from "react";
import { Composition, staticFile } from "remotion";
import { parseMedia } from "@remotion/media-parser";
import { config } from "./config";
import { FPS, H, W } from "./layout";
import { Reel, ReelProps } from "./Reel";
import { DemoSpeaker } from "./DemoSpeaker";

export const Root: React.FC = () => (
  <>
  <Composition
    id="Reel"
    component={Reel}
    width={W}
    height={H}
    fps={FPS}
    durationInFrames={FPS * 30}
    defaultProps={{ look: config.look, safe: false } as ReelProps}
    calculateMetadata={async () => {
      // the reel is exactly as long as the student's video
      const { slowDurationInSeconds } = await parseMedia({
        src: staticFile(config.video),
        fields: { slowDurationInSeconds: true },
        acknowledgeRemotionLicense: true,
      }).catch(() => {
        throw new Error(`Video public/${config.video} not found. Copy the video there (or run: npm run demo-video).`);
      });
      return { durationInFrames: Math.max(1, Math.floor(slowDurationInSeconds * FPS)) };
    }}
  />

  <Composition id="DemoSpeaker" component={DemoSpeaker} width={W} height={H} fps={FPS} durationInFrames={FPS * 14} />
  </>
);
