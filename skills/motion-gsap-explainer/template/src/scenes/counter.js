/* COUNTER: big number counts up + label + bar or line chart reveal.
   Props: kicker, value, prefix, suffix, decimals, label, sub, chart { kind: "bars"|"line", values[], labels[] }, ghost
   Timing (seconds from scene start), default duration 4.5:
     0.10 kicker      y -30 -> 0, 0.45s power3.out
     0.20 number      scale 0.86 -> 1, 0.60s expo.out; count 0 -> value 0.25..1.85 power3.out
     0.55 label       x +90 -> 0 (enters from the right, RTL), 0.55s power4.out
     0.95 label line  scaleX 0 -> 1 from the right, 0.50s power2.out
     0.80 sub         y 24 -> 0, 0.50s sine.out
     0.90 bars        scaleY 0 -> 1, 0.70s expo.out, stagger 0.08  |  line: draw 1.20s power2.inOut, dot back.out(2.5)
     breathe          number scale 1 -> 1.03 until scene end, sine.inOut */
window.MX = window.MX || {};
MX.scenes = MX.scenes || {};

MX.scenes.counter = {
  duration: 4.5,
  hero: 0.82,
  build(el, p, ctx) {
    const value = Number(p.value || 0);
    const dec = p.decimals || 0;
    const ghost = p.ghost != null ? p.ghost : "";
    // Hebrew affixes ("12 שעות") sit OUTSIDE the LTR number, in the RTL row, so word order stays right
    const heb = (x) => !!x && /[א-ת]/.test(x);
    el.innerHTML = `
      ${ghost ? `<div class="ghost">${MX.esc(ghost)}</div>` : ""}
      <div class="content">
        ${p.kicker ? `<div class="kicker"><span class="dot"></span><span>${MX.rich(p.kicker)}</span></div>` : ""}
        <div class="num-wrap">${heb(p.prefix) ? `<span class="affix-he h-display">${MX.rich(p.prefix)}</span>` : ""}<div class="num">${p.prefix && !heb(p.prefix) ? `<span class="affix">${MX.esc(p.prefix)}</span>` : ""}<span class="n">${MX.odometer(value, dec)}</span>${p.suffix && !heb(p.suffix) ? `<span class="affix">${MX.esc(p.suffix)}</span>` : ""}</div>${heb(p.suffix) ? `<span class="affix-he h-display">${MX.rich(p.suffix)}</span>` : ""}</div>
        ${p.label ? `<div class="label h-display">${MX.rich(p.label)}</div><div class="label-line"></div>` : ""}
        ${p.sub ? `<div class="sub">${MX.rich(p.sub)}</div>` : ""}
      </div>`;
    const content = el.querySelector(".content");
    const tl = gsap.timeline();
    const q = (s) => el.querySelectorAll(s);

    if (p.kicker)
      tl.from(
        q(".kicker"),
        { y: -30, opacity: 0, duration: 0.45, ease: "power3.out" },
        0.1,
      );
    tl.from(
      q(".num, .affix-he"),
      {
        scale: 0.86,
        opacity: 0,
        duration: 0.6,
        ease: "expo.out",
        transformOrigin: "100% 50%",
      },
      0.2,
    );
    // odometer roll 0 -> value, transform tweens only
    MX.rollOdometer(tl, el.querySelector(".n"), 0.25, 1.6, "power3.out");
    if (p.label) {
      tl.from(
        q(".label"),
        { x: 90, opacity: 0, duration: 0.55, ease: "power4.out" },
        0.55,
      );
      tl.from(
        q(".label-line"),
        { scaleX: 0, duration: 0.5, ease: "power2.out" },
        0.95,
      );
    }
    if (p.sub)
      tl.from(
        q(".sub"),
        { y: 24, opacity: 0, duration: 0.5, ease: "sine.out" },
        0.8,
      );

    const ch = p.chart;
    if (ch && ch.values && ch.values.length) {
      const vals = ch.values.map(Number);
      const max = Math.max.apply(null, vals);
      const labels = ch.labels || [];
      if ((ch.kind || "bars") === "line") {
        const W = 920,
          H = 360,
          n = vals.length;
        const pts = vals.map((v, i) => [
          (i / (n - 1)) * W,
          H - (v / max) * (H - 20),
        ]);
        const d = pts
          .map(
            (pt, i) =>
              (i ? "L" : "M") + pt[0].toFixed(1) + " " + pt[1].toFixed(1),
          )
          .join(" ");
        const area = d + ` L ${W} ${H} L 0 ${H} Z`;
        const last = pts[n - 1];
        const box = MX.el("div", "chart line");
        box.innerHTML = `<svg viewBox="0 0 ${W} ${H}"><path class="area" d="${area}"/><path class="stroke" d="${d}" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:0"/><circle class="dot" cx="${last[0]}" cy="${last[1]}" r="22"/></svg>`;
        content.appendChild(box);
        tl.from(
          box.querySelector(".stroke"),
          { strokeDashoffset: 1, duration: 1.2, ease: "power2.inOut" },
          0.9,
        );
        tl.from(
          box.querySelector(".area"),
          { opacity: 0, duration: 0.8, ease: "sine.out" },
          1.4,
        );
        tl.from(
          box.querySelector(".dot"),
          {
            scale: 0,
            transformOrigin: "50% 50%",
            duration: 0.5,
            ease: "back.out(2.5)",
          },
          2.05,
        );
      } else {
        const box = MX.el("div", "chart bars");
        vals.forEach((v, i) => {
          const col = MX.el("div", "bar-col");
          const h = Math.max(6, (v / max) * 100);
          const isLast = i === vals.length - 1;
          col.innerHTML = `${isLast ? `<div class="bar-val" style="bottom:calc(${h}% + 18px)">${MX.esc(ch.lastLabel || MX.fmt(v))}</div>` : ""}<div class="bar${isLast ? " last" : ""}" style="height:${h}%"></div>${labels[i] != null ? `<div class="bar-lab">${MX.esc(labels[i])}</div>` : ""}`;
          box.appendChild(col);
        });
        content.appendChild(box);
        tl.from(
          box.querySelectorAll(".bar"),
          { scaleY: 0, duration: 0.7, ease: "expo.out", stagger: 0.08 },
          0.9,
        );
        if (labels.length)
          tl.from(
          box.querySelectorAll(".bar-lab"),
          {
            opacity: 0,
            y: 12,
            duration: 0.4,
            ease: "power1.out",
            stagger: 0.06,
          },
          1.0,
        );
        tl.from(
          box.querySelectorAll(".bar-val"),
          { opacity: 0, y: 20, duration: 0.45, ease: "back.out(2)" },
          1.55,
        );
      }
    }
    // breathe: one slow push-in on the number, nothing else moves
    tl.to(
      q(".num"),
      {
        scale: 1.03,
        duration: Math.max(0.5, ctx.dur - 1.0),
        ease: "sine.inOut",
        transformOrigin: "100% 50%",
      },
      0.85,
    );
    if (ghost)
      tl.fromTo(
        q(".ghost"),
        { x: 0 },
        { x: -60, duration: ctx.dur, ease: "none" },
        0,
      );
    return tl;
  },
};
