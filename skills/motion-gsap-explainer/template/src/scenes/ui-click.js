/* UI-CLICK: app mockup, cursor clicks a field, text types in, cursor clicks the button, result card appears.
   Props: title, app (app name), appGlyph, placeholder, typed, button, result, resultLines (1-4)
   Timing (seconds from scene start), default duration 5.5:
     0.10 title        y -36 -> 0, 0.50s power3.out
     0.30 app window   y 90 + scale 0.94 -> 1, 0.70s expo.out
     1.00 cursor       glides in to the field, 0.60s power2.inOut
     1.62 click        ripple scale 0.2 -> 2, 0.45s power1.out; field border turns accent
     1.70 typing       chars appear one by one, 0.045s per char (max 1.4s total)
     +0.15 cursor      moves to the button, 0.50s power3.inOut
     +0.08 press       button scale 0.92 for 0.08s then back.out(3) 0.30s, ripple
     +0.20 result      y 40 -> 0, 0.50s expo.out; check pops back.out(2.5); skeleton lines grow from the right, stagger 0.10
   Cursor positions are read from layout (offsetLeft/offsetTop) when each tween starts, so fonts are already loaded. */
window.MX = window.MX || {};
MX.scenes = MX.scenes || {};

MX.scenes["ui-click"] = {
  duration: 5.5,
  hero: 0.88,
  build(el, p, ctx) {
    const typed = String(p.typed || "");
    const nLines = Math.min(4, Math.max(1, p.resultLines || 2));
    el.innerHTML = `
      <div class="content">
        ${p.title ? `<div class="title h-display">${MX.rich(p.title)}</div>` : ""}
        <div class="app-wrap" style="position:relative">
          <div class="app">
            <div class="app-bar">
              <div class="app-ic">${MX.glyph(p.appGlyph || "chat", "var(--onAccent)")}</div>
              <div class="app-name">${MX.rich(p.app || "העוזר שלי")}</div>
              <div class="dots"><i></i><i></i><i></i></div>
            </div>
            <div class="app-body">
              <div class="field">
                <div class="ph">${MX.rich(p.placeholder || "מה צריך לעשות?")}</div>
                <div class="typed">${typed.split("").map((c) => (c === " " ? " " : `<span class="ch">${MX.esc(c)}</span>`)).join("")}</div>
              </div>
              <div class="btn-row"><div class="btn">${MX.rich(p.button || "שלח")}</div></div>
              <div class="result">
                <div class="ok">${MX.glyph("check", "var(--onAccent)")}</div>
                <div class="r-body">
                  <div class="r-title">${MX.rich(p.result || "מוכן")}</div>
                  ${Array.from({ length: nLines }, (_, i) => `<div class="sk" style="width:${[100, 82, 64, 90][i]}%"></div>`).join("")}
                </div>
              </div>
            </div>
          </div>
          <div class="ripple"></div>
          <div class="cursor">${MX.glyph("cursor")}</div>
        </div>
      </div>`;

    const wrap = el.querySelector(".app-wrap");
    const field = el.querySelector(".field");
    const btn = el.querySelector(".btn");
    const cursor = el.querySelector(".cursor");
    const ripple = el.querySelector(".ripple");
    const result = el.querySelector(".result");
    const HOT_X = 15,
      HOT_Y = 9; // arrow tip inside the 96px cursor

    // layout position of an element's point (fx, fy as 0..1) relative to the wrap, transform independent
    const pos = (node, fx, fy) => {
      let x = 0,
        y = 0,
        n = node;
      while (n && n !== wrap) {
        x += n.offsetLeft;
        y += n.offsetTop;
        n = n.offsetParent;
      }
      return { x: x + node.offsetWidth * fx, y: y + node.offsetHeight * fy };
    };

    const tl = gsap.timeline();
    if (p.title)
      tl.from(
        el.querySelector(".title"),
        { y: -36, opacity: 0, duration: 0.5, ease: "power3.out" },
        0.1,
      );
    tl.from(
      el.querySelector(".app"),
      { y: 90, scale: 0.94, opacity: 0, duration: 0.7, ease: "expo.out" },
      0.3,
    );
    tl.set(result, { opacity: 0, y: 40 }, 0);
    tl.set(cursor, { opacity: 0 }, 0);

    // 1) cursor glides to the field
    const fieldPt = () => pos(field, 0.3, 0.62);
    tl.fromTo(
      cursor,
      {
        opacity: 0,
        x: () => wrap.offsetWidth * 0.15,
        y: () => wrap.offsetHeight + 140,
      },
      {
        opacity: 1,
        x: () => fieldPt().x - HOT_X,
        y: () => fieldPt().y - HOT_Y,
        duration: 0.6,
        ease: "power2.inOut",
        immediateRender: false,
      },
      1.0,
    );
    const click = (at, ptFn) => {
      tl.fromTo(
        ripple,
        { x: () => ptFn().x, y: () => ptFn().y, scale: 0.2, opacity: 0.7 },
        {
          scale: 2,
          opacity: 0,
          duration: 0.45,
          ease: "power1.out",
          immediateRender: false,
        },
        at,
      );
      tl.to(
        cursor,
        {
          scale: 0.86,
          duration: 0.08,
          ease: "power1.in",
          transformOrigin: "15% 9%",
        },
        at,
      );
      tl.to(
        cursor,
        { scale: 1, duration: 0.2, ease: "back.out(3)" },
        at + 0.08,
      );
    };
    click(1.62, fieldPt);
    tl.to(
      field,
      { borderColor: ctx.pal.accent, duration: 0.2, ease: "power1.out" },
      1.62,
    );

    // 2) typing
    const tType = 1.7;
    const typeDur = Math.min(1.4, Math.max(0.4, typed.length * 0.045));
    // each char is an inline span (keeps bidi intact); opacity steps in, no callbacks
    const chars = el.querySelectorAll(".typed .ch");
    if (chars.length)
      tl.to(chars, { opacity: 1, duration: 0.01, ease: "none", stagger: typeDur / chars.length }, tType);

    // 3) cursor to the button + press
    const btnPt = () => pos(btn, 0.5, 0.55);
    const tMove = tType + typeDur + 0.15;
    tl.to(
      cursor,
      {
        x: () => btnPt().x - HOT_X,
        y: () => btnPt().y - HOT_Y,
        duration: 0.5,
        ease: "power3.inOut",
      },
      tMove,
    );
    const tPress = tMove + 0.58;
    click(tPress, btnPt);
    tl.to(btn, { scale: 0.92, duration: 0.08, ease: "power1.in" }, tPress);
    tl.to(btn, { scale: 1, duration: 0.3, ease: "back.out(3)" }, tPress + 0.08);

    // 4) result
    const tRes = tPress + 0.2;
    tl.to(result, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, tRes);
    tl.from(
      result.querySelector(".ok"),
      { scale: 0, rotation: -45, duration: 0.5, ease: "back.out(2.5)" },
      tRes + 0.15,
    );
    tl.from(
      result.querySelectorAll(".draw"),
      { strokeDashoffset: 1, duration: 0.35, ease: "power2.out" },
      tRes + 0.35,
    );
    tl.from(
      result.querySelectorAll(".sk"),
      { scaleX: 0, duration: 0.5, ease: "power3.out", stagger: 0.1 },
      tRes + 0.25,
    );
    tl.to(
      cursor,
      { x: "+=60", y: "+=120", opacity: 0.0, duration: 0.5, ease: "power2.in" },
      tRes + 0.6,
    );
    return tl;
  },
};
