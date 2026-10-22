---
name: motion-gsap-explainer
description: Animated Hebrew RTL explainer B-roll scenes (9:16 MP4) from HTML + GSAP - number counter with chart, kinetic list, tool logo grid, app mockup with a clicking cursor, before/after split, quote/stat card. 3 palettes, JSON props, renders offline with headless Chrome. Use for "סצנת הסבר", "אנימציה של מספר", "רשימה מונפשת", "גרף שעולה", "לפני ואחרי", "בירול מונפש", "explainer scene".
---

# Motion GSAP Explainer

Builds short animated explainer scenes (B-roll) that a student drops into a reel between talking-head shots: a number that counts up with a chart, "3 טעויות ש..." list, a grid of tools, an app mockup with a cursor clicking, a before/after split, a quote or stat card. Output is a 1080x1920 MP4 with no audio, ready for Remotion, CapCut or Premiere.

Each scene is a JSON object. The student says what they want in plain Hebrew; you translate it into `video.json`, render, look at the stills, deliver.

## When to use

- "תעשה לי אנימציה של המספר 3,900 בוגרים", "סצנה עם גרף שעולה"
- "רשימה מונפשת של 3 טעויות", "תעשה לי את הטיפים כאנימציה"
- "תראה את הכלים שאני עובד איתם", "גריד של לוגואים"
- "סצנה של לפני ואחרי", "הדמיה של אפליקציה עם עכבר שלוחץ"
- "כרטיס ציטוט", "כרטיס עם נתון"
- Any short animated graphic for a reel that is not the speaker's face.

Not for: editing the talking-head video itself, captions over footage, 3D scenes (use the Remotion skills for those).

## Setup (once per project)

Requirements: Node 20+ (Node 22+ only if you also want the HyperFrames route). Nothing else: Chrome and ffmpeg come through npm.

1. Copy the template into the student's project, next to their reel files:
   - macOS / Linux: `cp -R ~/.claude/skills/motion-gsap-explainer/template ./explainer`
   - Windows (PowerShell): `Copy-Item -Recurse $HOME\.claude\skills\motion-gsap-explainer\template .\explainer`
2. `cd explainer && npm i` (pinned: gsap 3.15.0, puppeteer 25.12.0, ffmpeg-static 5.3.0, @fontsource Heebo / Rubik / Assistant / Secular One 5.3.0). First install downloads Chrome once (~170 MB).
3. Smoke test: `npm run render` renders the 13.5 s demo to `out/explainer.mp4` in about 20 s.

Never copy `node_modules/` or `out/` between machines; run `npm i` fresh.

## Inputs to ask the student for (with defaults)

Ask only for what is missing, in one short Hebrew message. Defaults let you start without waiting.

| Input             | Ask                                                    | Default if they have none                                                                                                         |
| ----------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Content           | "מה הסצנה צריכה להגיד? מספר, רשימה, כלים, לפני ואחרי?" | Pull it from their script line for that moment                                                                                    |
| Real numbers      | "יש מספר אמיתי?"                                       | Never invent numbers. No number = use `list` or `quote` instead of `counter`; charts get a plain rising shape with no axis labels |
| Brand colors      | "יש צבע מותג? (קוד HEX)"                               | Palette `night`. Their color goes into `colors.accent`                                                                            |
| Logo / brand name | "איך קוראים לעסק?"                                     | Not needed. Tool tiles use drawn glyphs, never logo image files                                                                   |
| Length            | "כמה שניות?"                                           | Scene defaults (4-5.5 s each). Match the voice-over line it covers                                                                |
| Where it goes     | "איפה זה נכנס בריל?"                                   | Full-screen cutaway between talking-head shots                                                                                    |

## How to build a request

1. Read `references/scene-library.md` (props, limits and exact timings of the 6 scenes).
2. Map each beat of the student's script to ONE scene. One idea per scene, one visual change every 2-3 s, 2-4 scenes per clip.
3. Write `video.json` (palette, optional `colors`, `scenes[]`). Keep text short: list items under ~40 chars, quote under ~60, `typed` under ~45.
4. `npm run sync` validates it (blocks em/en dashes, "קסם", "magic", unknown scene types).
5. `npm run stills -- --safe` and LOOK at every PNG (quality gate below). Fix, repeat.
6. `npm run render`, then `npm run check`.
7. Deliver `out/explainer.mp4` + the stills, with the exact path, duration and size.

Presets to start from: `video.json` (counter + list + logos, `night`), `presets/all-scenes.json` (ui-click, before-after, quote, line counter, `paper`), `presets/forest-tips.json` (`forest`).

## The style system

### Scene recipes (full timing tables in `references/scene-library.md`)

| Scene          | Signature motion                                                                                                                                        | Default length |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `counter`      | odometer roll 0 to value 1.6 s power3.out, label in from the right 0.55 s power4.out, bars scaleY stagger 0.08 expo.out or line draw 1.2 s power2.inOut | 4.5 s          |
| `list`         | title word stagger 0.06 power3.out, marker sweep from the right 0.45 s, rows every 0.55 s from x +120 expo.out, badge back.out(2.2)                     | 5 s            |
| `logos`        | tiles every 0.14 s scale 0.6 back.out(1.5), glyph spins in back.out(2), footer pill expo.out                                                            | 4 s            |
| `ui-click`     | window y 90 expo.out, cursor glide power2.inOut, ripple, typing 0.045 s/char, button press back.out(3), result card                                     | 5.5 s          |
| `before-after` | panels clip-reveal from the right, "before" dims to 0.6, checks draw                                                                                    | 5 s            |
| `quote`        | quote mark back.out(1.8), word stagger 0.05, marker sweep, stat card rolls                                                                              | 4.5 s          |

