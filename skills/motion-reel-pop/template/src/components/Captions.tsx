// Word-by-word Hebrew captions. Each word appears on its spoken onset inside a fixed page layout (no jumping),
// the spoken word gets the accent, Latin runs ("Claude Code") stay one token so RTL never flips them.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import {
  BROLL,
  CAPTION_HIDE,
  CARDS,
  cardIntervals,
  config,
  CTA_AT,
  HOOK_END,
  inAny,
  PUNCHES,
  WORDS,
  ZOOMS,
} from "../config";
import {
  CARD_ZONE,
  cleanCaption,
  EASE,
  fitSize,
  FPS,
  groupLatin,
  HEBREW,
  ramp,
  SEAM_Y,
  springAt,
  TALK_CAPTION_Y,
  useLook,
} from "../layout";
import type { StageState } from "./Stage";

type Tok = { text: string; start: number; end: number; hl: boolean; until?: number };
type Page = { start: number; end: number; toks: Tok[] };

const HL = (config.captions.highlight ?? []).map((h) => h.toLowerCase());

const buildPages = (duration: number): Page[] => {
  const edges = [
    ...cardIntervals(duration).flat(),
    ...BROLL.flatMap((b) => [b.at, b.to]),
    ...PUNCHES.flatMap((p) => [p.at, p.to]),
    ...ZOOMS.flatMap((z) => [z.at, z.to]),
  ];
  const raw = WORDS.map((w) => ({
    ...w,
    text: cleanCaption(w.text),
    endsSentence: /[.,!?:]$/.test(w.text),
  }));
  const toks = groupLatin(
    raw.filter((w) => w.text.length > 0),
    (a, b) => ({
      ...a,
      text: `${a.text} ${b.text}`,
      end: b.end,
      endsSentence: b.endsSentence,
    }),
  );
  const maxW = config.captions.maxWords ?? 3;
  const maxC = config.captions.maxChars ?? 16;
  const pages: Page[] = [];
  let cur: (typeof toks)[number][] = [];
  const flush = () => {
    if (!cur.length) return;
    pages.push({
      start: cur[0].start,
      end: cur[cur.length - 1].end,
      toks: cur.map((w) => ({
        text: w.text,
        start: w.start,
        end: w.end,
        hl: HL.some((h) => w.text.toLowerCase().includes(h)),
      })),
    });
    cur = [];
  };
  toks.forEach((w, i) => {
    const prev = toks[i - 1];
    const chars =
      cur.reduce((s, x) => s + x.text.length + 1, 0) + w.text.length;
    const crossesEdge =
      prev && edges.some((e) => e > prev.start + 0.01 && e <= w.start + 0.01);
    if (
      cur.length &&
      (cur.length >= maxW ||
        chars > maxC ||
        w.start - prev.end > 0.35 ||
        prev.endsSentence ||
        crossesEdge)
    )
      flush();
    cur.push(w);
  });
  flush();
  pages.forEach((p) =>
    p.toks.forEach((tk, k) => {
      const nx = p.toks[k + 1];
      tk.until = nx ? nx.start - 0.04 : tk.end + 0.15;
    }),
  );
  // hold each page until the next one (max 0.6 s after its last word), so there is no 1-2 frame flicker
  pages.forEach((p, i) => {
    const next = pages[i + 1];
    p.end = next
      ? Math.min(next.start, Math.max(p.end + 0.6, p.end))
      : p.end + 0.6;
    if (next && next.start - p.end < 0.12) p.end = next.start;
  });
  return pages;
};

let cache: { d: number; pages: Page[] } | null = null;
const getPages = (d: number) => {
  if (!cache || cache.d !== d) cache = { d, pages: buildPages(d) };
  return cache.pages;
};

