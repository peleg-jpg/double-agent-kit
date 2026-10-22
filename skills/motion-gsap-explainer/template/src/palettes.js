/* Palette system. Three named looks. Every scene reads only these CSS variables,
   so switching "palette" in video.json re-skins the whole video.
   Override single colors with "colors": { "accent": "#00A3FF" } in video.json. */
window.MX = window.MX || {};

MX.PALETTES = {
  // Dark, warm near-black with an orange accent. Default. Tech, AI, business tips.
  night: {
    bg: "#12100E",
    surface: "#1D1A16",
    surface2: "#2A251F",
    fg: "#F6F1E9",
    muted: "#ADA395",
    accent: "#FF6A2B",
    accent2: "#FFC24B",
    onAccent: "#170D06",
    line: "rgba(246,241,233,0.13)",
    good: "#5CD68B",
    bad: "#FF5A4E",
    glow: "rgba(255,106,43,0.20)",
  },
  // Light cream editorial with tomato red + deep green. Coaching, food, wellness, services.
  paper: {
    bg: "#F3EDE3",
    surface: "#FFFDF8",
    surface2: "#E7DFD1",
    fg: "#1C1A16",
    muted: "#625A4F",
    accent: "#D4442A",
    accent2: "#1E6B57",
    onAccent: "#FFF8F0",
    line: "rgba(28,26,22,0.12)",
    good: "#1E7F55",
    bad: "#C7362A",
    glow: "rgba(212,68,42,0.13)",
  },
  // Deep green with a lime accent. Finance, growth, productivity, real estate.
  forest: {
    bg: "#0E3328",
    surface: "#154336",
    surface2: "#1C5242",
    fg: "#F1F6EE",
    muted: "#A9C4B7",
    accent: "#C8F25A",
    accent2: "#FF9447",
    onAccent: "#0B2A20",
    line: "rgba(241,246,238,0.14)",
    good: "#C8F25A",
    bad: "#FF7A59",
    glow: "rgba(200,242,90,0.14)",
  },
};

MX.palette = function (name, overrides) {
  const base = MX.PALETTES[name] || MX.PALETTES.night;
  return Object.assign({}, base, overrides || {});
};
