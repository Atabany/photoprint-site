/* Photos per page calculator. Packing comes from print-math.js (the app's own engine). */
(() => {
  const M = window.PrintMath;
  const form = document.getElementById('sheet-form');
  if (!M || !form) return;
  const $ = id => document.getElementById(id);
  const sizeSelect = $('sheet-size'), paperSelect = $('sheet-paper'), orientSelect = $('sheet-orientation');
  const marginSelect = $('sheet-margin'), gapSelect = $('sheet-gap'), turnBox = $('sheet-turn');
  const custom = $('sheet-custom'), result = $('sheet-result'), preview = $('sheet-preview');
  let turnTouched = false;

  const fmt = (v, digits = 2) => new Intl.NumberFormat('en', {maximumFractionDigits: digits}).format(v);
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const parseLength = value => {
    const m = /^([\d.]+)(mm|in)?$/.exec(value);
    if (!m) return null;
    return Number(m[1]) * (m[2] === 'in' ? M.PT_PER_IN : M.PT_PER_MM);
  };
  const lengthText = (pt, unit) => unit === 'in' ? `${fmt(pt / M.PT_PER_IN)} in` : unit === 'cm' ? `${fmt(pt / M.PT_PER_MM / 10)} cm` : `${fmt(pt / M.PT_PER_MM, 1)} mm`;

  function chosenSize() {
    const option = sizeSelect.selectedOptions[0];
    if (option.value === 'custom') {
      const unit = $('sheet-unit').value;
      const w = Number($('sheet-width').value), h = Number($('sheet-height').value);
      if (!(w > 0 && h > 0)) return null;
      return {w: w * M.UNITS[unit], h: h * M.UNITS[unit], unit, label: `${fmt(w)} × ${fmt(h)} ${unit}`, id: false};
    }
    const unit = option.dataset.unit;
    return {w: Number(option.dataset.w) * M.UNITS[unit], h: Number(option.dataset.h) * M.UNITS[unit], unit,
      label: option.dataset.label, id: option.dataset.id === '1'};
  }

  function layoutFor(size, paperKey, orientation, margin, gap, rotates, centers) {
    const paper = M.PAPERS[paperKey];
    const page = orientation === 'portrait' ? {w: paper.w, h: paper.h} : {w: paper.h, h: paper.w};
    return {page, orientation, ...M.fillSheet({w: size.w, h: size.h, page, margin, spacing: gap, rotates, centers})};
  }

  function rowsText(cells) {
    const rows = [];
    cells.forEach(c => {
      const row = rows.find(r => Math.abs(r.y - c.y) < 0.5);
      if (row) row.n++; else rows.push({y: c.y, n: 1});
    });
    if (rows.every(r => r.n === rows[0].n)) return `${plural(rows.length, 'row', 'rows')} of ${rows[0].n}`;
    return `Rows of ${rows.map(r => r.n).join(', ')}`;
  }

  function drawSheet(layout, size, summary) {
    const {page, content, cells} = layout;
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', `-4 -4 ${page.w + 8} ${page.h + 8}`);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', summary);
    const rect = (x, y, w, h, attrs) => {
      const r = document.createElementNS(ns, 'rect');
      Object.entries({x, y, width: w, height: h, ...attrs}).forEach(([k, v]) => r.setAttribute(k, v));
      r.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(r);
    };
    rect(0, 0, page.w, page.h, {fill: '#fff', stroke: '#b9b2a2', 'stroke-width': 1.5});
    if (content.w > 0 && (content.x > 0 || content.y > 0)) rect(content.x, content.y, content.w, content.h, {fill: 'none', stroke: '#b9b2a2', 'stroke-width': 1, 'stroke-dasharray': '4 3'});
    cells.forEach(c => rect(c.x, c.y, c.w, c.h, c.r
      ? {fill: '#dfe7e1', stroke: '#354e41', 'stroke-width': 1}
      : {fill: '#f3ddd2', stroke: '#a34727', 'stroke-width': 1}));
    preview.querySelector('svg')?.remove();
    preview.prepend(svg);
    const turned = cells.some(c => c.r);
    preview.querySelector('figcaption').innerHTML = 'Drawn to scale. <span class="legend-swatch up"></span>Upright' +
      (turned ? '<span class="legend-swatch turned"></span>Turned sideways' : '') +
      (content.x > 0 ? '. Dashed line: margin.' : '.');
  }

  function update() {
    const size = chosenSize();
    if (!size) { result.innerHTML = '<p>Enter a width and height above zero.</p>'; return; }
    const paperKey = paperSelect.value, paper = M.PAPERS[paperKey];
    const margin = marginSelect.value === 'auto' ? (paper.borderless ? 0 : M.DEFAULT_MARGIN) : parseLength(marginSelect.value);
    // Automatic = the app's defaults: ID sheets have no gap, everyday layouts 3 mm.
    const gap = gapSelect.value === 'auto' ? (size.id ? 0 : M.DEFAULT_SPACING) : parseLength(gapSelect.value);
    const rotates = turnBox.checked;
    const centers = size.id;
    const orientations = orientSelect.value === 'best' ? ['portrait', 'landscape'] : [orientSelect.value];
    const layouts = orientations.map(o => layoutFor(size, paperKey, o, margin, gap, rotates, centers));
    const turns = l => l.cells.filter(c => c.r).length;
    const best = layouts.reduce((a, b) => (b.cells.length > a.cells.length || (b.cells.length === a.cells.length && turns(b) < turns(a))) ? b : a);
    const other = layouts.find(l => l !== best);
    const unit = size.unit === 'in' ? 'in' : 'mm';
    // Say margins and gaps the way they were chosen: ¼ in, 3 mm.
    const chosen = select => select.selectedOptions[0].value;
    const marginText = margin === 0 ? 'no margin (borderless)'
      : (chosen(marginSelect) === 'auto' || chosen(marginSelect) === '0.25in') ? '¼ in margins' : `${chosen(marginSelect).replace('mm', ' mm')} margins`;
    const gapText = gap === 0 ? 'no gap between photos' : chosen(gapSelect) === 'auto' ? '3 mm gaps' : `${chosen(gapSelect).replace('mm', ' mm')} gaps`;
    const paperName = `${paper.name} sheet`;

    if (!best.fits) {
      const c = best.content;
      result.innerHTML = `<p><strong>${size.label} does not fit on ${paper.name} paper with ${marginText}.</strong></p>` +
        `<p class="muted">The printable area is ${lengthText(c.w, unit)} × ${lengthText(c.h, unit)}. Choose larger paper or smaller margins: a print is never shrunk to fit.</p>`;
      preview.hidden = true;
      return;
    }
    preview.hidden = false;
    const n = best.cells.length;
    const lines = [
      `<span class="result-count">${n}</span>`,
      `<p><strong>${plural(n, 'photo', 'photos')} of ${size.label}</strong> ${n === 1 ? "fits" : "fit"} on one ${paperName} ${best.orientation === 'landscape' ? 'turned to landscape' : 'in portrait'}.</p>`,
      `<p class="muted">${rowsText(best.cells)} · ${marginText} · ${gapText}${turns(best) ? ` · ${turns(best)} turned sideways` : ''}.</p>`
    ];
    if (other && other.cells.length < n) {
      const portrait = best.orientation === 'portrait' ? n : other.cells.length;
      const landscape = best.orientation === 'landscape' ? n : other.cells.length;
      lines.push(`<p class="muted">Portrait paper holds ${portrait}; landscape holds ${landscape}.${rotates ? '' : ' The photos stay upright either way.'}</p>`);
    }
    if (!rotates && size.w !== size.h) {
      const turnedLayout = layoutFor(size, paperKey, best.orientation, margin, gap, true, centers);
      if (turnedLayout.cells.length > n) lines.push(`<p class="muted">Allowing photos to turn sideways would fit ${turnedLayout.cells.length}.${size.id ? ' ID photos are usually kept upright so every face reads the same way.' : ''}</p>`);
    }
    if (gap > 0) {
      const tight = layoutFor(size, paperKey, best.orientation, margin, 0, rotates, centers);
      if (tight.cells.length > n) lines.push(`<p class="muted">With no space between photos, ${tight.cells.length} fit. In Photo Print, set Space between photos to 0.</p>`);
    }
    if (n > 50) lines.push('<p class="muted">Photo Print makes up to 50 copies of one photo at a time; add the same photo again to fill the rest.</p>');
    result.innerHTML = lines.join('');
    const summary = `${n} photos of ${size.label} on ${paper.name}, ${rowsText(best.cells)}`;
    drawSheet(best, size, summary);
  }

  sizeSelect.addEventListener('change', () => {
    custom.hidden = sizeSelect.value !== 'custom';
    if (!turnTouched) turnBox.checked = sizeSelect.selectedOptions[0].dataset.id !== '1';
    update();
  });
  turnBox.addEventListener('change', () => { turnTouched = true; update(); });
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', event => { event.preventDefault(); update(); });
  update();
})();
