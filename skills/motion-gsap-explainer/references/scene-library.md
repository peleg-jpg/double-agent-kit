# Scene library

Six scene types. Each one is a JSON object inside `scenes` in `video.json`. Every scene accepts `duration` (seconds) and `transition` (how this scene enters: `curtain`, `push`, `zoom`, `cut`). All times below are seconds from the scene's own start. Keep the defaults unless there is a reason: they were tuned so text holds on screen at least 1.5 s after it lands.

Global fields in `video.json`:

| Field                  | Default                     | Notes                                                                                               |
| ---------------------- | --------------------------- | --------------------------------------------------------------------------------------------------- |
| `palette`              | `night`                     | `night`, `paper`, `forest`                                                                          |
| `colors`               | `{}`                        | override any token: `bg surface surface2 fg muted accent accent2 onAccent line good bad glow`       |
| `fonts`                | Secular One / Heebo / Rubik | `{ "display": "...", "body": "...", "ui": "..." }`. Installed: Secular One, Heebo, Rubik, Assistant |
| `fps`                  | 30                          | 30 for reels. 60 only if the student's edit is 60 fps                                               |
| `transition`           | `curtain`                   | default transition for every scene; a scene can override                                            |
| `rules`                | true                        | `false` hides the two hairlines at the safe-zone edges                                              |
| `music`, `musicVolume` | none, 0.25                  | optional bed, faded out over the last 0.8 s                                                         |

Mixed Hebrew + English: just write it (`"הכל מתוך Claude Code"`). The engine groups consecutive Latin words into one isolated run, so word order stays right. Never pre-wrap English words yourself.

---

## 1. `counter`: number + chart

Default 4.5 s, hero still at 82%.

```json
{
  "type": "counter",
  "kicker": "הקהילה שלנו",
  "value": 3900,
  "prefix": "",
  "suffix": "+",
  "decimals": 0,
  "label": "בוגרים",
  "sub": "שכבר בנו לעצמם סוכן AI ראשון",
  "chart": {
    "kind": "bars",
    "values": [8, 19, 34, 58, 100],
    "labels": [],
    "lastLabel": "היום"
  }
}
```

- `value` rolls like an odometer (each digit column spins, right-most spins most). Formats as `3,900`.
- `prefix` / `suffix`: symbols (`$`, `+`, `%`, `x`) stay inside the number. A Hebrew word (`"שעות"`) is placed beside the number in the RTL row, smaller, in the accent color.
- `chart.kind`: `bars` (last bar in accent, `lastLabel` above it) or `line` (draws left to right, dot pops at the end). Charts are LTR on purpose: time runs left to right even in Hebrew media.
- `values` are relative heights. If the student has no real numbers, use a plain rising shape and NO axis labels; never invent data.

| t           | element         | motion                                            | ease                        |
| ----------- | --------------- | ------------------------------------------------- | --------------------------- |
| 0.10        | kicker          | y -30 to 0, fade, 0.45 s                          | power3.out                  |
| 0.20        | number          | scale 0.86 to 1, fade, 0.60 s                     | expo.out                    |
| 0.25        | digits          | roll 0 to value, 1.6 s (columns finish staggered) | power3.out                  |
| 0.55        | label           | x +90 to 0 (from the right), 0.55 s               | power4.out                  |
| 0.80        | sub             | y 24 to 0, 0.50 s                                 | sine.out                    |
| 0.90        | bars            | scaleY 0 to 1, 0.70 s, stagger 0.08               | expo.out                    |
| 0.90        | line            | stroke draws 1.2 s; area fades 1.4; dot at 2.05   | power2.inOut, back.out(2.5) |
| 0.95        | label underline | scaleX from the right, 0.50 s                     | power2.out                  |
| 0.85 to end | number          | breathe scale 1 to 1.03                           | sine.inOut                  |

## 2. `list`: kinetic list

Default 5 s. Best with 3 items (max 4), each under ~40 characters.

```json
{
  "type": "list",
  "title": "3 טעויות שעולות לכם בלקוחות",
  "highlight": "טעויות",
  "icon": "x",
  "items": [
    "עונים לליד רק למחרת",
    "זורקים מחיר לפני שמבינים מה הוא צריך",
    "לא חוזרים אחרי ״אני אחשוב על זה״"
  ]
}
```

