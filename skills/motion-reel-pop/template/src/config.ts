// Reads src/reel.config.json + src/words.json and turns every time reference into seconds.
// Claude edits reel.config.json; this file normally stays as is.
import rawConfig from "./reel.config.json";
import rawWords from "./words.json";

export type LookId = "pop" | "glass" | "mono" | "split";
// A time is seconds (12.4) or a spoken word: "@Dots" (first time it is said), "@Dots#2" (second time),
// "@Dots+0.3" (0.3 s after it starts), "@Dots>" (when it ends).
export type TimeRef = number | string;
type Span = { at: TimeRef; to: TimeRef };

export type CardSpec = Span &
  (
    | { type: "list"; n: number; title: string; sub?: string }
    | { type: "tool"; name: string; sub?: string; logo?: string | null }
    | {
        type: "stat";
        value: number;
        prefix?: string;
        suffix?: string;
        label: string;
        decimals?: number;
      }
    | { type: "text"; title: string; sub?: string }
    | { type: "steps"; title?: string; items: { text: string; at: TimeRef }[] }
  );

export type ReelConfig = {
  look: LookId;
  video: string;
  face: { x: number; y: number };
  brand: {
    accent?: string | null;
    accent2?: string | null;
    logo?: string | null;
    handle?: string;
  };
  hook: { text: string; kicker?: string; until: TimeRef };
  captions: {
    maxWords: number;
    maxChars: number;
    highlight: string[];
    fix: Record<string, string>;
    hide: [TimeRef, TimeRef][];
  };
  zooms: (Span & { scale?: number })[];
  cards: CardSpec[];
  punches: (Span & { text: string; burst?: boolean })[];
  broll: (Span & { src?: string | null; text?: string; label?: string })[];
  cta: {
    at: TimeRef;
    title: string;
    sub?: string;
    button: string;
    handle?: string;
  } | null;
  progress: boolean;
  sfx: boolean;
  music?: string | null;
  musicVolume?: number;
};

export type Word = { text: string; start: number; end: number };

export const config = rawConfig as unknown as ReelConfig;

// ---------- words ----------
const fixWord = (t: string) => config.captions.fix?.[t] ?? t;
export const WORDS: Word[] = (rawWords as Word[]).map((w) => ({
  ...w,
  text: fixWord(w.text),
}));

const normWord = (s: string) =>
  s
    .toLowerCase()
    .replace(/[.,!?;:"'()׳״]/g, "")
    .trim();

export const resolveTime = (ref: TimeRef): number => {
  if (typeof ref === "number") return ref;
  const m = /^@(.+?)(?:#(\d+))?(>)?([+-]\d*\.?\d+)?$/.exec(ref.trim());
  if (!m)
    throw new Error(
      `Bad time "${ref}". Use seconds or "@word", "@word#2", "@word+0.3", "@word>"`,
    );
  const target = normWord(m[1]);
  const nth = m[2] ? parseInt(m[2], 10) : 1;
  const offset = m[4] ? parseFloat(m[4]) : 0;
  let count = 0;
  for (const w of WORDS) {
    const n = normWord(w.text);
    // exact match, or the word with up to 3 Hebrew prefix letters (ו ה ב ל ש כ מ) glued in front
    const prefix = n.endsWith(target)
      ? n.slice(0, n.length - target.length).replace(/-$/, "")
      : null;
    if (
      prefix !== null &&
      /^[\u05D5\u05D4\u05D1\u05DC\u05E9\u05DB\u05DE]{0,3}$/.test(prefix)
    ) {
      count++;
      if (count === nth) return (m[3] ? w.end : w.start) + offset;
    }
  }
  throw new Error(`Word "${m[1]}" (#${nth}) not found in src/words.json`);
};

const snap = (t: number) => Math.round(t * 30) / 30;
const sp = <T extends Span>(s: T) => ({
  ...s,
  at: snap(resolveTime(s.at)),
  to: snap(resolveTime(s.to)),
});

// distributive, so each card type keeps its own fields
export type Timed<T> = T extends unknown
  ? Omit<T, "at" | "to"> & { at: number; to: number }
  : never;

export const HOOK_END = snap(resolveTime(config.hook.until));
export const CARDS = config.cards.map((c) => {
  const out = sp(c) as Record<string, unknown>;
  if (c.type === "steps")
    out.items = c.items.map((it) => ({ ...it, at: snap(resolveTime(it.at)) }));
  return out;
}) as unknown as Timed<CardSpec>[];
export const ZOOMS = config.zooms.map(sp);
export const PUNCHES = config.punches.map(sp);
export const BROLL = config.broll.map(sp);
export const CTA_AT = config.cta ? snap(resolveTime(config.cta.at)) : Infinity;

// A card that ends less than 0.6 s before the next card (or the CTA) holds until it, so the screen never sits empty.
CARDS.sort((x, y) => x.at - y.at).forEach((c, i) => {
  const next = i + 1 < CARDS.length ? CARDS[i + 1].at : CTA_AT;
  if (next > c.to && next - c.to < 0.6) c.to = next;
});
export const CAPTION_HIDE = config.captions.hide.map(
  ([a, b]) => [resolveTime(a), resolveTime(b)] as [number, number],
);

// ---------- card mode (top graphic + face window) ----------
// Hook, cards and CTA put the reel in "card mode". Gaps under 0.6 s are bridged so the face does not bounce.
// A full-frame B-roll that leads into card mode joins it: the face moves into its window behind the B-roll,
// instead of flashing full screen for a frame when the B-roll ends. (Split keeps its own panel logic.)
export const cardIntervals = (
  duration: number,
  lookId?: string,
): [number, number][] => {
  const raw: [number, number][] = [
    [0, HOOK_END],
    ...CARDS.map((c) => [c.at, c.to] as [number, number]),
  ];
  if (config.cta) raw.push([CTA_AT, duration + 1]);
  if (lookId && lookId !== "split") {
    const starts = raw.map(([a]) => a);
    BROLL.forEach((b) => {
      if (starts.some((a) => a >= b.to - 0.05 && a - b.to < 0.6))
        raw.push([b.at, b.to]);
    });
  }
  raw.sort((a, b) => a[0] - b[0]);
  const out: [number, number][] = [];
  for (const iv of raw) {
    const last = out[out.length - 1];
    if (last && iv[0] - last[1] < 0.6) last[1] = Math.max(last[1], iv[1]);
    else out.push([...iv] as [number, number]);
  }
  return out;
};

export const inAny = (t: number, list: [number, number][]) =>
  list.some(([a, b]) => t >= a && t < b);
