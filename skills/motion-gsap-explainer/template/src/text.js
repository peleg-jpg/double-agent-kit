/* Hebrew + RTL text helpers.
   Rule: Latin runs ("Claude Code", "ElevenLabs") are grouped into ONE isolated <bdi>,
   never one isolate per word. Isolating each Latin word inside an RTL line makes the
   bidi algorithm order them right to left, so "Claude Code" would read "Code Claude". */
window.MX = window.MX || {};

MX.esc = function (s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

const LATIN_START = /^[A-Za-z]/;
const TRAIL_PUNCT = /([.,!?:;)\]"'״]+)$/;

/* Split text into display tokens. Consecutive Latin words merge into one token. */
MX.tokens = function (text) {
  const raw = String(text || "")
    .split(/\s+/)
    .filter(Boolean);
  const out = [];
  let i = 0;
  while (i < raw.length) {
    if (LATIN_START.test(raw[i])) {
      const group = [raw[i]];
      // keep merging while the next word is Latin and the current one has no trailing punctuation
      while (
        i + 1 < raw.length &&
        LATIN_START.test(raw[i + 1]) &&
        !TRAIL_PUNCT.test(group[group.length - 1])
      ) {
        group.push(raw[++i]);
      }
      let latin = group.join(" ");
      let punct = "";
      const m = latin.match(TRAIL_PUNCT);
      if (m) {
        punct = m[1];
        latin = latin.slice(0, -punct.length);
      }
      out.push({
        html:
          '<bdi dir="ltr" class="lat">' +
          MX.esc(latin) +
          "</bdi>" +
          MX.esc(punct),
        latin: true,
      });
    } else {
      out.push({ html: MX.esc(raw[i]), latin: false });
    }
    i++;
  }
  return out;
};

/* Plain rich text (no per-word spans). Use for labels and body lines. */
MX.rich = function (text) {
  return MX.tokens(text)
    .map((t) => t.html)
    .join(" ");
};

/* Split into animatable word spans (.w). An optional highlight phrase becomes one
   inline-block group (.hl) with a marker bar (.hl-bg) behind it. */
MX.words = function (text, highlight) {
  text = String(text || "");
  const wrap = (s) =>
    MX.tokens(s)
      .map((t) => '<span class="w">' + t.html + "</span>")
      .join(" ");
  if (highlight && text.indexOf(highlight) !== -1) {
    const at = text.indexOf(highlight);
    const before = text.slice(0, at).trim();
    const after = text.slice(at + highlight.length).trim();
    const hl =
      '<span class="hl"><span class="hl-bg"></span><span class="hl-tx">' +
      wrap(highlight) +
      "</span></span>";
    return [before && wrap(before), hl, after && wrap(after)]
      .filter(Boolean)
      .join(" ");
  }
  return wrap(text);
};

/* Number formatting: 3900 -> "3,900". Deterministic (fixed locale). */
MX.fmt = function (v, decimals) {
  const d = decimals || 0;
  return Number(v).toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
};

MX.el = function (tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
};

/* Odometer counter. Pure transform tweens (no onUpdate callbacks), so it renders the same
   whether the renderer seeks with or without events (HyperFrames suppresses callbacks).
   Each digit column is a vertical strip that rolls to its final digit. */
MX.odometer = function (value, decimals) {
  const s = MX.fmt(value, decimals || 0);
  let col = 0;
  const digits = s.replace(/[^0-9]/g, "").length;
  return (
    '<span class="odo">' +
    s
      .split("")
      .map((ch) => {
        if (!/[0-9]/.test(ch)) return '<span class="odo-sep">' + MX.esc(ch) + "</span>";
        const d = Number(ch);
        const cycles = Math.min(digits, col + 1); // right-most columns spin more
        col++;
        let strip = "";
        for (let c = 0; c < cycles; c++) for (let k = 0; k < 10; k++) strip += "<span>" + k + "</span>";
        for (let k = 0; k <= d; k++) strip += "<span>" + k + "</span>";
        return '<span class="odo-dg"><span class="odo-strip" data-n="' + (cycles * 10 + d + 1) + '">' + strip + "</span></span>";
      })
      .join("") +
    "</span>"
  );
};

MX.rollOdometer = function (tl, root, at, duration, ease) {
  root.querySelectorAll(".odo-strip").forEach((strip, i, all) => {
    const n = Number(strip.getAttribute("data-n"));
    tl.fromTo(
      strip,
      { yPercent: 0 },
      { yPercent: (-(n - 1) / n) * 100, duration: duration * (0.82 + 0.18 * ((i + 1) / all.length)), ease: ease || "power3.out" },
      at
    );
  });
};
