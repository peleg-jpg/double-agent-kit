// The card material of each look: satin (Pop), frosted glass (Glass), hard paper (Mono), browser card (Split).
import React from "react";
import { Img, staticFile } from "remotion";
import { EASE, ramp, useLook } from "../layout";
import { POP_SETS, shade } from "../looks";

export const Surface: React.FC<{
  w: number;
  h: number;
  t: number;
  t0: number;
  setIndex?: number;
  label?: string;
  children: React.ReactNode;
}> = ({ w, h, t, t0, setIndex = 0, label, children }) => {
  const look = useLook();
  if (look.id === "pop") {
    const c = POP_SETS[setIndex % POP_SETS.length].card;
    return (
      <div
        style={{
          width: w,
          height: h,
          borderRadius: 44,
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(200deg, ${shade(c, 0.4)} 0%, ${c} 42%, ${shade(c, -0.22)} 100%)`,
          boxShadow:
            "0 30px 50px rgba(10,12,40,.28), 0 6px 12px rgba(10,12,40,.18), inset 0 -6px 0 rgba(0,0,0,.10)",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 40,
            top: 18,
            width: 260,
            height: 54,
            borderRadius: "50%",
            background: POP_SETS[setIndex % POP_SETS.length].ink === "#FFFFFF" ? "rgba(255,255,255,.16)" : "rgba(255,255,255,.5)",
            filter: "blur(2.5px)",
          }}
        />
        {children}
      </div>
    );
  }
  if (look.id === "glass") {
    const sweep = ramp(t, t0 + 0.1, 1.0, EASE.out);
    return (
      <div
        style={{
          width: w,
          height: h,
          borderRadius: 44,
          position: "relative",
          overflow: "hidden",
          background: "rgba(255,248,240,.13)",
          backdropFilter: "blur(22px) saturate(1.35)",
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,.30), inset 0 1.5px 0 rgba(255,255,255,.45), 0 2px 6px rgba(12,16,30,.28), 0 26px 60px rgba(12,16,30,.40)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(160deg, rgba(255,255,255,.20) 0%, rgba(255,255,255,0) 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(115deg, transparent ${-30 + sweep * 150}%, rgba(255,255,255,.26) ${-14 + sweep * 150}%, transparent ${2 + sweep * 150}%)`,
          }}
        />
        {children}
      </div>
    );
  }
  if (look.id === "mono") {
    return (
      <div
        style={{
          width: w,
          height: h,
          position: "relative",
          background: look.paper,
          boxShadow: `-14px 14px 0 ${look.accent}`,
        }}
      >
        {children}
      </div>
    );
  }
  // split: browser-style card
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 28,
        position: "relative",
        overflow: "hidden",
        background: "#FFFFFF",
        border: "3px solid #B9D3F6",
        boxShadow:
          "0 24px 50px rgba(14,17,22,.14), 0 3px 8px rgba(14,17,22,.08)",
      }}
    >
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 24px",
          borderBottom: "2px solid #EEF1F5",
          background: "#FAFBFC",
          direction: "ltr",
        }}
      >
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div
            key={c}
            style={{ width: 18, height: 18, borderRadius: 9, background: c }}
          />
        ))}
        <div
          style={{
            marginLeft: 20,
            flex: 1,
            height: 36,
            borderRadius: 18,
            background: "#EEF1F5",
            fontFamily: look.body,
            fontWeight: 600,
            fontSize: 22,
            color: "#6B7280",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {label ?? ""}
        </div>
      </div>
      <div
        style={{ position: "absolute", top: 64, left: 0, right: 0, bottom: 0 }}
      >
        {children}
      </div>
    </div>
  );
};

// small rounded tile with a logo image or the first letter of a name
export const Monogram: React.FC<{
  name: string;
  size: number;
  logo?: string | null;
  color: string;
  ink: string;
}> = ({ name, size, logo, color, ink }) => {
  const look = useLook();
  return (
    <div
      style={{
        width: size,
        height: size,
        flex: "none",
        borderRadius: look.id === "mono" ? 0 : size * 0.26,
        background:
          look.id === "pop"
            ? `linear-gradient(200deg, ${shade(color, 0.4)}, ${color} 50%, ${shade(color, -0.25)})`
            : color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow:
          look.id === "glass"
            ? "inset 0 0 0 2px rgba(255,255,255,.35)"
            : "0 10px 22px rgba(0,0,0,.18)",
        overflow: "hidden",
      }}
    >
      {logo ? (
        <Img
          src={staticFile(logo)}
          style={{ width: "72%", height: "72%", objectFit: "contain" }}
        />
      ) : (
        <span
          style={{
            fontFamily: look.display,
            fontWeight: 900,
            fontSize: size * 0.56,
            color: ink,
            direction: "ltr",
          }}
        >
          {name.trim().charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
};
