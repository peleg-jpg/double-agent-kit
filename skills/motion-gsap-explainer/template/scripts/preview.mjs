// npm run preview [-- --config video.json --port 4321]
// Serves the composition and prints URLs: live loop (?play), a frozen frame (?t=3.2), safe-zone overlay (&safe).
import { args, sync, serve } from "./lib.mjs";

const a = args();
const { duration } = sync(a.config || "video.json");
const srv = await serve(Number(a.port || 4321));
console.log(`Preview (${duration}s):`);
console.log(`  live loop:   ${srv.url}?play`);
console.log(`  one frame:   ${srv.url}?t=2.5`);
console.log(`  safe zones:  ${srv.url}?play&safe`);
console.log(
  "The page is 1080x1920. Zoom the browser out (Cmd/Ctrl + minus) to see the full frame. Ctrl+C to stop.",
);
