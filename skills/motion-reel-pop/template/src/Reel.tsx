// The whole reel. Layer order: footage, B-roll, hook, cards, punches, CTA, captions, progress, sound.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { config, LookId } from "./config";
import { FPS, LookContext } from "./layout";
import { LOOKS } from "./looks";
import { Captions } from "./components/Captions";
import { CardsLayer, CtaLayer, HookLayer } from "./components/Cards";
import { Progress, SafeZones, SoundLayer } from "./components/Overlays";
import { BRollLayer, punchDim, PunchLayer, shakeAt } from "./components/Punch";
import { Stage, useStageState } from "./components/Stage";

export type ReelProps = { look?: LookId; safe?: boolean };

const Inner: React.FC<{ safe?: boolean }> = ({ safe }) => {
  const st = useStageState();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const look = React.useContext(LookContext);
  const shake = look.id === "pop" ? shakeAt(t) : { x: 0, y: 0 };
  const pd = look.id === "glass" ? punchDim(t) : 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${shake.x}px, ${shake.y}px)` }}>
        <Stage st={st} dim={pd * 0.28} blur={pd * 10} />
        <BRollLayer />
        <HookLayer />
        <CardsLayer />
        <PunchLayer />
        <CtaLayer />
        <Captions st={st} />
      </AbsoluteFill>
      <Progress />
      <SoundLayer />
      {safe && <SafeZones />}
    </AbsoluteFill>
  );
};

export const Reel: React.FC<ReelProps> = ({ look, safe }) => (
  <LookContext.Provider value={LOOKS[look ?? config.look] ?? LOOKS.pop}>
    <Inner safe={safe} />
  </LookContext.Provider>
);