- `highlight`: a short phrase (1-2 words) that appears exactly inside `title`; gets a marker sweep from the right.
- `icon`: `x` (mistakes, red), `check` (wins, green), `none`.
- `ghost`: big faint background text, default = number of items.

| t             | element      | motion                                    | ease          |
| ------------- | ------------ | ----------------------------------------- | ------------- |
| 0.15          | title words  | y 46 to 0, fade, 0.50 s, stagger 0.06     | power3.out    |
| T+0.25        | marker       | scaleX 0 to 1 from the right edge, 0.45 s | power2.inOut  |
| 0.95 + i*0.55 | row i        | x +120 to 0, fade, 0.55 s                 | expo.out      |
| row+0.10      | number badge | scale 0, rotate -90 to 0, 0.50 s          | back.out(2.2) |
| row+0.35      | icon         | stroke draws, 0.35 s                      | power2.out    |

## 3. `logos`: tool reveal grid

Default 4 s. 2 or 4 tools look best (2 columns).

```json
{
  "type": "logos",
  "title": "הכלים שבונים לכם את הריל",
  "sub": "",
  "tools": [
    {
      "name": "Claude",
      "role": "כותב ועורך",
      "glyph": "spark",
      "color": "#D97757"
    },
    {
      "name": "ElevenLabs",
      "role": "הקול שלכם",
      "glyph": "pause",
      "color": "#F6F1E9",
      "ink": "#12100E"
    }
  ],
  "footer": "הכל מתוך Claude Code"
}
```

- Glyphs are drawn shapes, NOT the real logo files (trademarks): `spark`, `wave`, `pause`, `avatar`, `nodes`, `play`, `chat`, `bolt`, `letter` (first letter of `name`).
- `color` = tile color, `ink` = glyph color (default white). Light tile needs dark ink.

| t                | element                    | motion                            | ease          |
| ---------------- | -------------------------- | --------------------------------- | ------------- |
| 0.10             | title                      | y -40 to 0, 0.50 s                | power3.out    |
| 0.45 + i*0.14    | tile i (first = top right) | scale 0.6, y 60 to 1, 0.65 s      | back.out(1.5) |
| tile+0.15        | glyph                      | rotate -120, scale 0 to 1, 0.70 s | back.out(2)   |
| tile+0.25        | name, role                 | x +40 to 0, 0.40 s, stagger 0.06  | power2.out    |
| last+0.60        | footer pill                | y 40 to 0, 0.50 s                 | expo.out      |
| last+0.70 to end | grid                       | breathe scale 1 to 1.025          | sine.inOut    |

## 4. `ui-click`: app mockup with a cursor

Default 5.5 s. Keep `typed` under ~45 characters.

```json
{
  "type": "ui-click",
  "title": "ככה זה נראה בפועל",
  "app": "הסוכן שלי",
  "appGlyph": "chat",
  "placeholder": "מה לעשות היום?",
  "typed": "תכתוב לי סקריפט לריל על מבצע",
  "button": "שלח",
  "result": "הסקריפט מוכן, 3 גרסאות",
  "resultLines": 3
}
```

| t     | element     | motion                                                            | ease                    |
| ----- | ----------- | ----------------------------------------------------------------- | ----------------------- |
| 0.10  | title       | y -36 to 0, 0.50 s                                                | power3.out              |
| 0.30  | app window  | y 90, scale 0.94 to 1, 0.70 s                                     | expo.out                |
| 1.00  | cursor      | glides in to the field, 0.60 s                                    | power2.inOut            |
| 1.62  | click       | ripple scale 0.2 to 2 + fade, 0.45 s; cursor squash 0.86          | power1.out              |
| 1.70  | typing      | one char at a time, 0.045 s per char, max 1.4 s                   | none                    |
| +0.15 | cursor      | moves to the button, 0.50 s                                       | power3.inOut            |
| +0.58 | press       | button 0.92 for 0.08 s, back with back.out(3) 0.30 s              |                         |
| +0.20 | result card | y 40 to 0, 0.50 s; check pops; skeleton lines grow from the right | expo.out, back.out(2.5) |

