// story-layout.js — the three cover layouts for BRINEHAVEN Cover Studio.
// Every layout is defined once in the 1280x720 design space and scaled to
// any export size, so the preview and every PNG export share one geometry.
(function () {
  'use strict';

  var DESIGN_W = 1280;
  var DESIGN_H = 720;
  var BORDER = 6;
  var GAP = 6;
  var STRIP_H = 38;

  // Panel rects in design space. stripTop is where the bottom tagline
  // strip starts; panels live above it.
  function storyRects() {
    var stripTop = DESIGN_H - BORDER - STRIP_H;
    var hero = { x: BORDER, y: BORDER, w: 640, h: stripTop - BORDER };
    var rx = hero.x + hero.w + GAP;
    var rw = DESIGN_W - BORDER - rx;
    var topH = 240;
    var midH = 196;
    var botY = BORDER + topH + GAP + midH + GAP;
    var botH = stripTop - botY;
    var bw = 203;
    return {
      stripTop: stripTop,
      hero: hero,
      panels: {
        hero: hero,
        portrait: { x: rx, y: BORDER, w: 308, h: topH },
        car: { x: rx + 308 + GAP, y: BORDER, w: 308, h: topH },
        fisher: { x: rx, y: BORDER + topH + GAP, w: rw, h: midH },
        heli: { x: rx, y: botY, w: bw, h: botH },
        boat: { x: rx + bw + GAP, y: botY, w: bw, h: botH },
        gas: { x: rx + bw + GAP + bw + GAP, y: botY, w: rw - bw - GAP - bw - GAP, h: botH }
      },
      // Decorations, design space.
      title: { x: hero.x + 14, w: 620 },
      starburst: { x: hero.x + hero.w + 2, y: 428, r: 52 },
      quoteBar: { x: hero.x + 14, w: 560 }
    };
  }

  function fiveRects() {
    var stripTop = DESIGN_H - BORDER - STRIP_H;
    var hero = { x: BORDER, y: BORDER, w: 640, h: stripTop - BORDER };
    var rx = hero.x + hero.w + GAP;
    var rw = DESIGN_W - BORDER - rx;
    var topH = 240;
    var midH = 196;
    var botY = BORDER + topH + GAP + midH + GAP;
    var botH = stripTop - botY;
    return {
      stripTop: stripTop,
      hero: hero,
      panels: {
        hero: hero,
        portrait: { x: rx, y: BORDER, w: 308, h: topH },
        car: { x: rx + 308 + GAP, y: BORDER, w: 308, h: topH },
        fisher: { x: rx, y: BORDER + topH + GAP, w: rw, h: midH },
        heli: { x: rx, y: botY, w: rw, h: botH }
      },
      title: { x: hero.x + 14, w: 620 },
      starburst: { x: hero.x + hero.w + 2, y: 428, r: 52 },
      quoteBar: { x: hero.x + 14, w: 560 }
    };
  }

  function heroRects() {
    var stripTop = DESIGN_H - BORDER - STRIP_H;
    var hero = { x: BORDER, y: BORDER, w: DESIGN_W - 2 * BORDER, h: 430 };
    var rowY = hero.y + hero.h + GAP;
    var rowH = stripTop - rowY;
    var totalW = DESIGN_W - 2 * BORDER;
    var pw = 248;
    return {
      stripTop: stripTop,
      hero: hero,
      panels: {
        hero: hero,
        portrait: { x: BORDER, y: rowY, w: pw, h: rowH },
        car: { x: BORDER + pw + GAP, y: rowY, w: pw, h: rowH },
        fisher: { x: BORDER + 2 * (pw + GAP), y: rowY, w: pw, h: rowH },
        heli: { x: BORDER + 3 * (pw + GAP), y: rowY, w: pw, h: rowH },
        boat: { x: BORDER + 4 * (pw + GAP), y: rowY, w: totalW - 4 * (pw + GAP), h: rowH }
      },
      title: { x: hero.x + 20, w: 640 },
      starburst: { x: DESIGN_W - 120, y: hero.y + 64, r: 50 },
      quoteBar: { x: hero.x + 20, w: 580 }
    };
  }

  var LAYOUTS = {
    story: { id: 'story', name: '7-Panel Story', panels: 7, build: storyRects },
    five: { id: 'five', name: '5-Panel Classic', panels: 5, build: fiveRects },
    hero: { id: 'hero', name: 'Hero Focus', panels: 6, build: heroRects }
  };

  // Scale a design-space layout to a real canvas size. Photos are drawn
  // cover-fit per panel, so non-uniform scaling only reshapes panel
  // frames, never the people or cars inside them.
  function layoutFor(id, W, H) {
    var def = LAYOUTS[id] || LAYOUTS.story;
    var d = def.build();
    var sx = W / DESIGN_W;
    var sy = H / DESIGN_H;
    function scaleRect(r) {
      return { x: r.x * sx, y: r.y * sy, w: r.w * sx, h: r.h * sy };
    }
    var panels = {};
    Object.keys(d.panels).forEach(function (k) { panels[k] = scaleRect(d.panels[k]); });
    return {
      id: def.id,
      name: def.name,
      sx: sx,
      sy: sy,
      stripTop: d.stripTop * sy,
      stripH: STRIP_H * sy,
      border: BORDER * sx,
      hero: scaleRect(d.hero),
      panels: panels,
      title: { x: d.title.x * sx, w: d.title.w * sx },
      starburst: { x: d.starburst.x * sx, y: d.starburst.y * sy, r: d.starburst.r * sx },
      quoteBar: { x: d.quoteBar.x * sx, w: d.quoteBar.w * sx }
    };
  }

  window.BrinehavenLayouts = { LAYOUTS: LAYOUTS, layoutFor: layoutFor, DESIGN_W: DESIGN_W, DESIGN_H: DESIGN_H };
})();
