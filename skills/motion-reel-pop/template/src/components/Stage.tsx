// The speaker footage + the card-mode backdrop. Full frame while talking; a window under the card in card mode.
import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CARDS, cardIntervals, config, HOOK_END, ZOOMS } from "../config";
import {
  EASE,
  FPS,
  H,
  lerp,
  ramp,
  SPLIT_PLATE,
  springAt,
  useLook,
  W,
  WINDOW,
} from "../layout";
import { POP_SETS, shade } from "../looks";

export type StageState = {
  m: number;
  zoom: number;
  push: number;
  setIndex: number;
  setChangeAt: number;
};

const ZOOM_DEFAULT = { pop: 1.22, glass: 1.12, mono: 1.3, split: 1 };

// card-mode amount m (0 = full face, 1 = window), zoom punch and slow push for time t
export const useStageState = (): StageState => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const look = useLook();
  const t = frame / FPS;
  const dur = durationInFrames / FPS;
  const ivs = cardIntervals(dur, look.id);

  // m: ease into card mode over 0.35 s, out over 0.3 s (Mono cuts hard, Split stays split)
  let m = 0;
  for (const [a, b] of ivs) {
    if (look.id === "mono") m = Math.max(m, t >= a && t < b ? 1 : 0);
    else
      m = Math.max(
        m,
        a <= 0.01 && t < b ? 1 : 0,
        Math.min(ramp(t, a, 0.35, EASE.key), 1 - ramp(t, b, 0.3, EASE.key)),
      );
  }

  // zoom punch-ins (talk mode only). Split: a zoom means "full face" for its span.
  let zoom = 1;
  let fullFace = 0;
  for (const z of ZOOMS) {
    if (t < z.at - 0.01 || t > z.to + 0.6) continue;
    const s = z.scale ?? ZOOM_DEFAULT[look.id];
    let env = 0;
    if (look.id === "pop")
      env =
        springAt(t, z.at, { damping: 14, mass: 0.8, stiffness: 220 }) *
        (1 - ramp(t, z.to, 0.2, EASE.in));
    else if (look.id === "glass")
      env = ramp(t, z.at, 0.6, EASE.key) * (1 - ramp(t, z.to, 0.5, EASE.key));
    else env = t >= z.at && t < z.to ? 1 : 0;
    zoom = Math.max(zoom, 1 + (s - 1) * env);
    if (look.id === "split" && t >= z.at && t < z.to) {
      fullFace = 1;
      zoom = 0.92 + 0.08 * ramp(t, z.at, 0.3, EASE.back);
    }
  }
  if (look.id === "split") m = 1 - fullFace;

  // slow 3.5% push-in that restarts at every layout change (reads as a new camera shot)
  const edges = [
    0,
    ...ivs.flat(),
    ...ZOOMS.flatMap((z) => [z.at, z.to]),
  ].filter((e) => e <= t);
  const shotStart = Math.max(...edges);
  const push = 1 + 0.035 * Math.min(1, (t - shotStart) / 6);

  // pop sets: which color set is up (hook = 0, then one per card)
  const starts = [0, ...CARDS.map((c) => c.at)];
  let setIndex = 0;
  let setChangeAt = 0;
  starts.forEach((s, i) => {
    if (t >= s) ((setIndex = i), (setChangeAt = s));
  });
  if (t >= HOOK_END && setIndex === 0) setChangeAt = 0;
  return { m, zoom, push, setIndex, setChangeAt };
};

const Backdrop: React.FC<{ st: StageState; t: number }> = ({ st, t }) => {
  const look = useLook();
  if (look.id === "pop") {
    const cur = POP_SETS[st.setIndex % POP_SETS.length];
    const prev =
      POP_SETS[(st.setIndex + POP_SETS.length - 1) % POP_SETS.length];
    const r =
      st.setIndex === 0 ? 2400 : lerp(40, 2400, ramp(t, st.setChangeAt, 0.32));
    const wall = (c: string) => ({
      background: `radial-gradient(ellipse 70% 42% at ${700 + 40 * Math.sin(t * 0.7)}px 520px, ${shade(c, 0.22)} 0%, ${c} 62%, ${shade(c, -0.18)} 100%)`,
    });
    return (
      <AbsoluteFill>
        <AbsoluteFill style={wall(prev.wall)} />
        <AbsoluteFill
          style={{
            ...wall(cur.wall),
            clipPath: `circle(${r}px at 540px 550px)`,
          }}
        />
      </AbsoluteFill>
    );
  }
  if (look.id === "glass") {
    return (
      <AbsoluteFill>
        <Ambient />
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, rgba(20,27,46,.62) 0%, rgba(31,45,74,.28) 40%, rgba(31,45,74,.30) 70%, rgba(16,20,34,.72) 100%)",
          }}
        />
        <AbsoluteFill
          style={{
            background: `radial-gradient(520px 420px at ${540 + 160 * Math.sin(t / 9)}px ${560 + 90 * Math.cos(t / 11)}px, ${look.accent}44, transparent 70%)`,
          }}
        />
      </AbsoluteFill>
    );
  }
  if (look.id === "mono") {
    return (
      <AbsoluteFill style={{ background: look.stage }}>
        <AbsoluteFill
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(255,255,255,.07) 2px, transparent 2px)",
            backgroundSize: "180px 100%",
            backgroundPosition: "0 0",
          }}
        />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill
      style={{
        background: look.stage,
        backgroundImage:
          "radial-gradient(rgba(14,17,22,.09) 2.4px, transparent 2.6px)",
        backgroundSize: "34px 34px",
      }}
    />
  );
};

