# reel.config.json, field by field

All times (`at`, `to`, `until`, step `at`) take either seconds (`12.4`) or a spoken word from `src/words.json`:

| Form                           | Means                                         |
| ------------------------------ | --------------------------------------------- |
| `"@Dots"`                      | when "Dots" is first said (start of the word) |
| `"@Dots#2"`                    | the second time it is said                    |
| `"@Dots>"`                     | when that word ENDS (use it for `to`)         |
| `"@Dots+0.3"` / `"@Dots>-0.2"` | with an offset in seconds                     |

Matching ignores punctuation and quote marks and accepts up to 3 glued Hebrew prefix letters (ו ה ב ל ש כ מ):
`"@בית"` matches "בבית" and "והבית". All times snap to the 1/30 s frame grid.

## Top level

| Field         | Type                                                           | Default / notes                                                                                                                                                 |
| ------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `look`        | `"pop"` `"glass"` `"mono"` `"split"`                           | `"pop"`                                                                                                                                                         |
| `video`       | file name inside `public/`                                     | `"input.mp4"`                                                                                                                                                   |
| `face`        | `{x, y}` px in the 1080x1920 frame, the point between the eyes | `{540, 600}` for HeyGen close-ups. Zooms center on it; card mode puts it at x 540, y 1265                                                                       |
| `brand`       | `{accent, accent2, logo, handle}`                              | `null` = the look's colors. `accent` = highlight/buttons, `accent2` = second color (Pop: active caption word)                                                   |
| `hook`        | `{text, kicker?, until}`                                       | `text` = opening line; `until` = end of that line (`"@שאלות>"`). Empty text = no hook                                                                           |
| `captions`    | see below                                                      |                                                                                                                                                                 |
| `zooms`       | `[{at, to, scale?}]`                                           | scale defaults: pop 1.22, glass 1.12, mono 1.30, split = full face                                                                                              |
| `cards`       | `[...]` see below                                              |                                                                                                                                                                 |
| `punches`     | `[{at, to, text, burst?}]`                                     | max 3. `burst: false` turns Pop confetti off                                                                                                                    |
| `broll`       | `[{at, to, src?, text?, label?}]`                              | `src` = `"broll/clip.mp4"` or `"broll/shot.png"` in `public/` (muted, images get a slow 8% push). No `src` = type beat with `text`. `label` = small pill on top |
| `cta`         | `{at, title, sub?, button, handle?}` or `null`                 | holds from `at` to the end. Button gets a tap with ripple 1.3 s after `at`                                                                                      |
| `progress`    | boolean                                                        | `true`                                                                                                                                                          |
| `sfx`         | boolean                                                        | `true`                                                                                                                                                          |
| `music`       | file in `public/` or `null`                                    | looped, faded in/out                                                                                                                                            |
| `musicVolume` | 0-1                                                            | `0.08` (under a voice: 0.06-0.10)                                                                                                                               |

## captions

| Field       | Default | Notes                                                                        |
| ----------- | ------- | ---------------------------------------------------------------------------- |
| `maxWords`  | 3       | words per page (2 for fast speakers, 4 for slow)                             |
| `maxChars`  | 16      | characters per page including spaces                                         |
| `highlight` | `[]`    | words always in the accent color (product names, the key noun). 2-4 per reel |
| `fix`       | `{}`    | display fixes for transcript words: `{"קלוד": "Claude", "צאט": "ChatGPT"}`   |
| `hide`      | `[]`    | extra no-caption windows: `[["@שלום", "@שלום>"], [20.1, 21.5]]`              |

Captions are hidden automatically under the hook, punches, the CTA, and during the 0.3 s face-window morph.

## cards

Every card has `at`, `to` (hold 1.5 s or more). Card mode starts at `at` (face goes to the window).

```json
{ "type": "tool",  "at": "@Notion", "to": "@Notion>+1.4", "name": "Notion", "sub": "כל המשימות במקום אחד", "logo": "logos/notion.svg" }
{ "type": "list",  "at": "@הראשון", "to": "@קוד>", "n": 1, "title": "Claude Code", "sub": "כותב לי את הקוד" }
{ "type": "steps", "at": "@פותחים", "to": "@שאלה>", "title": "איך מתחילים",
  "items": [ { "text": "פותחים ChatGPT", "at": "@פותחים" }, { "text": "נותנים לו שם", "at": "@נותנים" } ] }
{ "type": "stat",  "at": "@80", "to": "@מהזמן>", "value": 80, "suffix": "%", "label": "פחות זמן על עבודה שחוזרת" }
{ "type": "text",  "at": "@סוכן", "to": "@סוכן>+1.5", "title": "סוכן AI", "sub": "עובד בשבילכם גם בלילה" }
```

- `tool`: name in English as written by the company, monogram tile or `logo` (png/svg in `public/`).
- `list`: one numbered item per card. Use when each item gets 2 s or more.
- `steps`: one card, rows appear on their words, the newest row is highlighted. Best for 3-5 fast items. Max 5 rows.
- `stat`: counts from 0 to `value` in 0.8 s with ticks. `prefix`, `suffix`, `decimals` optional. Only numbers the
  speaker says.
- `text`: title + optional sub, no badge.

Card text: 2-5 words, casual Hebrew, our wording (not the full spoken sentence).

## Layout constants (src/layout.ts)

`CARD_ZONE {x 70, y 280, w 940, h 540}`, `SEAM_Y 892`, `WINDOW {x 60, y 965, w 960, scale 0.6, eyeY 1265, r 48}`,
`SPLIT_PLATE {x 36, w 1008, r 64}`, `TALK_CAPTION_Y 1330`, `SAFE {top 250, bottom 1500, rail x 910 y 1000-1500}`.
If a speaker's head is small in the frame (filmed far away), raise `WINDOW.scale` to 0.75 and lower `face.y` accordingly.
