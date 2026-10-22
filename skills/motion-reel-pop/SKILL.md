---
name: motion-reel-pop
description: Edit a talking-head video (HeyGen avatar or phone, 9:16, voice baked in) into an energetic Hebrew reel in Remotion - word-by-word captions synced to the audio, punch-in zooms, pop-up cards, B-roll cuts, progress bar, CTA end card, 4 looks (Pop, Glass, Bold Mono, Split). Triggers - "תערוך לי את הסרטון", "כתוביות מילה מילה", "תוסיף זומים וכרטיסיות", "ריל בסגנון פופ".
---

# motion-reel-pop

Input: one vertical talking video whose audio is the final voice (HeyGen export, phone recording, any 9:16 mp4/mov).
Output: `out/reel_final.mp4`, 1080x1920, 30 fps, same length as the video, loudness -14 LUFS.

Everything is driven by ONE file, `src/reel.config.json`, plus the word timings in `src/words.json`.
You (Claude) write the config from the transcript. The student never touches code.

Not for: cutting long videos into shorts, generating the avatar or the voice, horizontal (16:9) videos, 3D scenes.

## 1. Setup (once per video project)

The student works in plain Hebrew and is not technical. Do the commands yourself and explain in one short line each.

```bash
# from the student's project folder (any folder they choose), e.g. ~/reels/my-first-reel
cp -R ~/.claude/skills/motion-reel-pop/template/. .        # Windows PowerShell: Copy-Item -Recurse ~\.claude\skills\motion-reel-pop\template\* .
mkdir -p out public/broll
# The "double-agent-kit" installer keeps one shared engine. If it exists, link it (seconds, no extra disk):
ln -s ~/.double-agent/engine/node_modules node_modules      # Windows: New-Item -ItemType Junction -Path node_modules -Target "$HOME\.double-agent\engine\node_modules"
# No shared engine: npm i instead (pinned versions, ~1 minute, about 1.1 GB after the first render downloads Chrome)
```

Requirements: Node.js 20 or newer (`node -v`). On Mac the first transcription builds whisper.cpp, which needs
`git` and the Xcode Command Line Tools (`xcode-select --install`, one time). On Windows a ready whisper binary is
downloaded. First render downloads Chrome Headless Shell (~90 MB). Whisper model: ~1.5 GB in `~/.motion-reel-pop/`,
shared by all projects. Fonts load from Google Fonts at render time, so stay online.

Smoke test before copying the student's video in (it writes `public/input.mp4`; skip it when the shared engine
already rendered its install test):
`npm run demo-video && npx remotion render src/index.ts Reel out/demo.mp4 --frames=0-150`

## 2. Ask the student (one message, casual Hebrew, all with defaults)

