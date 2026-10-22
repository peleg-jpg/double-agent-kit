# The look that works (read before planning the edit)

This is how Peleg's reels that perform are edited, measured frame by frame. The default motion-reel-pop rhythm
(talking face, a card now and then) makes a clean talking head. That is NOT the target. The target is a motion-graphics
reel with real proof, where the full-screen face is the exception.

## The gold example: "Agent Skills" (41 s, glass style)

Look at `../examples/gold-agentskills-1fps.jpg` now: one frame per second, the label is the second. Then read this.

| Seconds   | Beat         | What he says (short)                               | On screen                                                                                                                         | Face             |
| --------- | ------------ | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 0-3.9     | Hook         | סקיל אחד גורם לקלוד קוד לעבוד כמו צוות פיתוח בגוגל | A spec page turns into task cards that tick off. Headline below, key words in color. Logos.                                       | none             |
| 3.9-4.8   | Hook payoff  | וזה בחינם                                          | One big word "חינם" + a small "MIT" badge                                                                                         | none             |
| 4.8-9.0   | Proof        | מי שהיה דירקטור בגוגל העלה לגיטהאב 25 סקילים       | The real GitHub profile card (photo, "Former Director at Google"), Google + GitHub logos, a "25" counter with 25 tiles filling in | panel below      |
| 9.0-10.3  | Name         | קוראים לזה Agent Skills                            | The repo's own title art, then a logo chip "Agent Skills" with the real star count                                                | none             |
| 10.3-17.4 | How it works | כותבים /spec, הוא שואל את כל השאלות וכותב מסמך     | A "Claude Code" terminal typing `/spec` (panel below), then SPEC.md filling in section by section                                 | panel, then none |
| 17.4-22.6 | Item 1       | מעלה מקרים שלא חשבתם עליהם, לקוח שמזמין פעמיים     | "Open questions" warnings, then a calendar where two bookings collide at 10:00                                                    | none             |
| 22.6-29.0 | Item 2       | /plan מפרק למשימות, /build בונה אחת אחת            | The command bar /spec /plan /build /test /review /ship lighting up, a task list ticking off one by one                            | none             |
| 29.0-31.5 | Re-hook      | ותכלס החלק הכי טוב                                 | Full face, the words big in the caption band                                                                                      | FULL             |
| 31.5-36.5 | Payoff       | התוכנית נשמרת בקבצים, גם כשהשיחה מתבלגנת           | File tabs SPEC.md / plan.md / todo.md, the old chat closes, a new one runs /build on the same list                                | none             |
| 36.5-38.5 | Bridge       | (name again)                                       | Logo chip, face in the panel below                                                                                                | panel below      |
| 38.5-41   | CTA          | תגיבו "תכנון" ואני שולח לכם את הלינק               | Full face + an Instagram comment card with the keyword "תכנון"                                                                    | FULL             |

Measured (1 frame per second): full-screen face **10%**, face in a panel under a graphic **24%**, no face **66%**.
Another of his reels with a different style measured full face 20%, panel 57%, no face 23%. The styles differ;
the skeleton is the same.

## The rules behind it (targets for every reel)

1. **Full-screen face only at the re-hook ("ותכלס...") and the CTA: at most 20% of the reel.** Everywhere else the
   face is either in a window under a graphic, or gone. The base layer of motion-reel-pop is the talking face, so
   schedule cards, B-roll and punches to cover at least 75% of the time between the hook and the CTA. Two cards in a
   row are fine; this beats motion-reel-pop's "alternate with talk" rhythm.
2. **Something changes every 1-2 seconds.** A new card, a new row appearing on its word, a counter, a cut to proof.
   No visual may sit still for more than 3 seconds.
3. **Every claim has a real thing on screen**: the real website, the real GitHub page, the real number, the student's
   own screenshot. If there is nothing real for a beat, a big clean graphic of the idea (a `steps` or `text` card),
   never a made-up interface or number.
4. **Things land on the spoken word**: the logo when the name is said, the counter when the number is said, each row
   when its item is said (use `"@word"` times, never round seconds).
5. **Big and full**: a proof image fills the width of the safe box (about 980 px wide, between y 380 and 1000). Never
   a whole web page shrunk small. Crop to the part that matters.
6. **Logos**: show the product's logo when its name is first said (`tool` card with `logo`).
7. **CTA**: the keyword big, as the thing to comment ("תגיבו "<keyword>""), held to the end.
8. **Voice**: 1.12x speed (already done in step 3). About 35-40 seconds, the 7 beats.

## Getting proof (free, no keys, a few minutes)

Save everything in `public/broll/` inside the reel folder.

- **Logo**: `curl -fsSL -o public/broll/<name>.svg https://cdn.simpleicons.org/<name>/white` (lowercase brand name,
  for example github, notion, google, anthropic). Not found (404)? Use the site icon:
  `curl -fsSL -o public/broll/<name>.png "https://www.google.com/s2/favicons?domain=<domain>&sz=256"`.
