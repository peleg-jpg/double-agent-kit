# The 4 looks: full numbers

Source of truth: `template/src/looks.ts`. World units: the phone is 2.6 x 5.4, centred at y = -1.25.
Camera fov is 30 unless noted. Times in seconds, authored for an 11 s phone intro, 10 s laptop, 5 s end card.

## Shared structure (all looks)

| Beat | Phone intro | What moves |
|---|---|---|
| Entrance | `deviceIn` + spring | Phone rises 6 units, unrotates 0.95 rad on Y and 0.45 rad on X, scales 0.92 to 1 |
| Title | `titleIn`, `titleStagger`, `titleDur` | Each line: right-to-left clip wipe with a thin light edge on the wipe front, depth grows from 4% to 100%, line tilts up 0.55 rad to 0 and rises 0.45 x size. Easing bezier(0.16, 1, 0.3, 1) |
| Kicker pill | `titleIn + 0.5`, 0.6 s | Fades and rises 24 px, anchored 14 px above the projected top of title line 1 |
| Hold | 2.2 s to 8.6 s | Camera glides between keys, phone drifts 0.14 rad on Y and 0.12 up |
| Sweeps | `sweeps[]`, `sweepDur` | Point light travels x -5 to +5 at z 3.2 with a sine intensity curve, glass glare band crosses the screen diagonal |
| Square up | 8.6 s to 9.8 s | Phone rotation eases to 0 so the screen faces the lens |
| Push-in | 8.6 s to 10.15 s | Camera to (0, -1.25, 7.7), screen overfills the 9:16 frame |
| Handoff | 10.15 s to 10.4 s fade, then 10.4 s to 11.0 s scale | Full-frame video fades in at the matching scale (about 1.29), then eases to 1.0 (ease in-out cubic) |

Title: Secular One TTF, size 0.56 world units (phone), 0.74 (laptop), 0.8 (end card); depth 0.22, bevel 22% of
depth, line gap 1.35 x size, auto-shrink to maxWidth 4.0 (phone), 5.4 (laptop), 3.9 (end card).

Particles: dust layer (count, size 0.024 to 0.065 x look size, soft 0.1) + bokeh layer (bokeh count, size 0.25 to
0.6, soft 0.72, opacity x 0.32). Drift upward at `speed` with a 0.18 sideways sine, twinkle 0.65 to 1.0, fade
with depth between 14 and 48 units. All behind z = -1.

## studio-dark ("Slow Orbit")

| Item | Value |
|---|---|
| Background | radial #20242b to #050607, vignette 0.55, fog #07080a 18 to 46 |
| Lights | ambient 0.18; key #fff4e6 2.4 at (-6, 7, 9); rim #ffb547 3.2 at (7, 3, -6); fill #8fb3ff 0.5 at (6, -4, 6); sweep #ffffff 40 |
| Environment | RoomEnvironment, intensity 0.55 |
| Phone | frame #5a5e64, metalness 1, roughness 0.22, rest tilt Y 0.2 |
| Title | face #f4f1ea, sides #ffb547, metalness 0.35, roughness 0.35 |
| Pill | text #ffcf85 on rgba(255,181,71,0.14) |
| Particles | #aebdcc + 14% #ffb547, 1400 dust, 26 bokeh, speed 0.22, additive |
| Spring | damping 20, stiffness 90, mass 1 |
| Timing | deviceIn 0.15, titleIn 0.75, stagger 0.35, wipe 1.1, sweeps 2.4 and 7.0 (1.3 s) |
| Camera phone | 0 s (4.6, 1.4, 19.5) -> 2.2 s (1.7, 0.9, 17.6) -> 8.6 s (-1.7, 0.6, 17.0) -> 10.15 s push. Target (0, 0.3, 0) |
| Camera laptop | (7, 6, 26.5) -> 3 s (3.2, 3.6, 24.5) -> 10 s (-1.8, 2.8, 24) |
| Camera end card | (1.2, 0, 17.4) -> 5 s (-0.8, -0.2, 15.8), target (0, 0.2, 0) |

