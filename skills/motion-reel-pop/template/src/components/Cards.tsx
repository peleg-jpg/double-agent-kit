// Pop-up cards (list item, tool, stat, text), the opening hook title and the CTA end card.
// All of them live in CARD_ZONE (y 280-820), above the face window.
import React from "react";
import { useCurrentFrame } from "remotion";
import { CARDS, config, CTA_AT, HOOK_END, Timed, CardSpec } from "../config";
import {
  CARD_ZONE,
  EASE,
  fitSize,
  FPS,
  HEBREW,
  ramp,
  springAt,
  useLook,
} from "../layout";
import { Look, POP_SETS, shade } from "../looks";
import { Monogram, Surface } from "./Surface";

// entrance/exit of a whole card, per look
const enterStyle = (
  look: Look,
  t: number,
  at: number,
  to: number,
): React.CSSProperties => {
  const exit = ramp(t, to - 0.2, 0.2, EASE.in);
  if (look.id === "pop") {
    const p = springAt(t, at, look.cardSpring);
    return {
      transform: `translateY(${(1 - p) * 160}px) scale(${(0.6 + 0.4 * p) * (1 - 0.15 * exit)}) rotate(${(1 - p) * -6}deg)`,
      opacity: Math.min(1, p * 3) * (1 - exit),
    };
  }
  if (look.id === "glass") {
    const p = ramp(t, at, 0.65, EASE.out);
    return {
      transform: `perspective(1400px) rotateX(${(1 - p) * 8}deg) scale(${0.94 + 0.06 * p})`,
      filter: `blur(${(1 - p) * 12 + exit * 6}px)`,
      opacity: p * (1 - exit),
    };
  }
  if (look.id === "mono") {
    const p = ramp(t, at, 0.32, EASE.out);
    return {
      clipPath: `inset(0 0 0 ${(1 - p) * 100}%)`,
      opacity: t < to ? 1 : 0,
    };
  }
  const p = ramp(t, at, 0.3, EASE.out);
  return {
    opacity: (0.18 + 0.82 * p) * (1 - exit),
    transform: `scale(${0.965 + 0.035 * p})`,
  };
};

// staggered element reveal inside a card
const useReveal = (look: Look, t: number, t0: number) => {
  if (look.id === "pop") {
    const s = springAt(t, t0, look.textSpring);
    return {
      opacity: Math.min(1, s * 2),
      transform: `translateY(${(1 - s) * 30}px)`,
    } as React.CSSProperties;
  }
  const p = ramp(t, t0, look.id === "mono" ? 0.25 : 0.45, EASE.out);
  return {
    opacity: p,
    transform: `translateX(${(1 - p) * (look.id === "mono" ? 60 : 0)}px) translateY(${(1 - p) * (look.id === "mono" ? 0 : 16)}px)`,
    filter: look.id === "glass" ? `blur(${(1 - p) * 8}px)` : undefined,
  } as React.CSSProperties;
};

const Txt: React.FC<{
  text: string;
  size: number;
  weight?: number;
  color: string;
  font: string;
  style?: React.CSSProperties;
}> = ({ text, size, weight = 800, color, font, style }) => (
  <div
    dir={HEBREW.test(text) ? "rtl" : "ltr"}
    style={{
      fontFamily: font,
      fontSize: size,
      fontWeight: weight,
      color,
      lineHeight: 1.08,
      textAlign: "right",
      ...style,
    }}
  >
    {text}
  </div>
);

const inkFor = (look: Look, setIndex: number) =>
  look.id === "pop"
    ? POP_SETS[setIndex % POP_SETS.length].ink
    : look.id === "glass"
      ? look.paper
      : look.ink;