Cursor targets are read from the real layout, so changing text never breaks the cursor path.

## 5. `before-after`: stacked split

Default 5 s. 2-3 items per side.

```json
{
  "type": "before-after",
  "before": {
    "label": "לפני",
    "title": "עורך ידני",
    "items": ["4 שעות על כל ריל", "תלוי בזמן של מישהו אחר"]
  },
  "after": {
    "label": "אחרי",
    "title": "Claude Code",
    "items": ["20 דקות לריל מוכן", "אתם שולטים בכל פריים"]
  }
}
```

| t           | element      | motion                                         | ease          |
| ----------- | ------------ | ---------------------------------------------- | ------------- |
| 0.10        | before panel | clip reveal from the right edge, 0.60 s        | power3.inOut  |
| 0.45        | before items | x +60 to 0, 0.45 s, stagger 0.12; x icons draw | power2.out    |
| 1.45        | arrow chip   | scale 0, rotate -90 to 0, 0.45 s               | back.out(2.5) |
| 1.55        | after panel  | clip reveal from the right edge, 0.60 s        | expo.inOut    |
| 1.60        | before panel | dims to 0.6, scale 0.97, 0.50 s                | power2.out    |
| 2.00        | after items  | x +60 to 0, 0.50 s, stagger 0.14; checks draw  | expo.out      |
| 2.60 to end | after panel  | breathe scale 1 to 1.02                        | sine.inOut    |

## 6. `quote`: quote or stat card

Default 4.5 s. Quote under ~60 characters.

```json
{
  "type": "quote",
  "quote": "הסוכן עונה ללידים שלי גם כשאני ישן",
  "highlight": "גם כשאני ישן",
  "author": "דנה, בעלת סטודיו",
  "role": "בוגרת המחזור הראשון",
  "stat": { "value": 3, "prefix": "x", "label": "יותר פגישות בחודש" }
}
```

- Only real quotes from real people, with permission. Otherwise drop `author` and use it as a statement card.
- `stat.value` as a number rolls like the counter; as a string (`"24/7"`) it is shown as is. Hebrew words go in `stat.label`, not in prefix/suffix.

| t      | element    | motion                                | ease          |
| ------ | ---------- | ------------------------------------- | ------------- |
| 0.10   | quote mark | scale 0.4, rotate -12 to 0, 0.60 s    | back.out(1.8) |
| 0.30   | words      | y 24 to 0, 0.45 s, stagger 0.05       | power2.out    |
| T+0.20 | marker     | scaleX from the right, 0.50 s         | power2.inOut  |
| T+0.30 | rule       | scaleX from the right, 0.50 s         | expo.out      |
| T+0.45 | author     | x +40 to 0, 0.45 s                    | power3.out    |
| T+0.70 | stat card  | y 60 to 0, 0.60 s; number rolls 0.9 s | expo.out      |

---

## Transitions (between scenes)

| Name                | What it does                                                  | Timing around the cut `b`                                          | Use for                  |
| ------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------ |
| `curtain` (default) | accent panel + fg panel sweep right to left, swap under cover | in 0.26 s power2.in from b-0.30 / b-0.24, out 0.30 s power2.out    | topic change, energetic  |
| `push`              | outgoing slides up, next slides up from below (like a swipe)  | 0.60 s expo.inOut from b-0.30                                      | "and then", continuation |
| `zoom`              | outgoing scales to 1.12 and fades, next scales 0.92 to 1      | out 0.50 s power2.in from b-0.25, in 0.50 s power3.out from b-0.10 | reveal, result           |
| `cut`               | hard cut                                                      | 0                                                                  | disruption, beat drop    |

Rules: every element enters with an animation; no scene fades its content out before a transition (the transition is the exit); only ambient "breathe" motion during the hold, never constant wobble.

## Adding a new scene type

Copy any file in `src/scenes/`, register `MX.scenes["name"] = { duration, hero, build(el, props, ctx) }`, return a `gsap.timeline()` of entrances, add the script tag in `index.html`, add the default duration to `SCENE_DEFAULTS` in `scripts/lib.mjs`. No `onUpdate` callbacks (HyperFrames seeks with events suppressed), no `Math.random`, no `repeat: -1`.
