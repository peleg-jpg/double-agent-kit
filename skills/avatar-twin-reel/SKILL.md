---
name: avatar-twin-reel
description: The whole "סוכן כפול" machine in one skill - topic, Hebrew script, the user's cloned voice (ElevenLabs), their talking avatar (HeyGen) and a finished edit (motion-reel-pop template), ending in final_reel.mp4. Also edits an avatar video the user already has. Use for "תכין ריל", "תכין לי ריל עם האווטאר שלי", "סוכן כפול", "תערוך לי את הסרטון של האווטאר", "make a reel", "avatar reel". Stops for approval at topic, script, cost and final video.
---

# Avatar Twin Reel ("סוכן כפול")

You produce one finished vertical reel (1080x1920, 30-40 seconds) in Hebrew, in the user's cloned voice and with
their talking avatar. The user took the course "סוכן כפול" and is not technical. Run every command yourself.
Before each step, say in one short Hebrew sentence what you are doing and why. Never show API keys on screen.

The edit is done by the `motion-reel-pop` skill (installed with this kit). Its template is tested, so the result
looks edited, not generated. Do not build a Remotion project from scratch.

## Where things live

- Workspace: `~/double-agent/` (Windows: `%USERPROFILE%\double-agent\`). Create it if missing.
- Settings: `~/double-agent/my-settings.md`. Read it at the start of every run.
- One folder per reel: `~/double-agent/reels/<YYYY-MM-DD>-<short-english-slug>/`. Every file of that reel goes there.
- Course prompts and guides (copied by the installer): `~/double-agent/prompts/`, `~/double-agent/guides/`.

## Where to start

Ask nothing you can see for yourself. Pick the entry point from what the user said and has:

| The user has / says                                       | Start at                   |
| --------------------------------------------------------- | -------------------------- |
| "תכין ריל", nothing else                                  | step 1 (first run: step 0) |
| A topic or a link to a reel they loved                    | step 2                     |
| A ready script                                            | step 3                     |
| `voice.mp3` already made                                  | step 4                     |
| An avatar video (HeyGen export or any 9:16 talking video) | step 5: just edit it       |

## 0. First run only

**Check the machine** (fix what is missing, report in one line):

- `node -v` is 20 or newer. `ffmpeg -version` works (if not, `npx remotion ffmpeg` inside a reel folder does the
  same job after step 5's setup). `~/.claude/skills/motion-reel-pop/SKILL.md` exists.
- Anything missing: the kit was not installed. Tell the user to paste this into Claude Code and come back:
  `https://github.com/peleg-jpg/double-agent-kit תתקין בשבילי`.

**Check the connectors** with one cheap read call each:

- ElevenLabs: list the voices. HeyGen: `get_current_user`. Apify: optional, only for finding topics.
- Tool names change between connector versions. Look for a tool whose name contains the action
  (speech, voices, current_user, video, asset).
- A connector is missing: tell the user, in Hebrew, exactly this flow, then ask them to open a new chat:
  - ElevenLabs and Apify: Claude app > Settings > Connectors > + > Discover > search the name > Connect > Authorize.
  - HeyGen: Settings > Connectors > Add > Add custom connector. Name `HeyGen`, URL `https://mcp.heygen.com/mcp/v1/`.
    In Discover there is only "HyperFrames by HeyGen", which is a different tool.
  - Full guide: `~/double-agent/guides/חיבור-הכלים.md`. No API key is needed for any of the three.

**Settings.** If `my-settings.md` does not exist, ask these one at a time (each with a default), then save:

1. The name of their cloned voice in ElevenLabs. No voice yet: they need a paid ElevenLabs plan (Starter or
   higher, free has no cloning) and a 1-2 minute recording in a quiet room. Cloning is done on the ElevenLabs
   website (Voices > Add a new voice > Instant Voice Clone), or by you with Claude in Chrome if they have it.
   Use only the user's own voice, with the consent box ticked by them.
2. Their avatar photo: face to the camera, chest up, mouth closed, soft front light, quiet background, no
   sunglasses, portrait orientation. Copy it to `~/double-agent/avatar-photo.<ext>`.
3. Their business and audience, one sentence.
4. The comment keyword for the call to action (for example "מדריך") and what they send to people who comment.
5. Look: pop (default, energetic), glass (premium), mono (bold opinions), split (tutorials). Brand color optional.

Write `my-settings.md` with those answers plus two empty sections: `## HeyGen photo asset` and
`## Rules from corrections`.

## 1. Topic (gate 1)

Find what is hot this week with the Apify connector (YouTube Scraper, Instagram Reel Scraper) in the user's field,
or use links they paste. Offer 4-5 topics, one line each, each with the number that proves an audience (views,
likes, how many creators covered it). A good topic gives the viewer a new power. Skip tip lists, version news and
"be careful" topics. **Wait for the user to pick.** Then create the reel folder.

## 2. Script (gate 2)

If `~/.claude/skills/reel-script-hebrew/SKILL.md` exists, read it with its references and follow it (it gives 5
hooks, the script, `script.txt`, `tts.txt` and an Instagram caption). Use the settings for audience and keyword.
Otherwise write it with the 7-beat formula:

| Seconds | Beat           | What happens                                                       |
| ------- | -------------- | ------------------------------------------------------------------ |
| 0-4     | Hook           | Surprise, a number or the result. The tool's name is not said yet. |
| 4-8     | Proof          | Something concrete that shows it is real.                          |
| 8-12    | Name           | Only now reveal what it is.                                        |
| 12-20   | How it works   | In plain words, as if explaining to a friend.                      |
| 20-28   | Examples       | Two or three short examples.                                       |
| 28-35   | Best part      | "ותכלס, החלק הכי טוב..." to re-hook before viewers leave.          |
| 35-40   | Call to action | "תגיבו <keyword> ואני שולח לכם..."                                 |

Rules for a script that will be spoken by an AI voice: at most 110 words for 40 seconds. Short spoken sentences
that flow, no full stop after every word. No question marks (the voice rises): rewrite questions as statements.
English names in Hebrew letters in `tts.txt` (קלוד קוד, גיטהאב), in English in `script.txt` (Claude Code). No
dates or "last week". Plural "אתם" unless the user talks in singular. Never invent numbers, clients or results.

The user loved a video: fetch it with Apify, get its transcript (no transcript: ask them to paste the text), break
it into its parts (opening, proof, core, twist, close, length), save that recipe in `my-settings.md`, and write
the new script with the same structure on their own topic. Copy structure only, never their sentences.

Save `script.txt` (the exact words, used for captions) and `tts.txt` (the voice version). **Wait for approval.**
Every correction the user makes becomes a one-line rule under "Rules from corrections".

Right after approval, start the edit setup in the background (step 5, "Setup") so it is ready later.

## 3. Voice

ElevenLabs connector, text to speech, with `tts.txt` and the user's voice. Model Eleven v4 (or the newest
multilingual model the connector offers). Stability 0.85, similarity 0.6, style 0. Save as `voice_raw.mp3`.
Then speed it up for reel energy:

