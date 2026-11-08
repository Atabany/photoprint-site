(() => {
  const format = value => new Intl.NumberFormat('en', {maximumFractionDigits: 4}).format(value);
  const round2 = value => new Intl.NumberFormat('en', {maximumFractionDigits: 2}).format(value);
  const valid = values => values.every(n => Number.isFinite(n) && n > 0);

  const form = document.getElementById('size-form');
  if (form) {
    const result = document.getElementById('size-result');
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const width = Number(document.getElementById('size-width').value);
      const height = Number(document.getElementById('size-height').value);
      const unit = document.getElementById('size-unit').value;
      const ppi = Number(document.getElementById('size-ppi').value);
      const factor = {in: 25.4, cm: 10, mm: 1}[unit];
      if (!valid([width, height, ppi, factor])) return;
      const mm = [width * factor, height * factor];
      const pair = (values, suffix) => values.map(format).join(' × ') + ' ' + suffix;
      const pixels = mm.map(n => Math.ceil(Number((n / 25.4 * ppi).toFixed(10))));
      result.textContent = `${pair(mm.map(n => n / 25.4), 'in')} = ${pair(mm, 'mm')} = ${pair(mm.map(n => n / 10), 'cm')}. At ${ppi} PPI: at least ${pixels.join(' × ')} visible pixels.`;
    });
  }

  const maxForm = document.getElementById('max-form');
  if (maxForm) {
    const result = document.getElementById('max-result');
    maxForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!maxForm.reportValidity()) return;
      const width = Number(document.getElementById('max-width').value);
      const height = Number(document.getElementById('max-height').value);
      const ppi = Number(document.getElementById('max-ppi').value);
      if (!valid([width, height, ppi])) return;
      const inches = [width / ppi, height / ppi];
      result.textContent = `${width} × ${height} pixels at ${ppi} PPI: up to ${inches.map(round2).join(' × ')} in (${inches.map(n => round2(n * 2.54)).join(' × ')} cm). Larger prints are possible at a lower PPI, with less fine detail.`;
    });
  }
})();