- **Screenshot of a real page** (official site, GitHub repo, App Store page, the student's own site): the editing
  engine already has a Chrome. Find it once (it is in the shared engine, or in the reel folder after `npm i`):
  `CH=$(find ~/.double-agent/engine/node_modules/.remotion node_modules/.remotion -type f \( -name chrome-headless-shell -o -name chrome-headless-shell.exe \) 2>/dev/null | head -1)`
  (still empty? run `npx remotion browser ensure` inside the reel folder and search again), then
  `"$CH" --headless --disable-gpu --hide-scrollbars --window-size=360,640 --force-device-scale-factor=3 --virtual-time-budget=8000 --timeout=15000 --screenshot=public/broll/shot_<name>.png <url>`
  (a sharp 1080x1920 phone-size shot with big text). It may exit with code 1 when the 15 s timeout fires: the file
  is what counts. LOOK at it. A "Verifying...", "Just a moment" or Cloudflare page means the site blocks automatic
  browsers (openai.com and chatgpt.com do): take that page with Claude in Chrome if the user has it, or ask the user
  for a screenshot (Mac: Cmd+Shift+4, Windows: Win+Shift+S) of exactly the part you need.
- **Frame the proof** for a full-frame B-roll: crop a wide strip with the part that matters (about 1080x680 from a
  phone-size shot), then place it in the safe box, y 380-1000 (clear of the label pill above and the Instagram
  button rail below):
  `ffmpeg -y -i public/broll/shot_<name>.png -vf "crop=<w>:<h>:<x>:<y>,scale=980:620:force_original_aspect_ratio=decrease,pad=1080:1920:(1080-iw)/2:380:color=0x141B2E" -frames:v 1 public/broll/<name>_framed.png`
  Use the look's background color instead of 0x141B2E. Then LOOK at the framed image: the key words must read
  easily on a phone.
- **Real numbers** (GitHub stars, followers, prices): read them off the page or
  `curl -s https://api.github.com/repos/<owner>/<repo>` (field `stargazers_count`). Only numbers you saw at a source.
- **Not a tech tool** (a studio, a clinic, a shop)? Ask the student for 3-5 phone screenshots or photos: their
  Instagram profile, a Google review, the product, a before/after, a booking screen. Frame them the same way.
- Never use footage from another creator's video, and never show another creator's name or handle.

## Building it in motion-reel-pop

| In the gold example                  | In motion-reel-pop                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------ |
| Hook headline + face below           | `hook` (text = the hook line, `kicker` = 1-3 words); the face window is built in           |
| Big single word ("חינם")             | `punches` (max 3)                                                                          |
| GitHub profile, repo page, any proof | `broll` with `src: "broll/<name>_framed.png"`, 1.5-3 s, on the word                        |
| Logo + name + real stars             | `tool` card with `logo` and a short `sub` ("98K כוכבים בגיטהאב")                           |
| "25" counter                         | `stat` card on the spoken number                                                           |
| Task list ticking / command bar      | `steps` card, each row `at` its spoken word (max 5 rows); split a longer list into 2 cards |
| Ideas without proof (calendar clash) | `text` card or a type beat (`broll` with `text`)                                           |
| Re-hook full face                    | leave it as talk, add one `zoom` on the payoff word                                        |
| Comment CTA                          | `cta` with `button: "תגיבו \"<keyword>\""`                                                 |

The split look (`look: "split"`) shows every B-roll and card in the top panel with the face below the whole time,
like the second reference reel. Pop, glass and mono cut B-roll to full screen with no face, like the gold example.

## The audit (do it before the full render, and again on the final file)

1. Render one still per second (old stills would mix in, so clear them first):
   `rm -rf out/stills && npm run stills -- $(seq 0 1 <last second>)`.
2. Tile them in order, 10 per row:
   `ls out/stills/<look>_*.jpg | grep -v safe | sort -t_ -k2 -g | sed "s|.*|file '$PWD/&'|" > out/sheet.txt && ffmpeg -y -f concat -safe 0 -i out/sheet.txt -vf "scale=216:-1,tile=10x5:padding=4" -frames:v 1 out/sheet.jpg`
   (frame N is second N, left to right, top to bottom).
3. LOOK at `out/sheet.jpg` next to `../examples/gold-agentskills-1fps.jpg`. Count FULL (face fills the frame),
   PANEL (face in a window under a graphic) and NONE (no face, or a blurred face behind a graphic).
4. Pass only if: FULL is 20% or less, no 4 frames in a row look the same, every named product shows its logo or page,
   and the CTA keyword is on screen at the end. Otherwise add cards or proof where the face is full, and repeat.
5. Tell the student the numbers in one line ("פנים מלאות 15%, הוכחות על המסך ב-8 מקומות").
