// cover-render.js — the one renderer the preview and every PNG export
// share: white border, seven (or five) fresh photos, caption chips on
// every panel, the gradient title + neon script, quote bar, starburst,
// WANTED stars, VOL. 01 and the bottom tagline strip.
(function () {
  'use strict';

  function drawCover(ctx, W, H, state, assets, opts) {
    opts = opts || {};
    var layout = window.BrinehavenLayouts.layoutFor(state.layout, W, H);
    var scale = layout.sx;
    var L = window.BrinehavenLettering;
    var G = window.BrinehavenGrade;
    var C = window.BrinehavenCrop;

    // White border frame.
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#0d0a18';
    ctx.fillRect(layout.border, layout.border, W - 2 * layout.border, layout.stripTop - layout.border);
    ctx.restore();

    // Panels: photo, grade light, caption chip.
    Object.keys(layout.panels).forEach(function (id) {
      var rect = layout.panels[id];
      var panel = state.panels[id];
      if (!panel) return;
      ctx.save();
      ctx.filter = G.gradeFilter(state.grade);
      C.drawPanelPhoto(ctx, assets.photos[id], rect, panel);
      ctx.restore();
      G.paintGradeLight(ctx, rect, state.grade);
      L.drawChip(ctx, rect, panel, scale);
      // Thin white frame between panels.
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = Math.max(1, 2 * scale);
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      ctx.restore();
    });

    // Selected panel outline — preview only, never in an export.
    if (opts.highlight && layout.panels[opts.highlight]) {
      var hr = layout.panels[opts.highlight];
      ctx.save();
      ctx.strokeStyle = '#ffd34d';
      ctx.lineWidth = Math.max(2, 4 * scale);
      ctx.setLineDash([10 * scale, 6 * scale]);
      ctx.strokeRect(hr.x + 2, hr.y + 2, hr.w - 4, hr.h - 4);
      ctx.restore();
    }

    // Quote bar, then the giant title, then the neon script.
    L.drawQuoteBar(ctx, layout, state, scale);
    var titleBox = L.drawTitle(ctx, layout, state, assets, scale);
    L.drawScript(ctx, titleBox, state, scale);

    // Starburst badge at the hero seam.
    L.drawStarburst(ctx, layout.starburst.x, layout.starburst.y, layout.starburst.r, ['EST.', '2026'], scale);

    // WANTED stars pill on the heli panel, five-star pill on the car.
    if (state.wanted && layout.panels.heli) {
      var heli = layout.panels.heli;
      var pillW = ctx.measureText('WANTED ★★★★★').width;
      L.drawPill(ctx, heli.x + heli.w / 2 - 62 * scale, heli.y + heli.h - 34 * scale, 'WANTED ★★★★★', scale);
    }
    if (layout.panels.car) {
      var car = layout.panels.car;
      L.drawPill(ctx, car.x + car.w - 118 * scale, car.y + car.h - 34 * scale, '★★★★★', scale);
    }
    if (layout.panels.gas) {
      var gas = layout.panels.gas;
      L.drawPill(ctx, gas.x + gas.w - 78 * scale, gas.y + gas.h - 32 * scale, 'VOL. 01', scale, { color: '#37e6ff', border: '#37e6ff', px: 13 });
    }

    // Bottom tagline strip.
    L.drawBottomStrip(ctx, layout, state, W, scale);
    return layout;
  }

  window.BrinehavenRender = { drawCover: drawCover };
})();