```bash
ffmpeg -y -i voice_raw.mp3 -filter:a atempo=1.12 -b:a 192k voice.mp3
```

Check: the length is 28-45 seconds, and `ffmpeg -i voice.mp3 -af volumedetect -f null -` shows a mean volume
louder than -35 dB. If the connector made two takes, keep the first one and tell the user where the second is.

## 4. Avatar (gate 3: cost)

HeyGen connector only. Never the HeyGen Video Agent (it makes its own full edit) and never a HeyGen API key (it
bills a separate dollar wallet).

1. `get_current_user` for the credit balance. A talking-photo video costs about 20 credits per minute, so a
   40-second reel is about 15 credits. **Tell the user the balance, the cost and the path of `voice.mp3` so they
   can listen first. Wait for "yes".**
2. Upload the photo once with `create_asset_upload`, a PUT of the file, then `complete_asset_upload`. Save the
   asset ID under "HeyGen photo asset" in `my-settings.md` and reuse it next time. Upload `voice.mp3` the same way
   every time.
3. `create_video_from_image`: Avatar IV, 1080p, portrait 9:16, low expressiveness, natural subtle head motion,
   the audio asset (not text).
4. Poll `get_video` every 30 seconds (it takes a few minutes; tell the user it is rendering). Download the result
   to `avatar.mp4` in the reel folder.
