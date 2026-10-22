// Canvas geometry, Instagram safe zones and motion helpers. 1080x1920, 30 fps.
import React from "react";
import { Easing, interpolate, spring } from "remotion";
import type { Look, SpringCfg } from "./looks";
import { LOOKS } from "./looks";

export const W = 1080;
export const H = 1920;
export const FPS = 30;

// Instagram Reels UI covers the top ~250 px (header) and everything under ~1500 px (name, caption, audio row),
// plus the like/comment/share rail on the right (x > 910, y 1000-1500). Text and key graphics stay inside.
export const SAFE = {
  top: 250,
  bottom: 1500,
  side: 60,
  rail: { x: 910, y0: 1000, y1: 1500 },
};

// Card mode: graphic on top, face window below, caption in the seam between them.
export const CARD_ZONE = { x: 70, y: 280, w: 940, h: 540 }; // y 280-820
export const SEAM_Y = 892; // caption center in card mode
export const WINDOW = {
  x: 60,
  y: 965,
  w: 960,
  h: 1100,
  r: 48,
  scale: 0.6,
  eyeY: 1265,
};
export const SPLIT_PLATE = {
  x: 36,
  y: 965,
  w: 1008,
  h: 1100,
  r: 64,
  scale: 0.6,
  eyeY: 1265,
};
export const TALK_CAPTION_Y = 1330; // caption center over full-frame footage

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // expo-out: reveals
  key: Easing.bezier(0.4, 0, 0.2, 1), // keynote: moves and morphs
  in: Easing.bezier(0.5, 0, 0.9, 0.6), // exits
  back: Easing.bezier(0.34, 1.56, 0.64, 1), // small overshoot
};

// 0 -> 1 between t0 and t0 + dur (seconds) with an easing
export const ramp = (t: number, t0: number, dur: number, ease = EASE.out) =>
  interpolate(t, [t0, t0 + Math.max(dur, 0.001)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

// spring that starts at t0 (seconds)
export const springAt = (t: number, t0: number, cfg: SpringCfg) =>
  t < t0 ? 0 : spring({ frame: (t - t0) * FPS, fps: FPS, config: cfg });

export const LookContext = React.createContext<Look>(LOOKS.pop);
export const useLook = () => React.useContext(LookContext);

// split a Hebrew/English string into tokens; runs of Latin words stay together so "Claude Code" never flips
export const HEBREW = /[֐-׿]/;
export const groupLatin = <T extends { text: string }>(
  items: T[],
  merge: (a: T, b: T) => T,
): T[] => {
  const out: T[] = [];
  for (const it of items) {
    const prev = out[out.length - 1];
    const isLatin = !HEBREW.test(it.text) && /[A-Za-z0-9]/.test(it.text);
    const prevLatin =
      prev &&
      !HEBREW.test(prev.text) &&
      /[A-Za-z0-9]/.test(prev.text) &&
      !/[.,!?]$/.test(prev.text);
    if (prev && isLatin && prevLatin) out[out.length - 1] = merge(prev, it);
    else out.push(it);
  }
  return out;
};

// strip sentence punctuation for on-screen captions (keep "?" and "%")
export const cleanCaption = (s: string) =>
  s
    .replace(/["״]/g, "")
    .replace(/[.,;:!]+$/g, "")
    .replace(/^[.,;:!]+/g, "");

// font size that fits a line of `chars` characters into `width` (Hebrew bold is about 0.56 em per char)
export const fitSize = (
  text: string,
  width: number,
  max: number,
  min: number,
  em = 0.56,
) => Math.max(min, Math.min(max, width / Math.max(1, text.length * em)));
