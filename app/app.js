// app.js — BRINEHAVEN Cover Studio editor wiring: state, photo loading,
// live canvas preview, layout / grade / WANTED controls, per-panel crop
// and caption editing, uploads (per panel + fill-all) and PNG export.
(function () {
  'use strict';

  var PANEL_DEFS = [
    { id: 'hero', place: 'PALM BOULEVARD', time: '6:42 PM', flavor: 'GOLDEN HOUR', src: 'photos/hero.jpg', focusX: 0.38, focusY: 0.55 },
    { id: 'portrait', place: 'MARINA DEL SOL', time: '7:48 PM', flavor: 'LAST LIGHT', src: 'photos/portrait.jpg' },
    { id: 'car', place: 'INTERSTATE 6', time: '11:58 PM', flavor: 'FULL THROTTLE', src: 'photos/car.jpg' },
    { id: 'fisher', place: 'PIER 26', time: '6:10 AM', flavor: 'FIRST CAST', src: 'photos/fisher.jpg', oy: 0.18 },
    { id: 'heli', place: 'TOWER 2', time: '9:15 PM', flavor: 'SPOTLIGHT', src: 'photos/heli.jpg' },
    { id: 'boat', place: 'OPEN WATER', time: '10:04 PM', flavor: 'NO TURNING BACK', src: 'photos/boat.jpg' },
    { id: 'gas', place: 'ROUTE 27', time: '11:47 PM', flavor: 'LIGHTS OUT', src: 'photos/gas.jpg' }
  ];

  var state = {
    layout: 'story',
    grade: 'day',
    wanted: true,
    title: 'BRINEHAVEN',
    script: 'Tide City Nights',
    quote: 'THE TIDE DECIDES THE ROADS',
    quoteSource: 'BRINE FM 91.4',
    tagline: 'THE TIDE DECIDES THE ROADS · COMING SOON',
    selected: 'hero',
    panels: {}
  };
  PANEL_DEFS.forEach(function (d) {
    state.panels[d.id] = {
      id: d.id, place: d.place, time: d.time, flavor: d.flavor,
      src: d.src, zoom: 1, ox: d.ox || 0, oy: d.oy || 0,
      focusX: d.focusX != null ? d.focusX : 0.5,
      focusY: d.focusY != null ? d.focusY : 0.5
    };
  });

  var assets = { photos: {}, title: null };
  var preview, pctx;
  var statusEl, panelListEl;

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error('could not load ' + src)); };
      img.src = src;
    });
  }

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  function drawPreview() {
    if (!preview || !assets.title) return;
    pctx.clearRect(0, 0, preview.width, preview.height);
    window.BrinehavenRender.drawCover(pctx, preview.width, preview.height, state, assets, { highlight: state.selected });
  }

  function refreshPanelList() {
    var layout = window.BrinehavenLayouts.layoutFor(state.layout, 1280, 720);
    panelListEl.innerHTML = '';
    PANEL_DEFS.forEach(function (def) {
      var p = state.panels[def.id];
      var inLayout = !!layout.panels[def.id];
      var row = document.createElement('div');
      row.className = 'panel-row' + (state.selected === def.id ? ' selected' : '') + (inLayout ? '' : ' off-layout');
      row.dataset.panel = def.id;
      row.innerHTML =
        '<button class="panel-name" type="button" title="Select this panel">' + def.id.toUpperCase() +
        (inLayout ? '' : ' · not in this layout') + '</button>' +
        '<label class="mini">Place <input type="text" data-field="place" value=""></label>' +
        '<label class="mini">Time <input type="text" data-field="time" value=""></label>' +
        '<label class="mini">Flavour <input type="text" data-field="flavor" value=""></label>' +
        '<label class="mini">Zoom <input type="range" min="1" max="3" step="0.05" data-field="zoom" value="1"></label>' +
        '<span class="panel-actions">' +
        '<label class="btn small">Upload <input type="file" accept="image/*" data-upload="' + def.id + '" hidden></label>' +
        '<button class="btn small ghost" type="button" data-sample="' + def.id + '">Sample</button>' +
        '</span>';
      row.querySelector('[data-field="place"]').value = p.place;
      row.querySelector('[data-field="time"]').value = p.time;
      row.querySelector('[data-field="flavor"]').value = p.flavor;
      row.querySelector('[data-field="zoom"]').value = p.zoom;
      panelListEl.appendChild(row);
    });
  }

  function bindPanelList() {
    panelListEl.addEventListener('input', function (e) {
      var field = e.target.dataset.field;
      if (!field) return;
      var row = e.target.closest('.panel-row');
      var id = row.dataset.panel;
      var p = state.panels[id];
      if (field === 'zoom') p.zoom = parseFloat(e.target.value);
      else p[field] = e.target.value;
      window.BrinehavenCrop.clampCrop(p);
      drawPreview();
    });
    panelListEl.addEventListener('click', function (e) {
      var nameBtn = e.target.closest('.panel-name');
      if (nameBtn) {
        state.selected = nameBtn.closest('.panel-row').dataset.panel;
        refreshPanelList();
        drawPreview();
        syncSelectedEditor();
        return;
      }
      var sampleBtn = e.target.closest('[data-sample]');
      if (sampleBtn) {
        var id = sampleBtn.dataset.sample;
        var def = PANEL_DEFS.find(function (d) { return d.id === id; });
        state.panels[id].src = def.src;
        loadImage(def.src).then(function (img) {
          assets.photos[id] = img;
          state.panels[id].zoom = 1; state.panels[id].ox = 0; state.panels[id].oy = 0;
          refreshPanelList();
          drawPreview();
          setStatus('Sample photo restored in ' + id.toUpperCase() + '.');
        });
      }
    });
    panelListEl.addEventListener('change', function (e) {
      var up = e.target.dataset.upload;
      if (!up) return;
      var file = e.target.files && e.target.files[0];
      if (file) loadUserPhoto(up, file);
      e.target.value = '';
    });
  }

  function loadUserPhoto(id, file) {
    var reader = new FileReader();
    reader.onload = function () {
      loadImage(reader.result).then(function (img) {
        assets.photos[id] = img;
        state.panels[id].src = 'upload';
        state.panels[id].zoom = 1; state.panels[id].ox = 0; state.panels[id].oy = 0;
        state.selected = id;
        refreshPanelList();
        drawPreview();
        syncSelectedEditor();
        setStatus('Your photo is in ' + id.toUpperCase() + ' — drag it on the cover to position it.');
      });
    };
    reader.readAsDataURL(file);
  }

  function syncSelectedEditor() {
    var p = state.panels[state.selected];
    var sel = document.getElementById('selected-panel');
    if (sel) sel.textContent = state.selected.toUpperCase();
    var zx = document.getElementById('zoom-selected');
    if (zx) zx.value = p.zoom;
  }

  function bindEditor() {
    document.querySelectorAll('[data-layout]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.layout = btn.dataset.layout;
        document.querySelectorAll('[data-layout]').forEach(function (b) { b.classList.toggle('active', b === btn); });
        refreshPanelList();
        drawPreview();
        setStatus('Layout: ' + window.BrinehavenLayouts.LAYOUTS[state.layout].name + '.');
      });
    });
    document.querySelectorAll('[data-grade]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.grade = btn.dataset.grade;
        document.querySelectorAll('[data-grade]').forEach(function (b) { b.classList.toggle('active', b === btn); });
        drawPreview();
        setStatus('Grade: ' + window.BrinehavenGrade.GRADES[state.grade].name + '.');
      });
    });
    var wanted = document.getElementById('wanted-toggle');
    wanted.addEventListener('change', function () {
      state.wanted = wanted.checked;
      drawPreview();
    });
    [['title-input', 'title'], ['script-input', 'script'], ['quote-input', 'quote'],
     ['quote-source-input', 'quoteSource'], ['tagline-input', 'tagline']].forEach(function (pair) {
      var el = document.getElementById(pair[0]);
      el.addEventListener('input', function () {
        state[pair[1]] = el.value;
        drawPreview();
      });
    });
    var zoomSel = document.getElementById('zoom-selected');
    zoomSel.addEventListener('input', function () {
      state.panels[state.selected].zoom = parseFloat(zoomSel.value);
      drawPreview();
      refreshPanelList();
    });
    document.getElementById('reset-crop').addEventListener('click', function () {
      var p = state.panels[state.selected];
      p.zoom = 1; p.ox = 0; p.oy = 0;
      drawPreview();
      refreshPanelList();
      syncSelectedEditor();
    });
    document.querySelectorAll('[data-export]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.export;
        setStatus('Exporting ' + window.BrinehavenExport.SIZES[key].label + ' PNG…');
        window.BrinehavenExport.exportPNG(key, state, assets).then(function (info) {
          setStatus('Exported ' + info.file + ' — ' + info.width + '×' + info.height + ' PNG (' + Math.round(info.bytes / 1024) + ' KB).');
        }).catch(function (err) { setStatus('Export failed: ' + err.message); });
      });
    });
    document.getElementById('fill-all-input').addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        loadImage(reader.result).then(function (img) {
          PANEL_DEFS.forEach(function (def) {
            assets.photos[def.id] = img;
            state.panels[def.id].src = 'upload';
            state.panels[def.id].zoom = 1; state.panels[def.id].ox = 0; state.panels[def.id].oy = 0;
          });
          refreshPanelList();
          drawPreview();
          setStatus('One photo now fills all seven panels — crop each one to taste.');
        });
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    });

    // Click a panel to select it; drag to pan the selected photo.
    var dragging = false, lastX = 0, lastY = 0;
    function canvasPoint(e) {
      var r = preview.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (preview.width / r.width), y: (e.clientY - r.top) * (preview.height / r.height) };
    }
    preview.addEventListener('pointerdown', function (e) {
      var pt = canvasPoint(e);
      var layout = window.BrinehavenLayouts.layoutFor(state.layout, preview.width, preview.height);
      var hit = null;
      Object.keys(layout.panels).forEach(function (id) {
        var rc = layout.panels[id];
        if (pt.x >= rc.x && pt.x <= rc.x + rc.w && pt.y >= rc.y && pt.y <= rc.y + rc.h) hit = id;
      });
      if (hit) {
        state.selected = hit;
        dragging = true; lastX = pt.x; lastY = pt.y;
        preview.setPointerCapture(e.pointerId);
        refreshPanelList();
        drawPreview();
        syncSelectedEditor();
      }
    });
    preview.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var pt = canvasPoint(e);
      var layout = window.BrinehavenLayouts.layoutFor(state.layout, preview.width, preview.height);
      var rc = layout.panels[state.selected];
      if (!rc) return;
      var p = state.panels[state.selected];
      p.ox += (pt.x - lastX) / rc.w;
      p.oy += (pt.y - lastY) / rc.h;
      window.BrinehavenCrop.clampCrop(p);
      lastX = pt.x; lastY = pt.y;
      drawPreview();
    });
    preview.addEventListener('pointerup', function () { dragging = false; refreshPanelList(); });
    preview.addEventListener('wheel', function (e) {
      e.preventDefault();
      var p = state.panels[state.selected];
      p.zoom = Math.min(3, Math.max(1, p.zoom + (e.deltaY < 0 ? 0.1 : -0.1)));
      drawPreview();
      refreshPanelList();
      syncSelectedEditor();
    }, { passive: false });
  }

  function init() {
    preview = document.getElementById('preview');
    pctx = preview.getContext('2d');
    statusEl = document.getElementById('status');
    panelListEl = document.getElementById('panel-list');
    setStatus('Loading seven fresh photos…');
    var loads = PANEL_DEFS.map(function (def) {
      return loadImage(def.src).then(function (img) { assets.photos[def.id] = img; });
    });
    loads.push(loadImage('title.png').then(function (img) { assets.title = img; }));
    Promise.all(loads).then(function () {
      return Promise.all([
        document.fonts.load('700 40px Oswald'),
        document.fonts.load('600 20px Oswald'),
        document.fonts.load('40px Pacifico')
      ]).catch(function () { /* system fallback still draws */ });
    }).then(function () {
      bindPanelList();
      bindEditor();
      refreshPanelList();
      syncSelectedEditor();
      drawPreview();
      setStatus('Ready — click a panel, upload your photos, flip the grade, export a PNG.');
      document.fonts.ready.then(drawPreview);
    }).catch(function (err) {
      setStatus('Could not load the cover photos: ' + err.message);
    });
  }

  window.BRINEHAVEN = { state: state, assets: assets, drawPreview: drawPreview };
  document.addEventListener('DOMContentLoaded', init);
})();
