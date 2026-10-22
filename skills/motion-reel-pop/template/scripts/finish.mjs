// Final audio pass: measure loudness, normalize to Instagram level (-14 LUFS, true peak -1.5 dB), keep the video as is.
// Usage:
//   node scripts/finish.mjs out/reel.mp4                 -> out/reel_final.mp4
//   node scripts/finish.mjs out/reel.mp4 --max-mb 8      -> also re-encodes the video to fit a size (for WhatsApp/email)
// Uses the ffmpeg that ships inside Remotion, so nothing else to install.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const mi = args.indexOf("--max-mb");
const maxMb = mi === -1 ? null : parseFloat(args.splice(mi, 2)[1]);
const input = args[0] ?? "out/reel.mp4";
if (!fs.existsSync(input)) {
  console.error(`Not found: ${input}. Render first: npm run render`);
  process.exit(1);
}
const isWin = process.platform === "win32";
const ff = (a) => {
  const r = spawnSync(
    isWin ? "npx.cmd" : "npx",
    ["remotion", "ffmpeg", "-hide_banner", ...a],
    { encoding: "utf8", shell: isWin, maxBuffer: 1 << 26 },
  );
  if (r.status !== 0) throw new Error(r.stderr.slice(-2000));
  return r.stderr;
};
const measure = (file) => {
  const err = ff([
    "-i",
    file,
    "-vn",
    "-af",
    "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json",
    "-f",
    "null",
    "-",
  ]);
  return JSON.parse(err.slice(err.lastIndexOf("{"), err.lastIndexOf("}") + 1));
};
const probeDuration = (file) => {
  const err = spawnSync(
    isWin ? "npx.cmd" : "npx",
    ["remotion", "ffprobe", "-hide_banner", file],
    { encoding: "utf8", shell: isWin },
  ).stderr;
  const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(err);
  return m ? +m[1] * 3600 + +m[2] * 60 + parseFloat(m[3]) : null;
};

const before = measure(input);
console.log(`before: ${before.input_i} LUFS, true peak ${before.input_tp} dB`);
const out = input.replace(/\.mp4$/i, "") + "_final.mp4";
const af = `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${before.input_i}:measured_TP=${before.input_tp}:measured_LRA=${before.input_lra}:measured_thresh=${before.input_thresh}:offset=${before.target_offset}:linear=true,aresample=48000`;

let video = ["-c:v", "copy"];
if (maxMb) {
  const dur = probeDuration(input) ?? 60;
  const kbps = Math.floor((maxMb * 8192 * 0.94) / dur - 128); // leave room for 128k audio + container
  video = [
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-b:v",
    `${kbps}k`,
    "-maxrate",
    `${Math.round(kbps * 1.4)}k`,
    "-bufsize",
    `${kbps * 2}k`,
    "-pix_fmt",
    "yuv420p",
  ];
  console.log(`fitting ${maxMb} MB: video ${kbps} kbps`);
}
ff([
  "-y",
  "-i",
  input,
  "-af",
  af,
  ...video,
  "-c:a",
  "aac",
  "-b:a",
  maxMb ? "128k" : "256k",
  "-movflags",
  "+faststart",
  out,
]);
const after = measure(out);
const mb = (fs.statSync(out).size / 1048576).toFixed(2);
console.log(`after:  ${after.input_i} LUFS, true peak ${after.input_tp} dB`);
console.log(`wrote ${path.resolve(out)} (${mb} MB)`);
