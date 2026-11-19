// panel-crop.js — per-panel crop and position. Each panel keeps its own
// photo, zoom and pan offset; the photo is drawn cover-fit so the person
// or car always fills the frame, and zoom/pan only reframe it.
(function () {
  'use strict';

  // Draw one photo cover-fit into a panel rect, honouring zoom (1 = fit)
  // and pan offsets ox/oy in fractions of the panel size. focusX/focusY
  // (0..1, default centre) name the point of the photo to keep centred
  // when the panel crops hard — e.g. the couple in the hero photo sit
  // left of centre, so a tall square panel must not crop them away.
  // The focus shift blends in with the cropped fraction, so a panel
  // that already shows the whole photo does not move at all.
  function drawPanelPhoto(ctx, img, rect, crop) {
    if (!img || !img.width) return false;
    var zoom = (crop && crop.zoom) || 1;
    var ox = (crop && crop.ox) || 0;
    var oy = (crop && crop.oy) || 0;
    var fx = (crop && crop.focusX != null) ? crop.focusX : 0.5;
    var fy = (crop && crop.focusY != null) ? crop.focusY : 0.5;
    var scale = Math.max(rect.w / img.width, rect.h / img.height) * zoom;
    var dw = img.width * scale;
    var dh = img.height * scale;
    var cropX = dw > rect.w ? 1 - rect.w / dw : 0;
    var cropY = dh > rect.h ? 1 - rect.h / dh : 0;
    var dx = rect.x + (rect.w - dw) / 2 + (0.5 - fx) * dw * cropX + ox * rect.w;
    var dy = rect.y + (rect.h - dh) / 2 + (0.5 - fy) * dh * cropY + oy * rect.h;
    // Clamp the final position so the photo always covers the whole
    // panel: a pan can never open a gap at a panel edge.
    dx = Math.min(rect.x, Math.max(rect.x + rect.w - dw, dx));
    dy = Math.min(rect.y, Math.max(rect.y + rect.h - dh, dy));
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
    return true;
  }

  function clampCrop(crop) {
    crop.zoom = Math.min(3, Math.max(1, crop.zoom || 1));
    crop.ox = Math.min(0.5, Math.max(-0.5, crop.ox || 0));
    crop.oy = Math.min(0.5, Math.max(-0.5, crop.oy || 0));
    return crop;
  }

  window.BrinehavenCrop = { drawPanelPhoto: drawPanelPhoto, clampCrop: clampCrop };
})();
