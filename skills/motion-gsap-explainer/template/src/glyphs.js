/* Simple drawn glyphs (inline SVG). Generic shapes only, never trademark logo files.
   A tool tile can use any glyph, or "letter" to show the first letter of the name. */
window.MX = window.MX || {};

MX.glyph = function (name, color, opts) {
  const c = color || "currentColor";
  const o = opts || {};
  switch (name) {
    case "spark": {
      // 8 rounded rays
      let rays = "";
      for (let i = 0; i < 8; i++) {
        const a = (i * 45 * Math.PI) / 180;
        const x = 50 + Math.cos(a) * 34;
        const y = 50 + Math.sin(a) * 34;
        rays += `<line x1="50" y1="50" x2="${x.toFixed(2)}" y2="${y.toFixed(2)}" />`;
      }
      return `<svg viewBox="0 0 100 100" class="glyph"><g stroke="${c}" stroke-width="13" stroke-linecap="round">${rays}</g></svg>`;
    }
    case "wave":
      // audio bars
      return `<svg viewBox="0 0 100 100" class="glyph"><g fill="${c}">
        <rect x="14" y="38" width="10" height="24" rx="5"/><rect x="31" y="22" width="10" height="56" rx="5"/>
        <rect x="48" y="12" width="10" height="76" rx="5"/><rect x="65" y="28" width="10" height="44" rx="5"/>
        <rect x="82" y="40" width="10" height="20" rx="5"/></g></svg>`;
    case "pause":
      // two tall bars
      return `<svg viewBox="0 0 100 100" class="glyph"><g fill="${c}"><rect x="27" y="16" width="15" height="68" rx="4"/><rect x="58" y="16" width="15" height="68" rx="4"/></g></svg>`;
    case "avatar":
      // presenter: head + shoulders inside a frame
      return `<svg viewBox="0 0 100 100" class="glyph"><rect x="10" y="10" width="80" height="80" rx="22" fill="none" stroke="${c}" stroke-width="8"/>
        <circle cx="50" cy="42" r="14" fill="${c}"/><path d="M24 80c4-14 14-21 26-21s22 7 26 21" fill="${c}"/></svg>`;
    case "nodes":
      // data / scraping: connected nodes
      return `<svg viewBox="0 0 100 100" class="glyph"><g stroke="${c}" stroke-width="7" stroke-linecap="round"><line x1="28" y1="30" x2="72" y2="30"/><line x1="28" y1="30" x2="50" y2="72"/><line x1="72" y1="30" x2="50" y2="72"/></g>
        <g fill="${c}"><circle cx="28" cy="30" r="13"/><circle cx="72" cy="30" r="13"/><circle cx="50" cy="72" r="13"/></g></svg>`;
    case "play":
      return `<svg viewBox="0 0 100 100" class="glyph"><path d="M32 18 L80 50 L32 82 Z" fill="${c}" stroke="${c}" stroke-width="8" stroke-linejoin="round"/></svg>`;
    case "chat":
      return `<svg viewBox="0 0 100 100" class="glyph"><path d="M16 22h68a8 8 0 0 1 8 8v34a8 8 0 0 1-8 8H44L26 86V72H16a8 8 0 0 1-8-8V30a8 8 0 0 1 8-8z" fill="${c}"/></svg>`;
    case "bolt":
      return `<svg viewBox="0 0 100 100" class="glyph"><path d="M56 8 L22 56 H48 L42 92 L78 42 H52 Z" fill="${c}" stroke="${c}" stroke-width="4" stroke-linejoin="round"/></svg>`;
    case "check":
      return `<svg viewBox="0 0 100 100" class="glyph icon-check"><path d="M22 53 L42 72 L79 31" fill="none" stroke="${c}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" pathLength="1" class="draw"/></svg>`;
    case "x":
      return `<svg viewBox="0 0 100 100" class="glyph icon-x"><g fill="none" stroke="${c}" stroke-width="13" stroke-linecap="round"><path d="M28 28 L72 72" pathLength="1" class="draw"/><path d="M72 28 L28 72" pathLength="1" class="draw"/></g></svg>`;
    case "arrow-down":
      return `<svg viewBox="0 0 100 100" class="glyph"><path d="M50 18 V78 M26 56 L50 80 L74 56" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    case "cursor":
      return `<svg viewBox="0 0 64 64" class="glyph"><path d="M10 6 L10 52 L22 41 L30 59 L39 55 L31 37 L47 37 Z" fill="#FFFFFF" stroke="#111111" stroke-width="3.5" stroke-linejoin="round"/></svg>`;
    case "letter":
    default: {
      const ch = MX.esc((o.text || "?").charAt(0).toUpperCase());
      return `<svg viewBox="0 0 100 100" class="glyph"><text x="50" y="52" text-anchor="middle" dominant-baseline="central" font-family="Heebo, sans-serif" font-weight="900" font-size="66" fill="${c}">${ch}</text></svg>`;
    }
  }
};
