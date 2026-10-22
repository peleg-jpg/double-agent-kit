# Choosing and extending looks

## Pick by content

| The video is mostly...                                       | Look  | Why                                                               |
| ------------------------------------------------------------ | ----- | ----------------------------------------------------------------- |
| a new tool, news, "3 tips", high energy                      | pop   | color blocks and springs read as "launch", confetti on the payoff |
| expertise, premium service, calm explanation, B2B            | glass | frosted panes over the blurred room feel expensive and quiet      |
| a strong opinion, a myth, "stop doing X", short punchy lines | mono  | black, white and one accent: the words are the design             |
| a tutorial, steps, "N tools", a list the viewer will save    | split | the top panel is always readable, the face stays small and steady |

Second reel for the same student: use a different look than the last one they posted, so the feed does not repeat.

## What each look must never do

- Pop: no more than 3 confetti moments, no satin cards on top of each other, no rainbow (one wall + one card color per beat).
- Glass: no white cards (always translucent), no hard cuts, no more than 2 punches.
- Mono: no rounded corners, no gradients, no second accent color, no soft fades on cards.
- Split: no full-face stretches longer than a zoom, no captions inside cards.

## Origin of the numbers

The timings come from reels that were tested on real audiences: spring {damping 11, mass 0.6, stiffness 180} for
pops (3-6% overshoot reads as "satisfying", more reads as "cartoon"); 0.35 s layout morphs; holds of 1.5-2.5 s for
anything the viewer must read; one visual change every 2-3 s ("too fast, I cannot read" happens at ~1 s); captions in
2-4 word pages that stay, never single-word flashes; payoff text with blur-in and a 0.2 s shake; captions kept off
the face and inside the Instagram safe zones.

## Adding a fifth look

1. Add the id to `LookId` in `src/config.ts` and a token block in `LOOKS` (`src/looks.ts`): fonts, colors, `em`, springs.
2. Every component switches on `look.id` (Stage backdrop + frame, Captions `Word`, Surface, Cards `enterStyle`,
   Punch, BRoll, Progress). Add a branch in each; the default branch is Split, so a missing branch still renders.
3. Render stills of the hook, a card, a zoom, a punch and the CTA with `--look <id>` and `--safe`, and look at them.