const CardBody: React.FC<{
  c: Timed<CardSpec>;
  look: Look;
  t: number;
  setIndex: number;
  total: number;
}> = ({ c, look, t, setIndex, total }) => {
  const ink = inkFor(look, setIndex);
  const subInk =
    look.id === "glass"
      ? "rgba(255,253,249,.78)"
      : look.id === "pop"
        ? ink
        : "#4B5563";
  const W = CARD_ZONE.w;
  const titleFont = look.display;
  const r1 = useReveal(look, t, c.at + 0.12);
  const r2 = useReveal(look, t, c.at + 0.22);
  const r3 = useReveal(look, t, c.at + 0.32);
  const badgeColor =
    look.id === "pop"
      ? setIndex % 2
        ? "#FF3E8A"
        : "#FF6A2B"
      : look.id === "mono"
        ? look.ink
        : look.accent;

  if (c.type === "steps") {
    const items = c.items as unknown as { text: string; at: number }[];
    const cur = items.filter((it) => t >= it.at - 0.05).length - 1;
    const rowH = Math.min(96, (420 - (c.title ? 90 : 20)) / Math.max(1, items.length));
    const fs = Math.min(56, rowH * 0.6);
    return (
      <div style={{ height: "100%", direction: "rtl", padding: "30px 56px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
        {c.title && (
          <Txt text={c.title} size={46} weight={look.id === "mono" ? 400 : 800} color={look.id === "pop" || look.id === "mono" ? ink : look.accent} font={look.display} style={{ ...r1, marginBottom: 10, opacity: (r1.opacity as number) * 0.9 }} />
        )}
        {items.map((it, k) => {
          const r = useReveal(look, t, it.at - 0.05);
          const on = k === cur;
          const bs = rowH * 0.74;
          return (
            <div key={k} style={{ ...r, height: rowH, display: "flex", alignItems: "center", gap: 26, opacity: t < it.at - 0.05 ? 0 : on ? 1 : 0.55 }}>
              <div
                style={{
                  width: bs,
                  height: bs,
                  flex: "none",
                  borderRadius: look.id === "mono" ? 0 : look.id === "split" ? 16 : bs / 2,
                  background: on ? (look.id === "pop" ? badgeColor : look.id === "mono" ? look.ink : look.accent) : look.id === "glass" ? "rgba(255,255,255,.14)" : look.id === "pop" ? "rgba(0,0,0,.18)" : "#E5E7EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: look.display,
                  fontWeight: 900,
                  fontSize: bs * 0.56,
                  color: on ? (look.id === "mono" ? look.accent : look.id === "glass" ? look.ink : "#FFFFFF") : look.id === "split" ? "#6B7280" : ink,
                }}
              >
                {k + 1}
              </div>
              <Txt text={it.text} size={fs} weight={look.id === "mono" ? 400 : 800} color={ink} font={look.display} style={{ unicodeBidi: "plaintext" }} />
            </div>
          );
        })}
      </div>
    );
  }

  if (c.type === "stat") {
    const p = ramp(t, c.at + 0.15, 0.8, EASE.out);
    const val = (c.value * p).toFixed(c.decimals ?? 0);
    const numText = `${c.prefix ?? ""}${val}${c.suffix ?? ""}`;
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <div
          dir="ltr"
          style={{
            ...r1,
            fontFamily: titleFont,
            fontWeight: 900,
            fontSize: fitSize(numText, W - 120, 230, 120, 0.62),
            lineHeight: 1,
            color:
              look.id === "glass" || look.id === "split" ? look.accent : ink,
            textShadow:
              look.id === "pop"
                ? `0 10px 0 ${shade(POP_SETS[setIndex % 4].card, -0.3)}`
                : undefined,
            borderBottom:
              look.id === "mono" ? `18px solid ${look.accent}` : undefined,
            unicodeBidi: "isolate",
          }}
        >
          {numText}
        </div>
        <Txt
          text={c.label}
          size={fitSize(c.label, W - 140, 58, 40)}
          color={subInk}
          font={look.body}
          weight={700}
          style={{ ...r2, textAlign: "center" }}
        />
      </div>
    );
  }

  const badgeSize = look.id === "split" ? 150 : 190;
  const badge =
    c.type === "list" ? (
      <div
        style={{
          ...r1,
          width: badgeSize,
          height: badgeSize,
          flex: "none",
          borderRadius:
            look.id === "mono" ? 0 : look.id === "split" ? 30 : badgeSize / 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            look.id === "pop"
              ? `radial-gradient(circle at 35% 30%, ${shade(badgeColor, 0.45)}, ${badgeColor} 55%, ${shade(badgeColor, -0.3)})`
              : look.id === "glass"
                ? "rgba(255,255,255,.06)"
                : badgeColor,
          border: look.id === "glass" ? `3px solid ${look.accent}` : undefined,
          boxShadow:
            look.id === "pop" ? "0 14px 24px rgba(10,12,40,.25)" : undefined,
        }}
      >
        <span
          style={{
            fontFamily: titleFont,
            fontWeight: 900,
            fontSize: badgeSize * 0.62,
            color:
              look.id === "glass"
                ? look.accent
                : look.id === "mono"
                  ? look.accent
                  : "#FFFFFF",
            lineHeight: 1,
          }}
        >
          {look.id === "mono" ? String(c.n).padStart(2, "0") : c.n}
        </span>
      </div>
    ) : c.type === "tool" ? (
      <div style={r1}>
        <Monogram
          name={c.name}
          size={badgeSize}
          logo={c.logo}
          color={
            look.id === "pop"
              ? badgeColor
              : look.id === "glass"
                ? "rgba(255,255,255,.12)"
                : look.id === "mono"
                  ? look.ink
                  : look.accent
          }
          ink={look.id === "mono" ? look.accent : "#FFFFFF"}
        />
      </div>
    ) : null;

  const title = c.type === "tool" ? c.name : c.title;
  const titleW = W - 120 - (badge ? badgeSize + 44 : 0);
  const titleSize = fitSize(
    title,
    titleW * (c.type === "tool" ? 1 : 1.9),
    c.type === "tool" ? 104 : 84,
    52,
    c.type === "tool" ? 0.66 : 0.56, // Latin product names run wider
  );
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        direction: "rtl",
        alignItems: "center",
        gap: 44,
        padding: "0 60px",
      }}
    >
      {badge}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          alignItems: "flex-start",
        }}
      >
        {look.id === "split" && c.type === "list" && (
          <div
            style={{
              ...r2,
              fontFamily: look.body,
              fontWeight: 700,
              fontSize: 30,
              color: look.accent,
            }}
          >{`${c.n} / ${total}`}</div>
        )}
        <Txt
          text={title}
          size={titleSize}
          weight={look.id === "mono" ? 400 : 900}
          color={ink}
          font={titleFont}
          style={{
            ...r2,
            unicodeBidi: "isolate",
            width: "100%",
            textAlign: "right",
            whiteSpace: c.type === "tool" ? "nowrap" : undefined,
          }}
        />
        {c.sub && (
          <Txt
            text={c.sub}
            size={fitSize(c.sub, titleW * 2, 46, 34)}
            weight={600}
            color={subInk}
            font={look.body}
            style={{ ...r3, opacity: (r3.opacity as number) * 0.92 }}
          />
        )}
      </div>
    </div>
  );
};

