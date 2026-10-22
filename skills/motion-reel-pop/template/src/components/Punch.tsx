// Payoff words ("punches") and cut-to-B-roll moments.
import React from "react";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { BROLL, PUNCHES } from "../config";
import {
  CARD_ZONE,
  EASE,
  fitSize,
  FPS,
  H,
  HEBREW,
  lerp,
  ramp,
  springAt,
  useLook,
  W,
} from "../layout";
import { shade } from "../looks";
import { Surface } from "./Surface";

// deterministic pseudo random (never Math.random in Remotion)
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const Burst: React.FC<{ t: number; t0: number; x: number; y: number }> = ({
  t,
  t0,
  x,
  y,
}) => {
  const dt = t - t0;
  if (dt < 0 || dt > 1.2) return null;
  const colors = [
    "#FF3E8A",
    "#FFD23F",
    "#2E55F0",
    "#39C36A",
    "#FF6A2B",
    "#FFFFFF",
  ];
  return (
    <>
      {Array.from({ length: 32 }, (_, i) => {
        const ang = rnd(i) * Math.PI * 2;
        const v = 900 + rnd(i + 50) * 1300;
        const k = 2.6;
        const d = (v / k) * (1 - Math.exp(-k * dt));
        const px = x + Math.cos(ang) * d;
        const py = y + Math.sin(ang) * d + 0.5 * 1700 * dt * dt * 0.6;
        const s = 18 + rnd(i + 9) * 26;
        const c = colors[i % colors.length];
        const pill = i % 3 === 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px - s / 2,
              top: py - s / 2,
              width: pill ? s * 1.9 : s,
              height: s,
              borderRadius: s,
              transform: `rotate(${ang * 57 + dt * 400}deg)`,
              background: `radial-gradient(circle at 35% 30%, ${shade(c, 0.5)}, ${c} 60%, ${shade(c, -0.3)})`,
              opacity: 1 - Math.max(0, (dt - 0.8) / 0.4),
            }}
          />
        );
      })}
    </>
  );
};

// camera shake for Pop punches: 14 px for 0.2 s
export const shakeAt = (t: number) => {
  for (const p of PUNCHES) {
    const dt = t - p.at;
    if (dt >= 0 && dt < 0.2) {
      const a = 14 * (1 - dt / 0.2);
      return { x: Math.sin(dt * 90) * a, y: Math.cos(dt * 70) * a };
    }
  }
  return { x: 0, y: 0 };
};

// glass and mono need the footage dimmed/blurred under a punch
export const punchDim = (t: number) => {
  let d = 0;
  for (const p of PUNCHES)
    d = Math.max(
      d,
      Math.min(ramp(t, p.at, 0.35), 1 - ramp(t, p.to - 0.2, 0.25)),
    );
  return d;
};

