// npm run render [-- --config video.json --out out/explainer.mp4 --fps 30 --music path/to/music.mp3 --volume 0.25]
// Frame-by-frame: seek the GSAP timeline in headless Chrome, screenshot, pipe JPEG frames into ffmpeg (H.264).
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";
import { args, sync, serve, openComposition, ensureDir, ROOT } from "./lib.mjs";

const a = args();
const { data } = sync(a.config || "video.json");
const fps = Number(a.fps || data.fps || 30);
const out = path.resolve(ROOT, a.out || "out/explainer.mp4");
ensureDir(path.dirname(out));
const music = a.music || data.music;

const srv = await serve();
const { browser, page, meta, seek } = await openComposition(srv.url);
const frames = Math.round(meta.duration * fps);
console.log(
  `Rendering ${meta.scenes.length} scenes, ${meta.duration}s, ${frames} frames @ ${fps}fps -> ${path.relative(ROOT, out)}`,
);

const ff = [
  "-y",
  "-loglevel",
  "error",
  "-f",
  "image2pipe",
  "-framerate",
  String(fps),
  "-c:v",
  "mjpeg",
  "-i",
  "-",
];
if (music) {
  const m = path.resolve(ROOT, music);
  if (!fs.existsSync(m)) throw new Error(`Music file not found: ${m}`);
  const vol = Number(a.volume || data.musicVolume || 0.25);
  ff.push(
    "-i",
    m,
    "-filter_complex",
    `[1:a]volume=${vol},afade=t=out:st=${Math.max(0, meta.duration - 0.8)}:d=0.8[a]`,
    "-map",
    "0:v",
    "-map",
    "[a]",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-shortest",
  );
}
ff.push(
  "-c:v",
  "libx264",
  "-preset",
  "medium",
  "-crf",
  String(a.crf || 20),
  "-pix_fmt",
  "yuv420p",
  "-r",
  String(fps),
  "-movflags",
  "+faststart",
  out,
);

const proc = spawn(ffmpegPath, ff, { stdio: ["pipe", "inherit", "inherit"] });
const done = new Promise((res, rej) =>
  proc.on("close", (c) =>
    c === 0 ? res() : rej(new Error("ffmpeg exited with code " + c)),
  ),
);
const write = (buf) =>
  new Promise((res) =>
    proc.stdin.write(buf) ? res() : proc.stdin.once("drain", res),
  );

const t0 = Date.now();
for (let f = 0; f < frames; f++) {
  await seek(f / fps);
  const buf = await page.screenshot({
    type: "jpeg",
    quality: 93,
    optimizeForSpeed: true,
  });
  await write(buf);
  if (f % fps === 0) process.stdout.write(`\r  frame ${f}/${frames}`);
}
proc.stdin.end();
await done;
await browser.close();
srv.close();
const mb = (fs.statSync(out).size / 1024 / 1024).toFixed(2);
console.log(
  `\rDone: ${path.relative(ROOT, out)} (${mb} MB, ${((Date.now() - t0) / 1000).toFixed(1)}s)`,
);
