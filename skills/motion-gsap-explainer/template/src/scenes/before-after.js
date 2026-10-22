/* BEFORE-AFTER: stacked split for 9:16. "Before" panel on top, "after" panel below, arrow chip between.
   Props: before { label, title, items[] }, after { label, title, items[] }
   Timing (seconds from scene start), default duration 5:
     0.10 before panel   clip reveal from the right edge, 0.60s power3.inOut
     0.45 before items   x +60 -> 0, 0.45s power2.out, stagger 0.12; x icons draw
     1.45 arrow chip     scale 0 + rotate -90 -> 0, 0.45s back.out(2.5)
     1.55 after panel    clip reveal from the right edge, 0.60s expo.inOut
     1.60 before dims    opacity 1 -> 0.6, scale 0.97, 0.50s power2.out (the eye moves to "after")
     2.00 after items    x +60 -> 0, 0.50s expo.out, stagger 0.14; check icons draw
     breathe            after panel scale 1 -> 1.02 until scene end, sine.inOut */
window.MX = window.MX || {};
MX.scenes = MX.scenes || {};

MX.scenes["before-after"] = {
  duration: 5,
  hero: 0.85,
  build(el, p, ctx) {
    const b = p.before || {};
    const a = p.after || {};
    const panel = (side, d, icon, color) => `
      <div class="ba-panel ${side}">
        <div class="ba-label">${MX.rich(d.label || (side === "before" ? "לפני" : "אחרי"))}</div>
        ${d.title ? `<div class="ba-title">${MX.rich(d.title)}</div>` : ""}
        ${(d.items || []).map((it) => `<div class="ba-item"><div class="ic">${MX.glyph(icon, color)}</div><div>${MX.rich(it)}</div></div>`).join("")}
      </div>`;
    el.innerHTML = `
      <div class="content">
        ${panel("before", b, "x", "var(--bad)")}
        <div class="ba-chip">${MX.glyph("arrow-down", "currentColor")}</div>
        ${panel("after", a, "check", "var(--onAccent)")}
      </div>`;
    const before = el.querySelector(".ba-panel.before");
    const after = el.querySelector(".ba-panel.after");
    const tl = gsap.timeline();
    const reveal = { clipPath: "inset(0% 0% 0% 100% round 40px)" };
    tl.fromTo(
      before,
      reveal,
      {
        clipPath: "inset(0% 0% 0% 0% round 40px)",
        duration: 0.6,
        ease: "power3.inOut",
      },
      0.1,
    );
    tl.from(
      before.querySelectorAll(".ba-label, .ba-title, .ba-item"),
      { x: 60, opacity: 0, duration: 0.45, ease: "power2.out", stagger: 0.12 },
      0.45,
    );
    tl.from(
      before.querySelectorAll(".draw"),
      { strokeDashoffset: 1, duration: 0.3, ease: "power2.out", stagger: 0.1 },
      0.8,
    );
    tl.from(
      el.querySelector(".ba-chip"),
      { scale: 0, rotation: -90, duration: 0.45, ease: "back.out(2.5)" },
      1.45,
    );
    tl.fromTo(
      after,
      reveal,
      {
        clipPath: "inset(0% 0% 0% 0% round 40px)",
        duration: 0.6,
        ease: "expo.inOut",
      },
      1.55,
    );
    tl.to(
      before,
      { opacity: 0.6, scale: 0.97, duration: 0.5, ease: "power2.out" },
      1.6,
    );
    tl.from(
      after.querySelectorAll(".ba-label, .ba-title, .ba-item"),
      { x: 60, opacity: 0, duration: 0.5, ease: "expo.out", stagger: 0.14 },
      2.0,
    );
    tl.from(
      after.querySelectorAll(".draw"),
      {
        strokeDashoffset: 1,
        duration: 0.35,
        ease: "power2.out",
        stagger: 0.12,
      },
      2.35,
    );
    tl.to(
      after,
      {
        scale: 1.02,
        duration: Math.max(0.5, ctx.dur - 2.6),
        ease: "sine.inOut",
      },
      2.6,
    );
    return tl;
  },
};