export const Captions: React.FC<{ st: StageState }> = ({ st }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const look = useLook();
  const t = frame / FPS;
  const pages = getPages(durationInFrames / FPS);
  const hidden =
    t < HOOK_END ||
    t >= CTA_AT ||
    inAny(t, CAPTION_HIDE) ||
    inAny(
      t,
      PUNCHES.map((p) => [p.at, p.to]),
    );
  // no caption while the face window is morphing (0.3 s), it would fly over the face
  if (hidden || (st.m > 0.04 && st.m < 0.96)) return null;
  const page = pages.find((p) => t >= p.start && t < p.end);
  if (!page) return null;

  const cardUp =
    inAny(
      t,
      CARDS.map((c) => [c.at, c.to]),
    ) ||
    (look.id === "split" &&
      inAny(
        t,
        BROLL.map((b) => [b.at, b.to]),
      ));
  // where the caption sits: "talk" over footage, "seam" between card and face window, "panel" = Split top panel
  const place: "talk" | "seam" | "panel" =
    look.id === "split"
      ? st.m < 0.5
        ? "talk"
        : cardUp
          ? "seam"
          : "panel"
      : st.m > 0.5
        ? "seam"
        : "talk";

  const text = page.toks.map((x) => x.text).join(" ");
  const base =
    place === "panel"
      ? fitSize(text, 2 * 860, 118, 84, 0.58)
      : place === "seam"
        ? fitSize(text, 860, look.id === "mono" ? 66 : 62, 44)
        : fitSize(
            text,
            800,
            look.id === "glass" ? 60 : look.id === "mono" ? 98 : 92,
            54,
            look.id === "mono" ? 0.5 : 0.58,
          );
  const y =
    place === "panel"
      ? CARD_ZONE.y + CARD_ZONE.h / 2
      : place === "seam"
        ? SEAM_Y
        : TALK_CAPTION_Y;
  const pageIn = ramp(t, page.start - 0.03, 0.18, EASE.out);

  const container: React.CSSProperties = {
    position: "absolute",
    left: place === "panel" ? CARD_ZONE.x : 80,
    width: place === "panel" ? CARD_ZONE.w : 840, // talk captions sit 30 px left of center, away from the IG rail
    top: y,
    transform: `translateY(-50%) translateX(${place === "talk" ? -30 : 0}px)`,
    direction: "rtl",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    columnGap: base * (place === "panel" ? 0.08 : 0.26),
    rowGap: base * 0.08,
    fontFamily: look.body,
    fontSize: base,
    lineHeight: 1.12,
  };

  if (look.id === "glass" && place !== "panel") {
    return (
      <div
        style={{
          ...container,
          left: 0,
          width: 1080,
          transform: `translateY(-50%) translateX(${place === "talk" ? -30 : 0}px)`,
        }}
      >
        <div
          style={{
            direction: "rtl",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            columnGap: base * 0.26,
            maxWidth: 860,
            padding: `${base * 0.32}px ${base * 0.62}px`,
            borderRadius: 60,
            background: "rgba(18,22,36,.42)",
            backdropFilter: "blur(22px) saturate(1.35)",
            boxShadow:
              "inset 0 0 0 1px rgba(255,255,255,.28), inset 0 1.5px 0 rgba(255,255,255,.4), 0 2px 6px rgba(12,16,30,.28), 0 26px 60px rgba(12,16,30,.4)",
            opacity: pageIn,
            transform: `scale(${0.96 + 0.04 * pageIn})`,
          }}
        >
          {page.toks.map((w, i) => (
            <Word key={i} w={w} t={t} place={place} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={container}>
      {page.toks.map((w, i) => (
        <Word key={i} w={w} t={t} place={place} />
      ))}
    </div>
  );
};

const Word: React.FC<{
  w: Tok;
  t: number;
  place: "talk" | "seam" | "panel";
}> = ({ w, t, place }) => {
  const look = useLook();
  const latin = !HEBREW.test(w.text);
  const shown = t >= w.start - 0.04;
  const active = t >= w.start - 0.04 && t < (w.until ?? w.end + 0.15); // one active word at a time
  const dir = latin ? "ltr" : "rtl";
  const common: React.CSSProperties = {
    display: "inline-block",
    whiteSpace: "nowrap",
    direction: dir,
  };

  if (look.id === "pop") {
    const s = springAt(t, w.start - 0.04, look.cardSpring);
    const scale = shown ? 0.7 + 0.3 * s + (active ? 0.06 : 0) : 0.7;
    const fill = w.hl ? look.accent : active ? look.accent2 : "#FFFFFF";
    return (
      <span
        style={{
          ...common,
          fontWeight: 900,
          color: fill,
          WebkitTextStroke: `${place === "seam" ? 11 : 15}px #18223F`,
          paintOrder: "stroke fill",
          filter: "drop-shadow(0 8px 14px rgba(0,0,0,.35))",
          opacity: shown ? 1 : 0,
          transform: `scale(${scale}) rotate(${active ? -2 : 0}deg)`,
        }}
      >
        {w.text}
      </span>
    );
  }
  if (look.id === "glass") {
    const p = ramp(t, w.start - 0.06, 0.26, EASE.out);
    return (
      <span
        style={{
          ...common,
          fontWeight: active || w.hl ? 800 : 700,
          color: active || w.hl ? look.accent : look.paper,
          opacity: p,
          filter: `blur(${(1 - p) * 8}px)`,
          transform: `translateY(${(1 - p) * 14}px) scale(${active ? 1.03 : 1})`,
        }}
      >
        {w.text}
      </span>
    );
  }
  if (look.id === "mono") {
    const p = ramp(t, w.start - 0.04, 0.1, EASE.out);
    const box = active || w.hl;
    return (
      <span
        style={{
          ...common,
          fontFamily: look.display,
          color: box ? look.ink : look.paper,
          background: box ? look.accent : "transparent",
          padding: box ? "0 0.14em" : 0,
          WebkitTextStroke: box
            ? undefined
            : `${place === "seam" ? 8 : 12}px ${look.ink}`,
          paintOrder: "stroke fill",
          opacity: shown ? 1 : 0,
          transform: `scale(${shown ? 1.18 - 0.18 * p : 1})`,
        }}
      >
        {w.text}
      </span>
    );
  }
  // split
  if (place === "panel") {
    const p = ramp(t, w.start - 0.04, 0.16, EASE.out);
    return (
      <span
        style={{
          ...common,
          fontWeight: 900,
          color: active ? "#FFFFFF" : shown ? look.ink : "#C9CDD4",
          background: active ? look.accent : "transparent",
          borderRadius: 18,
          padding: "0 0.16em",
          transform: `scale(${shown ? 0.9 + 0.1 * p : 0.9})`,
        }}
      >
        {w.text}
      </span>
    );
  }
  return (
    <span
      style={{
        ...common,
        fontWeight: 800,
        color:
          place === "talk"
            ? active || w.hl
              ? "#FFFFFF"
              : "#FFFFFF"
            : active
              ? look.accent
              : look.ink,
        background:
          place === "talk" && (active || w.hl) ? look.accent : "transparent",
        borderRadius: 14,
        padding: "0 0.14em",
        textShadow: place === "talk" ? "0 3px 14px rgba(0,0,0,.55)" : undefined,
        opacity: shown ? 1 : 0,
      }}
    >
      {w.text}
    </span>
  );
};
