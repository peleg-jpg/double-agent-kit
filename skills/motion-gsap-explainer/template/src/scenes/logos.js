/* LOGOS: tool reveal grid (2 columns). Drawn glyphs or letters, never logo image files.
   Props: title, sub, tools[] { name, role, glyph: spark|wave|pause|avatar|nodes|play|chat|bolt|letter, color, ink }, footer
   Timing (seconds from scene start), default duration 4:
     0.10 title        y -40 -> 0, 0.50s power3.out
     0.30 sub          opacity, 0.45s sine.out
     0.45 + i*0.14     tile i: scale 0.6 + y 60 -> 1, 0.65s back.out(1.5)  (first tile = top right, RTL order)
     tile + 0.15       mark: rotation -120 + scale 0 -> 0, 0.70s back.out(2)
     tile + 0.25       name + role: x +40 -> 0, 0.40s power2.out
     last tile + 0.6   footer pill: y 40 -> 0, 0.50s expo.out
     breathe           grid scale 1 -> 1.025 until scene end, sine.inOut */
window.MX = window.MX || {};
MX.scenes = MX.scenes || {};

MX.scenes.logos = {
  duration: 4,
  hero: 0.85,
  build(el, p, ctx) {
    const tools = p.tools || [];
    el.innerHTML = `
      <div class="content">
        <div class="title h-display">${MX.rich(p.title)}</div>
        ${p.sub ? `<div class="sub">${MX.rich(p.sub)}</div>` : ""}
        <div class="grid">
          ${tools
            .map(
              (t) => `<div class="tile">
                <div class="mark" style="background:${t.color || "var(--accent)"}">${MX.glyph(t.glyph || "letter", t.ink || "#FFFFFF", { text: t.name })}</div>
                <div class="tool-name">${MX.esc(t.name)}</div>
                ${t.role ? `<div class="tool-role">${MX.rich(t.role)}</div>` : ""}
              </div>`,
            )
            .join("")}
        </div>
        ${p.footer ? `<div class="footer">${MX.rich(p.footer)}</div>` : ""}
      </div>`;
    const tl = gsap.timeline();
    tl.from(
      el.querySelector(".title"),
      { y: -40, opacity: 0, duration: 0.5, ease: "power3.out" },
      0.1,
    );
    if (p.sub)
      tl.from(
        el.querySelector(".sub"),
        { opacity: 0, duration: 0.45, ease: "sine.out" },
        0.3,
      );
    const tiles = el.querySelectorAll(".tile");
    tiles.forEach((tile, i) => {
      const t = 0.45 + i * 0.14;
      tl.from(
        tile,
        {
          scale: 0.6,
          y: 60,
          opacity: 0,
          duration: 0.65,
          ease: "back.out(1.5)",
        },
        t,
      );
      tl.from(
        tile.querySelector(".mark"),
        { rotation: -120, scale: 0, duration: 0.7, ease: "back.out(2)" },
        t + 0.15,
      );
      tl.from(
        tile.querySelectorAll(".tool-name, .tool-role"),
        { x: 40, opacity: 0, duration: 0.4, ease: "power2.out", stagger: 0.06 },
        t + 0.25,
      );
    });
    const tLast = 0.45 + Math.max(0, tiles.length - 1) * 0.14;
    if (p.footer)
      tl.from(
        el.querySelector(".footer"),
        { y: 40, opacity: 0, duration: 0.5, ease: "expo.out" },
        tLast + 0.6,
      );
    tl.to(
      el.querySelector(".grid"),
      {
        scale: 1.025,
        duration: Math.max(0.5, ctx.dur - tLast - 0.7),
        ease: "sine.inOut",
      },
      tLast + 0.7,
    );
    return tl;
  },
};
