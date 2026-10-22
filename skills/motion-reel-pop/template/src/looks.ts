// The 4 looks. Every number here is a tested default; change colors through reel.config.json "brand".
import { loadFont as loadRubik } from "@remotion/google-fonts/Rubik";
import { loadFont as loadHeebo } from "@remotion/google-fonts/Heebo";
import { loadFont as loadSecular } from "@remotion/google-fonts/SecularOne";
import { loadFont as loadAssistant } from "@remotion/google-fonts/Assistant";
import { config, LookId } from "./config";

const sub = { subsets: ["hebrew", "latin"] as ("hebrew" | "latin")[] };
export const RUBIK = loadRubik("normal", {
  weights: ["500", "700", "800", "900"],
  ...sub,
}).fontFamily;
export const HEEBO = loadHeebo("normal", {
  weights: ["400", "600", "700", "800", "900"],
  ...sub,
}).fontFamily;
export const SECULAR = loadSecular("normal", sub).fontFamily;
export const ASSISTANT = loadAssistant("normal", {
  weights: ["600", "700", "800"],
  ...sub,
}).fontFamily;

export type SpringCfg = { damping: number; mass: number; stiffness: number };

export type Look = {
  id: LookId;
  display: string; // font for hooks, cards, punches
  body: string; // font for captions and small labels
  accent: string; // highlight color (active caption word, numbers, buttons)
  accent2: string; // second color
  ink: string; // dark text color
  paper: string; // light text color
  stage: string; // card-mode backdrop base color
  em: number; // average width of one bold display character, in em (used to fit text)
  cardSpring: SpringCfg;
  textSpring: SpringCfg;
};

const brand = config.brand ?? {};

export const LOOKS: Record<LookId, Look> = {
  // Pop: saturated color-block sets, satin cards, springy pops, 2-3 confetti payoffs.
  pop: {
    id: "pop",
    em: 0.6,
    display: RUBIK,
    body: RUBIK,
    accent: brand.accent ?? "#FF3E8A",
    accent2: brand.accent2 ?? "#FFD23F",
    ink: "#18223F",
    paper: "#FFFFFF",
    stage: "#2E55F0",
    cardSpring: { damping: 11, mass: 0.6, stiffness: 180 },
    textSpring: { damping: 18, mass: 1, stiffness: 160 },
  },
  // Glass: Apple-keynote calm. Frosted panes over the blurred video, one warm accent, soft curves.
  glass: {
    id: "glass",
    em: 0.6,
    display: HEEBO,
    body: HEEBO,
    accent: brand.accent ?? "#FFB547",
    accent2: brand.accent2 ?? "#8FD3FF",
    ink: "#141B2E",
    paper: "#FFFDF9",
    stage: "#141B2E",
    cardSpring: { damping: 20, mass: 1, stiffness: 120 },
    textSpring: { damping: 22, mass: 1, stiffness: 140 },
  },
  // Bold Mono: black, white and ONE accent. Hard cuts, square corners, giant type.
  mono: {
    id: "mono",
    em: 0.5,
    display: SECULAR,
    body: ASSISTANT,
    accent: brand.accent ?? "#FFE14D",
    accent2: brand.accent2 ?? "#FFFFFF",
    ink: "#0B0B0B",
    paper: "#FFFFFF",
    stage: "#0B0B0B",
    cardSpring: { damping: 30, mass: 0.7, stiffness: 320 },
    textSpring: { damping: 30, mass: 0.7, stiffness: 320 },
  },
  // Split: permanent split screen. Light top panel with kinetic words and cards, face plate at the bottom.
  split: {
    id: "split",
    em: 0.62,
    display: HEEBO,
    body: HEEBO,
    accent: brand.accent ?? "#1A73E8",
    accent2: brand.accent2 ?? "#FFB020",
    ink: "#0E1116",
    paper: "#FFFFFF",
    stage: "#F2F3F5",
    cardSpring: { damping: 18, mass: 1, stiffness: 160 },
    textSpring: { damping: 20, mass: 0.8, stiffness: 200 },
  },
};

export const LOOK: Look = LOOKS[config.look] ?? LOOKS.pop;

// Pop sets: one wall color + one card color per beat, cycled. Text color picked for contrast.
export const POP_SETS = [
  { wall: LOOKS.pop.stage, card: "#FFD23F", ink: "#18223F" },
  { wall: "#FF6A2B", card: "#18223F", ink: "#FFFFFF" },
  { wall: LOOKS.pop.accent, card: "#FBF0E2", ink: "#18223F" },
  { wall: "#39C36A", card: "#2E55F0", ink: "#FFFFFF" },
];

// mix a hex color toward white (k > 0) or black (k < 0)
export const shade = (hex: string, k: number) => {
  const n = parseInt(hex.replace("#", ""), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(k >= 0 ? c + (255 - c) * k : c * (1 + k)),
  );
  return `rgb(${ch[0]},${ch[1]},${ch[2]})`;
};
