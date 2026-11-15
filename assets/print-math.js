/* Photo Print's layout and print-quality maths, ported line for line from the iOS app
   (PhotoPrint/Domain/LayoutEngine.swift, CropMath.swift, PrintQuality.swift, Paper.swift).
   Lengths are in points, 72 per inch. _ops/check_print_math.mjs compares this file with the
   app's compiled engine; run it after any change here or in the app's Domain folder. */
(function (root) {
  'use strict';
  const PT_PER_IN = 72;
  const PT_PER_MM = 72 / 25.4;
  const TOL = 0.001;

  const UNITS = {in: PT_PER_IN, cm: PT_PER_MM * 10, mm: PT_PER_MM};

  // Portrait sizes, as the app defines them.
  const PAPERS = {
    photo4x6: {name: '4 × 6 in', w: 4 * PT_PER_IN, h: 6 * PT_PER_IN, borderless: true},
    photo5x7: {name: '5 × 7 in', w: 5 * PT_PER_IN, h: 7 * PT_PER_IN, borderless: true},
    a4: {name: 'A4', w: 210 * PT_PER_MM, h: 297 * PT_PER_MM, borderless: false},
    usLetter: {name: 'US Letter', w: 8.5 * PT_PER_IN, h: 11 * PT_PER_IN, borderless: false},
    a5: {name: 'A5', w: 148 * PT_PER_MM, h: 210 * PT_PER_MM, borderless: false},
    a6: {name: 'A6', w: 105 * PT_PER_MM, h: 148 * PT_PER_MM, borderless: false},
    legal: {name: 'US Legal', w: 8.5 * PT_PER_IN, h: 14 * PT_PER_IN, borderless: false}
  };
  const DEFAULT_MARGIN = 0.25 * PT_PER_IN;
  const DEFAULT_SPACING = 3 * PT_PER_MM;

  function candidates(w, h, rotates, preferWide) {
    const upright = {w, h, r: false};
    if (!rotates || Math.abs(w - h) <= TOL) return [upright];
    const turned = {w: h, h: w, r: true};
    return (preferWide === (w > h)) ? [upright, turned] : [turned, upright];
  }

  // One page of shelf packing, LayoutEngine.packPage with every item the same size.
  function packPage(count, w, h, content, spacing, preferWide, rotates) {
    const cells = [];
    let x = content.x, y = content.y, rowHeight = 0;
    const maxX = content.x + content.w + TOL;
    const maxY = content.y + content.h + TOL;
    const options = candidates(w, h, rotates, preferWide);
    for (let i = 0; i < count; i++) {
      let placed = false;
      for (const o of options) {
        if (x + o.w <= maxX && y + o.h <= maxY) {
          cells.push({x, y, w: o.w, h: o.h, r: o.r});
          x += o.w + spacing;
          rowHeight = Math.max(rowHeight, o.h);
          placed = true;
          break;
        }
      }
      if (placed) continue;
      if (rowHeight > 0) {
        const nextY = y + rowHeight + spacing;
        for (const o of options) {
          if (content.x + o.w <= maxX && nextY + o.h <= maxY) {
            y = nextY; x = content.x;
            cells.push({x, y, w: o.w, h: o.h, r: o.r});
            x += o.w + spacing;
            rowHeight = o.h;
            placed = true;
            break;
          }
        }
      }
      // Identical items: once one fails, every later one fails the same way.
      if (!placed) break;
    }
    return cells;
  }

  /* How many copies of one size fill the first page, and where they go.
     page: {w, h} in points; margin and spacing in points. */
  function fillSheet({w, h, page, margin, spacing, rotates, centers}) {
    const inset = {x: margin, y: margin, w: page.w - 2 * margin, h: page.h - 2 * margin};
    const content = (inset.w <= 0 || inset.h <= 0) ? {x: 0, y: 0, w: 0, h: 0} : inset;
    const fitsUp = w <= content.w + TOL && h <= content.h + TOL;
    const fitsTurned = h <= content.w + TOL && w <= content.h + TOL;
    const fits = content.w > 0 && content.h > 0 && w > 0 && h > 0 && (fitsUp || (rotates && fitsTurned));
    if (!fits) return {fits: false, cells: [], content};
    const bound = Math.min(20000, Math.floor((content.w * content.h) / (w * h)) + 2);
    let best = null;
    for (const preferWide of (rotates ? [false, true] : [false])) {
      const attempt = packPage(bound, w, h, content, spacing, preferWide, rotates);
      if (!best) { best = attempt; continue; }
      const turns = cells => cells.reduce((n, c) => n + (c.r ? 1 : 0), 0);
      if (attempt.length > best.length || (attempt.length === best.length && turns(attempt) < turns(best))) best = attempt;
    }
    let cells = best;
    if (centers && cells.length) {
      const minX = Math.min(...cells.map(c => c.x)), minY = Math.min(...cells.map(c => c.y));
      const maxX = Math.max(...cells.map(c => c.x + c.w)), maxY = Math.max(...cells.map(c => c.y + c.h));
      const dx = Math.max(0, (content.x + content.w - maxX + content.x - minX) / 2);
      const dy = Math.max(0, (content.y + content.h - maxY + content.y - minY) / 2);
      cells = cells.map(c => ({...c, x: c.x + dx, y: c.y + dy}));
    }
    return {fits: true, cells, content};
  }

  /* CropMath.fillSourceRect / visibleSourceRect with the default, centred crop at zoom 1. */
  function visibleSource(imgW, imgH, cellW, cellH, fill) {
    if (!fill || !(imgW > 0 && imgH > 0 && cellW > 0 && cellH > 0)) return {x: 0, y: 0, w: imgW, h: imgH};
    const imageAspect = imgW / imgH, cellAspect = cellW / cellH;
    const vis = imageAspect > cellAspect ? {w: imgH * cellAspect, h: imgH} : {w: imgW, h: imgW / cellAspect};
    const x = Math.min(Math.max(0.5 * imgW - vis.w / 2, 0), imgW - vis.w);
    const y = Math.min(Math.max(0.5 * imgH - vis.h / 2, 0), imgH - vis.h);
    return {x, y, w: vis.w, h: vis.h};
  }

  const THRESHOLDS = {excellent: 300, good: 200, fair: 150};
  const RATINGS = {
    excellent: {label: 'Excellent', summary: 'Sharp at this size, even up close.'},
    good: {label: 'Good', summary: 'Looks sharp at normal viewing distance.'},
    fair: {label: 'Fair', summary: 'May look a little soft up close. Fine for casual prints.'},
    low: {label: 'Low', summary: 'Will look soft or pixelated at this size. Try a smaller size or a larger photo.'}
  };
  function rating(ppi) {
    if (ppi >= THRESHOLDS.excellent) return 'excellent';
    if (ppi >= THRESHOLDS.good) return 'good';
    if (ppi >= THRESHOLDS.fair) return 'fair';
    return 'low';
  }

  /* PrintQuality.evaluate for a photo of imgW × imgH pixels printed at cellW × cellH points. */
  function quality(imgW, imgH, cellW, cellH, fill) {
    if (!(imgW > 0 && imgH > 0 && cellW > 0 && cellH > 0)) return {ppi: 0, rating: 'low', source: {x: 0, y: 0, w: 0, h: 0}, drawn: {w: 0, h: 0}};
    const source = visibleSource(imgW, imgH, cellW, cellH, fill);
    let drawn;
    if (fill) drawn = {w: cellW, h: cellH};
    else {
      const scale = Math.min(cellW / source.w, cellH / source.h);
      drawn = {w: source.w * scale, h: source.h * scale};
    }
    const ppi = Math.min(source.w / (drawn.w / PT_PER_IN), source.h / (drawn.h / PT_PER_IN));
    return {ppi, rating: rating(ppi), source, drawn};
  }

  /* PrintQuality.largestSize then roundedDown (no white border): same shape, whole mm. */
  function largestSize(cellW, cellH, ppi, target) {
    if (!(ppi > 0 && target > 0 && cellW > 0 && cellH > 0)) return null;
    const growth = ppi / target;
    const down = v => Math.floor(v / PT_PER_MM + 1e-6) * PT_PER_MM;
    return {w: down(cellW * growth), h: down(cellH * growth)};
  }

  const api = {PT_PER_IN, PT_PER_MM, TOL, UNITS, PAPERS, DEFAULT_MARGIN, DEFAULT_SPACING, THRESHOLDS, RATINGS,
    fillSheet, visibleSource, quality, rating, largestSize};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PrintMath = api;
})(typeof window !== 'undefined' ? window : globalThis);
