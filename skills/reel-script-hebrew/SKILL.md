---
name: reel-script-hebrew
description: Write Hebrew Reel/TikTok scripts and hooks for a talking head or AI avatar (HeyGen, ElevenLabs). Concept, 5 hooks of different types, a 30-40 s timed script, a TTS-ready version, script.txt for word-by-word captions, an IG caption, and a shot plan for the motion skills. Triggers "תכתוב לי תסריט לריל", "תן לי הוקים", "פתיח לסרטון", "תסריט לאווטאר", "reel script", "hooks".
---

# Hebrew Reel Script + Hooks

You write the words of a short vertical video in natural spoken Israeli Hebrew: the hook, the script, the
voice-ready text, the caption. The student is usually a non-technical Israeli business owner who records
themselves or uses an AI avatar (HeyGen) with a cloned voice (ElevenLabs). The output feeds the motion skills
in this kit: `motion-reel-pop` (edit + word-by-word captions), `motion-gsap-explainer` (explainer B-roll) and
`motion-3d-cinematic` (3D intro and end card).

Load these before writing:

- [references/hooks.md](references/hooks.md): hook mechanisms and 8 Hebrew hook types with examples.
- [references/beat-sheet.md](references/beat-sheet.md): timing, word counts, re-hook, CTA.
- [references/hebrew-voice.md](references/hebrew-voice.md): word-level Hebrew rules and banned words.
- [references/tts.md](references/tts.md): how to turn the script into text an AI voice reads well.
- [examples/example-pilates.md](examples/example-pilates.md): one complete output, start to finish.

## 1. Ask only what you are missing

Use whatever the student already gave you. Ask in one short Hebrew message (4 questions at most), only for
what is missing. Rows with a default don't block: if the student skips them, use the default and say so.
Only "Topic" and "What actually happens" block. Write files only after the student picks a hook.

| Input                    | Ask                                                    | Default if they don't know                                    |
| ------------------------ | ------------------------------------------------------ | ------------------------------------------------------------- |
| Topic                    | "על מה הסרטון?"                                        | none, this one is required                                    |
| Audience                 | "למי הסרטון מיועד?"                                    | the student's own customers (ask what their business is)      |
| The real result or proof | "מה התוצאה שאפשר להראות? מספר, לפני ואחרי, משהו שקרה?" | no number; use a concrete before/after instead of a statistic |
| What actually happens    | "מה בדיוק קורה? מה הלקוח עושה, ומה הכלי או אתם עושים?" | none: ask. Every "how it works" line and every item needs it    |
| What the CTA sends       | "מה תשלחו למי שמגיב? לינק, מדריך, הסבר?"               | "איך עשיתי את זה" (a promise the student can always keep)      |
| A source reel to adapt   | "יש ריל שאהבתם ותרצו את המבנה שלו?"                    | write an original                                             |
| Length                   | "כמה ארוך? 30, 35 או 40 שניות?"                        | 35 s                                                          |
| CTA keyword              | "איזו מילה אנשים יגיבו כדי לקבל ממך משהו?"             | one Hebrew word tied to the topic, e.g. "מדריך"               |
| Who speaks               | "אתם מצלמים את עצמכם או אווטאר?"                       | avatar with an AI voice; write `tts.txt` only for an AI voice  |

Never invent results, numbers, clients, income, testimonials or product details. If there is no proof, the
script sells the capability and a concrete before/after, not a number. If a line needs a detail the student
did not give (how the booking works, what gets sent), ask for it, or write it and list it under
"לאשר לפני צילום" in `shot-plan.md` so the student confirms it.

## 2. Concept gate (3 lines, before any hook)

Write a 3-line header and check it:

- **קהל:** who exactly watches this.
- **תוצאה:** the one thing they get or can do after watching, in their words.
- **מילה אסורה:** the name of the tool or method being taught. It must not appear in the hook (it closes
  the curiosity). It comes later, around second 5-8.

Kill or reframe concepts whose core is caution, fear, checking or "before you X, check Y". People share
new capabilities, not warnings. If the topic is weak, say so and suggest a stronger angle.

## 3. Hooks: 5 options of different types

Read `references/hooks.md`, then give exactly 5 hooks, each a different type, numbered. For each:

- The spoken line (Hebrew, 10-13 words, one sentence, no question mark).
- The on-screen text for second 0-3 (2-5 words, a different angle from the spoken line, not a repeat).
- The beat-1 visual: what is on screen in the first 3 seconds. Never just the talking face. A striking
  graphic, the result itself, a screenshot, or a 3D intro (`motion-3d-cinematic`).
- One line: what the viewer now expects, so the body can pay it off.

If the student gave a source reel, option 1 is a faithful Hebrew adaptation of its hook (same claim, same
number, same structure, new words) and is the default recommendation. Otherwise mark your strongest one.
Wait for the student to pick (or edit) before writing the full script. Only if the student asked for
everything in one go ("תכתוב הכל"), continue with the recommended hook and say which one you used.

