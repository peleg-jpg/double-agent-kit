// Word timing helpers shared by transcribe.mjs and import-captions.mjs.
import fs from "node:fs";
// A "word" is {text, start, end} in seconds.

const NIQQUD = /[֑-ׇ]/g;
export const norm = (s) =>
  s
    .replace(NIQQUD, "")
    .replace(/[־\-_'"׳״.,!?;:()\[\]{}…]/g, "")
    .toLowerCase()
    .trim();

const lev = (a, b) => {
  if (a === b) return 0;
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(
        dp[j] + 1,
        dp[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = tmp;
    }
  }
  return dp[b.length];
};
const sim = (a, b) => {
  const x = norm(a);
  const y = norm(b);
  if (!x.length && !y.length) return 1;
  return 1 - lev(x, y) / Math.max(x.length, y.length);
};

// en/em dashes become spaces (built from char codes so no formatter rewrites them)
const LONG_DASHES = new RegExp(`[${String.fromCharCode(0x2013, 0x2014)}]`, "g");

export const splitScript = (text) =>
  text
    .replace(LONG_DASHES, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => norm(w).length > 0);

// Needleman-Wunsch alignment: script words keep their spelling, Whisper gives the timing.
export const alignToScript = (words, scriptText) => {
  const S = splitScript(scriptText);
  const n = words.length;
  const m = S.length;
  const GAP = 0.75;
  const cost = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
  const move = Array.from({ length: n + 1 }, () => new Int8Array(m + 1));
  for (let i = 1; i <= n; i++) ((cost[i][0] = i * GAP), (move[i][0] = 1));
  for (let j = 1; j <= m; j++) ((cost[0][j] = j * GAP), (move[0][j] = 2));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const sub =
        cost[i - 1][j - 1] + (1 - sim(words[i - 1].text, S[j - 1])) * 1.2;
      const del = cost[i - 1][j] + GAP;
      const ins = cost[i][j - 1] + GAP;
      if (sub <= del && sub <= ins) ((cost[i][j] = sub), (move[i][j] = 0));
      else if (del <= ins) ((cost[i][j] = del), (move[i][j] = 1));
      else ((cost[i][j] = ins), (move[i][j] = 2));
    }
  }
  // backtrack
  const pairs = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    const mv = move[i][j];
    if (i > 0 && j > 0 && mv === 0) (pairs.push([i - 1, j - 1]), i--, j--);
    else if (i > 0 && (j === 0 || mv === 1)) (pairs.push([i - 1, null]), i--);
    else (pairs.push([null, j - 1]), j--);
  }
  pairs.reverse();

  const out = [];
  let pending = [];
  let lastEnd = words.length ? words[0].start : 0;
  const flush = (nextStart) => {
    if (!pending.length) return;
    const span = Math.max(0.12 * pending.length, nextStart - lastEnd);
    const step = span / pending.length;
    pending.forEach((t, k) =>
      out.push({
        text: t,
        start: +(lastEnd + k * step).toFixed(3),
        end: +(lastEnd + (k + 1) * step).toFixed(3),
      }),
    );
    lastEnd = lastEnd + span;
    pending = [];
  };
  for (const [wi, sj] of pairs) {
    if (wi !== null && sj !== null) {
      flush(words[wi].start);
      out.push({ text: S[sj], start: words[wi].start, end: words[wi].end });
      lastEnd = words[wi].end;
    } else if (sj !== null) {
      pending.push(S[sj]);
    } else if (wi !== null && out.length && !pending.length) {
      // extra Whisper word (filler or split word): extend the previous word
      out[out.length - 1].end = words[wi].end;
      lastEnd = words[wi].end;
    }
  }
  flush(lastEnd + 0.12 * pending.length);
  return out;
};

// SRT: words inside each cue get times in proportion to their length.
export const parseSrt = (txt) => {
  const toSec = (t) => {
    const [h, m, s] = t.replace(",", ".").split(":");
    return +h * 3600 + +m * 60 + parseFloat(s);
  };
  const out = [];
  for (const block of txt.replace(/\r/g, "").split(/\n\s*\n/)) {
    const lines = block.trim().split("\n");
    const tl = lines.findIndex((l) => l.includes("-->"));
    if (tl === -1) continue;
    const [a, b] = lines[tl]
      .split("-->")
      .map((x) => toSec(x.trim().split(" ")[0]));
    const text = lines
      .slice(tl + 1)
      .join(" ")
      .replace(/<[^>]+>/g, "");
    const ws = splitScript(text);
    const total = ws.reduce((s, w) => s + norm(w).length + 1, 0) || 1;
    let t = a;
    for (const w of ws) {
      const d = ((b - a) * (norm(w).length + 1)) / total;
      out.push({ text: w, start: +t.toFixed(3), end: +(t + d).toFixed(3) });
      t += d;
    }
  }
  return out;
};

// JSON: our format, Remotion Caption[], ElevenLabs Scribe, or OpenAI/faster-whisper segments.
export const parseJsonWords = (data) => {
  if (Array.isArray(data) && data.length && "startMs" in data[0])
    return data.map((c) => ({
      text: c.text.trim(),
      start: c.startMs / 1000,
      end: c.endMs / 1000,
    }));
  if (Array.isArray(data))
    return data.map((w) => ({
      text: String(w.text ?? w.word).trim(),
      start: +w.start,
      end: +w.end,
    }));
  if (data.words)
    return data.words
      .filter((w) => !w.type || w.type === "word")
      .map((w) => ({
        text: String(w.text ?? w.word).trim(),
        start: +w.start,
        end: +w.end,
      }));
  if (data.segments)
    return data.segments.flatMap((s) =>
      (s.words ?? []).map((w) => ({
        text: String(w.word ?? w.text).trim(),
        start: +w.start,
        end: +w.end,
      })),
    );
  throw new Error("Unknown JSON captions format");
};

export const printWords = (words) => {
  let line = [];
  let lineStart = 0;
  const flush = () => {
    if (line.length)
      console.log(`${lineStart.toFixed(2).padStart(6)}s  ${line.join(" ")}`);
    line = [];
  };
  words.forEach((w, i) => {
    if (!line.length) lineStart = w.start;
    line.push(w.text);
    const gap = words[i + 1] ? words[i + 1].start - w.end : 1;
    if (line.length >= 8 || gap > 0.35) flush();
  });
  flush();
};

export const saveWords = (words) => {
  const clean = words.map((w) => ({
    text: w.text,
    start: Math.round(w.start * 1000) / 1000,
    end: Math.round(Math.max(w.end, w.start + 0.05) * 1000) / 1000,
  }));
  fs.mkdirSync("src", { recursive: true });
  fs.writeFileSync("src/words.json", JSON.stringify(clean, null, 1) + "\n");
};
