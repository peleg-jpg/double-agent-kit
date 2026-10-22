// A stand-in "speaker" so the template renders before the student adds a real video.
// npm run demo-video -> public/input.mp4 (14 s, silent). Replace it with the real talking-head video.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { HEEBO } from "./looks";

export const DemoSpeaker: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const bob = Math.sin(t * 2.1) * 6;
  const talk = 0.5 + 0.5 * Math.abs(Math.sin(t * 9.3) * Math.sin(t * 3.1));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 60% at 50% 35%, #4a3a2c 0%, #231a14 60%, #120d0a 100%)" }}>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(90deg, rgba(255,255,255,.035) 0 40px, transparent 40px 90px)" }} />
      <div style={{ position: "absolute", left: 140, top: 160, width: 70, height: 110, borderRadius: 35, background: "#ffb45e", boxShadow: "0 0 120px 40px rgba(255,170,80,.35)" }} />
      {/* shoulders */}
      <div style={{ position: "absolute", left: 120, top: 1080 + bob, width: 840, height: 900, borderRadius: "420px 420px 0 0", background: "linear-gradient(180deg, #2b2f3a, #15171d)" }} />
      {/* neck + head */}
      <div style={{ position: "absolute", left: 470, top: 930 + bob, width: 140, height: 200, borderRadius: 50, background: "#c99272" }} />
      <div style={{ position: "absolute", left: 330, top: 360 + bob, width: 420, height: 560, borderRadius: "48% 48% 46% 46%", background: "radial-gradient(ellipse at 45% 35%, #e3b08f, #b67e5f 70%, #8d5d44)" }} />
      <div style={{ position: "absolute", left: 318, top: 330 + bob, width: 444, height: 200, borderRadius: "220px 220px 60px 60px", background: "#2a1d16" }} />
      {/* eyes and mouth */}
      {[455, 585].map((x) => (
        <div key={x} style={{ position: "absolute", left: x, top: 590 + bob, width: 40, height: 22 * (Math.sin(t * 1.3) > 0.97 ? 0.15 : 1), borderRadius: 20, background: "#2a1d16" }} />
      ))}
      <div style={{ position: "absolute", left: 490, top: 760 + bob, width: 100, height: 18 + 34 * talk, borderRadius: 40, background: "#5e2c22" }} />
      <div style={{ position: "absolute", bottom: 120, width: "100%", textAlign: "center", fontFamily: HEEBO, fontWeight: 700, fontSize: 40, color: "rgba(255,255,255,.55)", direction: "rtl" }}>
        כאן ייכנס הסרטון שלכם
      </div>
    </AbsoluteFill>
  );
};
