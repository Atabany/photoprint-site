/* Print quality checker and crop calculator. The photo is opened in the browser and never
   uploaded. Crop and PPI come from print-math.js (the app's own CropMath and PrintQuality). */
(() => {
  const M = window.PrintMath;
  if (!M) return;
  const $ = id => document.getElementById(id);
  const fmt = (v, d = 2) => new Intl.NumberFormat('en', {maximumFractionDigits: d}).format(v);
  const floor2 = v => Math.floor(v * 100 + 1e-9) / 100;
  const INK = '#25251f', ACCENT = '#a34727';

  /* Opens a chosen file as an image. Rejects when this browser cannot decode the format. */
  function openPhoto(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => resolve({img, w: img.naturalWidth, h: img.naturalHeight});
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')); };
      img.src = url;
    });
  }

  /* A stand-in picture for a shape when no photo is chosen: sky, sun, hills. */
  function drawPlaceholder(ctx, x, y, w, h) {
    const sky = ctx.createLinearGradient(0, y, 0, y + h);
    sky.addColorStop(0, '#f1e3cf'); sky.addColorStop(1, '#e2c9a6');
    ctx.fillStyle = sky; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#d98a5f';
    ctx.beginPath(); ctx.arc(x + w * 0.7, y + h * 0.32, Math.min(w, h) * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7f9585';
    ctx.beginPath(); ctx.moveTo(x, y + h * 0.78); ctx.lineTo(x + w * 0.3, y + h * 0.5); ctx.lineTo(x + w * 0.55, y + h * 0.72);
    ctx.lineTo(x + w * 0.8, y + h * 0.56); ctx.lineTo(x + w, y + h * 0.7); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.fill();
    ctx.fillStyle = '#354e41';
    ctx.beginPath(); ctx.moveTo(x, y + h * 0.88); ctx.quadraticCurveTo(x + w * 0.5, y + h * 0.74, x + w, y + h * 0.9); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.fill();
  }

  /* Draws the whole photo with everything outside `source` shaded, framed in the accent colour. */
  function drawCrop(canvas, photo, imgW, imgH, source, maxCss) {
    const ratio = window.devicePixelRatio || 1;
    const scale = Math.min(maxCss / imgW, maxCss / imgH);
    const w = Math.max(1, Math.round(imgW * scale)), h = Math.max(1, Math.round(imgH * scale));
    canvas.width = w * ratio; canvas.height = h * ratio;
    canvas.style.width = w + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (photo) ctx.drawImage(photo, 0, 0, w, h); else drawPlaceholder(ctx, 0, 0, w, h);
    const s = {x: source.x * scale, y: source.y * scale, w: source.w * scale, h: source.h * scale};
    ctx.fillStyle = 'rgba(37,37,31,.62)';
    ctx.fillRect(0, 0, w, s.y);
    ctx.fillRect(0, s.y + s.h, w, h - s.y - s.h);
    ctx.fillRect(0, s.y, s.x, s.h);
    ctx.fillRect(s.x + s.w, s.y, w - s.x - s.w, s.h);
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 2;
    ctx.strokeRect(s.x + 1, s.y + 1, Math.max(0, s.w - 2), Math.max(0, s.h - 2));
  }

  /* Fit mode: the print with the whole photo centred inside and blank paper around it. */
  function drawFit(canvas, photo, imgW, imgH, cellW, cellH, maxCss) {
    const ratio = window.devicePixelRatio || 1;
    const scale = Math.min(maxCss / cellW, maxCss / cellH);
    const w = Math.round(cellW * scale), h = Math.round(cellH * scale);
    canvas.width = w * ratio; canvas.height = h * ratio; canvas.style.width = w + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
    const fit = Math.min(w / imgW, h / imgH);
    const dw = imgW * fit, dh = imgH * fit, dx = (w - dw) / 2, dy = (h - dh) / 2;
    if (photo) ctx.drawImage(photo, dx, dy, dw, dh); else drawPlaceholder(ctx, dx, dy, dw, dh);
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
  }

  function cutText(imgW, imgH, source) {
    const cut = 1 - (source.w * source.h) / (imgW * imgH);
    if (cut < 0.0005) return {share: 0, text: 'Nothing is cut off: the photo already has this shape.'};
    const where = source.w < imgW - 0.5 ? 'the left and right sides' : 'the top and bottom';
    return {share: cut, where, text: `The crop removes ${fmt(cut * 100, 1)}% of the photo, from ${where}.`};
  }

  function sizeFromOption(option, prefix) {
    if (option.value === 'custom') {
      const unit = $(prefix + '-unit').value;
      const w = Number($(prefix + '-width').value), h = Number($(prefix + '-height').value);
      if (!(w > 0 && h > 0)) return null;
      return {w: w * M.UNITS[unit], h: h * M.UNITS[unit], unit, label: `${fmt(w)} × ${fmt(h)} ${unit}`, id: false};
    }
    const unit = option.dataset.unit;
    return {w: Number(option.dataset.w) * M.UNITS[unit], h: Number(option.dataset.h) * M.UNITS[unit], unit, label: option.dataset.label, id: option.dataset.id === '1'};
  }

  const sizeText = (wPt, hPt) => {
    const mmW = Math.round(wPt / M.PT_PER_MM), mmH = Math.round(hPt / M.PT_PER_MM);
    return `${mmW} × ${mmH} mm (${fmt(floor2(wPt / M.PT_PER_IN))} × ${fmt(floor2(hPt / M.PT_PER_IN))} in)`;
  };

  /* ---------- Print quality checker ---------- */
  const qForm = $('quality-form');
  if (qForm) {
    let photo = null;
    const sizeSelect = $('q-size'), turnBox = $('q-turn'), result = $('q-result'), canvas = $('q-canvas');
    const caption = $('q-caption'), fileInput = $('q-file'), fileName = $('q-file-name');
    const pxW = $('q-px-width'), pxH = $('q-px-height');
    let turnWanted = turnBox.checked; // the person's choice; ID sizes only suspend it

    const update = () => {
      const imgW = photo ? photo.w : Number(pxW.value), imgH = photo ? photo.h : Number(pxH.value);
      let size = sizeFromOption(sizeSelect.selectedOptions[0], 'q');
      if (!(imgW > 0 && imgH > 0) || !size) { result.innerHTML = '<p>Enter sizes above zero.</p>'; return; }
      const isID = size.id;
      turnBox.disabled = isID;
      turnBox.checked = isID ? false : turnWanted;
      let turned = false;
      if (turnBox.checked && Math.abs(size.w - size.h) > M.TOL && (imgW > imgH) !== (size.w > size.h) && imgW !== imgH) {
        size = {...size, w: size.h, h: size.w}; turned = true;
      }
      const fill = qForm.querySelector('input[name="q-fit"]:checked').value === 'fill';
      const q = M.quality(imgW, imgH, size.w, size.h, fill);
      const r = M.RATINGS[q.rating];
      const printName = turned ? `${size.label} (turned to ${imgW > imgH ? 'landscape' : 'portrait'})` : size.label;
      const l300 = M.largestSize(size.w, size.h, q.ppi, 300), l200 = M.largestSize(size.w, size.h, q.ppi, 200);
      const lines = [
        `<p><span class="rating ${q.rating}">${r.label}</span><strong>${fmt(Math.round(q.ppi), 0)} PPI</strong> at ${printName}</p>`,
        `<p>${r.summary}</p>`,
        `<p class="muted">The print uses ${fmt(Math.round(q.source.w), 0)} × ${fmt(Math.round(q.source.h), 0)} of the photo's ${fmt(imgW, 0)} × ${fmt(imgH, 0)} pixels.</p>`
      ];
      if (fill) lines.push(`<p class="muted">${cutText(imgW, imgH, q.source).text}</p>`);
      else {
        const barW = (size.w - q.drawn.w) / 2, barH = (size.h - q.drawn.h) / 2;
        const bar = Math.max(barW, barH);
        lines.push(`<p class="muted">${bar < M.PT_PER_MM * 0.1 ? 'The whole photo fills the print exactly.' : `The whole photo prints, with blank paper ${fmt(bar / M.PT_PER_MM, 1)} mm wide at ${barH > barW ? 'the top and bottom' : 'each side'}.`}</p>`);
      }
      if (l300 && l200) lines.push(`<p class="muted">Largest size in this shape: ${sizeText(l300.w, l300.h)} at 300 PPI (Excellent), ${sizeText(l200.w, l200.h)} at 200 PPI (Good).</p>`);
      result.innerHTML = lines.join('');
      const maxCss = Math.min(460, (canvas.parentElement.clientWidth || 460) - 8);
      if (fill) drawCrop(canvas, photo && photo.img, imgW, imgH, q.source, maxCss);
      else drawFit(canvas, photo && photo.img, imgW, imgH, size.w, size.h, maxCss);
      caption.textContent = fill
        ? `${photo ? 'Your photo' : 'A stand-in picture of that shape'}: the framed part prints at ${printName}; the shaded part is cut off.`
        : `${photo ? 'Your photo' : 'A stand-in picture of that shape'} fitted inside a ${printName} print; white is blank paper.`;
    };

    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;
      try {
        if (photo) URL.revokeObjectURL(photo.img.src);
        photo = await openPhoto(file);
        fileName.textContent = `${file.name}: ${photo.w} × ${photo.h} pixels`;
        pxW.value = photo.w; pxH.value = photo.h;
      } catch {
        photo = null;
        pxW.value = ''; pxH.value = '';
        fileName.textContent = 'This browser cannot open that file (HEIC photos open in Safari). Type its pixel size above.';
      }
      update();
    });
    [pxW, pxH].forEach(input => input.addEventListener('input', () => {
      if (photo) { URL.revokeObjectURL(photo.img.src); photo = null; fileName.textContent = 'Using the pixel size you typed.'; }
    }));
    // On the box itself, so the choice is stored before the form's own input handler redraws.
    ['input', 'change'].forEach(type => turnBox.addEventListener(type, () => { if (!turnBox.disabled) turnWanted = turnBox.checked; }));
    sizeSelect.addEventListener('change', () => { $('q-custom').hidden = sizeSelect.value !== 'custom'; });
    qForm.addEventListener('input', update);
    qForm.addEventListener('change', update);
    qForm.addEventListener('submit', e => { e.preventDefault(); update(); });
    window.addEventListener('resize', () => requestAnimationFrame(update));
    update();
  }

  /* ---------- Crop calculator ---------- */
  const cForm = $('crop-form');
  if (cForm) {
    let photo = null;
    const grid = $('crop-grid'), fileInput = $('crop-file'), fileName = $('crop-file-name');
    const shapeSelect = $('crop-shape'), orientSelect = $('crop-orientation');
    const PRINTS = [
      ['4 × 6 in', 4, 6, 'in'], ['5 × 7 in', 5, 7, 'in'], ['8 × 10 in', 8, 10, 'in'],
      ['3.5 × 5 in', 3.5, 5, 'in'], ['Wallet 2.5 × 3.5 in', 2.5, 3.5, 'in'], ['11 × 14 in', 11, 14, 'in'],
      ['8.5 × 11 in', 8.5, 11, 'in'], ['A4', 210, 297, 'mm'], ['Square 8 × 8 in', 8, 8, 'in']
    ];
    const figures = PRINTS.map(([label]) => {
      const fig = document.createElement('figure');
      fig.innerHTML = `<canvas></canvas><figcaption><strong>${label}</strong><span></span></figcaption>`;
      return fig;
    });

    const update = () => {
      let imgW, imgH;
      if (photo) { imgW = photo.w; imgH = photo.h; }
      else {
        const [a, b] = shapeSelect.value.split(':').map(Number);
        const landscape = orientSelect.value === 'landscape';
        imgW = landscape ? Math.max(a, b) * 1000 : Math.min(a, b) * 1000;
        imgH = landscape ? Math.min(a, b) * 1000 : Math.max(a, b) * 1000;
      }
      orientSelect.disabled = !!photo || shapeSelect.value === '1:1';
      shapeSelect.disabled = !!photo;
      if (!grid.dataset.ready) { grid.replaceChildren(...figures); grid.dataset.ready = '1'; }
      const cssMax = Math.max(80, Math.floor((figures[0].clientWidth || 200) - 22));
      PRINTS.forEach(([label, pw, ph, unit], i) => {
        let w = pw * M.UNITS[unit], h = ph * M.UNITS[unit];
        // Everyday prints turn to match the photo's shape, as they do in Photo Print.
        if (Math.abs(w - h) > M.TOL && (imgW > imgH) !== (w > h) && imgW !== imgH) [w, h] = [h, w];
        const q = M.quality(imgW, imgH, w, h, true);
        const cut = cutText(imgW, imgH, q.source);
        const fig = figures[i];
        drawCrop(fig.querySelector('canvas'), photo && photo.img, imgW, imgH, q.source, cssMax);
        let text = cut.share === 0 ? 'nothing cut off' : `cuts ${fmt(cut.share * 100, 1)}% from ${cut.where === 'the top and bottom' ? 'top and bottom' : 'the sides'}`;
        if (photo) text += ` · ${fmt(Math.round(q.ppi), 0)} PPI, ${M.RATINGS[q.rating].label}`;
        fig.querySelector('figcaption span').textContent = text;
        fig.querySelector('canvas').setAttribute('aria-label', `${label}: ${text}`);
        fig.querySelector('canvas').setAttribute('role', 'img');
      });
    };

    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;
      try {
        if (photo) URL.revokeObjectURL(photo.img.src);
        photo = await openPhoto(file);
        fileName.textContent = `${file.name}: ${photo.w} × ${photo.h} pixels`;
        $('crop-clear').hidden = false;
      } catch {
        photo = null;
        fileName.textContent = 'This browser cannot open that file (HEIC photos open in Safari). Choose a shape below instead.';
      }
      update();
    });
    $('crop-clear').addEventListener('click', () => {
      if (photo) URL.revokeObjectURL(photo.img.src);
      photo = null; fileInput.value = ''; fileName.textContent = ''; $('crop-clear').hidden = true; update();
    });
    cForm.addEventListener('change', update);
    cForm.addEventListener('submit', e => { e.preventDefault(); update(); });
    window.addEventListener('resize', () => requestAnimationFrame(update));
    update();
  }
})();