export const CardsLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const look = useLook();
  const t = frame / FPS;
  const lists = CARDS.filter((c) => c.type === "list").length;
  return (
    <>
      {CARDS.map((c, i) => {
        if (t < c.at - 0.05 || t > c.to + 0.05) return null;
        const h = c.type === "stat" ? 470 : c.type === "steps" ? 500 : 420;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: CARD_ZONE.x,
              top: CARD_ZONE.y + (CARD_ZONE.h - h) / 2,
              width: CARD_ZONE.w,
              height: h,
              ...enterStyle(look, t, c.at, c.to),
            }}
          >
            <Surface
              w={CARD_ZONE.w}
              h={h}
              t={t}
              t0={c.at}
              setIndex={i + 1}
              label={
                c.type === "tool"
                  ? c.name
                  : c.type === "list"
                    ? `${c.n} / ${lists}`
                    : ""
              }
            >
              <CardBody
                c={c}
                look={look}
                t={t}
                setIndex={i + 1}
                total={lists}
              />
            </Surface>
          </div>
        );
      })}
    </>
  );
};

// ---------- hook title (0 to hook.until) ----------
export const HookLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const look = useLook();
  const t = frame / FPS;
  if (t >= HOOK_END + 0.05 || !config.hook.text) return null;
  const words = config.hook.text.split(/\s+/);
  const exit = ramp(t, HOOK_END - 0.2, 0.2, EASE.in);
  // about 2.3 lines inside the card zone (the glass pane has padding, so less room)
  const size = fitSize(
    config.hook.text,
    (CARD_ZONE.w - (look.id === "glass" ? 120 : 0)) * 2.3,
    look.id === "mono" ? 132 : 118,
    64,
    look.em,
  );
  const kicker = config.hook.kicker;
  const stagger = look.id === "split" ? 0.13 : 0.09;

  const wordStyle = (i: number, last: boolean): React.CSSProperties => {
    const t0 = 0.05 + i * stagger;
    if (look.id === "pop") {
      const s = springAt(t, t0, look.cardSpring);
      return {
        color: last ? "#FFD23F" : "#FFFFFF",
        transform: `scale(${s}) rotate(${(1 - s) * 8}deg)`,
        textShadow:
          Array.from(
            { length: 10 },
            (_, k) => `0 ${k + 1}px 0 ${shade("#18223F", 0.05 * k)}`,
          ).join(",") + ", 0 18px 28px rgba(0,0,0,.35)",
      };
    }
    if (look.id === "glass") {
      const p = ramp(t, t0, 0.62, EASE.out);
      return {
        color: last ? look.accent : look.paper,
        opacity: p,
        filter: `blur(${(1 - p) * 12}px)`,
        transform: `translateY(${(1 - p) * 0.7 * size}px) scale(${0.94 + 0.06 * p})`,
      };
    }
    if (look.id === "mono") {
      const on = t >= t0;
      return {
        color: last ? look.ink : look.paper,
        background: last ? look.accent : undefined,
        padding: last ? "0 0.12em" : undefined,
        opacity: on ? 1 : 0,
        transform: `translateY(${on ? 0 : 20}px)`,
      };
    }
    const p = ramp(t, t0, 0.14, EASE.out);
    return {
      color: t >= t0 ? (last ? "#FFFFFF" : look.ink) : "#C9CDD4",
      background: last && t >= t0 ? look.accent : undefined,
      borderRadius: 18,
      padding: last ? "0 0.16em" : undefined,
      transform: `scale(${0.92 + 0.08 * p})`,
    };
  };

  const title = (
    <div
      style={{
        direction: "rtl",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: size * 0.26,
        rowGap: size * 0.06,
        fontFamily: look.display,
        fontWeight: look.id === "mono" ? 400 : 900,
        fontSize: size,
        lineHeight: 1.08,
      }}
    >
      {words.map((w, i) => (
        <span
          key={i}
          dir={HEBREW.test(w) ? "rtl" : "ltr"}
          style={{
            display: "inline-block",
            whiteSpace: "nowrap",
            ...wordStyle(i, i === words.length - 1),
          }}
        >
          {w}
        </span>
      ))}
    </div>
  );

  const kick = kicker ? (
    <div
      style={{
        alignSelf: "center",
        fontFamily: look.body,
        fontWeight: 800,
        fontSize: 40,
        padding: "8px 26px",
        borderRadius: look.id === "mono" ? 0 : 40,
        color:
          look.id === "pop"
            ? "#18223F"
            : look.id === "glass"
              ? look.ink
              : look.id === "mono"
                ? look.ink
                : "#FFFFFF",
        background:
          look.id === "pop"
            ? "#FFD23F"
            : look.id === "glass"
              ? look.accent
              : look.id === "mono"
                ? look.accent
                : look.accent,
        transform: `scale(${springAt(t, 0, look.cardSpring)})`,
        direction: "rtl",
      }}
    >
      {kicker}
    </div>
  ) : null;

  const inner = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 26,
        alignItems: "center",
        padding: look.id === "glass" ? "50px 56px" : 0,
      }}
    >
      {kick}
      {title}
    </div>
  );

  return (
    <div
      style={{
        position: "absolute",
        left: CARD_ZONE.x,
        top: CARD_ZONE.y,
        width: CARD_ZONE.w,
        height: CARD_ZONE.h,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: 1 - exit,
        transform: `scale(${1 - 0.06 * exit})`,
      }}
    >
      {look.id === "glass" ? (
        <Surface w={CARD_ZONE.w} h={CARD_ZONE.h - 40} t={t} t0={0}>
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {inner}
          </div>
        </Surface>
      ) : (
        inner
      )}
    </div>
  );
};

