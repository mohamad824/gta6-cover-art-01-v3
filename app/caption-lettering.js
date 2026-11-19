// caption-lettering.js — every piece of lettering on the cover: caption
// chips, the gradient title, the neon script, the quote bar, the starburst
// badge, the WANTED / stars pills and the bottom tagline strip.
(function () {
  'use strict';

  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function fitFont(ctx, text, maxW, startPx, family, weight) {
    var px = startPx;
    ctx.font = weight + ' ' + px + 'px ' + family;
    while (px > 8 && ctx.measureText(text).width > maxW) {
      px -= 1;
      ctx.font = weight + ' ' + px + 'px ' + family;
    }
    return px;
  }

  // Caption chip: dark glass chip, place in gold + time in white on the
  // first line, flavour in pink on the second. Never touches a panel edge.
  function drawChip(ctx, rect, panel, scale) {
    var pad = 8 * scale;
    var x = rect.x + pad;
    var y = rect.y + pad;
    var line1 = (panel.place + ' · ' + panel.time).toUpperCase();
    var line2 = (panel.flavor || '').toUpperCase();
    var px1 = Math.max(10, 15 * scale);
    var px2 = Math.max(8, 11 * scale);
    ctx.font = '700 ' + px1 + 'px Oswald, sans-serif';
    var w1 = ctx.measureText(line1).width;
    ctx.font = '600 ' + px2 + 'px Oswald, sans-serif';
    var w2 = ctx.measureText(line2).width;
    var w = Math.max(w1, w2) + pad * 2;
    var h = (line2 ? px1 + px2 + 14 : px1 + 8) * 1.0 + pad;
    h = px1 + (line2 ? px2 + 6 : 0) + pad * 1.1;
    ctx.save();
    ctx.fillStyle = 'rgba(8,6,18,0.82)';
    rr(ctx, x, y, w, h, 5 * scale);
    ctx.fill();
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    var tx = x + pad;
    var ty = y + pad * 0.7;
    // Place in gold, time in white — measure the place part separately.
    ctx.font = '700 ' + px1 + 'px Oswald, sans-serif';
    var placeW = ctx.measureText(panel.place.toUpperCase() + ' ').width;
    ctx.fillStyle = '#ffd34d';
    ctx.fillText(panel.place.toUpperCase() + ' ', tx, ty);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('· ' + panel.time.toUpperCase(), tx + placeW, ty);
    if (line2) {
      ctx.font = '600 ' + px2 + 'px Oswald, sans-serif';
      ctx.fillStyle = '#ff8fb8';
      ctx.fillText(line2, tx, ty + px1 + 3);
    }
    ctx.restore();
  }

  // The giant gradient title. The shipped title.png is the default
  // BRINEHAVEN wordmark; any edited title is drawn as gradient text so
  // the cover stays honest to what the maker typed.
  function drawTitle(ctx, layout, state, assets, scale) {
    var t = layout.title;
    var w = t.w;
    var titleImg = assets.title;
    var stripTop = layout.stripTop;
    if (state.title === 'BRINEHAVEN' && titleImg && titleImg.width) {
      var h = w * (titleImg.height / titleImg.width);
      var y = stripTop - h - 4 * scale;
      ctx.save();
      ctx.shadowColor = 'rgba(255,60,160,0.75)';
      ctx.shadowBlur = 18 * scale;
      ctx.drawImage(titleImg, t.x, y, w, h);
      ctx.restore();
      return { x: t.x, y: y, w: w, h: h };
    }
    var px = fitFont(ctx, state.title, w, 92 * scale, 'Oswald, sans-serif', '700');
    var grad = ctx.createLinearGradient(0, stripTop - 110 * scale, 0, stripTop);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.45, '#ffe14d');
    grad.addColorStop(1, '#ff7a1a');
    ctx.save();
    ctx.font = '700 ' + px + 'px Oswald, sans-serif';
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(3, 7 * scale);
    ctx.strokeStyle = '#1a0b1e';
    ctx.shadowColor = 'rgba(255,60,160,0.75)';
    ctx.shadowBlur = 18 * scale;
    var y = stripTop - 8 * scale;
    ctx.strokeText(state.title, t.x, y);
    ctx.fillStyle = grad;
    ctx.fillText(state.title, t.x, y);
    ctx.restore();
    return { x: t.x, y: y - px, w: w, h: px };
  }

  // Pink neon script subtitle, tucked at the title's lower right.
  function drawScript(ctx, titleBox, state, scale) {
    var px = Math.max(16, 40 * scale);
    ctx.save();
    ctx.font = px + 'px Pacifico, cursive';
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'right';
    ctx.shadowColor = '#ff2e88';
    ctx.shadowBlur = 16 * scale;
    ctx.fillStyle = '#ff7ec2';
    ctx.lineWidth = Math.max(2, 4 * scale);
    ctx.strokeStyle = '#4d0a2e';
    var x = titleBox.x + titleBox.w * 0.98;
    // Tucked into the title's lower right, overlapping its tail and
    // staying clear of the bottom tagline strip.
    var y = titleBox.y + titleBox.h - px * 0.22;
    ctx.strokeText(state.script, x, y);
    ctx.fillText(state.script, x, y);
    ctx.restore();
  }

  // Quote bar above the title: five gold stars + the radio quote.
  function drawQuoteBar(ctx, layout, state, scale) {
    var q = layout.quoteBar;
    var px = Math.max(10, 15 * scale);
    ctx.save();
    ctx.font = '700 ' + px + 'px Oswald, sans-serif';
    var text = '★★★★★  "' + state.quote + '" — ' + state.quoteSource;
    var w = Math.min(q.w, ctx.measureText(text).width + 18 * scale);
    var h = px + 12 * scale;
    // Sit directly above the title image.
    var titleImgH = q.w * (177 / 864);
    var y = layout.stripTop - titleImgH - h - 12 * scale;
    ctx.fillStyle = 'rgba(8,6,18,0.85)';
    rr(ctx, q.x, y, w, h, 4 * scale);
    ctx.fill();
    ctx.fillStyle = '#ffd34d';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText('★★★★★', q.x + 9 * scale, y + h / 2 + 1);
    var starsW = ctx.measureText('★★★★★  ').width;
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 ' + px + 'px Oswald, sans-serif';
    ctx.fillText('"' + state.quote + '" — ' + state.quoteSource, q.x + 9 * scale + starsW, y + h / 2 + 1);
    ctx.restore();
  }

  // Yellow starburst badge, e.g. EST. 2026 at the hero seam.
  function drawStarburst(ctx, cx, cy, r, lines, scale) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    var points = 16;
    for (var i = 0; i < points * 2; i++) {
      var rad = (i % 2 === 0) ? r : r * 0.78;
      var a = (Math.PI * i) / points - Math.PI / 2;
      var px = Math.cos(a) * rad;
      var py = Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = '#ffd21f';
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 8 * scale;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1a0b1e';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 ' + Math.max(9, 15 * scale) + 'px Oswald, sans-serif';
    ctx.fillText(lines[0], 0, -8 * scale);
    ctx.font = '700 ' + Math.max(9, 15 * scale) + 'px Oswald, sans-serif';
    ctx.fillText(lines[1], 0, 8 * scale);
    ctx.restore();
  }

  // Pill: dark chip with gold border and gold text/stars.
  function drawPill(ctx, x, y, text, scale, opts) {
    opts = opts || {};
    var px = Math.max(10, (opts.px || 15) * scale);
    ctx.save();
    ctx.font = '700 ' + px + 'px Oswald, sans-serif';
    var w = ctx.measureText(text).width + 20 * scale;
    var h = px + 12 * scale;
    ctx.fillStyle = 'rgba(8,6,18,0.88)';
    rr(ctx, x, y, w, h, h / 2);
    ctx.fill();
    ctx.lineWidth = Math.max(1.5, 2 * scale);
    ctx.strokeStyle = opts.border || '#ffd34d';
    ctx.stroke();
    ctx.fillStyle = opts.color || '#ffd34d';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2 + 1);
    ctx.restore();
    return { x: x, y: y, w: w, h: h };
  }

  // Bottom tagline strip: left credit, centre tagline, right barcode.
  function drawBottomStrip(ctx, layout, state, W, scale) {
    var y = layout.stripTop;
    var h = layout.stripH;
    ctx.save();
    ctx.fillStyle = '#120e24';
    ctx.fillRect(0, y, W, h);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '600 ' + Math.max(8, 10 * scale) + 'px Oswald, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('BRINEHAVEN — A SEVEN-PANEL STORY COVER · STARRING YOU', 12 * scale, y + h / 2);
    ctx.fillStyle = '#ffe14d';
    ctx.font = '700 ' + Math.max(9, 13 * scale) + 'px Oswald, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.tagline.toUpperCase(), W / 2, y + h / 2);
    // Deterministic barcode: fixed bar pattern, no randomness.
    var bars = [3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1];
    var bx = W - 66 * scale;
    var bw = 0;
    bars.forEach(function (b) { bw += b * 1.6 * scale + 1.2 * scale; });
    var cx = bx;
    ctx.fillStyle = '#ffffff';
    bars.forEach(function (b) {
      ctx.fillRect(cx, y + 6 * scale, b * 1.6 * scale, h - 12 * scale);
      cx += b * 1.6 * scale + 1.2 * scale;
    });
    ctx.restore();
  }

  window.BrinehavenLettering = {
    drawChip: drawChip, drawTitle: drawTitle, drawScript: drawScript,
    drawQuoteBar: drawQuoteBar, drawStarburst: drawStarburst,
    drawPill: drawPill, drawBottomStrip: drawBottomStrip, rr: rr
  };
})();