| Input                                                | Where it goes                                                                | Default if they have none                                                  |
| ---------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| The video                                            | `public/input.mp4` (copy it there; .mov is fine, set `"video": "input.mov"`) | required                                                                   |
| The script text (what the avatar says)               | `script.txt` in the project                                                  | Whisper transcript only; you fix wrong words in `captions.fix`             |
| Captions file (SRT or JSON) if they already have one | `npm run captions -- file.srt`                                               | auto transcription                                                         |
| Look                                                 | `look`                                                                       | pick by content (table in section 4) and say which one and why in one line |
| Brand colors (1-2 hex)                               | `brand.accent`, `brand.accent2`                                              | the look's own colors                                                      |
| Logo or tool logos (png/svg)                         | `public/` + `brand.logo` / card `logo`                                       | a letter monogram tile                                                     |
| The ending ask (comment keyword, follow, link)       | `cta`                                                                        | the last spoken line turned into a button                                  |
| B-roll clips or screenshots                          | `public/broll/` + `broll[].src`                                              | "type beats" (big text on the look's color)                                |

Example message: "שלחו לי את הסרטון, ואם יש לכם גם את הטקסט שהאווטאר מקריא, צבע של המותג ולוגו. אין? סבבה, אני אסתדר עם ברירות מחדל."

## 3. Pipeline

1. **Words.** With a script (best, fixes Hebrew spelling and English names):
   `npm run transcribe -- public/input.mp4 --script script.txt`. Without: `npm run transcribe`.
   With their file: `npm run captions -- path/to/file.srt` (also takes ElevenLabs, OpenAI, faster-whisper and
   Remotion JSON). READ the printed transcript. Fix any wrong word in `captions.fix` (`{"וואטסאפ": "WhatsApp"}`).
   English product names are written in English ("ChatGPT", "Claude Code"), never transliterated.
2. **Face.** `npx remotion ffmpeg -ss 1 -i public/input.mp4 -frames:v 1 -vf scale=1080:1920 out/face.jpg`, look at it,
   set `face` to the point between the eyes in 1080x1920 pixels. HeyGen head-and-shoulders close-ups: about `{x:540,y:600}`.
3. **Plan the beats** (rules below), then write `src/reel.config.json`. Reference for every field:
   `references/config.md`. Worked example (the demo reel): `references/example-config.json`.
4. `npm run check` (TypeScript must print nothing).
5. **Stills** (section 7) and fix until clean.
6. **Render:** `npm run render` (about 3x real time on a laptop: 42 s video = ~2.5 min), then `npm run finish`.
   Deliver `out/reel_final.mp4`. For WhatsApp or email: `node scripts/finish.mjs out/reel.mp4 --max-mb 15`.
7. Tell the student: the file path, the look used, what each beat does in 3-5 short lines, and one question for
   changes. Change requests are config edits + re-render; keep the old file (`out/reel_v1.mp4`, `_v2`...).

### Beat planning rules (these make it look edited, not generated)

- **Times are words, not seconds.** Write `"at": "@Dots"`, `"@Dots#2"` (second time it is said), `"@Dots+0.2"`,
  `"to": "@Pro>"` (when that word ENDS). Every visual starts on a spoken word.
- **Hook (0 to ~3 s):** the first spoken line as big type on top, face in a window below from frame 0. `hook.text` =
  their opening line verbatim (or trimmed to its strongest 4-8 words); `hook.until` = the end of that line.
  Optional `kicker`: 1-3 words in a pill above ("חדש", "שמרו את זה").
- **Something changes every 2-3 s.** Never more than 4 s of plain talking face. Alternate: card, talk + zoom, punch,
  B-roll, card. Never two of the same kind back to back.
- **Cards** (`list`, `steps`, `tool`, `stat`, `text`) on: a tool or product name (`tool`), numbered items (`list`
  per item when each gets 2+ s, otherwise ONE `steps` card whose rows appear on their words), any number (`stat`,
  counts up), a short definition (`text`). A card holds at least 1.5 s. Card text = 2-5 words, our wording,
  never a full sentence. Gaps under 0.6 s between cards are bridged automatically (the face does not bounce).
- **Zooms** on emotional or payoff words in talk stretches, 0.6-1.5 s long, one every 4-6 s. Not on every sentence.
- **Punches** (big payoff word over the footage, Pop adds confetti): the 2-3 strongest lines only. Max 3 per reel.
- **B-roll:** a clip or screenshot when they say a concrete thing you have a file for; a "type beat" (text only)
  when they list 3+ nouns quickly ("זום, יומן, CRM"). 1-2.5 s each.
- **CTA** on the final ask ("תגיבו...", "תעקבו...", "לינק בביו"). Button text = the action in 2-3 words. It holds to
  the end. Captions hide under the hook, punches, type beats and the CTA (they would double the big text).
- Numbers and claims on screen come only from what the speaker says. Never invent a stat.

## 4. The looks (exact values; all in `src/looks.ts`, `src/layout.ts`, `src/components/`)

Pick by content: launch, news, tool tips, high energy = **pop** (default). Premium, expert, B2B, calm = **glass**.
Opinion, bold statements, myths, "stop doing X" = **mono**. Tutorials, step lists, "N tools" = **split**.

Shared by all looks: canvas 1080x1920 @30 fps. Card zone x 70-1010, y 280-820. Card mode = face in a window
(x 60, y 965, w 960, bleeds off the bottom, footage scale 0.6, eyes at y 1265, sides filled by a blurred copy of the
video with a 110 px feather). Talk captions center y 1330, max width 800, shifted 30 px left of center (away from
the IG button rail). Card-mode captions at y 892 (the seam). Slow push-in 3.5% over 6 s, restarted at every layout
change. Pages of max 3 words / 16 characters, broken at pauses > 0.35 s, sentence ends and layout changes; each word
appears on its onset in a fixed layout (no jumping), exactly one word active at a time.

|                                         | **Pop**                                                                                                                                                                                | **Glass**                                                                                                                            | **Bold Mono**                                                                                                    | **Split**                                                                                                                     |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Feel                                    | product launch, satisfying                                                                                                                                                             | Apple keynote, premium                                                                                                               | editorial, loud, strict                                                                                          | tutorial, clear (Nick Saraev format)                                                                                          |
| Fonts                                   | Rubik 900                                                                                                                                                                              | Heebo 700/800                                                                                                                        | Secular One + Assistant 800                                                                                      | Heebo 900                                                                                                                     |
| Colors                                  | walls cobalt #2E55F0, tangerine #FF6A2B, pink #FF3E8A, green #39C36A; cards butter #FFD23F, navy #18223F, cream #FBF0E2                                                                | navy #141B2E veil over the blurred video, text #FFFDF9, accent amber #FFB547                                                         | black #0B0B0B, white, ONE accent #FFE14D                                                                         | light #F2F3F5 + 34 px dot grid, ink #0E1116, accent blue #1A73E8                                                              |
| Captions                                | 92 px white, 15 px navy stroke, active word butter + spring pop {damping 11, mass 0.6, stiffness 180}, highlight words pink                                                            | glass capsule rgba(18,22,36,.42), blur 22 px, radius 60, 60 px; words rise 14 px + unblur 8 px in 0.26 s expo-out; active word amber | 98 px white, 12 px black stroke; active word = black on an accent block; words snap in, scale 1.18 to 1 in 0.1 s | talk: 84-118 px kinetic type in the TOP panel, unspoken grey #C9CDD4, spoken ink, active word white on a blue box (radius 18) |
| Card material                           | satin gradient (+0.40 highlight, -0.22 rim), radius 44, specular ellipse                                                                                                               | frosted rgba(255,248,240,.13), blur 22 px + saturate 1.35, 1 px white rim, radius 44, specular sweep 115 deg over 1.0 s              | white, square corners, hard accent shadow -14 px 14 px                                                           | white browser card, radius 28, 3 px #B9D3F6 border, 64 px chrome bar with traffic lights                                      |
| Card in                                 | spring {11, 0.6, 180} from +160 px, scale 0.6, -6 deg; rows stagger 0.12 / 0.22 / 0.32 s                                                                                               | 0.65 s cubic-bezier(.16,1,.3,1): rotateX 8 deg, scale 0.94, blur 12 px to 0                                                          | clip wipe right to left 0.32 s expo-out, rows slide 60 px                                                        | ghost 18% to 100% + scale 0.965 to 1 in 0.3 s                                                                                 |
| Card out                                | 0.2 s ease-in, -15% scale, fade                                                                                                                                                        | 0.2 s fade + blur 6 px                                                                                                               | hard cut                                                                                                         | 0.2 s fade                                                                                                                    |
| Face window morph                       | 0.35 s in / 0.3 s out cubic-bezier(.4,0,.2,1), 10 px cream border                                                                                                                      | same curve, glass rim                                                                                                                | hard cut, 12 px accent bar on top                                                                                | always split (plate x 36, w 1008, radius 64)                                                                                  |
| Backdrop change                         | circle wipe 40 to 2400 px in 0.32 s, new wall per card                                                                                                                                 | amber glow 520x420 drifting on 9 s / 11 s sines                                                                                      | 180 px vertical rules at 7% white                                                                                | static                                                                                                                        |
| Zoom                                    | to 1.22, spring {14, 0.8, 220}, out 0.2 s                                                                                                                                              | to 1.12, 0.6 s in / 0.5 s out keynote curve                                                                                          | hard jump cut to 1.30                                                                                            | jump to FULL FACE, scale 0.92 to 1 with back easing 0.3 s                                                                     |
| Punch                                   | Rubik 900 130-260 px butter, 16-layer extrusion, scale 1.8 to 1 spring {10, 0.7, 210}, 6 px blur first 0.05 s, 14 px camera shake 0.2 s, 32-piece confetti (life 1.2 s), center y 1290 | footage blur 10 px + dim 28%, light bloom 160 to 680 px in 0.7 s, words rise one by one (0.62 s, 0.08 s stagger), last word amber    | full black frame, white 120-230 px, accent bar 26 px wipes in 0.28 s, hard cut out                               | giant word in the top panel + 520 px accent underline wiping in 0.35 s                                                        |
| B-roll                                  | full frame, circle wipe 0.32 s, type beats on tangerine                                                                                                                                | full frame, blur 20 px to 0 in 0.35 s                                                                                                | full frame, hard cut                                                                                             | inside a browser card in the top panel                                                                                        |
| Hook                                    | words pop 0.09 s apart with 8 deg rotation, 10-layer navy extrusion, last word butter                                                                                                  | glass pane, words rise 0.09 s apart, last word amber                                                                                 | words drop in 0.09 s apart, last word on an accent block                                                         | words turn grey to ink 0.13 s apart, last word in a blue box                                                                  |
| Progress bar (top, fills right to left) | 14 px butter                                                                                                                                                                           | 7 px white 85%                                                                                                                       | 12 px accent, square                                                                                             | 9 px blue                                                                                                                     |
| Card sound                              | pop                                                                                                                                                                                    | tick                                                                                                                                 | click                                                                                                            | pop                                                                                                                           |

Sound: self-made dry SFX in `public/sfx/` (pop, click, tick, thud, tap, sparkle; no licenses needed). Click on every
layout change and B-roll cut, thud on punches, ticks under hook words and stat count-ups, tap on the CTA button.
No whoosh sounds. Optional music: `"music": "music.mp3"` (in `public/`) at `musicVolume` 0.06-0.10 with 0.5 s fades.
Brand colors replace only the accent colors (`brand.accent` / `accent2`); the rest of each look stays fixed.

## 5. Hebrew and RTL rules (already built in; keep them when you edit)

- Every Hebrew container has `direction: rtl`. In RTL flex rows the FIRST child sits on the RIGHT; write JSX in
  reading order and never use `row-reverse`.
- Never isolate each word with `unicode-bidi` inside an RTL line: it reverses "Claude Code" into "Code Claude".
  Caption words are flex items; runs of Latin words are merged into ONE token (`groupLatin`) with `dir="ltr"`.
- Hebrew prefix + English stays one token with a hyphen: "ה-AI", "ב-ChatGPT". Do not split it.
- Punctuation goes after the text in our strings: "רוצים את ההוראה?" (never "?רוצים"). Captions drop . , : ! and
  quote marks; "?" and "%" stay.
- Fonts: Rubik, Heebo, Assistant, Secular One only (loaded with the Hebrew + Latin subsets).
- All on-screen text you write is casual spoken Hebrew, the way people talk on WhatsApp: "מה הוא עושה בשבילכם",
  not "יכולות המערכת". Plural address ("תגיבו", "שמרו") unless the student speaks in singular or feminine.

## 6. Anti-slop rules

- No em dash or en dash anywhere (strings, config, comments). Use a comma, period or colon.
- Never the words "magic" or "קסם", no "revolutionary"/"מהפכני" style hype unless the speaker says it.
- No purple-to-blue gradients unless the student asks. Each look has its own palette; keep it.
- Motion has a reason: things move on words. No constant wobble, no confetti on more than 3 moments, no zoom
  on every sentence, no card that just repeats the full caption.
- Max 2 colors of text per frame. Text never on the face (eyes to chin), never under the IG zones.
- No invented numbers, quotes, logos or claims. Real logos only for products the speaker names.

## 7. Quality gate (before every delivery, you LOOK; exit code 0 proves nothing)

1. `npm run stills -- <t1> <t2> ...` with one time in the hook, the middle of each card, a zoom, a punch, a B-roll
   and the CTA (6-10 times). Read every image (`out/stills/*.jpg`, half size).
2. `npm run stills -- --safe <hook> <card> <cta>`: red = Instagram covers it (top 250 px, below y 1500, right rail
   x > 910 at y 1000-1500). No text, logo or button may touch red.
3. Check each still: text contrast (no light text on light), nothing clipped or cut at the edges, Hebrew reads
   right to left, English names not flipped, the caption not on the face, the face not cut at the forehead in the
   window (move `face.y`), no empty colored half of the frame, cards readable (key text 44 px+ at full size).
4. After `npm run finish`, read its output: integrated loudness must be -14 LUFS (+-1) and true peak at or below
   -1 dB. Much quieter than -20 before the fix means the source audio is weak: tell the student.
5. Spot-check the final file: `npx remotion ffmpeg -ss 12 -i out/reel_final.mp4 -frames:v 1 out/check.jpg` at 2-3
   moments and look.
6. Anything ugly: fix the config (or the component), re-run the stills, then render again.

To compare looks for the student without editing the config: `npm run stills -- --look glass 3 9 20`.

## 8. Render commands and output

| Command                                                                               | Output                                                                         |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `npm run render`                                                                      | `out/reel.mp4` (h264, crf 18, video audio + SFX)                               |
| `npm run finish`                                                                      | `out/reel_final.mp4`, loudness -14 LUFS / TP -1.5, faststart. Deliver this one |
| `node scripts/finish.mjs out/reel.mp4 --max-mb 8`                                     | same, re-encoded to fit a size                                                 |
| `npx remotion render src/index.ts Reel out/hook.mp4 --frames=0-120`                   | quick 4 s hook preview                                                         |
| `npx remotion render src/index.ts Reel out/reel_glass.mp4 --props='{"look":"glass"}'` | another look, same config                                                      |
| `npm run studio`                                                                      | live preview in the browser (scrub, check timing)                              |

Slow or out of memory: `--concurrency=2`. A frame that shows the wrong word: fix `src/words.json` times by hand.

## 9. Troubleshooting

- `Video public/input.mp4 not found`: copy the video there, or fix `"video"` in the config.
- `Word "X" not found`: the word in `"@X"` must exist in `src/words.json` (prefixes ו/ה/ב/ל/ש/כ/מ are matched).
- Whisper build fails on Mac: run `xcode-select --install`, delete `~/.motion-reel-pop/whisper.cpp`, retry.
- Bad Hebrew transcript: always pass `--script`; or try `--model large-v3` (3 GB, slower, more accurate).
- Captions late or early everywhere: the video has a different start; re-run transcription on the exact final file.
- Fonts look like Arial: the render had no internet; render again online.

## Limits (tell the student when relevant)

- 9:16 input only. A 16:9 video gets cropped to the middle.
- Whisper Hebrew is good, not perfect: always use the script, or read the transcript and fix words.
- No face tracking: `face` is one fixed point. A speaker who walks around the frame may leave the zoom center.
- B-roll is the student's own files or text beats; the skill does not find or generate footage.
- Remotion is free for individuals and companies of up to 3 people; bigger companies need a Remotion company license.

## Files

- `template/` runnable project: `src/reel.config.json` (the only file you normally edit), `src/words.json`,
  `src/Reel.tsx` (layer order), `src/components/` (Stage, Captions, Cards, Surface, Punch, Overlays),
  `src/looks.ts` (tokens), `src/layout.ts` (geometry, safe zones, easing), `scripts/` (transcribe, import-captions,
  stills, finish), `public/sfx/`. `src/DemoSpeaker.tsx` is only the placeholder for the smoke test.
- `references/config.md`: every config field with examples. `references/example-config.json`: the demo reel's
  config (a real 42 s HeyGen video, Pop look). `references/looks.md`: when to choose which look, and how to add one.
- `examples/`: `preview.mp4` (Pop, full demo) and stills of all 4 looks.
