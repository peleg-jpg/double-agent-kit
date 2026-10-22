---
name: motion-3d-cinematic
description: Premium 3D motion for Hebrew Reels in Remotion + three.js. 3D phone mockup playing the student's video with orbit, light sweep and push-in, laptop mockup for desktop recordings, extruded 3D Hebrew titles, particle depth end cards. 4 named looks. Triggers "סצנת פתיחה תלת-ממדית", "טלפון תלת מימד", "פתיח בתלת מימד", "תשים את הסרטון בתוך אייפון", "כותרת תלת מימד", "3D intro", "phone mockup".
---

# motion-3d-cinematic

Premium 3D openers and end cards for 9:16 Reels, built in Remotion with React Three Fiber.
Four building blocks, one template:

| Composition                    | What it is                                                                                                                                                                                 | Default length |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| `PhoneIntro`                   | 3D phone playing the student's video on its screen, slow orbit, glass light sweep, extruded Hebrew title, particles, then a push-in into the screen that hands off to the full-frame video | 11 s           |
| `LaptopIntro`                  | Laptop whose lid opens, desktop screen recording on the screen, title above                                                                                                                | 10 s           |
| `EndCard`                      | Particle depth background, two orbiting rings, extruded CTA headline, CTA pill, optional handle and logo                                                                                   | 5 s            |
| 3D title (`three/Title3D.tsx`) | Extruded Hebrew title with a right-to-left reveal, usable in any scene                                                                                                                     |                |

## When to use

