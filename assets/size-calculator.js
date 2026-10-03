(() => {
  const form = document.getElementById('size-form');
  if (!form) return;
  const result = document.getElementById('size-result');
  const format = value => new Intl.NumberFormat('en', {maximumFractionDigits: 4}).format(value);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const width = Number(document.getElementById('size-width').value);
    const height = Number(document.getElementById('size-height').value);
    const unit = document.getElementById('size-unit').value;
    const ppi = Number(document.getElementById('size-ppi').value);
    const factor = {in: 25.4, cm: 10, mm: 1}[unit];
    if (![width, height, ppi, factor].every(n => Number.isFinite(n) && n > 0)) return;
    const mm = [width * factor, height * factor];
    const pair = (values, suffix) => values.map(format).join(' × ') + ' ' + suffix;
    const pixels = mm.map(n => Math.ceil(Number((n / 25.4 * ppi).toFixed(10))));
    result.textContent = `${pair(mm.map(n => n / 25.4), 'in')} = ${pair(mm, 'mm')} = ${pair(mm.map(n => n / 10), 'cm')}. At ${ppi} PPI: at least ${pixels.join(' × ')} visible pixels.`;
  });
})();