// ---------- CTA end card ----------
export const CtaLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const look = useLook();
  const t = frame / FPS;
  const cta = config.cta;
  if (!cta || t < CTA_AT) return null;
  const at = CTA_AT;
  const tap = at + 1.3;
  const press = t >= tap && t < tap + 0.2 ? 0.95 : 1;
  const ripple = ramp(t, tap, 0.45, EASE.out);
  const titleSize = fitSize(cta.title, CARD_ZONE.w * 1.9, 92, 60);
  const r1 = useReveal(look, t, at + 0.1);
  const r2 = useReveal(look, t, at + 0.25);
  const btnIn =
    look.id === "pop"
      ? springAt(t, at + 0.45, look.cardSpring)
      : ramp(t, at + 0.45, 0.4, EASE.out);
  const btnBg =
    look.id === "pop"
      ? "#FF3E8A"
      : look.id === "glass"
        ? `${look.accent}`
        : look.accent;
  const btnInk =
    look.id === "mono" || look.id === "glass" ? look.ink : "#FFFFFF";
  const titleInk =
    look.id === "split" ? look.ink : look.id === "pop" ? "#FFFFFF" : look.paper;

  return (
    <div
      style={{
        position: "absolute",
        left: CARD_ZONE.x,
        top: CARD_ZONE.y - 10,
        width: CARD_ZONE.w,
        height: CARD_ZONE.h + 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 26,
        direction: "rtl",
      }}
    >
      <Txt
        text={cta.title}
        size={titleSize}
        weight={look.id === "mono" ? 400 : 900}
        color={titleInk}
        font={look.display}
        style={{
          ...r1,
          textAlign: "center",
          textShadow:
            look.id === "pop"
              ? Array.from(
                  { length: 8 },
                  (_, k) => `0 ${k + 1}px 0 #18223F`,
                ).join(",")
              : undefined,
        }}
      />
      {cta.sub && (
        <Txt
          text={cta.sub}
          size={fitSize(cta.sub, CARD_ZONE.w * 1.8, 46, 34)}
          weight={600}
          color={look.id === "split" ? "#4B5563" : "rgba(255,255,255,.88)"}
          font={look.body}
          style={{ ...r2, textAlign: "center" }}
        />
      )}
      <div
        style={{
          position: "relative",
          transform: `scale(${(0.6 + 0.4 * btnIn) * press})`,
          opacity: Math.min(1, btnIn * 2),
        }}
      >
        <div
          style={{
            fontFamily: look.body,
            fontWeight: 900,
            fontSize: 54,
            color: btnInk,
            padding: "22px 64px",
            borderRadius: look.id === "mono" ? 0 : 999,
            background:
              look.id === "pop"
                ? `linear-gradient(200deg, ${shade(btnBg, 0.35)}, ${btnBg} 50%, ${shade(btnBg, -0.25)})`
                : btnBg,
            boxShadow:
              look.id === "mono"
                ? `-10px 10px 0 ${look.paper}`
                : look.id === "glass"
                  ? "inset 0 1.5px 0 rgba(255,255,255,.6), 0 20px 40px rgba(0,0,0,.35)"
                  : "0 18px 34px rgba(10,12,40,.3)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {cta.button}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 600 * ripple,
              height: 600 * ripple,
              marginLeft: -300 * ripple,
              marginTop: -300 * ripple,
              borderRadius: "50%",
              background: "rgba(255,255,255,.35)",
              opacity: 1 - ripple,
            }}
          />
        </div>
        {t >= tap - 0.35 && t < tap + 0.5 && (
          <div
            style={{
              position: "absolute",
              left: "58%",
              top: 40 + 40 * (1 - ramp(t, tap - 0.35, 0.35, EASE.out)),
              width: 70,
              height: 70,
              borderRadius: 35,
              background: "rgba(255,255,255,.75)",
              border: "3px solid rgba(0,0,0,.25)",
              opacity: 1 - ramp(t, tap + 0.25, 0.25),
            }}
          />
        )}
      </div>
      {cta.handle && (
        <div
          style={{
            ...r2,
            fontFamily: look.body,
            fontWeight: 700,
            fontSize: 38,
            color: titleInk,
            direction: "ltr",
            opacity: 0.85,
          }}
        >
          {cta.handle}
        </div>
      )}
    </div>
  );
};
