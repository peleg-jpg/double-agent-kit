// Progress bar, sound effects, music, and the safe-zone debug overlay.
import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  BROLL,
  CARDS,
  config,
  CTA_AT,
  HOOK_END,
  PUNCHES,
  ZOOMS,
  cardIntervals,
} from "../config";
import { FPS, SAFE, useLook } from "../layout";

export const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const look = useLook();
  if (!config.progress) return null;
  const p = frame / Math.max(1, durationInFrames - 1);
  const h =
    look.id === "pop"
      ? 14
      : look.id === "glass"
        ? 7
        : look.id === "mono"
          ? 12
          : 9;
  const color =
    look.id === "pop"
      ? "#FFD23F"
      : look.id === "glass"
        ? "rgba(255,255,255,.85)"
        : look.accent;
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: h,
        background:
          look.id === "split" ? "rgba(14,17,22,.08)" : "rgba(0,0,0,.25)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0, // RTL: fills from right to left
          height: h,
          width: `${p * 100}%`,
          background: color,
          borderRadius: look.id === "mono" ? 0 : `${h}px 0 0 ${h}px`,
        }}
      />
    </div>
  );
};

type Cue = { t: number; file: string; vol: number };

// every visual event gets a quiet, dry sound. No whooshes. Volumes are linear gain.
const buildCues = (lookId: string, duration: number): Cue[] => {
  const cues: Cue[] = [];
  const cardSound =
    lookId === "glass" ? "tick" : lookId === "mono" ? "click" : "pop";
  // no second click where a B-roll already clicks at the same moment
  cardIntervals(duration, lookId).forEach(
    ([a]) =>
      a > 0.05 &&
      !BROLL.some((b) => Math.abs(b.at - a) < 0.05) &&
      cues.push({ t: a, file: "click", vol: 0.28 }),
  );
  CARDS.forEach((c) => {
    cues.push({ t: c.at, file: cardSound, vol: 0.32 });
    if (c.type === "stat")
      for (let k = 0.15; k < 0.95; k += 0.07)
        cues.push({ t: c.at + k, file: "tick", vol: 0.1 });
  });
  PUNCHES.forEach((p) => {
    cues.push({ t: p.at, file: "thud", vol: 0.55 });
    if (lookId === "pop" && p.burst !== false)
      cues.push({ t: p.at + 0.03, file: "sparkle", vol: 0.22 });
  });
  BROLL.forEach((b) => {
    cues.push({ t: b.at, file: "click", vol: 0.4 });
    cues.push({ t: b.to, file: "click", vol: 0.3 });
  });
  if (lookId === "mono" || lookId === "split")
    ZOOMS.forEach((z) => cues.push({ t: z.at, file: "click", vol: 0.32 }));
  if (config.hook.text) {
    const n = config.hook.text.split(/\s+/).length;
    for (let i = 0; i < n; i++)
      cues.push({
        t: 0.05 + i * (lookId === "split" ? 0.13 : 0.09),
        file: "tick",
        vol: 0.12,
      });
  }
  if (config.cta) {
    cues.push({ t: CTA_AT + 0.45, file: "pop", vol: 0.3 });
    cues.push({ t: CTA_AT + 1.3, file: "tap", vol: 0.45 });
  }
  return cues.filter(
    (c) =>
      c.t >= 0 && c.t < duration && !(c.t < HOOK_END && c.file === "click"),
  );
};

export const SoundLayer: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const look = useLook();
  const cues = config.sfx ? buildCues(look.id, durationInFrames / FPS) : [];
  const musicVol = config.musicVolume ?? 0.08;
  return (
    <>
      {cues.map((c, i) => (
        <Sequence
          key={i}
          from={Math.round(c.t * FPS)}
          durationInFrames={FPS}
          layout="none"
        >
          <Audio src={staticFile(`sfx/${c.file}.wav`)} volume={c.vol} />
        </Sequence>
      ))}
      {config.music && (
        <Audio
          src={staticFile(config.music)}
          loop
          volume={(f) =>
            interpolate(
              f,
              [0, 15, durationInFrames - 30, durationInFrames],
              [0, musicVol, musicVol, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            )
          }
        />
      )}
    </>
  );
};

// pass --props='{"safe":true}' to see where Instagram covers the frame
export const SafeZones: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: SAFE.top,
        background: "rgba(255,0,0,.28)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: SAFE.bottom,
        bottom: 0,
        background: "rgba(255,0,0,.28)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: SAFE.rail.x,
        right: 0,
        top: SAFE.rail.y0,
        height: SAFE.rail.y1 - SAFE.rail.y0,
        background: "rgba(255,120,0,.32)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: SAFE.side,
        right: SAFE.side,
        top: SAFE.top,
        bottom: 1920 - SAFE.bottom,
        border: "3px dashed #00E5FF",
      }}
    />
  </AbsoluteFill>
);
