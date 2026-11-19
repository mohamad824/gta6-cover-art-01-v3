// png-export.js — PNG export in the three common post sizes. The cover
// layout is re-rendered at each size (never stretched from a screenshot),
// so 1080x1080, 1080x1350 and 1920x1080 are all first-class renders.
(function () {
  'use strict';

  var SIZES = {
    wide: { w: 1920, h: 1080, label: '1920x1080', file: 'brinehaven-1920x1080.png' },
    square: { w: 1080, h: 1080, label: '1080x1080', file: 'brinehaven-1080x1080.png' },
    portrait: { w: 1080, h: 1350, label: '1080x1350', file: 'brinehaven-1080x1350.png' }
  };

  function renderToCanvas(W, H, state, assets) {
    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');
    window.BrinehavenRender.drawCover(ctx, W, H, state, assets, {});
    return canvas;
  }

  function exportPNG(sizeKey, state, assets) {
    var size = SIZES[sizeKey];
    if (!size) return Promise.reject(new Error('unknown export size ' + sizeKey));
    var canvas = renderToCanvas(size.w, size.h, state, assets);
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (!blob) { reject(new Error('export failed')); return; }
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = size.file;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        resolve({ file: size.file, width: size.w, height: size.h, bytes: blob.size });
      }, 'image/png');
    });
  }

  window.BrinehavenExport = { SIZES: SIZES, renderToCanvas: renderToCanvas, exportPNG: exportPNG };
})();
