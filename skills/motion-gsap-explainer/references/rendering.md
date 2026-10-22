# Rendering: two validated routes

The template is ONE composition (`index.html` + `video.json`) that both renderers read. Pick the built-in renderer by default.

## Route A (default): built-in renderer, `npm run render`

`scripts/render.mjs` opens the page in headless Chrome (Puppeteer 25.12.0, Chrome downloaded by `npm i`), seeks the GSAP timeline frame by frame (`tl.seek(t)`), screenshots each frame and pipes JPEGs into ffmpeg (`ffmpeg-static` 5.3.0, bundled, nothing to install). Output: H.264, yuv420p, CRF 20, +faststart.

```bash
npm run render                                    # video.json -> out/explainer.mp4
npm run render -- --config presets/all-scenes.json --out out/gallery.mp4
npm run render -- --music music.mp3 --volume 0.2  # optional music bed, fades out
npm run render -- --fps 60 --crf 18               # smoother / higher quality
```

Validated on macOS (Apple Silicon, Node 22): 13.5 s demo, 405 frames, rendered in about 18 s, 1.6 MB.

Works offline after `npm i`: fonts come from `@fontsource/*` packages, GSAP from `node_modules`, no CDN at render time.

## Route B (optional): HyperFrames CLI

The same `index.html` passes `hyperframes lint` with 0 errors and renders identically (frames compared side by side).

```bash
npm run hf:render     # = sync + npx -y hyperframes@0.8.113 render -o out/explainer-hf.mp4
npx -y hyperframes@0.8.113 lint
npx -y hyperframes@0.8.113 preview   # HyperFrames studio with a timeline UI
```

Needs Node 22+ and its own Chrome download on first run. Validated: same 13.5 s demo, 16.5 s render. Version pinned to 0.8.113 because HyperFrames publishes several releases a day; do not use `@latest` in a student project.

HyperFrames rules the template already follows:

- No `dir="rtl"` on `<html>`. HyperFrames lint flags it as `html_dir_attribute_breaks_render` (renders a blank video). Each scene sets `dir="rtl"` itself.
- `window.__timelines["main"]` registered in an inline script; the timeline is built synchronously on load.
- `data-duration` on `#stage` is written by `npm run sync` from the scene durations.
- No `onUpdate` callbacks: HyperFrames seeks with events suppressed, so counters use an odometer (transform tweens) and typing uses per-character opacity.
- No `Math.random`, no `Date`, no `repeat: -1`.

## Preview while editing

```bash
npm run preview       # prints http://127.0.0.1:4321/?play  (loop), ?t=2.5 (one frame), &safe (safe zones)
npm run stills        # one PNG per scene at its hero moment -> out/stills/
npm run stills -- --safe                 # same, with the Instagram UI zones tinted red
npm run stills -- --times 1.2,4.4,9.6    # exact moments (mid-transition checks)
npm run check                            # resolution, duration, size, loudness if there is audio
```

## Troubleshooting

| Symptom                                     | Fix                                                                                                                                     |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `npm i` is slow or fails on Chrome download | Puppeteer downloads Chrome once (~170 MB). Behind a proxy set `PUPPETEER_DOWNLOAD_BASE_URL`, or retry. On a locked machine use Route B. |
| `video.json problems: ... em dash`          | Replace the long dash with `-` or a comma. The validator also blocks "קסם" and "magic".                                                 |
| `Unknown scene type`                        | Use one of: counter, list, logos, ui-click, before-after, quote.                                                                        |
| Hebrew shows as boxes or a fallback font    | Run `npm i` again (the `@fontsource` packages are missing).                                                                             |
| English words in the wrong order            | Do not wrap English words in your own spans; write plain text, the engine groups them.                                                  |
| Text overflows a card                       | Shorten the text (limits in scene-library.md) before shrinking fonts. Key text stays at 38 px or more.                                  |
| Windows: `'node' is not recognized`         | Install Node 20+ from nodejs.org, reopen the terminal.                                                                                  |
