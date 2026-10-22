// npm run stills [-- --config video.json --times 1.5,6,11 --safe --prefix demo]
// Without --times: one PNG per scene at its hero moment (everything entered). --safe draws the IG safe zones.
import path from "node:path";
import { args, sync, serve, openComposition, ensureDir, ROOT } from "./lib.mjs";

const a = args();
sync(a.config || "video.json");
const dir = ensureDir(path.resolve(ROOT, a.dir || "out/stills"));
const srv = await serve();
const { browser, page, meta, seek } = await openComposition(srv.url);
if (a.safe) {
  await page.evaluate(() =>
    document
      .getElementById("stage")
      .insertAdjacentHTML(
        "beforeend",
        '<div class="safe-overlay"><div class="top"></div><div class="bot"></div><div class="side l"></div><div class="side r"></div></div>',
      ),
  );
}
const shots = a.times
  ? String(a.times)
      .split(",")
      .map((t, i) => ({
        t: Number(t),
        name: `t${String(i + 1).padStart(2, "0")}-${Number(t).toFixed(2)}s`,
      }))
  : meta.scenes.map((s, i) => ({
      t: s.hero,
      name: `scene-${String(i + 1).padStart(2, "0")}-${s.type}`,
    }));
const prefix = a.prefix ? a.prefix + "-" : "";
for (const s of shots) {
  await seek(s.t);
  const file = path.join(dir, `${prefix}${s.name}${a.safe ? "-safe" : ""}.png`);
  await page.screenshot({ path: file, type: "png" });
  console.log(`  ${path.relative(ROOT, file)}  (t=${s.t}s)`);
}
await browser.close();
srv.close();
