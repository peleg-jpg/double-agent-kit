/* LIST: kinetic list ("3 טעויות ש...").
   Props: title, highlight (a phrase inside title), items[] (strings), icon: "x"|"check"|"none", ghost
   Timing (seconds from scene start), default duration 5:
     0.15 title words  y 46 -> 0, 0.50s power3.out, stagger 0.06 (right to left, reading order)
     T+0.25 marker     scaleX 0 -> 1 from the right edge, 0.45s power2.inOut  (T = end of word stagger)
     0.95 + i*0.55     row i: x +120 -> 0 (from the right), 0.55s expo.out
     row + 0.10        badge: scale 0 + rotate -90 -> 0, 0.50s back.out(2.2)
     row + 0.35        icon stroke draws, 0.35s power2.out
     breathe           ghost digit drifts left 60px over the scene, linear */
window.MX = window.MX || {};
MX.scenes = MX.scenes || {};

MX.scenes.list = {
  duration: 5,
  hero: 0.85,
  build(el, p, ctx) {
    const items = p.items || [];
    const icon = p.icon || "x";
    const iconColor = icon === "check" ? "var(--good)" : "var(--bad)";
    const ghost = p.ghost != null ? p.ghost : String(items.length);
    el.innerHTML = `
      ${ghost ? `<div class="ghost">${MX.esc(ghost)}</div>` : ""}
      <div class="content">
        <div class="title h-display">${MX.words(p.title, p.highlight)}</div>
        <div class="rows">
          ${items
            .map(
              (it, i) =>
                `<div class="row"><div class="badge">${i + 1}</div><div class="row-tx">${MX.rich(it)}</div>${
                  icon !== "none"
                    ? `<div class="row-ic">${MX.glyph(icon, iconColor)}</div>`
                    : ""
                }</div>`,
            )
            .join("")}
        </div>
      </div>`;
    const tl = gsap.timeline();
    const words = el.querySelectorAll(".title .w");
    tl.from(
      words,
      { y: 46, opacity: 0, duration: 0.5, ease: "power3.out", stagger: 0.06 },
      0.15,
    );
    const tEnd = 0.15 + words.length * 0.06 + 0.25;
    const hl = el.querySelector(".hl-bg");
    if (hl)
      tl.from(hl, { scaleX: 0, duration: 0.45, ease: "power2.inOut" }, tEnd);

    el.querySelectorAll(".row").forEach((row, i) => {
      const t = Math.max(0.95, tEnd - 0.2) + i * 0.55;
      tl.from(row, { x: 120, opacity: 0, duration: 0.55, ease: "expo.out" }, t);
      tl.from(
        row.querySelector(".badge"),
        { scale: 0, rotation: -90, duration: 0.5, ease: "back.out(2.2)" },
        t + 0.1,
      );
      const strokes = row.querySelectorAll(".draw");
      if (strokes.length)
        tl.from(
          strokes,
          {
            strokeDashoffset: 1,
            duration: 0.35,
            ease: "power2.out",
            stagger: 0.12,
          },
          t + 0.35,
        );
    });
    if (ghost)
      tl.fromTo(
        el.querySelector(".ghost"),
        { x: 0 },
        { x: -60, duration: ctx.dur, ease: "none" },
        0,
      );
    return tl;
  },
};