export const PunchLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const look = useLook();
  const t = frame / FPS;
  const p = PUNCHES.find((x) => t >= x.at && t < x.to + 0.2);
  if (!p) return null;
  const exit = ramp(t, p.to - 0.15, 0.15, EASE.in);
  const latin = !HEBREW.test(p.text);

  if (look.id === "pop") {
    const s = springAt(t, p.at, { damping: 10, mass: 0.7, stiffness: 210 });
    const size = fitSize(p.text, 900, 260, 130, 0.6);
    return (
      <AbsoluteFill>
        <div
          dir={latin ? "ltr" : "rtl"}
          style={{
            position: "absolute",
            left: 60,
            width: 960,
            top: 1290, // over the chest, never over the face
            transform: `translateY(-50%) scale(${(1.8 - 0.8 * s) * (1 - exit)})`,
            textAlign: "center",
            fontFamily: look.display,
            fontWeight: 900,
            fontSize: size,
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            color: "#FFD23F",
            filter: t - p.at < 0.05 ? "blur(6px)" : undefined,
            textShadow:
              Array.from(
                { length: 16 },
                (_, k) =>
                  `0 ${k + 1}px 0 ${shade("#FF6A2B", -0.45 - k * 0.01)}`,
              ).join(",") + ", 0 30px 40px rgba(0,0,0,.45)",
          }}
        >
          {p.text}
        </div>
        {p.burst !== false && <Burst t={t} t0={p.at + 0.04} x={540} y={1290} />}
      </AbsoluteFill>
    );
  }
  if (look.id === "glass") {
    const words = p.text.split(" ");
    const size = fitSize(p.text, 1700, 190, 110, 0.58);
    const bloom = ramp(t, p.at, 0.7, EASE.out);
    return (
      <AbsoluteFill style={{ opacity: 1 - exit }}>
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 540px 800px, rgba(255,214,170,${0.35 * (1 - bloom * 0.5)}) 0, transparent ${lerp(160, 680, bloom)}px)`,
            mixBlendMode: "screen",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 800,
            left: 60,
            width: 960,
            transform: "translateY(-50%)",
            direction: "rtl",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            columnGap: size * 0.26,
            fontFamily: look.display,
            fontWeight: 800,
            fontSize: size,
            lineHeight: 1.06,
            letterSpacing: "-0.02em",
            color: look.paper,
            textShadow: "0 6px 30px rgba(0,0,0,.35)",
          }}
        >
          {words.map((w, i) => {
            const q = ramp(t, p.at + 0.08 * i, 0.62, EASE.out);
            return (
              <span
                key={i}
                dir={HEBREW.test(w) ? "rtl" : "ltr"}
                style={{
                  display: "inline-block",
                  opacity: q,
                  filter: `blur(${(1 - q) * 12}px)`,
                  transform: `translateY(${(1 - q) * 0.7 * size}px) scale(${0.94 + 0.06 * q})`,
                  color: i === words.length - 1 ? look.accent : look.paper,
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }
  if (look.id === "mono") {
    if (t >= p.to) return null;
    const size = fitSize(p.text, 1800, 230, 120, 0.5);
    const bar = ramp(t, p.at + 0.06, 0.28, EASE.out);
    return (
      <AbsoluteFill style={{ background: look.ink, alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 18 }}>
          <div
            dir={latin ? "ltr" : "rtl"}
            style={{ maxWidth: 940, textAlign: "center", fontFamily: look.display, fontSize: size, lineHeight: 1, color: look.paper }}
          >
            {p.text}
          </div>
          <div style={{ alignSelf: "stretch", display: "flex", justifyContent: "flex-end" }}>
            <div style={{ width: `${bar * 100}%`, height: 26, background: look.accent }} />
          </div>
        </div>
      </AbsoluteFill>
    );
  }
  // split: giant word in the top panel with an accent underline
  const size = fitSize(p.text, 1700, 200, 110, 0.58);
  const q = ramp(t, p.at, 0.3, EASE.back);
  const line = ramp(t, p.at + 0.15, 0.35, EASE.out);
  return (
    <div
      style={{
        position: "absolute",
        left: CARD_ZONE.x,
        top: CARD_ZONE.y,
        width: CARD_ZONE.w,
        height: CARD_ZONE.h,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: 1 - exit,
      }}
    >
      <div
        dir={latin ? "ltr" : "rtl"}
        style={{
          fontFamily: look.display,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.02,
          color: look.ink,
          textAlign: "center",
          transform: `scale(${0.7 + 0.3 * q})`,
        }}
      >
        {p.text}
      </div>
      <div
        style={{
          width: 520 * line,
          height: 18,
          borderRadius: 9,
          background: look.accent,
          marginTop: 10,
        }}
      />
    </div>
  );
};

// ---------- B-roll ----------
const isVideo = (src: string) => /\.(mp4|mov|webm|m4v)$/i.test(src);

export const BRollLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const look = useLook();
  const t = frame / FPS;
  return (
    <>
      {BROLL.map((b, i) => {
        if (t < b.at || t >= b.to) return null;
        const k = ramp(t, b.at, b.to - b.at, (x) => x);
        const media = b.src ? (
          isVideo(b.src) ? (
            <Sequence from={Math.round(b.at * FPS)} layout="none">
              <OffthreadVideo
                src={staticFile(b.src)}
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Sequence>
          ) : (
            <Img
              src={staticFile(b.src)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `scale(${1 + 0.08 * k})`,
              }}
            />
          )
        ) : null;

        if (look.id === "split") {
          const h = 470;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: CARD_ZONE.x,
                top: CARD_ZONE.y + (CARD_ZONE.h - h) / 2,
                opacity: 0.18 + 0.82 * ramp(t, b.at, 0.3),
                transform: `scale(${0.965 + 0.035 * ramp(t, b.at, 0.3)})`,
              }}
            >
              <Surface
                w={CARD_ZONE.w}
                h={h}
                t={t}
                t0={b.at}
                label={b.label ?? ""}
              >
                {media ?? <TypeBeat text={b.text ?? ""} t={t} t0={b.at} />}
              </Surface>
            </div>
          );
        }
        // full-frame cut. Pop opens with a circle wipe, Glass with a soft blur-in, Mono with a hard cut.
        const r =
          look.id === "pop" ? lerp(40, 2300, ramp(t, b.at, 0.32)) : 2300;
        const blurIn = look.id === "glass" ? (1 - ramp(t, b.at, 0.35)) * 20 : 0;
        return (
          <AbsoluteFill
            key={i}
            style={{
              clipPath: `circle(${r}px at 540px 960px)`,
              filter: blurIn ? `blur(${blurIn}px)` : undefined,
            }}
          >
            <AbsoluteFill
              style={{ background: look.id === "pop" ? "#FF6A2B" : look.stage }}
            >
              {media ?? <TypeBeat text={b.text ?? ""} t={t} t0={b.at} />}
            </AbsoluteFill>
            {b.label && (
              <div
                style={{
                  position: "absolute",
                  top: 300,
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: look.body,
                    fontWeight: 800,
                    fontSize: 40,
                    padding: "10px 28px",
                    borderRadius: look.id === "mono" ? 0 : 40,
                    background:
                      look.id === "mono"
                        ? look.accent
                        : look.id === "glass"
                          ? "rgba(18,22,36,.5)"
                          : "#FFFFFF",
                    color: look.id === "glass" ? look.paper : look.ink,
                    backdropFilter:
                      look.id === "glass" ? "blur(18px)" : undefined,
                    direction: "rtl",
                  }}
                >
                  {b.label}
                </div>
              </div>
            )}
          </AbsoluteFill>
        );
      })}
    </>
  );
};

// a "B-roll" with no file: one big line of type on the look's color
const TypeBeat: React.FC<{ text: string; t: number; t0: number }> = ({
  text,
  t,
  t0,
}) => {
  const look = useLook();
  const size = fitSize(text, 1600, 150, 80, 0.58);
  const q =
    look.id === "pop"
      ? springAt(t, t0 + 0.1, look.cardSpring)
      : ramp(t, t0 + 0.05, 0.4, EASE.out);
  const color =
    look.id === "split" ? look.ink : look.id === "pop" ? "#FFFFFF" : look.paper;
  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", padding: 70 }}
    >
      <div
        dir={HEBREW.test(text) ? "rtl" : "ltr"}
        style={{
          fontFamily: look.display,
          fontWeight: look.id === "mono" ? 400 : 900,
          fontSize: size,
          lineHeight: 1.05,
          textAlign: "center",
          color,
          opacity: Math.min(1, q * 1.5),
          transform: `scale(${0.85 + 0.15 * q})`,
          textShadow:
            look.id === "pop"
              ? Array.from(
                  { length: 10 },
                  (_, k) => `0 ${k + 1}px 0 #18223F`,
                ).join(",")
              : undefined,
          maxWidth: W - 140,
          marginTop: look.id === "split" ? 0 : -(H * 0.12),
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
