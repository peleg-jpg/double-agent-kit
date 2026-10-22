/* Engine: reads window.VIDEO (generated from video.json by scripts/sync.mjs), builds every scene,
   chains them on ONE paused GSAP timeline and registers it as window.__timelines.main.
   Built synchronously on load (HyperFrames contract). Deterministic: no Math.random, no Date. */
(function () {
  const V = window.VIDEO || { scenes: [] };
  const pal = MX.palette(V.palette, V.colors);
  const fonts = Object.assign(
    { display: "Secular One", body: "Heebo", ui: "Rubik" },
    V.fonts || {},
  );
  const root = document.documentElement;
  Object.keys(pal).forEach((k) => root.style.setProperty("--" + k, pal[k]));
  root.style.setProperty(
    "--font-display",
    `'${fonts.display}', 'Heebo', sans-serif`,
  );
  root.style.setProperty("--font-body", `'${fonts.body}', 'Heebo', sans-serif`);
  root.style.setProperty("--font-ui", `'${fonts.ui}', 'Heebo', sans-serif`);

  const stage = document.getElementById("stage");
  const tl = gsap.timeline({ paused: true });

  // shared background layer: two accent glows, hairlines at the safe-zone edges, grain
  stage.insertAdjacentHTML(
    "afterbegin",
    `<div class="bg-glow g1"></div><div class="bg-glow g2"></div>${V.rules === false ? "" : '<div class="bg-rule top"></div><div class="bg-rule bottom"></div>'}`,
  );

  const TRANS = { curtain: 0.5, push: 0.6, zoom: 0.5, cut: 0 };
  const scenes = V.scenes || [];
  const meta = [];
  let t = 0;
  scenes.forEach((s, i) => {
    const def = MX.scenes[s.type];
    if (!def)
      throw new Error(
        "Unknown scene type: " +
          s.type +
          ". Use one of: " +
          Object.keys(MX.scenes).join(", "),
      );
    const el = document.createElement("section");
    el.className = "scene scene--" + s.type;
    el.setAttribute("dir", "rtl");
    stage.appendChild(el);
    const dur = Number(s.duration || def.duration);
    const sceneTl = def.build(el, s, { pal, fonts, dur, index: i });
    tl.add(sceneTl, t);
    meta.push({
      type: s.type,
      start: t,
      duration: dur,
      hero: +(t + dur * def.hero).toFixed(3),
      el,
    });
    t += dur;
  });
  const total = +t.toFixed(3);

  // transitions between scene i and i+1, at boundary b
  const curtains = [];
  meta.forEach((m, i) => {
    const next = meta[i + 1];
    if (i === 0) tl.set(m.el, { opacity: 1 }, 0);
    if (!next) return;
    const b = next.start;
    const kind = scenes[i + 1].transition || V.transition || "curtain";
    if (kind === "push") {
      // vertical push, like a swipe up. Direction agnostic, works for RTL.
      tl.set(next.el, { opacity: 1, y: 1920 }, b - 0.3);
      tl.to(m.el, { y: -1920, duration: 0.6, ease: "expo.inOut" }, b - 0.3);
      tl.to(next.el, { y: 0, duration: 0.6, ease: "expo.inOut" }, b - 0.3);
      tl.set(m.el, { opacity: 0 }, b + 0.3);
    } else if (kind === "zoom") {
      tl.to(
        m.el,
        { scale: 1.12, opacity: 0, duration: 0.5, ease: "power2.in" },
        b - 0.25,
      );
      tl.fromTo(
        next.el,
        { opacity: 0, scale: 0.92 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "power3.out",
          immediateRender: false,
        },
        b - 0.1,
      );
    } else if (kind === "cut") {
      tl.set(m.el, { opacity: 0 }, b);
      tl.set(next.el, { opacity: 1 }, b);
    } else {
      // curtain: two panels sweep from right to left (RTL reading direction), swap under cover
      let pair = curtains[i];
      if (!pair) {
        pair = [MX.el("div", "curtain c1"), MX.el("div", "curtain c2")];
        stage.appendChild(pair[1]);
        stage.appendChild(pair[0]);
      }
      const [c1, c2] = pair;
      tl.fromTo(
        c2,
        { x: 1188 },
        { x: 0, duration: 0.26, ease: "power2.in", immediateRender: false },
        b - 0.3,
      );
      tl.fromTo(
        c1,
        { x: 1188 },
        { x: 0, duration: 0.26, ease: "power2.in", immediateRender: false },
        b - 0.24,
      );
      tl.set(m.el, { opacity: 0 }, b);
      tl.set(next.el, { opacity: 1 }, b);
      tl.to(c2, { x: -1188, duration: 0.3, ease: "power2.out" }, b - 0.02);
      tl.to(c1, { x: -1188, duration: 0.3, ease: "power2.out" }, b + 0.02);
    }
  });

  // ambient: the shared glows drift once across the whole video (finite, no repeat: -1)
  if (total > 0) {
    tl.fromTo(
      ".bg-glow.g1",
      { x: 0, y: 0 },
      { x: -140, y: 120, duration: total, ease: "sine.inOut" },
      0,
    );
    tl.fromTo(
      ".bg-glow.g2",
      { x: 0, y: 0 },
      { x: 120, y: -100, duration: total, ease: "sine.inOut" },
      0,
    );
  }

  stage.setAttribute("data-duration", String(total));
  window.__timelines = window.__timelines || {};
  window.__timelines["main"] = tl;
  window.__mainTimeline = tl;
  window.__meta = {
    duration: total,
    fps: V.fps || 30,
    scenes: meta.map(({ el, ...rest }) => rest),
  };
  window.__ready = true;

  // live preview helpers (only when opened with ?play or ?t=3.2 in a browser, never during render)
  const qs = new URLSearchParams(location.search);
  if (qs.has("t")) tl.seek(parseFloat(qs.get("t")) || 0, false);
  if (qs.has("safe")) stage.insertAdjacentHTML("beforeend", '<div class="safe-overlay"><div class="top"></div><div class="bot"></div><div class="side l"></div><div class="side r"></div></div>');
  if (qs.has("play")) {
    tl.eventCallback("onComplete", () => tl.restart());
    document.fonts.ready.then(() => tl.play(0));
  }
})();
