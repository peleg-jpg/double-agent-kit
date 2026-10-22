// Render quick check frames (half size) at given seconds, so Claude can LOOK before the full render.
// Usage:
//   node scripts/stills.mjs 1.2 6.5 14 30.5            -> out/stills/<look>_<sec>.jpg
//   node scripts/stills.mjs --look glass 6.5 14        -> try another look without editing the config
//   node scripts/stills.mjs --safe 6.5                 -> red = Instagram UI covers this, dashed = safe area
//   node scripts/stills.mjs --full 6.5                 -> full 1080x1920 instead of half size
import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const args = process.argv.slice(2);
const take = (name) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return null;
  return args.splice(i, 2)[1];
};
const has = (name) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return false;
  args.splice(i, 1);
  return true;
};
const look = take("look");
const safe = has("safe");
const full = has("full");
const times = args.map(Number).filter((x) => Number.isFinite(x));
if (!times.length) {
  console.error(
    "Usage: node scripts/stills.mjs [--look pop|glass|mono|split] [--safe] [--full] <seconds...>",
  );
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync("src/reel.config.json", "utf8"));
const inputProps = { look: look ?? config.look, safe };
console.log("bundling...");
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({
  serveUrl,
  id: "Reel",
  inputProps,
});
fs.mkdirSync("out/stills", { recursive: true });
for (const s of times) {
  const frame = Math.min(
    composition.durationInFrames - 1,
    Math.round(s * composition.fps),
  );
  const output = `out/stills/${inputProps.look}${safe ? "_safe" : ""}_${s.toFixed(2)}.jpg`;
  await renderStill({
    composition,
    serveUrl,
    output,
    frame,
    inputProps,
    imageFormat: "jpeg",
    jpegQuality: 88,
    scale: full ? 1 : 0.5,
  });
  console.log(output);
}
// the bundle is a ~60 MB temp folder per run; the audit runs this many times
fs.rmSync(serveUrl, { recursive: true, force: true });