## clean-white ("Tabletop Float")

| Item | Value |
|---|---|
| Background | radial #ffffff to #e6e8ec, vignette 0.12, fog #eef0f3 22 to 60 |
| Lights | ambient 0.55; key #ffffff 2.0 at (-5, 8, 10); rim #dbe6ff 1.4; fill #ffffff 0.8; sweep 18 |
| Environment | intensity 0.9 |
| Phone | frame #d6d3cc (silver), roughness 0.22, rest tilt X -0.1, Y 0.1, contact shadow 0.32 |
| Title | face #111418, sides #2563eb |
| Pill | text #1d4ed8 on rgba(37,99,235,0.10) |
| Particles | #9aa3ae + #2563eb, 700 dust, 14 bokeh, normal blending (additive is invisible on white) |
| Spring | damping 26, stiffness 80 (no overshoot) |
| Timing | deviceIn 0.2, titleIn 0.8, stagger 0.3, wipe 1.0, one sweep 2.8 (1.4 s) |
| Camera phone | (0, 4.2, 19) -> 3 s (1.0, 3.0, 17.4) -> 8.6 s (-1.0, 2.4, 16.9) -> push. Target (0, 0.2, 0) |

## neon-night ("Low Arc")

| Item | Value |
|---|---|
| Background | radial #0b1626 to #020409, vignette 0.6, fog #03060c 16 to 42 |
| Lights | ambient 0.12; key #e8fbff 1.6; rim #22e4ff 5 at (-7, 2, -5); fill #ff4d6d 3.2 at (7, -2, -3); sweep #9ff3ff 45 |
| Phone | frame #1c2026, roughness 0.25, rest tilt Y -0.1 |
| Title | face #effdff, sides #22e4ff, emissive 0.25 |
| Pill | text #ff8fa3 on rgba(255,77,109,0.16) |
| Particles | #22e4ff + #ff4d6d, 2200 dust, 40 bokeh, size 1.35, speed 0.35 |
| Spring | damping 14, stiffness 110, mass 0.9 (slight overshoot) |
| Timing | deviceIn 0.1, titleIn 0.6, stagger 0.28, wipe 0.9, sweeps 2.0, 5.2, 8.0 (1.0 s) |
| Camera phone | (-7.5, -2.8, 14.5) -> 2.6 s (-1.6, 0.4, 17.4) -> 8.6 s (1.9, 0.9, 16.9) -> push |

## golden-hour ("Dolly Drift")

| Item | Value |
|---|---|
| Background | radial #3a2414 to #0d0805, vignette 0.5, fog #0d0805 18 to 48 |
| Lights | ambient 0.2; key #ffd9a8 2.8 at (-7, 8, 6); rim #ff8a3d 3.5; fill #6f8cff 0.35; sweep #ffe2b8 34 |
| Phone | frame #b89870 (gold titanium), roughness 0.32 |
| Title | face #fff4e2, sides #d9822b |
| Particles | #ffd59a + #ff8a3d, 1000 dust, 30 bokeh, speed 0.12 (slow floating dust) |
| Spring | damping 30, stiffness 70, mass 1.1 (heavy, calm) |
| Timing | deviceIn 0.25, titleIn 1.0, stagger 0.4, wipe 1.3, sweeps 3.0 and 7.6 (1.6 s) |
| Camera phone | (0, 0.7, 22.5) fov 26 -> 8.6 s (0.7, 0.5, 16.8) fov 30 -> push |

## Making a new look

Copy a whole entry, rename the id, then change in this order: background pair, title face/side (check contrast
first), rim light color, particles, camera keys. Keep 3-4 camera keys, keep the push-in key `PHONE_PUSH` last, keep
the camera between z 16.5 and 19.5 while the title is on screen (closer and the title clips on the orbit).