The student asks for a 3D opener, a phone or laptop mockup, "the video inside an iPhone", a 3D title, a
cinematic intro, or a particle end card. Typical Hebrew requests: "תעשה לי סצנת פתיחה תלת-ממדית",
"תשים את הסרטון שלי בתוך טלפון שמסתובב", "תעשה פתיח עם הלפטופ להקלטת מסך", "כותרת בתלת מימד",
"תעשה לי סיום עם חלקיקים וקריאה לפעולה".
Not for: captions, talking-head editing, flat 2D motion graphics (use the course's other motion skills).

## Setup (student's machine, Mac or Windows)

Needs Node.js 18+ (20 or 22 recommended). Nothing else; Remotion downloads its own headless Chrome on the first
render (needs internet once, about 100 MB).

1. Copy the template into the student's project, never edit the skill folder itself:
   - Mac: `cp -R ~/.claude/skills/motion-3d-cinematic/template ./reel-3d`
   - Windows (PowerShell): `Copy-Item -Recurse $HOME\.claude\skills\motion-3d-cinematic\template .\reel-3d`
2. `cd reel-3d && npm i` (all versions are pinned in package.json: Remotion 4.0.536, @remotion/three 4.0.536,
   @remotion/media 4.0.536, @react-three/fiber 8.18.0, three 0.170.0, React 18.3.1). Do not upgrade one package
   alone; Remotion packages must all share the exact same version.
3. Put the student's video in `public/` (for example `public/screen.mp4`).
4. Preview: `npm run studio` (opens in the browser). Render: see "Render" below.

## Inputs to ask the student for (with defaults)

| Input         | Ask                                                                                              | Default if they have none                                                        |
| ------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Video         | "איזה סרטון לשים בתוך הטלפון?" A 9:16 reel for the phone, a 16:9 screen recording for the laptop | Placeholder screen with "הסרטון שלכם כאן". Render works, tell them to add a file |
| Title         | 1-2 short lines, max ~14 characters per line in 3D                                               | Take the hook line of their script, split it in two                              |
| Kicker        | Small pill above the title (topic, tool name)                                                    | Empty (hidden)                                                                   |
| Look          | One of the 4 below                                                                               | `studio-dark`                                                                    |
| Brand color   | One hex color                                                                                    | Look default (goes to `accent`: title sides and pill)                            |
| Logo / handle | For the end card only                                                                            | Hidden                                                                           |
| Audio         | Should the video's sound play during the intro?                                                  | Phone: yes (`volume: 1`). Laptop: no (`volume: 0`)                               |
| Start point   | From which second of the video to start                                                          | 0                                                                                |

Write the answers into a props JSON (copy one from `template/props/`) and render with `--props`.

## The 4 looks (exact values in `template/src/looks.ts`, full table in `references/looks.md`)

| Look          | Feel                                                                | Camera path (phone)                                                                                                                                           | Key numbers                                                                                                 |
| ------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `studio-dark` | Product launch, charcoal + warm amber                               | "Slow Orbit": starts right (4.6, 1.4, 19.5), glides to (1.7, 0.9, 17.6) by 2.2 s, crosses to (-1.7, 0.6, 17.0) by 8.6 s, pushes to (0, -1.25, 7.7) by 10.15 s | Spring damping 20 / stiffness 90; title in at 0.75 s, 0.35 s stagger, 1.1 s wipe; sweeps at 2.4 s and 7.0 s |
| `clean-white` | Apple-store white, black title with blue sides, soft contact shadow | "Tabletop Float": high camera (0, 4.2, 19) looking down, lateral truck +1.0 to -1.0                                                                           | Damping 26 (no overshoot); title 0.8 s; one sweep at 2.8 s; shadow opacity 0.32                             |
| `neon-night`  | Deep navy, cyan rim, coral fill, dense particles                    | "Low Arc": starts low left (-7.5, -2.8, 14.5), rises to the front by 2.6 s                                                                                    | Damping 14 (small overshoot); title 0.6 s, 0.9 s wipe; sweeps at 2.0, 5.2, 8.0 s                            |
| `golden-hour` | Warm brown, amber key, gold phone frame, slow bokeh                 | "Dolly Drift": straight-on dolly from z 22.5 to 16.8 with a lens breathe fov 26 to 30                                                                         | Damping 30 (slow, heavy); title 1.0 s, 1.3 s wipe; sweeps at 3.0 and 7.6 s                                  |

Rules that make every look premium and not generic:

- One camera move per shot, eased in-out per segment (bezier 0.45, 0, 0.2, 1). Few keys (3-4). No shake, no
  constant wobble. The phone only drifts 0.14 rad over the whole intro.
- Device entrance is a single spring; title waits ~0.5 s after it. Text never overshoots.
- Light sweep = a moving point light (specular streak on the metal and title sides) plus a diagonal glare band
  over the screen glass. 1-3 sweeps per intro, never continuous.
- Particles stay behind the hero (`zMax`), so no dust crosses the face on the screen.
- The intro ends with a purpose: the phone squares up, the camera pushes into the screen, and the full-frame video
  takes over at the exact same scale (computed in `PhoneIntro.tsx`, no visible cut). The video keeps playing, so
  the intro IS the first seconds of the reel.

When the student asks for a "new look", copy one entry in `looks.ts`, change colors and camera keys, keep the
timing structure. Do not add purple gradients unless they ask.

## Hebrew in 3D: how it works and why

three.js `TextGeometry` builds real extruded glyphs but lays characters out left to right and knows nothing about
RTL. Hebrew needs no contextual shaping (unlike Arabic), so converting the string to visual order is enough.
`src/lib/bidi.ts` does a small single-line bidi pass: Hebrew runs reversed, Latin and digit runs kept in order,
spaces between two Latin words stay inside the Latin group (so "Claude Code" never flips), punctuation at the end
lands on the left (after the text in RTL reading), brackets mirrored. Verified on "ה-AI שעובד",
"Claude Code בעברית!" and "(גרסה 2) מוכנה".

The font is loaded from `public/fonts/SecularOne-Regular.ttf` (OFL, license file next to it) by three's
`TTFLoader` at runtime. It must be a TTF or OTF; woff2 from Google Fonts does not work for 3D. To change the 3D
font, drop another Hebrew TTF in `public/fonts/` and pass its path to `useFont3D()`.

We did not use drei/troika `<Text>`: it does handle bidi, but it is flat (no extrusion), loads fonts in a web
worker (timing risk in headless render) and adds a large dependency tree.

Use `titleMode: "dom"` (HTML title with the same right-to-left wipe) when the title has niqqud, more than ~16
characters per line, numbers with mixed punctuation, or anything that looks wrong in 3D. The DOM layer gets full
browser shaping and bidi. The kicker pill and CTA are always DOM, and they are anchored to the 3D title by
projecting its 3D position to screen pixels every frame (`projectToScreen` in `lib/anim.ts`).

## Hebrew and RTL rules (all text in this skill)

- Every DOM text container: `dir="rtl"` and `direction: 'rtl'`. In RTL flex rows `flex-start` is the RIGHT side.
- Never wrap single words in their own `unicode-bidi` isolate inside an RTL line. It reverses "Claude Code" into
  "Code Claude". Write the line as one string; Latin words that sit next to each other stay grouped.
- Punctuation goes after the text in the logical string (`"רוצים את ההוראה?"`). Check the render: in RTL the "?"
  must appear on the LEFT end.
- Hyphenated prefixes are written logically: `"ה-AI"`, `"ב-ChatGPT"`.
- Fonts: Secular One for display (3D and DOM titles), Heebo for pills, labels and CTA. Assistant and Rubik are
  fine substitutes for Heebo (`@remotion/google-fonts`, subsets `hebrew` + `latin`).
- Casual spoken Hebrew, like on WhatsApp. "תגיבו", "שימו", "ככה זה נראה". Not "ניתן", not "על ידי".
- No em dash or en dash anywhere (text, comments, props). Use a comma, colon or a plain hyphen.
- Never write "magic" or "קסם".

## Render

`remotion.config.ts` already sets `--gl=angle`; the npm scripts pass it too.

```bash
npm run render                    # PhoneIntro with Root.tsx defaults -> out/phone-intro.mp4
npx remotion render PhoneIntro out/intro.mp4 --gl=angle --props=props/phone-neon-night.json
npm run render:laptop             # -> out/laptop-intro.mp4
npm run render:endcard            # -> out/end-card.mp4
npx remotion still PhoneIntro out/check-90.png --frame=90 --gl=angle --props=props/phone-studio-dark.json
```

GL flag, important: without a GL backend headless Chrome fails with `Error creating WebGL context`.

- `--gl=angle` (default here): GPU, Mac and Windows. An 11 s 1080x1920 intro renders in about 15-20 s on an
  Apple Silicon Mac.
- `--gl=swangle`: software fallback for machines with no usable GPU (Linux servers, some VMs, remote desktops).
  Same picture, about 1 s per frame.
- If a render comes out black or throws a WebGL error with angle, retry with swangle.

Output goes to `out/` inside the project. Tell the student the full path when done.

Durations: set `durationSec` in props. The phone intro keeps its entrance and push-in speed and stretches only the
calm middle, so 8-20 s all work (minimum 6 s).

## Quality gate before delivering (do all of it, look with your own eyes)

1. Render 4 stills: the title fully in (about frame 75-95, catch a sweep if you can), mid orbit (frame 150),
   push-in (2 frames before `durationSec - 0.85`), and handoff (last 10 frames). Read each PNG.
2. Check on every still:
   - Hebrew reads right to left, punctuation on the left end, Latin words grouped, nothing mirrored.
   - Text contrast: title face vs background. Clean White needs a dark title; dark looks need a light one.
   - Nothing clipped: title lines inside the frame on ALL camera positions (the orbit moves them), no letter cut
     by the frame edge. If a line is cut, shorten it, lower `size`, or lower `maxWidth`.
   - Safe zones: all text between y 230 and y 1536 of 1920 (out of the top ~12% and bottom ~20% where Instagram
     UI sits). The device itself may reach lower; text may not.
   - Handoff: frames before and after the crossfade show the video at the same scale (no ghost double image).
3. Contact sheet of the final video:
   `ffmpeg -i out/phone-intro.mp4 -vf "fps=3,scale=180:-1,tile=11x3" -frames:v 1 out/sheet.jpg`
4. Audio: `ffmpeg -i out/phone-intro.mp4 -af ebur128=peak=true -f null -` and read the last `I:` and `Peak:`
   lines. Target about -14 LUFS integrated, true peak at or below -1 dB. The intro passes the source audio
   through, so a quiet source stays quiet: fix the source, or lower `volume` if it clips.
5. Size check for sharing: `ffmpeg -i out/phone-intro.mp4 -c:v libx264 -crf 22 -preset slow -c:a aac -b:a 160k out/phone-intro-small.mp4`.

## Anti-slop rules

- No em dashes, no en dashes, no "magic" / "קסם" in any text.
- No generic purple gradients unless the student asks. The 4 looks are charcoal/amber, white/blue, navy/cyan/coral,
  brown/gold.
- Motion with purpose: entrance, reveal, one sweep, push-in. No idle spinning, no constant bobbing, no
  shake. Particles drift slowly and stay behind the hero.
- One title, max 2 lines. If the student gives a paragraph, pick the hook and say why.
- Do not invent claims or numbers in the title. Use the student's own words.
- Real-looking device: titanium frame, black glass, Dynamic Island, buttons. Do not replace it with a flat
  rounded rectangle.

## Code rules (Remotion + three)

- All motion comes from `useCurrentFrame()`. `useFrame()` from R3F is forbidden (it flickers in render).
- Shaders get time as a uniform (`frame / fps`). Random values come from `seeded()` in `lib/anim.ts`, never
  `Math.random()`.
- Video on a 3D surface: `@remotion/media` `<Video headless onVideoFrame>` drawing into a `CanvasTexture`, then
  `advance()` during render (`three/ScreenTexture.tsx`). Do not use the deprecated `useOffthreadVideoTexture`.
- Any `<Sequence>` inside `<ThreeCanvas>` needs `layout="none"`.
- Anything async (fonts, files) uses `delayRender` / `continueRender`.

## Files

- `template/src/looks.ts`: the 4 looks (colors, lights, camera keys, timing).
- `template/src/scenes/`: `PhoneIntro.tsx`, `LaptopIntro.tsx`, `EndCard.tsx`.
- `template/src/three/`: `Phone.tsx`, `Laptop.tsx`, `Title3D.tsx`, `Particles.tsx`, `Glare.tsx`, `Stage.tsx`
  (environment, camera rig, lights, sweep), `ScreenTexture.tsx`.
- `template/src/lib/`: `bidi.ts`, `anim.ts` (camera sampling, seeded random, 3D to screen projection), `media.ts`,
  `fonts.ts`, `useFont3D.ts`, `shapes.ts`.
- `template/props/`: ready props for each look, laptop and end card.
- `references/looks.md`: full numeric table per look. `references/recipes.md`: common requests and how to do them.
- `examples/`: `preview.mp4` (the demo) and 6 stills.