Transitions: `curtain` (default, two panels sweep right to left in 0.26 s, out 0.30 s), `push` (vertical swipe 0.6 s expo.inOut), `zoom` (out 1.12 + fade, in 0.92 to 1), `cut`.

Motion rules baked in: first move at 0.1-0.3 s, never t=0; at least 3 different eases per scene; entrances are `.out`, exits `.in`; text never overshoots (cards may, 3-6%); after the build, ONE slow breathe (scale 1 to 1.02-1.03, sine.inOut) and nothing else moves; no exit animations before a transition (the transition is the exit).

### Palettes

| Name              | bg      | surface | fg      | muted   | accent         | accent2 | Use for                            |
| ----------------- | ------- | ------- | ------- | ------- | -------------- | ------- | ---------------------------------- |
| `night` (default) | #12100E | #1D1A16 | #F6F1E9 | #ADA395 | #FF6A2B orange | #FFC24B | AI, tech, business tips            |
| `paper`           | #F3EDE3 | #FFFDF8 | #1C1A16 | #625A4F | #D4442A tomato | #1E6B57 | coaching, services, food, wellness |
| `forest`          | #0E3328 | #154336 | #F1F6EE | #A9C4B7 | #C8F25A lime   | #FF9447 | finance, growth, productivity      |

Brand color: set `"colors": { "accent": "#HEX" }` and, if the accent is light, `"onAccent": "#111111"` so text on accent stays readable. Do not invent new colors per element; every scene reads the same tokens.

### Typography and sizes (1080x1920)

- Display (titles, labels): Secular One. Body, numbers, list items: Heebo 500-900. App mockup: Rubik. Assistant is installed as an alternative body font.
- Hero number 290 px, scene titles 96-112 px, list items 60 px, body 48-54 px, smallest label 36 px. Key text never under 38 px.
- Safe zone: all text between y=250 and y=1500, x 80 to 1000. Instagram UI covers the top ~12% and bottom ~20%. The faint hairlines in the background mark these edges.

## Hebrew and RTL rules

- Every scene section has `dir="rtl"`. Do NOT put `dir="rtl"` on `<html>` (HyperFrames renders a blank video with it).
- Write mixed text plainly: `"הכל מתוך Claude Code"`. `MX.tokens` groups consecutive Latin words into ONE `<bdi>`. Never isolate each Latin word separately (`unicode-bidi` per word): inside an RTL line that reorders them and "Claude Code" becomes "Code Claude".
- Punctuation goes at the end of the Hebrew string, as typed: `"מה לעשות היום?"`. Never pre-flip it to the front.
- Hebrew quote marks: use ״ (gershayim) or regular quotes, both render correctly.
- Entrances that move on x come from the right (`x: +N`), marker and reveal sweeps grow from the right edge (`transform-origin: 100% 50%`). Numbers and charts stay LTR (time runs left to right).
- Hebrew words next to a number (`"12 שעות"`): put the word in `suffix`; the engine places it beside the number in the RTL row. Symbols (`+ % $ x`) stay inside the number.
- Fonts: Heebo, Assistant, Rubik, Secular One only, loaded from local npm packages (works offline, no Google Fonts link).
- Copy: casual spoken Hebrew, the way the student talks ("עונים לליד רק למחרת", not "מענה מאוחר לפניות"). Plural "אתם/לכם" unless the student talks to a specific gender.

## Quality gate (before you deliver, every time)

1. `npm run stills -- --safe` and open every PNG. Check:
   - Contrast: every text readable at phone size (muted text on bg, text on accent uses `onAccent`).
   - Clipping: no word cut at a card edge or the frame edge, no text overlapping another element.
   - Safe zones: nothing important inside the red bands.
   - RTL: Hebrew reads right to left, English runs in the right order, punctuation at the end.
   - No template residue: no demo text left from `video.json` that the student did not ask for.
2. Check one mid-transition frame: `npm run stills -- --times <boundary-0.1>`.
3. `npm run render`, then `npm run check`: must print 1080x1920, the expected duration, PASS.
4. Audio: the default output is silent on purpose (the reel's voice carries the sound). If you added `--music`, `npm run check` prints LUFS and true peak: under a voice keep the bed around -24 to -20 LUFS; true peak must be below -1 dBFS.
5. Report to the student: file path, duration, size, and which stills you checked.

## Render command and output

```bash
npm run render                                   # -> out/explainer.mp4
npm run render -- --config presets/all-scenes.json --out out/scene-2.mp4
npm run hf:render                                # optional HyperFrames route -> out/explainer-hf.mp4
```

Output lives in `explainer/out/` inside the student's project. Name finals by content (`out/counter-3900.mp4`), never overwrite a file the student already used. Details and troubleshooting: `references/rendering.md`.

## Anti-slop rules

- No em dash or en dash anywhere (text, JSON, comments). `npm run sync` rejects them.
- No "magic" or "קסם".
- No generic purple gradients, no gradient text, no neon-on-black unless the student asks.
- No invented numbers, quotes, logos or client names. Tool tiles use drawn glyphs, never trademark logo files.
- Motion with a purpose: one breathe per scene after the build, no constant wobble, no infinite loops, no confetti.
- One idea per scene. If a scene needs more than 4 list items or 2 lines of quote, split it into two scenes.

## Files

- `template/` runnable project: `index.html`, `video.json`, `src/` (engine, palettes, text helpers, glyphs, 6 scenes, styles), `scripts/` (sync, preview, stills, render, check), `presets/`.
- `references/scene-library.md` props and timing tables for every scene and transition, how to add a scene.
- `references/rendering.md` both render routes, preview, troubleshooting.
- `examples/preview.mp4` the 13.5 s demo, `examples/stills/` one still per scene type + a safe-zone check.
