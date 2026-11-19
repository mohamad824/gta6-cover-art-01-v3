// grade-flip.js — the one-click DAY golden-hour / NIGHT neon grade flip.
// One grade is a photo filter plus a tinted light overlay; the sunset is
// the single light source by day, the neon is the single light source
// by night, so the two grades are a real tension, not a slider nudge.
(function () {
  'use strict';

  var GRADES = {
    day: {
      id: 'day',
      name: 'DAY · Golden Hour',
      // Warm sunset spill: saturated, a touch of sepia, lifted light.
      filter: 'saturate(1.66) sepia(0.36) brightness(0.95) contrast(1.06)',
      overlayTop: 'rgba(255,122,40,0.24)',
      overlayBottom: 'rgba(255,80,120,0.18)'
    },
    night: {
      id: 'night',
      name: 'NIGHT · Neon',
      // Neon night: cooler, punchier, pink-cyan tension.
      filter: 'saturate(1.42) contrast(1.12) brightness(0.94) hue-rotate(-14deg)',
      overlayTop: 'rgba(40,40,190,0.16)',
      overlayBottom: 'rgba(255,40,160,0.14)'
    }
  };

  function gradeFilter(grade) {
    return (GRADES[grade] || GRADES.day).filter;
  }

  // Paint the grade's light over one panel rect (or the whole cover).
  function paintGradeLight(ctx, rect, grade) {
    var g = GRADES[grade] || GRADES.day;
    var grad = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    grad.addColorStop(0, g.overlayTop);
    grad.addColorStop(1, g.overlayBottom);
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = grad;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
    // A thin warm rim along the panel's sun side by day, a cyan rim
    // along the top by night — one visible light direction.
    ctx.save();
    ctx.globalAlpha = grade === 'night' ? 0.35 : 0.28;
    ctx.fillStyle = grade === 'night' ? '#37e6ff' : '#ffb347';
    if (grade === 'night') ctx.fillRect(rect.x, rect.y, rect.w, 2);
    else ctx.fillRect(rect.x, rect.y, 2, rect.h);
    ctx.restore();
  }

  window.BrinehavenGrade = { GRADES: GRADES, gradeFilter: gradeFilter, paintGradeLight: paintGradeLight };
})();
