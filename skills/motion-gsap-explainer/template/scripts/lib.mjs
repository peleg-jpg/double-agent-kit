// Shared helpers: CLI args, video.json -> video-data.js sync + validation, tiny static server, headless page.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export const SCENE_DEFAULTS = {
  counter: 4.5,
  list: 5,
  logos: 4,
  "ui-click": 5.5,
  "before-after": 5,
  quote: 4.5,
};
const BANNED = [
  { re: new RegExp("[" + String.fromCharCode(0x2014, 0x2013) + "]"), why: "em dash or en dash (use - or a comma)" },
  { re: /קסם/, why: 'the word "קסם"' },
  { re: /magic/i, why: 'the word "magic"' },
];

export function args() {
  const out = {};
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith("--")) {
      const k = a[i].slice(2);
      const v = a[i + 1] && !a[i + 1].startsWith("--") ? a[++i] : true;
      out[k] = v;
    } else (out._ ||= []).push(a[i]);
  }
  return out;
}

function walkStrings(v, at, cb) {
  if (typeof v === "string") cb(v, at);
  else if (Array.isArray(v))
    v.forEach((x, i) => walkStrings(x, `${at}[${i}]`, cb));
  else if (v && typeof v === "object")
    Object.entries(v).forEach(([k, x]) => walkStrings(x, `${at}.${k}`, cb));
}

// Reads the config, validates it, writes video-data.js and patches data-duration in index.html.
export function sync(configPath = "video.json") {
  const abs = path.resolve(ROOT, configPath);
  if (!fs.existsSync(abs)) throw new Error(`Config not found: ${abs}`);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(abs, "utf8"));
  } catch (e) {
    throw new Error(`${configPath} is not valid JSON: ${e.message}`);
  }
  const problems = [];
  if (!Array.isArray(data.scenes) || !data.scenes.length)
    problems.push("scenes must be a non-empty array");
  (data.scenes || []).forEach((s, i) => {
    if (!SCENE_DEFAULTS[s.type])
      problems.push(
        `scenes[${i}].type "${s.type}" is unknown. Use: ${Object.keys(SCENE_DEFAULTS).join(", ")}`,
      );
  });
  walkStrings(data, "video", (str, at) => {
    BANNED.forEach(
      (b) =>
        b.re.test(str) && problems.push(`${at} contains ${b.why}: "${str}"`),
    );
  });
  if (problems.length)
    throw new Error("video.json problems:\n  - " + problems.join("\n  - "));

  const duration = +data.scenes
    .reduce((t, s) => t + Number(s.duration || SCENE_DEFAULTS[s.type]), 0)
    .toFixed(3);
  fs.writeFileSync(
    path.join(ROOT, "video-data.js"),
    `/* generated from ${path.basename(abs)} by scripts/sync.mjs, edit the JSON, not this file */\nwindow.VIDEO = ${JSON.stringify(data, null, 2)};\n`,
  );
  const idx = path.join(ROOT, "index.html");
  const html = fs.readFileSync(idx, "utf8");
  const patched = html.replace(
    /(id="stage"[^>]*data-duration=")[^"]*(")/,
    `$1${duration}$2`,
  );
  if (patched !== html) fs.writeFileSync(idx, patched);
  return { data, duration };
}

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
};

export function serve(port = 0) {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    const file = path.join(ROOT, url === "/" ? "index.html" : url);
    if (
      !file.startsWith(ROOT) ||
      !fs.existsSync(file) ||
      fs.statSync(file).isDirectory()
    ) {
      res.writeHead(404).end("not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type":
        TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
    });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) =>
    server.listen(port, "127.0.0.1", () =>
      resolve({
        url: `http://127.0.0.1:${server.address().port}/`,
        close: () => server.close(),
      }),
    ),
  );
}

// Opens the composition in headless Chrome, waits for fonts and the timeline.
export async function openComposition(url) {
  const { default: puppeteer } = await import("puppeteer");
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--font-render-hinting=none",
      "--force-color-profile=srgb",
      "--disable-lcd-text",
      "--hide-scrollbars",
    ],
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "load", timeout: 60000 });
  await page
    .waitForFunction("window.__ready === true", { timeout: 15000 })
    .catch(() => {
      throw new Error(
        "Composition did not build. Page errors:\n  " +
          (errors.join("\n  ") || "(none)"),
      );
    });
  await page.evaluate(async () => {
    await document.fonts.ready;
    const faces = [
      "400 40px 'Secular One'",
      "400 40px Heebo",
      "500 40px Heebo",
      "600 40px Heebo",
      "700 40px Heebo",
      "800 40px Heebo",
      "900 40px Heebo",
      "500 40px Rubik",
      "600 40px Rubik",
      "700 40px Rubik",
      "800 40px Rubik",
    ];
    await Promise.all(faces.map((f) => document.fonts.load(f, "אבג Abc 123")));
  });
  if (errors.length) console.warn("Page warnings:\n  " + errors.join("\n  "));
  const meta = await page.evaluate(() => window.__meta);
  const seek = (t) =>
    page.evaluate((x) => { window.__timelines.main.seek(x, false); return x; }, t);
  return { browser, page, meta, seek, errors };
}

export function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
  return p;
}