// blurred copy of the footage (rendered small, then scaled: cheap blur)
const Ambient: React.FC<{ dim?: number }> = ({ dim = 0.75 }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <div
      style={{
        width: W / 4,
        height: H / 4,
        transform: "scale(4.4)",
        transformOrigin: "0 0",
        marginLeft: -60,
        marginTop: -100,
      }}
    >
      <OffthreadVideo
        src={staticFile(config.video)}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: `blur(9px) brightness(${dim}) saturate(1.2)`,
        }}
      />
    </div>
  </AbsoluteFill>
);

export const Stage: React.FC<{
  st: StageState;
  dim?: number;
  blur?: number;
}> = ({ st, dim = 0, blur = 0 }) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const { m } = st;
  const win = look.id === "split" ? SPLIT_PLATE : WINDOW;
  const face = config.face ?? { x: 540, y: 600 };

  // clip rect: full frame -> window
  const rx = lerp(0, win.x, m);
  const ry = lerp(0, win.y, m);
  const rw = lerp(W, win.w, m);
  const rh = lerp(H, win.h, m);
  const radius = lerp(0, win.r, m);
  // footage transform: face point F drawn at anchor A with scale k
  const k = lerp(st.zoom * st.push, win.scale * (0.985 + 0.015 * st.push), m);
  const ax = lerp(face.x, W / 2, m);
  const ay = lerp(face.y, win.eyeY, m);
  const feather = 110 * m;

  const frameStyle: React.CSSProperties =
    look.id === "pop"
      ? {
          boxShadow: `0 0 0 ${10 * m}px #FBF0E2, 0 40px 70px rgba(10,12,40,${0.42 * m})`,
        }
      : look.id === "glass"
        ? {
            boxShadow: `inset 0 0 0 1.5px rgba(255,255,255,${0.32 * m}), 0 30px 70px rgba(8,10,20,${0.5 * m})`,
          }
        : look.id === "mono"
          ? { boxShadow: `0 -${12 * m}px 0 0 ${look.accent}` }
          : { boxShadow: `0 18px 50px rgba(14,17,22,${0.22 * m})` };

  return (
    <AbsoluteFill>
      {m > 0.001 && <Backdrop st={st} t={t} />}
      <div
        style={{
          position: "absolute",
          left: rx,
          top: ry,
          width: rw,
          height: rh,
          borderRadius: look.id === "mono" ? 0 : radius,
          overflow: "hidden",
          background: "#000",
          ...frameStyle,
        }}
      >
        {m > 0.001 && <Ambient dim={0.6} />}
        <div
          style={{
            position: "absolute",
            left: ax - face.x * k - rx,
            top: ay - face.y * k - ry,
            width: W * k,
            height: H * k,
            WebkitMaskImage:
              feather > 1
                ? `linear-gradient(90deg, transparent 0, #000 ${feather}px, #000 calc(100% - ${feather}px), transparent 100%)`
                : undefined,
            filter:
              blur || dim
                ? `blur(${blur}px) brightness(${1 - dim})`
                : undefined,
          }}
        >
          <OffthreadVideo
            src={staticFile(config.video)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        {look.id === "glass" && m > 0.01 && (
          <AbsoluteFill
            style={{
              borderRadius: radius,
              boxShadow: "inset 0 1.5px 0 rgba(255,255,255,.45)",
              background:
                "linear-gradient(160deg, rgba(255,255,255,.14), rgba(255,255,255,0) 40%)",
              opacity: m,
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};
