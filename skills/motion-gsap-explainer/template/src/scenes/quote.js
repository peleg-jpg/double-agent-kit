/* QUOTE: quote or stat card. Big quote mark, word-by-word quote, marker on the key phrase, author line, optional stat.
   Props: quote, highlight, author, role, stat { value, prefix, suffix, label }
   Timing (seconds from scene start), default duration 4.5:
     0.10 quote mark   scale 0.4 + rotate -12 -> 0, 0.60s back.out(1.8)
     0.30 words        y 24 -> 0, 0.45s power2.out, stagger 0.05
     T+0.20 marker     scaleX 0 -> 1 from the right edge, 0.50s power2.inOut  (T = end of word stagger)
     T+0.30 rule       scaleX 0 -> 1 from the right, 0.50s expo.out
     T+0.45 author     x +40 -> 0, 0.45s power3.out
     T+0.70 stat card  y 60 -> 0, 0.60s expo.out; numeric stat counts up 0.9s power3.out
     breathe          quote mark drifts down 20px, sine.inOut */
window.MX = window.MX || {};
MX.scenes = MX.scenes || {};

MX.scenes.quote = {
  duration: 4.5,
  hero: 0.85,
  build(el, p, ctx) {
    const s = p.stat;
    const numeric = s && typeof s.value === "number";
    const initial = (p.author || "").trim().charAt(0);
    el.innerHTML = `
      <div class="content">
        <div class="qmark">&#8221;</div>
        <div class="qtext h-display">${MX.words(p.quote, p.highlight)}</div>
        <div class="q-rule"></div>
        ${p.author ? `<div class="author"><div class="avatar">${MX.esc(initial)}</div><div><div class="who">${MX.rich(p.author)}</div>${p.role ? `<div class="role">${MX.rich(p.role)}</div>` : ""}</div></div>` : ""}
        ${s ? `<div class="stat-card"><div class="sv">${MX.esc(s.prefix || "")}<span class="n">${numeric ? MX.odometer(s.value, s.decimals || 0) : MX.esc(s.value)}</span>${MX.esc(s.suffix || "")}</div><div class="sl">${MX.rich(s.label || "")}</div></div>` : ""}
      </div>`;
    const tl = gsap.timeline();
    tl.from(
      el.querySelector(".qmark"),
      {
        scale: 0.4,
        rotation: -12,
        opacity: 0,
        duration: 0.6,
        ease: "back.out(1.8)",
        transformOrigin: "100% 0%",
      },
      0.1,
    );
    const words = el.querySelectorAll(".qtext .w");
    tl.from(
      words,
      { y: 24, opacity: 0, duration: 0.45, ease: "power2.out", stagger: 0.05 },
      0.3,
    );
    const T = 0.3 + words.length * 0.05 + 0.2;
    const hl = el.querySelector(".hl-bg");
    if (hl)
      tl.from(hl, { scaleX: 0, duration: 0.5, ease: "power2.inOut" }, T + 0.2);
    tl.from(
      el.querySelector(".q-rule"),
      { scaleX: 0, duration: 0.5, ease: "expo.out" },
      T + 0.3,
    );
    if (p.author)
      tl.from(
        el.querySelector(".author"),
        { x: 40, opacity: 0, duration: 0.45, ease: "power3.out" },
        T + 0.45,
      );
    if (s) {
      tl.from(
        el.querySelector(".stat-card"),
        { y: 60, opacity: 0, duration: 0.6, ease: "expo.out" },
        T + 0.7,
      );
      if (numeric) {
        MX.rollOdometer(
          tl,
          el.querySelector(".stat-card .n"),
          T + 0.8,
          0.9,
          "power3.out",
        );
      }
    }
    tl.to(
      el.querySelector(".qmark"),
      { y: 20, duration: Math.max(0.5, ctx.dur - 0.7), ease: "sine.inOut" },
      0.7,
    );
    return tl;
  },
};
