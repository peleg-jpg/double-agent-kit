// Use a captions file the student already has instead of transcribing.
// Usage:
//   node scripts/import-captions.mjs <file.srt|file.json> [--script script.txt]
// JSON can be: [{text,start,end}] (seconds), Remotion Caption[] (startMs/endMs),
// ElevenLabs Scribe output ({words:[...]}) or OpenAI/faster-whisper output ({segments:[{words:[...]}]}).
// SRT has no word timings, so words inside each line get times by their length (good enough for 1-3 word pages).
import fs from "node:fs";
import { parseSrt, parseJsonWords, alignToScript, printWords, saveWords } from "./lib/words.mjs";

const args = process.argv.slice(2);
const si = args.indexOf("--script");
const scriptFile = si === -1 ? null : args.splice(si, 2)[1];
const file = args[0];
if (!file || !fs.existsSync(file)) {
  console.error("Usage: node scripts/import-captions.mjs <file.srt|file.json> [--script script.txt]");
  process.exit(1);
}
const raw = fs.readFileSync(file, "utf8");
let words = file.toLowerCase().endsWith(".srt") ? parseSrt(raw) : parseJsonWords(JSON.parse(raw));
words = words.filter((w) => w.text && Number.isFinite(w.start) && Number.isFinite(w.end));
if (scriptFile) words = alignToScript(words, fs.readFileSync(scriptFile, "utf8"));
saveWords(words);
printWords(words);
console.log(`\nwrote src/words.json (${words.length} words)`);
