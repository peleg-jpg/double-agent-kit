// npm run check [-- out/explainer.mp4]
// Prints size, resolution, duration, fps, and (if there is audio) integrated loudness + true peak.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";
import { args, ROOT } from "./lib.mjs";

const a = args();
const file = path.resolve(ROOT, (a._ && a._[0]) || "out/explainer.mp4");
if (!fs.existsSync(file)) {
  console.error("File not found: " + file);
  process.exit(1);
}
const info = spawnSync(ffmpegPath, ["-hide_banner", "-i", file], {
  encoding: "utf8",
}).stderr;
const v = info.match(/Video: .*?, (\d{2,5})x(\d{2,5}).*?, ([\d.]+) fps/);
const d = info.match(/Duration: (\d+):(\d+):([\d.]+)/);
const hasAudio = /Audio: /.test(info);
const secs = d ? +d[1] * 3600 + +d[2] * 60 + +d[3] : 0;
const mb = fs.statSync(file).size / 1024 / 1024;
const fails = [];
console.log(`file:       ${path.relative(ROOT, file)}`);
console.log(`size:       ${mb.toFixed(2)} MB`);
console.log(`video:      ${v ? `${v[1]}x${v[2]} @ ${v[3]}fps` : "not found"}`);
console.log(`duration:   ${secs.toFixed(2)}s`);
if (!v || v[1] !== "1080" || v[2] !== "1920")
  fails.push("resolution is not 1080x1920");
if (hasAudio) {
  const r = spawnSync(
    ffmpegPath,
    [
      "-hide_banner",
      "-nostats",
      "-i",
      file,
      "-af",
      "ebur128=peak=true",
      "-f",
      "null",
      "-",
    ],
    { encoding: "utf8" },
  ).stderr;
  const I = r.match(/I:\s+(-?[\d.]+) LUFS/g);
  const TP = r.match(/Peak:\s+(-?[\d.]+) dBFS/g);
  const lufs = I ? parseFloat(I[I.length - 1].replace(/[^-\d.]/g, "")) : NaN;
  const tp = TP ? parseFloat(TP[TP.length - 1].replace(/[^-\d.]/g, "")) : NaN;
  console.log(`loudness:   ${lufs} LUFS integrated, true peak ${tp} dBFS`);
  console.log(
    `            (music bed under a voice: about -24 to -20 LUFS; music alone for IG: about -14 LUFS, peak below -1)`,
  );
  if (tp > -1) fails.push("true peak above -1 dBFS, lower --volume");
} else {
  console.log(
    "audio:      none (normal for B-roll, the reel's voice track carries the sound)",
  );
}
if (fails.length) {
  console.log("FAIL:\n  - " + fails.join("\n  - "));
  process.exit(1);
}
console.log("PASS");
