# Recipes: common student requests

## "תשים את הסרטון שלי בתוך טלפון בפתיחה"
1. Copy the template, `npm i`, copy their reel to `public/screen.mp4`.
2. Copy `props/phone-studio-dark.json` to `props/my-intro.json`. Set `titleLines` (their hook, 2 lines),
   `kicker` (topic or tool), `look`.
3. Stills (see SKILL.md gate), then `npx remotion render PhoneIntro out/my-intro.mp4 --gl=angle --props=props/my-intro.json`.
4. With `handoff: true` the video continues full frame at the end. To make the whole reel: render the intro, then
   append the rest of the reel from the second where the intro ends (11 s by default):
   `ffmpeg -i out/my-intro.mp4 -ss 11 -i public/screen.mp4 -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -crf 18 -c:a aac out/full-reel.mp4`
   (both files must be 1080x1920 30 fps; if the source is a different fps add `-r 30`).

## "רק הפתיח, בלי סאונד"
`volume: 0`, `handoff: false` (ends on the orbit, no push-in).

## "תתחיל את הסרטון מאמצע"
`videoStartSec: 12.5`. Audio and handoff follow the same start.

## "פתיח עם הקלטת מסך מהמחשב"
`LaptopIntro`. Put the screen recording in `public/`, `videoSrc: "screen-desktop.mp4"`, `fit: "contain"` keeps the
whole recording (thin bars on 16:9 into the 16:10 screen), `"cover"` fills and crops the sides slightly.
Laptop default is silent (`volume: 0`); voice-over goes in the main edit.

## "תעשה סיום עם קריאה לפעולה"
`EndCard`. `titleLines` = the ask as a question ("רוצים את ההוראה?"), `cta` = the exact action
("תגיבו \"עובד\" ואני שולח לכם"), optional `handle` ("@name") and `logo` (file in `public/`). 4-6 s.

## "בצבעים של המותג שלי"
`accent: "#HEX"` recolors the title sides, the pill and the end card rings. `frameColor` recolors the phone or
laptop body. If the brand color is dark, use it on a light look (clean-white); if bright, on a dark look.

## "הכותרת יוצאת מוזרה / חתוכה"
- Cut at the frame edge: shorten the line or lower `TITLE_SIZE` in the scene file (max ~14 characters per 3D line).
- Wrong order of Hebrew and English: the line is unusual for the mini bidi (nested quotes, numbers with
  separators, niqqud). Switch to `titleMode: "dom"`.
- Letters missing: the TTF has no glyph for that character (emoji, rare symbols). Remove it or use the DOM title.

## "תעשה עוד וריאציה"
Same props, different `look`. Render all 4 stills at frame 150 to show options side by side:
`for L in studio-dark clean-white neon-night golden-hour; do npx remotion still PhoneIntro out/$L.png --frame=150 --gl=angle --props=props/phone-$L.json; done`

## Render fails
- `Error creating WebGL context`: the GL flag is missing. Add `--gl=angle`, or `--gl=swangle` on a machine with
  no GPU.
- Timeout on `3D font`: the TTF path is wrong. It must be in `public/fonts/` and passed without `public/`.
- Black phone screen: `videoSrc` does not match the file name in `public/` (case sensitive on Mac).
- Codec errors on the video: re-encode the source once:
  `ffmpeg -i input.mov -c:v libx264 -pix_fmt yuv420p -c:a aac public/screen.mp4`.