## 4. The script

Pick the shape in `references/beat-sheet.md` that fits the topic:

- **Tool or capability** (most reels): hook, proof, name, how it works, 2-4 items, re-hook at about 70%,
  CTA from about 85-90%.
- **Owner's own result** (a self-filmed business owner telling what changed): Before/after shape. When the
  hook already holds the proof number, drop the separate proof beat and use the time for one more item.
- **Tips** or **true story**: the matching shape in the beat sheet.

Word budget about 3.1 spoken Hebrew words per second (35 s = 105-112 words, hard cap 125). Count the
spoken version (numbers as words, like `tts.txt`). The percentages are guides; when they fight the word
counts, the word counts win.

**Person:** a self-filmed owner speaks as "אני" for their own story and result, then switches to "אתם/לכם"
for what the viewer gets. Make the switch at one clear point (usually "ואתם פשוט..."), not back and forth.

Deliver it as a table with one row per beat: time, the spoken text, the on-screen text or card, and the
visual. Then the full text as one block to read aloud. Count the words and state the estimated length.

Every benefit is said as a result for "אתם/לכם", never as a feature name. Test: could this line sit on a
pricing page feature list? Rewrite it.

## 5. Files to write (in the student's project folder)

| File           | What                                                                                             | Who uses it                                       |
| -------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| `script.txt`   | The script in caption spelling: brand names in English with a hyphen after a Hebrew prefix (ב-WhatsApp, עם Claude Code), digits as digits | `motion-reel-pop` (`--script`) for exact captions |
| `tts.txt`      | Only when an AI voice reads it (avatar, ElevenLabs). Per `references/tts.md`: loanwords in Hebrew letters, numbers as words, no "?" | paste into ElevenLabs or HeyGen |
| `hooks.md`     | The 5 hooks with on-screen text and beat-1 visual, the chosen one marked                         | the student                                       |
| `caption.txt`  | The Instagram caption (section 6)                                                                | the student                                       |
| `shot-plan.md` | Beat table with which motion skill makes each visual (section 7)                                 | you, when editing                                 |

If the student only asked for hooks, write only `hooks.md` and offer the script next.

## 6. Instagram caption

- Line 1: the comment CTA in plural, same keyword as the video: `תגיבו "<מילה>" ואני שולח/ת לכם <מה>`.
- Then 2-4 short lines that add an angle the video does not say word for word: an analogy, who it is for, or
  a tip built only on facts the student gave. No new claims.
- If a third-party clip, post or screenshot appears in the video, the last line is `קרדיטים: @handle`.
- No hashtag walls. 0-3 hashtags at most.

## 7. Shot plan for the motion skills

For every beat, say which skill makes the visual. Typical mapping:

| Beat               | Visual                                                     | Skill                                |
| ------------------ | ---------------------------------------------------------- | ------------------------------------ |
| Hook (0-3 s)       | the result, or the video inside a turning phone + 3D title | `motion-3d-cinematic` PhoneIntro     |
| Proof number       | counter with a rising chart                                | `motion-gsap-explainer` counter      |
| 2-4 items          | kinetic list, or a tool grid                               | `motion-gsap-explainer` list / logos |
| Before/after       | split before/after                                         | `motion-gsap-explainer` before-after |
| Whole talking part | word-by-word captions, zooms on strong words, cards        | `motion-reel-pop`                    |
| CTA                | end card with the keyword                                  | `motion-reel-pop` CTA or 3D EndCard  |

Mark the 3 strongest words (hook payoff, proof number, CTA keyword) as zoom/emphasis moments for
`motion-reel-pop`. If the hook already holds the proof number, the third is the re-hook benefit. Hide captions where a big on-screen title already says the same words.

## 8. Check before showing anything (all must be yes)

1. The concept sells a new capability or result the audience wants.
2. The hook is one sentence of 10-13 words, no question mark, no tool name, no fear or threat.
3. Every number and claim comes from the student or a named source. Nothing invented.
4. The body pays off exactly what the hook promised.
5. The re-hook adds a new benefit; it is not a recap.
6. The CTA keyword is the same in the video and on caption line 1.
7. Word count fits the length (section 4), and the hard cap of 125 words holds.
8. It reads as speech: run the text aloud in your head. No textbook words, no stacked fragments.
9. No em dash or en dash anywhere. Only "-".
10. None of the banned words in `references/hebrew-voice.md`.

## 9. After the student approves

Offer the next step in one line: record the video (or generate the voice from `tts.txt` and the avatar in HeyGen), then
"תערוך לי את הסרטון" with `motion-reel-pop`, which picks up `script.txt` for exact captions.

If the student rejects a draft, ask what bothered them in one line, keep their exact words, and after two
rejections change the angle and hook type completely instead of swapping adjectives.