5. Check with `ffmpeg -i avatar.mp4`: 1080x1920 (or another 9:16 size), it has an audio stream, and the length
   matches `voice.mp3` within half a second.

A moving avatar (walking, hand gestures) is a different, paid route: `~/double-agent/prompts/5b_avatar_dynamic.txt`.
Use it only if the user asks for it.

## 5. Edit with motion-reel-pop

Read `~/.claude/skills/motion-reel-pop/SKILL.md` now, with `references/config.md`, and follow it exactly. It holds
the beat rules, the 4 looks, the Hebrew RTL rules and the quality gate. What changes for this pipeline:

**Setup** (inside the reel folder, so the reel folder becomes the edit project):

```bash
cp -R ~/.claude/skills/motion-reel-pop/template/. .
npm i
```

Windows PowerShell: `Copy-Item -Recurse -Force "$HOME\.claude\skills\motion-reel-pop\template\*" .` then `npm i`.

**Inputs:**

- Video: `cp avatar.mp4 public/input.mp4`. Its audio is already the final voice.
- Words: `npm run transcribe -- public/input.mp4 --script script.txt`. Read the printed transcript and fix wrong
  words in `captions.fix`. The first run downloads a 1.5 GB speech model once.
- Face: HeyGen chest-up photos sit at about `{x: 540, y: 600}`. Check it on a still as the skill says.
- Look and brand color from `my-settings.md`. Keyword: the `cta` button ("תגיבו <keyword>").
- Music: only a track the user has a license for, in `public/music.mp3` at volume 0.06-0.08. No track: no music.
  The built-in sound effects carry the edit.
- Visual variety matters most: the face should be full screen only around the hook, one emphasis point and the
  call to action. Use cards, type beats and the user's own screenshots (`public/broll/`) for the rest.

**Quality gate:** run the stills and safe-zone check from the motion-reel-pop skill and LOOK at every image. Fix
until clean. Then `npm run render` and `npm run finish`, and copy `out/reel_final.mp4` to `final_reel.mp4` in the
reel folder. Loudness must read -14 LUFS (plus or minus 1).

If the user came only to edit (they brought a video), use their video as `public/input.mp4` and their script, if
they have one, as `script.txt`. Everything else is the same.

## 6. Show (gate 4)

Open the video so it plays (`open final_reel.mp4` on Mac, `start final_reel.mp4` on Windows). Tell the user, in 3-5
short Hebrew lines: where the file is, the look you used, what happens in the hook, the cards and the ending. Save
the Instagram caption to `caption.txt`. Ask one question: "מה לשנות?".

Changes are config edits and a new render. Keep every version (`final_reel_v1.mp4`, `final_reel_v2.mp4`).

When the user says the reel is done, delete `node_modules` in the reel folder: it takes about 1 GB per reel, and
`npm i` brings it back if they want changes later. Tell them in one line.

Never publish, post, pay or message anyone yourself. Remind the user to turn on Instagram's "AI info" label.

## Costs (tell the user when they ask)

With the subscriptions, a reel costs about 2 dollars: HeyGen credits plus ElevenLabs characters. Everything else
(Claude Code skills, Remotion for individuals, ffmpeg, the speech model) is free.

## When something breaks

- HeyGen says the credits are too low: stop, tell the user the balance, never switch to an API key.
- The voice sounds flat or robotic: lower stability to 0.5 and make it again. Words read wrong: write them the way
  they sound in `tts.txt` (with niqqud if needed).
- A connector stopped answering: Settings > Connectors, reconnect it, open a new chat.
- Anything in the edit: the Troubleshooting section of the motion-reel-pop skill.

## Safety

- API keys, if a tool ever needs one, live in a local `.env` listed in `.gitignore`. Never print them, never paste
  them into chat, never upload them.
- Clone only the user's own voice and face, with their consent.
- Use only music the user has a license for.
