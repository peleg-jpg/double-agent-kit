// Local word-level transcription with whisper.cpp (free, offline after the first run).
// Usage:
//   node scripts/transcribe.mjs [video] [--script script.txt] [--model medium] [--lang he]
// Writes src/words.json ([{text,start,end}] in seconds) and prints the transcript with timings.
// First run downloads whisper.cpp + the model (~1.5 GB for medium) into ~/.motion-reel-pop/ (shared by all projects).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  installWhisperCpp,
  downloadWhisperModel,
} from "@remotion/install-whisper-cpp";
import { alignToScript, printWords, saveWords } from "./lib/words.mjs";

const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const model = flag("model", "medium"); // "small" = faster and weaker, "large-v3" = 3 GB and slower
const lang = flag("lang", "he");
const scriptFile = flag("script", null);
const input = path.resolve(args[0] ?? "public/input.mp4");
if (!fs.existsSync(input)) {
  console.error(
    `Video not found: ${input}\nPut the video in public/input.mp4 or pass its path.`,
  );
  process.exit(1);
}

const WHISPER_VERSION = "1.5.5";
const isWin = process.platform === "win32";
const home = path.join(os.homedir(), ".motion-reel-pop");
const whisperDir = path.join(home, "whisper.cpp");
fs.mkdirSync(home, { recursive: true });

// 1. 16 kHz mono wav, made with the ffmpeg that ships inside Remotion (no separate install)
const wav = path.join(home, "audio16k.wav");
console.log("1/4 extracting audio...");
execFileSync(
  isWin ? "npx.cmd" : "npx",
  [
    "remotion",
    "ffmpeg",
    "-y",
    "-v",
    "error",
    "-i",
    input,
    "-ar",
    "16000",
    "-ac",
    "1",
    "-c:a",
    "pcm_s16le",
    wav,
  ],
  { stdio: "inherit", shell: isWin },
);

// 2. whisper.cpp + model, cached for every future project
console.log("2/4 installing whisper.cpp (first time only, about 1 min)...");
await installWhisperCpp({
  to: whisperDir,
  version: WHISPER_VERSION,
  printOutput: false,
});
console.log(
  `3/4 downloading the ${model} model (first time only, a few minutes)...`,
);
await downloadWhisperModel({ model, folder: whisperDir, printOutput: false });

// 3. One segment per word (-ml 1 -sow). This keeps Hebrew letters whole; token mode splits UTF-8 bytes.
console.log("4/4 transcribing...");
const exe = path.join(whisperDir, isWin ? "main.exe" : "main");
const outBase = path.join(home, "last_transcript");
execFileSync(
  exe,
  [
    "-m",
    path.join(whisperDir, `ggml-${model}.bin`),
    "-f",
    wav,
    "-l",
    lang,
    "-ml",
    "1",
    "-sow",
    "-oj",
    "-of",
    outBase,
  ],
  { cwd: whisperDir, stdio: ["ignore", "ignore", "ignore"] },
);
const json = JSON.parse(fs.readFileSync(`${outBase}.json`, "utf8"));
let words = json.transcription
  .map((s) => ({
    text: s.text.trim(),
    start: s.offsets.from / 1000,
    end: s.offsets.to / 1000,
  }))
  .filter((w) => w.text.length > 0 && !/^\[.*\]$/.test(w.text));

// 4. Optional: the student's script fixes Whisper's spelling. Timings stay from Whisper.
if (scriptFile) {
  words = alignToScript(words, fs.readFileSync(scriptFile, "utf8"));
  console.log(`spelling taken from ${scriptFile}`);
}

saveWords(words);
printWords(words);
console.log(
  `\nwrote src/words.json (${words.length} words). Read it, fix any wrong word in reel.config.json "captions.fix".`,
);
