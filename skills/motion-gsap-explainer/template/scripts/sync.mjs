// npm run sync [-- --config presets/all-scenes.json]
// Validates the JSON and writes video-data.js (the page reads it synchronously, HyperFrames-safe).
import { args, sync } from "./lib.mjs";

const a = args();
try {
  const { data, duration } = sync(a.config || "video.json");
  console.log(
    `OK: ${data.scenes.length} scenes, ${duration}s, palette "${data.palette || "night"}"`,
  );
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
